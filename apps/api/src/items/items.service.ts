import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type { Prisma } from '@prisma/client';
import type { Item, Paginated } from '@view/shared';
import { PrismaService } from '../common/prisma/prisma.service';
import { clampLimit, clampPage, paginate } from '../common/pagination';
import { toItemDto } from './item.mapper';
import { ItemQueryDto } from './dto/item-query.dto';
import { MediaService } from '../media/media.service';

@Injectable()
export class ItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: MediaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async list(query: ItemQueryDto): Promise<Paginated<Item>> {
    const page = clampPage(query.page);
    const limit = clampLimit(query.limit);
    const cacheKey = `items:${JSON.stringify({ ...query, page, limit })}`;
    const cached = await this.cache.get<Paginated<Item>>(cacheKey);
    if (cached) return cached;

    const where: Prisma.ItemWhereInput = {};
    if (query.category) where.category = query.category;
    if (query.year) where.year = query.year;
    if (query.genre) where.genresKey = { contains: `|${query.genre}|` };
    if (query.q) {
      where.OR = [
        { title: { contains: query.q } },
        { description: { contains: query.q } },
        { tagsJson: { contains: query.q } },
      ];
    }

    const orderBy = this.orderBy(query.sort);
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.item.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
      this.prisma.item.count({ where }),
    ]);

    const result = paginate(rows.map((r) => toItemDto(r, this.media)), total, page, limit);
    await this.cache.set(cacheKey, result);
    return result;
  }

  async getByIdOrSlug(idOrSlug: string): Promise<Item> {
    const row = await this.prisma.item.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    });
    if (!row) throw new NotFoundException('Item not found');
    return toItemDto(row, this.media);
  }

  /**
   * Resolves the upstream page URL for the "Watch" button. This is the only
   * method that reads `sourcePageUrl`, and only the authenticated controller
   * endpoint calls it. The value is never cached and never logged.
   */
  async resolveSourceUrl(idOrSlug: string): Promise<string> {
    const row = await this.prisma.item.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      select: { sourcePageUrl: true },
    });
    if (!row?.sourcePageUrl) throw new NotFoundException('No source available for this item');
    return row.sourcePageUrl;
  }

  async search(q: string, page = 1, limit = 20): Promise<Paginated<Item>> {
    if (!q || q.trim().length < 2) return paginate<Item>([], 0, 1, limit);
    return this.list({ q: q.trim(), sort: 'popular', page, limit });
  }

  async upcomingSports(withinHours = 72, take = 20): Promise<Item[]> {
    const now = new Date();
    const until = new Date(now.getTime() + withinHours * 3600_000);
    const rows = await this.prisma.item.findMany({
      where: { category: 'sports', startsAt: { gte: now, lte: until } },
      orderBy: { startsAt: 'asc' },
      take,
    });
    return rows.map((r) => toItemDto(r, this.media));
  }

  private orderBy(sort?: string): Prisma.ItemOrderByWithRelationInput[] {
    switch (sort) {
      case 'rating':
        return [{ rating: 'desc' }, { popularity: 'desc' }];
      case 'title':
        return [{ title: 'asc' }];
      case 'newest':
        return [{ releasedAt: 'desc' }, { createdAt: 'desc' }];
      case 'popular':
      default:
        return [{ popularity: 'desc' }, { createdAt: 'desc' }];
    }
  }
}
