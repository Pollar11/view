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
 * Adapter for a source that exposes a JSON API.
 *
 *   GET {baseUrl}{API_PATH}?{API_QUERY}&category={c}&page={n}&limit={l}
 *   -> [ItemLike]
 *    | { items | data | results | records | content | events | docs: [ItemLike] }
 *    | { response: { docs | items: [ItemLike] } }
 *    | { _embedded: { <anything>: [ItemLike] } }
 *
 * Per-source env (n = 1 | 2 | 3):
 *   SOURCE_n_API_PATH            path to the collection endpoint      (default /items)
 *   SOURCE_n_API_QUERY           extra raw query string, e.g. "q=collection:foo&output=json"
 *   SOURCE_n_API_PAGE_SIZE       page size hint                       (default 50)
 *   SOURCE_n_API_PAGE_PARAM      name of the page param               (default "page")
 *   SOURCE_n_API_START_PAGE      first page number                    (default 1)
 *   SOURCE_n_PAGE_URL_TEMPLATE   detail-page URL, "{id}" substituted  (e.g. https://site/details/{id})
 *   SOURCE_n_API_KEY             bearer / x-api-key
 *
 * Field names inside each row are matched loosely and nested objects are
 * unwrapped (image.original, rating.average, images.jpg.image_url, …).
 */
export class ApiSourceAdapter implements SourceAdapter {
  readonly kind = 'api' as const;
  private readonly logger = new Logger(`Source:${this.cfg.id}:api`);
  private readonly env = `SOURCE_${this.cfg.id.replace(/^s/, '')}`;

  private readonly path = this.envStr('API_PATH', '/items');
  private readonly extraQuery = this.envStr('API_QUERY', '');
  private readonly pageSize = Number(this.envStr('API_PAGE_SIZE', '50'));
  private readonly pageParam = this.envStr('API_PAGE_PARAM', 'page');
  private readonly startPage = Number(this.envStr('API_START_PAGE', '1'));
  private readonly pageUrlTemplate = this.envStr('PAGE_URL_TEMPLATE', '');
  // Some APIs reject unknown query params — set these empty to omit them.
  private readonly categoryParam = this.envStr('API_CATEGORY_PARAM', 'category');
  private readonly limitParam = this.envStr('API_LIMIT_PARAM', 'limit');
  private readonly uaOverride = this.envStr('USER_AGENT', '');

  constructor(
    readonly id: string,
    private readonly cfg: SourceConfig,
    private readonly http: PoliteHttp,
  ) {}

  private envStr(suffix: string, dflt: string): string {
    // An explicitly-empty value (SOURCE_n_X=) means "omit this", not "use default".
    const v = process.env[`${this.env}_${suffix}`];
    return v === undefined ? dflt : v.trim();
  }

  async fetchItems(cap: number): Promise<RawItem[]> {
    const out: RawItem[] = [];
    const seen = new Set<string>();
    const headers: Record<string, string> = {};
    if (this.cfg.apiKey) {
      headers.Authorization = `Bearer ${this.cfg.apiKey}`;
      headers['X-API-Key'] = this.cfg.apiKey;
    }
    if (this.uaOverride) headers['User-Agent'] = this.uaOverride;

    for (const category of this.cfg.categories as Category[]) {
      let page = this.startPage;
      let emptyPages = 0;
      while (out.length < cap) {
        const url = this.buildUrl(category, page);
        const payload = await this.http.json<unknown>(url, { headers, delayMs: this.cfg.crawlDelayMs });
        const rows = this.extractRows(payload);
        if (rows.length === 0) break;

        let added = 0;
        for (const row of rows) {
          const item = this.mapRow(row, category);
          if (item && isUsable(item) && !seen.has(item.externalId)) {
            seen.add(item.externalId);
            out.push(item);
            added++;
          }
          if (out.length >= cap) break;
        }
        // Stop when a page yields nothing new twice running, or looks like the last page.
        if (added === 0 && ++emptyPages >= 2) break;
        if (added > 0) emptyPages = 0;
        if (!this.pageParam) break; // source returns everything in one response
        if (rows.length < this.pageSize) break;
        page += 1;
        if (page - this.startPage > 40) break;
      }
    }
    this.logger.log(`Pulled ${out.length} item(s) from API`);
    return out;
  }

  private buildUrl(category: string, page: number): string {
    const u = new URL(this.cfg.baseUrl + this.path);
    if (this.extraQuery) {
      for (const [k, v] of new URLSearchParams(this.extraQuery)) u.searchParams.append(k, v);
    }
    if (this.categoryParam && !u.searchParams.has(this.categoryParam)) {
      u.searchParams.set(this.categoryParam, category);
    }
    if (this.pageParam) u.searchParams.set(this.pageParam, String(page));
    if (this.limitParam && !u.searchParams.has(this.limitParam)) {
      u.searchParams.set(this.limitParam, String(this.pageSize));
    }
    return u.toString();
  }

  private extractRows(payload: unknown): Record<string, unknown>[] {
    if (Array.isArray(payload)) return payload as Record<string, unknown>[];
    if (!payload || typeof payload !== 'object') return [];
    const obj = payload as Record<string, unknown>;

    const KEYS = ['items', 'data', 'results', 'records', 'content', 'events', 'docs', 'shows', 'list'];
    for (const key of KEYS) {
      if (Array.isArray(obj[key])) return obj[key] as Record<string, unknown>[];
    }
    // One level of nesting: { response: { docs: [...] } }, { _embedded: { x: [...] } }
    for (const wrapper of ['response', '_embedded', 'result', 'payload', 'body']) {
      const inner = obj[wrapper];
      if (inner && typeof inner === 'object') {
        for (const v of Object.values(inner as Record<string, unknown>)) {
          if (Array.isArray(v)) return v as Record<string, unknown>[];
        }
      }
    }
    return [];
  }

  private mapRow(row: Record<string, unknown>, fallbackCategory: Category): RawItem | null {
    const externalId = String(
      pick(row, ['id', 'uuid', '_id', 'slug', 'guid', 'ref', 'identifier', 'mal_id', 'idEvent', 'imdbID', 'matchID', 'gamePk']) ?? '',
    ).trim();
    let title = firstString(
      pick(row, ['title', 'name', 'headline', 'label', 'strEvent', 'trackName']),
    );
    // Compose "Home vs Away" when the source only gives structured teams.
    if (!title) {
      const home = unwrapName(pick(row, ['home', 'homeTeam', 'strHomeTeam', 'team1']));
      const away = unwrapName(pick(row, ['away', 'awayTeam', 'strAwayTeam', 'team2']));
      if (home && away) title = `${home} vs ${away}`;
    }
    if (!externalId || !title) return null;

    return {
      externalId,
      title,
      description: firstString(
        pick(row, ['description', 'summary', 'overview', 'synopsis', 'plot', 'excerpt', 'strDescriptionEN', 'shortName']),
      ),
      category: coerceCategory(pick(row, ['category', 'type', 'kind', 'section']) ?? fallbackCategory, fallbackCategory),
      genres: toStringArray(pick(row, ['genres', 'genre', 'categories', 'subject', 'keywords'])),
      tags: toStringArray(pick(row, ['tags', 'keywords', 'cast', 'teams', 'participants', 'subject'])),
      year: coerceYear(pick(row, ['year', 'releaseYear', 'releaseDate', 'firstAired', 'premiered', 'date', 'dateEvent', 'matchDateTimeUTC', 'matchDateTime'])),
      rating: coerceRating(unwrapNumber(pick(row, ['rating', 'score', 'imdbRating', 'voteAverage', 'vote_average', 'stars', 'aggregateRating']))),
      posterUrl: this.absolute(unwrapImage(pick(row, ['poster', 'posterUrl', 'poster_path', 'image', 'images', 'thumbnail', 'cover', 'artwork', 'strThumb', 'strPoster']))),
      releasedAt: coerceDate(pick(row, ['releaseDate', 'publishedAt', 'airDate', 'date', 'firstAired', 'premiered'])),
      startsAt: coerceDate(pick(row, ['startsAt', 'startTime', 'kickoff', 'scheduledStart', 'eventDate', 'date', 'dateEvent', 'matchDateTimeUTC', 'matchDateTime', 'strTimestamp'])),
      sourcePageUrl: this.pageUrl(row, externalId),
    };
  }

  private pageUrl(row: Record<string, unknown>, externalId: string): string {
    if (this.pageUrlTemplate) {
      return this.pageUrlTemplate.replace('{id}', encodeURIComponent(externalId));
    }
    const direct = unwrapUrl(pick(row, ['url', 'link', 'permalink', 'canonicalUrl', 'href', 'pageUrl', 'links']));
    return this.absolute(direct) ?? `${this.cfg.baseUrl}${this.path.replace(/\/+$/, '')}/${externalId}`;
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

/* --------------------------- value unwrappers --------------------------- */

function firstString(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  if (Array.isArray(v)) return firstString(v[0]);
  return '';
}

function unwrapName(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    const n = o.teamName ?? o.name ?? o.displayName ?? o.fullName ?? o.shortName;
    if (typeof n === 'string') return n.trim();
    if (o.team && typeof o.team === 'object') return unwrapName(o.team);
  }
  return '';
}

function unwrapNumber(v: unknown): unknown {
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    return o.average ?? o.ratingValue ?? o.value ?? o.rate ?? null;
  }
  return v;
}

function unwrapImage(v: unknown): string | null {
  if (!v) return null;
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return unwrapImage(v[0]);
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>;
    const direct = o.original ?? o.large ?? o.medium ?? o.url ?? o.src ?? o.link ?? o.image_url ?? o.image;
    if (typeof direct === 'string') return direct;
    for (const nested of ['jpg', 'webp', 'images']) {
      if (o[nested] && typeof o[nested] === 'object') {
        const r = unwrapImage(o[nested]);
        if (r) return r;
      }
    }
  }
  return null;
}

function unwrapUrl(v: unknown): string | null {
  if (!v) return null;
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) {
    for (const el of v) {
      const r = unwrapUrl(el);
      if (r) return r;
    }
    return null;
  }
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>;
    return (o.href ?? o.url ?? o.web ?? null) as string | null;
  }
  return null;
}
