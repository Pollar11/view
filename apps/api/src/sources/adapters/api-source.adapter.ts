import { Logger } from '@nestjs/common';
import type { Category } from '@view/shared';
import type { SourceConfig } from '../../config/configuration';
import type { PoliteHttp } from '../http';
import type { RawItem, SourceAdapter } from '../types';
import {
  coerceCategory,
  coerceDate,
  coerceRating,
  coerceYear,
  isUsable,
  pick,
  toStringArray,
} from '../normalize';

/**
 * Adapter for the ONE source that exposes an official JSON API.
 *
 * Expected (configurable) contract:
 *   GET {baseUrl}{API_PATH}?category={c}&page={n}&limit={l}
 *   -> [ItemLike] | { items|data|results: [ItemLike] }
 *
 * Field names are matched loosely (id/slug/title/name/…); set
 * SOURCE_1_API_PATH / SOURCE_1_API_KEY in the environment.
 */
export class ApiSourceAdapter implements SourceAdapter {
  readonly kind = 'api' as const;
  private readonly logger = new Logger(`Source:${this.cfg.id}:api`);
  private readonly path = process.env.SOURCE_1_API_PATH?.trim() || '/items';
  private readonly pageSize = Number(process.env.SOURCE_1_API_PAGE_SIZE ?? 50);

  constructor(
    readonly id: string,
    private readonly cfg: SourceConfig,
    private readonly http: PoliteHttp,
  ) {}

  async fetchItems(cap: number): Promise<RawItem[]> {
    const out: RawItem[] = [];
    const headers = this.cfg.apiKey
      ? { Authorization: `Bearer ${this.cfg.apiKey}`, 'X-API-Key': this.cfg.apiKey }
      : undefined;

    for (const category of this.cfg.categories as Category[]) {
      let page = 1;
      const perCategoryCap = Math.ceil(cap / this.cfg.categories.length);
      while (out.length < cap) {
        const url = this.buildUrl(category, page);
        const payload = await this.http.json<unknown>(url, { headers, delayMs: this.cfg.crawlDelayMs });
        const rows = this.extractRows(payload);
        if (rows.length === 0) break;

        for (const row of rows) {
          const item = this.mapRow(row, category);
          if (item && isUsable(item)) out.push(item);
          if (out.length >= cap) break;
        }
        if (rows.length < this.pageSize || out.filter((i) => i.category === category).length >= perCategoryCap) break;
        page += 1;
        if (page > 40) break;
      }
    }
    this.logger.log(`Pulled ${out.length} item(s) from API`);
    return out;
  }

  private buildUrl(category: string, page: number): string {
    const u = new URL(this.cfg.baseUrl + this.path);
    u.searchParams.set('category', category);
    u.searchParams.set('page', String(page));
    u.searchParams.set('limit', String(this.pageSize));
    return u.toString();
  }

  private extractRows(payload: unknown): Record<string, unknown>[] {
    if (Array.isArray(payload)) return payload as Record<string, unknown>[];
    if (payload && typeof payload === 'object') {
      const obj = payload as Record<string, unknown>;
      for (const key of ['items', 'data', 'results', 'records', 'content']) {
        if (Array.isArray(obj[key])) return obj[key] as Record<string, unknown>[];
      }
    }
    return [];
  }

  private mapRow(row: Record<string, unknown>, fallbackCategory: Category): RawItem | null {
    const externalId = String(
      pick(row, ['id', 'uuid', '_id', 'slug', 'guid', 'ref']) ?? '',
    ).trim();
    const title = String(pick(row, ['title', 'name', 'headline', 'label']) ?? '').trim();
    if (!externalId || !title) return null;

    const pagePath = String(
      pick(row, ['url', 'link', 'permalink', 'canonicalUrl', 'href', 'pageUrl']) ?? '',
    );
    const sourcePageUrl = this.absolute(pagePath) ?? `${this.cfg.baseUrl}${this.path}/${externalId}`;

    return {
      externalId,
      title,
      description: String(pick(row, ['description', 'summary', 'overview', 'synopsis', 'plot', 'excerpt']) ?? ''),
      category: coerceCategory(pick(row, ['category', 'type', 'kind', 'section']) ?? fallbackCategory, fallbackCategory),
      genres: toStringArray(pick(row, ['genres', 'genre', 'categories', 'tags'])),
      tags: toStringArray(pick(row, ['tags', 'keywords', 'cast', 'teams', 'participants'])),
      year: coerceYear(pick(row, ['year', 'releaseYear', 'releaseDate', 'firstAired', 'date'])),
      rating: coerceRating(pick(row, ['rating', 'score', 'imdbRating', 'voteAverage', 'stars'])),
      posterUrl: this.absolute(String(pick(row, ['poster', 'posterUrl', 'image', 'thumbnail', 'cover', 'artwork']) ?? '')),
      releasedAt: coerceDate(pick(row, ['releaseDate', 'publishedAt', 'airDate', 'date', 'firstAired'])),
      startsAt: coerceDate(pick(row, ['startsAt', 'startTime', 'kickoff', 'scheduledStart', 'eventDate'])),
      sourcePageUrl,
    };
  }

  private absolute(url: string | null | undefined): string | null {
    if (!url) return null;
    try {
      return new URL(url, this.cfg.baseUrl).toString();
    } catch {
      return null;
    }
  }
}
