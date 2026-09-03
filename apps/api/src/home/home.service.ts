import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type { HomeFeed, HomeSection, Item } from '@view/shared';
import { CATEGORIES } from '@view/shared';
import { PrismaService } from '../common/prisma/prisma.service';
import { MediaService } from '../media/media.service';
import { toItemDto } from '../items/item.mapper';
import { RecommendationsService } from '../recommendations/recommendations.service';

const CATEGORY_TITLES: Record<string, string> = {
  movies: 'Movies',
  sports: 'Sports',
  documentaries: 'Documentaries',
};

@Injectable()
export class HomeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: MediaService,
    private readonly reco: RecommendationsService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async feed(userId?: string): Promise<HomeFeed> {
    const base = await this.baseFeed();
    if (!userId) return base;

    const recs = await this.reco.forUser(userId, 18).catch(() => []);
    if (recs.length >= 4) {
      const youMightLike: HomeSection = {
        key: 'you-might-like',
        title: 'You Might Like',
        kind: 'rail',
        items: recs.map((r) => r.item),
      };
      return { ...base, sections: [youMightLike, ...base.sections] };
    }
    return base;
  }

  private async baseFeed(): Promise<HomeFeed> {
    const cached = await this.cache.get<HomeFeed>('home:base');
    if (cached) return cached;

    const now = new Date();
    const [hero, upcoming, trending, ...perCategory] = await Promise.all([
      // Hero needs artwork to land — prefer items that have a poster.
      this.prisma.item
        .findMany({
          where: { posterUrl: { not: null } },
          orderBy: [{ popularity: 'desc' }, { rating: 'desc' }],
          take: 6,
        })
        .then(async (rows) =>
          rows.length >= 3
            ? rows
            : this.prisma.item.findMany({
                orderBy: [{ popularity: 'desc' }, { rating: 'desc' }],
                take: 6,
              }),
        ),
      this.prisma.item.findMany({
        where: { category: 'sports', startsAt: { gte: now } },
        orderBy: { startsAt: 'asc' },
        take: 12,
      }),
      this.prisma.item.findMany({
        orderBy: { popularity: 'desc' },
        take: 18,
        skip: 6,
      }),
      ...CATEGORIES.map((category) =>
        this.prisma.item.findMany({
          where: { category },
          orderBy: [{ releasedAt: 'desc' }, { createdAt: 'desc' }],
          take: 18,
        }),
      ),
    ]);

    const sign = (rows: Parameters<typeof toItemDto>[0][]): Item[] =>
      rows.map((r) => toItemDto(r, this.media));

    const sections: HomeSection[] = [];
    if (upcoming.length) {
      sections.push({ key: 'upcoming', title: 'Upcoming Matches', kind: 'rail', items: sign(upcoming) });
    }
    sections.push({ key: 'trending', title: 'Trending Now', kind: 'rail', items: sign(trending) });
    CATEGORIES.forEach((category, i) => {
      const rows = perCategory[i] ?? [];
      if (rows.length) {
        sections.push({
          key: category,
          title: CATEGORY_TITLES[category],
          kind: 'rail',
          items: sign(rows),
        });
      }
    });

    const feed: HomeFeed = { hero: sign(hero), sections };
    await this.cache.set('home:base', feed, 30_000);
    return feed;
  }
}
