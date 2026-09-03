import { Injectable, NotFoundException } from '@nestjs/common';
import type { PublicUser } from '@view/shared';
import { PrismaService } from '../common/prisma/prisma.service';
import { parsePreferences, toPublicUser } from './user.mapper';
import { UpdatePreferencesDto, UpdateProfileDto } from './dto/preferences.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicUser(id: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return toPublicUser(user);
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<PublicUser> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { displayName: dto.displayName?.trim() || undefined },
    });
    return toPublicUser(user);
  }

  async updatePreferences(id: string, dto: UpdatePreferencesDto): Promise<PublicUser> {
    const current = await this.prisma.user.findUniqueOrThrow({ where: { id } });
    const prefs = parsePreferences(current.preferenceJson, current.matchNotifications);

    const next = {
      favoriteCategories: dto.favoriteCategories ?? prefs.favoriteCategories,
      favoriteGenres: (dto.favoriteGenres ?? prefs.favoriteGenres)
        .map((g) => g.trim())
        .filter(Boolean)
        .slice(0, 20),
    };

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        preferenceJson: JSON.stringify(next),
        matchNotifications:
          dto.matchNotifications ?? current.matchNotifications,
      },
    });
    return toPublicUser(user);
  }

  /** Persist the recommender's derived profile without clobbering explicit prefs. */
  async mergeDerivedProfile(
    id: string,
    derived: { favoriteGenres: string[] },
  ): Promise<void> {
    const current = await this.prisma.user.findUnique({ where: { id } });
    if (!current) return;
    const prefs = parsePreferences(current.preferenceJson, current.matchNotifications);
    if (prefs.favoriteGenres.length > 0) return; // user set their own — leave it
    await this.prisma.user.update({
      where: { id },
      data: {
        preferenceJson: JSON.stringify({
          favoriteCategories: prefs.favoriteCategories,
          favoriteGenres: derived.favoriteGenres.slice(0, 12),
        }),
      },
    });
  }
}
