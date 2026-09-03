import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type { Interaction, InteractionType, Item } from '@view/shared';
import { PrismaService } from '../common/prisma/prisma.service';
import { toItemDto } from '../items/item.mapper';
import { MediaService } from '../media/media.service';
import { CreateInteractionDto } from './dto/interaction.dto';

const POPULARITY_DELTA: Record<string, number> = {
  view: 0.5,
  favorite: 3,
  unfavorite: -3,
  rating: 0, // handled from value
};

@Injectable()
export class InteractionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: MediaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  private async invalidate(userId: string): Promise<void> {
    await Promise.all([
      this.cache.del(`reco:${userId}`),
      this.cache.del('home:base'),
    ]).catch(() => undefined);
  }

  async record(userId: string, dto: CreateInteractionDto): Promise<Interaction> {
    const item = await this.prisma.item.findUnique({ where: { id: dto.itemId } });
    if (!item) throw new NotFoundException('Item not found');

    const type = dto.type as InteractionType;
    if (type === 'rating' && (dto.value == null || dto.value < 1 || dto.value > 5)) {
      throw new BadRequestException('A rating value between 1 and 5 is required.');
    }

    if (type === 'favorite' || type === 'unfavorite') {
      await this.prisma.interaction.deleteMany({
        where: { userId, itemId: dto.itemId, type: { in: ['favorite', 'unfavorite'] } },
      });
    }
    if (type === 'rating') {
      await this.prisma.interaction.deleteMany({
        where: { userId, itemId: dto.itemId, type: 'rating' },
      });
    }

    const row = await this.prisma.interaction.create({
      data: { userId, itemId: dto.itemId, type, value: type === 'rating' ? dto.value : null },
    });

    const delta =
      type === 'rating' ? ((dto.value ?? 3) - 3) * 0.6 : POPULARITY_DELTA[type] ?? 0;
    if (delta !== 0) {
      await this.prisma.item.update({
        where: { id: dto.itemId },
        data: { popularity: { increment: delta } },
      });
    }

    await this.invalidate(userId);
    return this.toDto(row);
  }

  /** Fire-and-forget passive view (deduped to once per item per hour). */
  async logView(userId: string, itemId: string): Promise<void> {
    const oneHourAgo = new Date(Date.now() - 3600_000);
    const recent = await this.prisma.interaction.findFirst({
      where: { userId, itemId, type: 'view', createdAt: { gt: oneHourAgo } },
    });
    if (recent) return;
    await this.prisma.interaction.create({ data: { userId, itemId, type: 'view' } });
    await this.prisma.item
      .update({ where: { id: itemId }, data: { popularity: { increment: 0.25 } } })
      .catch(() => undefined);
    await this.invalidate(userId);
  }

  async favorites(userId: string): Promise<Item[]> {
    const rows = await this.prisma.interaction.findMany({
      where: { userId, type: 'favorite' },
      orderBy: { createdAt: 'desc' },
      include: { item: true },
    });
    return rows.map((r) => toItemDto(r.item, this.media));
  }

  async history(userId: string, type?: string): Promise<(Interaction & { item: Item })[]> {
    const rows = await this.prisma.interaction.findMany({
      where: { userId, type: type ?? { in: ['view', 'favorite', 'rating'] } },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { item: true },
    });
    return rows.map((r) => ({ ...this.toDto(r), item: toItemDto(r.item, this.media) }));
  }

  async ratingsMap(userId: string): Promise<Map<string, number>> {
    const rows = await this.prisma.interaction.findMany({
      where: { userId, type: 'rating' },
      select: { itemId: true, value: true },
    });
    return new Map(rows.map((r) => [r.itemId, r.value ?? 0]));
  }

  private toDto(row: {
    id: string;
    itemId: string;
    type: string;
    value: number | null;
    createdAt: Date;
  }): Interaction {
    return {
      id: row.id,
      itemId: row.itemId,
      type: row.type as InteractionType,
      value: row.value,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
