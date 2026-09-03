import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type { Item as PrismaItem } from '@prisma/client';
import type { Category, Recommendation } from '@view/shared';
import { PrismaService } from '../common/prisma/prisma.service';
import { toItemDto } from '../items/item.mapper';
import { UsersService } from '../users/users.service';
import { MediaService } from '../media/media.service';

interface WeightedItem {
  item: PrismaItem;
  weight: number;
}

/**
 * Hybrid recommender:
 *   1. Build a sparse preference vector from the user's interactions
 *      (favorite = +3, rating = (value-3)*1.2, view = +0.4), over the feature
 *      space {category:*, genre:*, tag:*}.
 *   2. Score every candidate the user hasn't interacted with by cosine
 *      similarity to that vector.
 *   3. Blend: 0.8 * contentScore + 0.2 * normalisedPopularity.
 *   4. Cold start (no interactions) → popular items within the user's
 *      preferred categories.
 */
@Injectable()
export class RecommendationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly media: MediaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async forUser(userId: string, limit = 20): Promise<Recommendation[]> {
    const cacheKey = `reco:${userId}`;
    const internalLimit = 40;
    const cached = await this.cache.get<Recommendation[]>(cacheKey);
    if (cached) return cached.slice(0, limit);

    const interactions = await this.prisma.interaction.findMany({
      where: { userId, type: { in: ['favorite', 'rating', 'view'] } },
      include: { item: true },
      orderBy: { createdAt: 'desc' },
      take: 300,
    });

    const seen = new Set(interactions.map((i) => i.itemId));
    const weighted: WeightedItem[] = interactions.map((i) => ({
      item: i.item,
      weight:
        i.type === 'favorite'
          ? 3
          : i.type === 'rating'
            ? ((i.value ?? 3) - 3) * 1.2
            : 0.4,
    }));

    const prefs = await this.users.getPublicUser(userId).then((u) => u.preferences);

    let result: Recommendation[];
    if (weighted.filter((w) => w.weight > 0).length < 2) {
      result = await this.coldStart(prefs.favoriteCategories, seen, internalLimit);
    } else {
      result = await this.contentBased(weighted, seen, internalLimit);
      // Persist a derived genre profile for display on the Profile screen.
      const topGenres = this.topFeatures(this.buildVector(weighted), 'genre', 8);
      void this.users.mergeDerivedProfile(userId, { favoriteGenres: topGenres });
    }

    await this.cache.set(cacheKey, result, 120_000);
    return result.slice(0, limit);
  }

  /* ------------------------- content-based ------------------------- */

  private async contentBased(
    weighted: WeightedItem[],
    seen: Set<string>,
    limit: number,
  ): Promise<Recommendation[]> {
    const profile = this.buildVector(weighted);
    const profileNorm = norm(profile);
    if (profileNorm === 0) return [];

    const likedCategories = new Set(
      weighted.filter((w) => w.weight > 0).map((w) => w.item.category),
    );

    const candidates = await this.prisma.item.findMany({
      where: {
        id: { notIn: [...seen].slice(0, 500) },
        category: likedCategories.size ? { in: [...likedCategories] } : undefined,
      },
      orderBy: { popularity: 'desc' },
      take: 600,
    });
    if (candidates.length === 0) return [];

    const maxPop = Math.max(...candidates.map((c) => c.popularity), 1);

    const scored = candidates
      .map((item) => {
        const vec = this.itemVector(item);
        const content = dot(profile, vec) / (profileNorm * (norm(vec) || 1));
        const pop = item.popularity / maxPop;
        const score = 0.8 * content + 0.2 * pop;
        return { item, score, content };
      })
      .filter((s) => s.content > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const topGenres = this.topFeatures(profile, 'genre', 5);
    return scored.map((s) => ({
      item: toItemDto(s.item, this.media),
      score: round(s.score),
      reason: this.reason(s.item, topGenres),
    }));
  }

  private async coldStart(
    categories: Category[],
    seen: Set<string>,
    limit: number,
  ): Promise<Recommendation[]> {
    const rows = await this.prisma.item.findMany({
      where: {
        id: { notIn: [...seen].slice(0, 500) },
        category: categories.length ? { in: categories } : undefined,
      },
      orderBy: [{ popularity: 'desc' }, { rating: 'desc' }],
      take: limit,
    });
    return rows.map((item) => ({
      item: toItemDto(item, this.media),
      score: round(Math.min(1, item.popularity / 20)),
      reason: 'Popular right now',
    }));
  }

  /* --------------------------- vectors --------------------------- */

  private buildVector(weighted: WeightedItem[]): Map<string, number> {
    const v = new Map<string, number>();
    for (const { item, weight } of weighted) {
      if (weight === 0) continue;
      for (const [f, val] of this.itemVector(item)) {
        v.set(f, (v.get(f) ?? 0) + val * weight);
      }
    }
    return v;
  }

  private itemVector(item: PrismaItem): Map<string, number> {
    const v = new Map<string, number>();
    v.set(`category:${item.category}`, 1);
    for (const g of parseArr(item.genresJson)) v.set(`genre:${g.toLowerCase()}`, 1);
    for (const t of parseArr(item.tagsJson).slice(0, 12)) v.set(`tag:${t.toLowerCase()}`, 0.6);
    if (item.year) v.set(`decade:${Math.floor(item.year / 10) * 10}`, 0.4);
    return v;
  }

  private topFeatures(vec: Map<string, number>, prefix: string, n: number): string[] {
    return [...vec.entries()]
      .filter(([k, val]) => k.startsWith(`${prefix}:`) && val > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([k]) => k.slice(prefix.length + 1));
  }

  private reason(item: PrismaItem, topGenres: string[]): string {
    const g = parseArr(item.genresJson).map((x) => x.toLowerCase());
    const overlap = g.filter((x) => topGenres.includes(x));
    if (overlap.length) {
      return `Because you like ${overlap.slice(0, 2).join(' & ')}`;
    }
    return `More ${item.category} you might enjoy`;
  }
}

/* ----------------------------- math ----------------------------- */

function parseArr(json: string): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}
function dot(a: Map<string, number>, b: Map<string, number>): number {
  let s = 0;
  const [small, big] = a.size < b.size ? [a, b] : [b, a];
  for (const [k, v] of small) s += v * (big.get(k) ?? 0);
  return s;
}
function norm(a: Map<string, number>): number {
  let s = 0;
  for (const v of a.values()) s += v * v;
  return Math.sqrt(s);
}
function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}
