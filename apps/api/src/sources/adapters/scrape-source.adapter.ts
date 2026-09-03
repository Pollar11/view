import { Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import type { Category } from '@view/shared';
import type { SourceConfig } from '../../config/configuration';
import type { PoliteHttp } from '../http';
import type { RobotsGate } from '../robots';
import type { RawItem, SourceAdapter } from '../types';
import {
  coerceCategory,
  coerceDate,
  coerceRating,
  coerceYear,
  isUsable,
  toStringArray,
} from '../normalize';

/**
 * Generic HTML scraper for the two sources without an API.
 *
 * Strategy (no site-specific selectors required):
 *   1. Crawl configured listing paths (SOURCE_n_LIST_PATHS, default "/").
 *   2. Collect same-origin links; keep those matching SOURCE_n_ITEM_PATTERN
 *      (default: any path with >= 2 segments).
 *   3. On each detail page, read metadata in priority order:
 *        a. JSON-LD  (schema.org Movie / TVSeries / SportsEvent / VideoObject …)
 *        b. Open Graph / Twitter card meta tags
 *        c. <title> + <meta name="description">
 *   4. Only metadata is kept. No <video>/<source>/<iframe> src is read or stored.
 *
 * robots.txt is honoured for every fetched URL and the site's Crawl-delay is
 * respected.
 */
export class ScrapeSourceAdapter implements SourceAdapter {
  readonly kind = 'scrape' as const;
  private readonly logger = new Logger(`Source:${this.cfg.id}:scrape`);

  private readonly listPaths = split(process.env[`${this.envPrefix}_LIST_PATHS`]) ?? ['/'];
  private readonly itemPattern = process.env[`${this.envPrefix}_ITEM_PATTERN`]
    ? new RegExp(process.env[`${this.envPrefix}_ITEM_PATTERN`] as string)
    : /\/[^/]+\/[^/]+/;
  private readonly maxListPages = Number(process.env[`${this.envPrefix}_MAX_LIST_PAGES`] ?? 4);

  constructor(
    readonly id: string,
    private readonly cfg: SourceConfig,
    private readonly http: PoliteHttp,
    private readonly robots: RobotsGate,
  ) {}

  private get envPrefix(): string {
    return `SOURCE_${this.cfg.id.replace(/^s/, '')}`;
  }

  async fetchItems(cap: number): Promise<RawItem[]> {
    const delayMs = await this.robots.crawlDelayMs(this.cfg.baseUrl, this.cfg.crawlDelayMs);
    const detailUrls = await this.collectDetailUrls(cap * 2, delayMs);
    this.logger.log(`Discovered ${detailUrls.size} candidate page(s)`);

    const out: RawItem[] = [];
    for (const url of detailUrls) {
      if (out.length >= cap) break;
      if (!(await this.robots.allowed(url))) continue;
      const html = await this.http.text(url, { delayMs });
      if (!html) continue;
      const item = this.parseDetail(url, html);
      if (item && isUsable(item)) out.push(item);
    }
    this.logger.log(`Scraped ${out.length} item(s)`);
    return out;
  }

  private async collectDetailUrls(limit: number, delayMs: number): Promise<Set<string>> {
    const found = new Set<string>();
    const origin = new URL(this.cfg.baseUrl).origin;

    for (const path of this.listPaths) {
      for (let page = 1; page <= this.maxListPages; page++) {
        if (found.size >= limit) break;
        const listUrl = this.pageUrl(path, page);
        if (!(await this.robots.allowed(listUrl))) break;
        const html = await this.http.text(listUrl, { delayMs });
        if (!html) break;

        const $ = cheerio.load(html);
        let addedOnPage = 0;
        $('a[href]').each((_, el) => {
          const href = $(el).attr('href');
          if (!href) return;
          let abs: URL;
          try {
            abs = new URL(href, listUrl);
          } catch {
            return;
          }
          if (abs.origin !== origin) return;
          abs.hash = '';
          const clean = abs.toString();
          if (this.itemPattern.test(abs.pathname) && !found.has(clean)) {
            found.add(clean);
            addedOnPage++;
          }
        });
        if (addedOnPage === 0) break;
      }
    }
    return found;
  }

  private pageUrl(path: string, page: number): string {
    const base = new URL(path, this.cfg.baseUrl + '/');
    if (page > 1) base.searchParams.set('page', String(page));
    return base.toString();
  }

  /* --------------------------- parsing --------------------------- */

  private parseDetail(url: string, html: string): RawItem | null {
    const $ = cheerio.load(html);
    const fallbackCategory = this.categoryForUrl(url);

    const fromLd = this.fromJsonLd($, url, fallbackCategory);
    const fromOg = this.fromMeta($, url, fallbackCategory);

    // Prefer a real synopsis over an SEO meta description when the page has one.
    const bodyDesc = this.fromBody($);
    const ldOrOg = fromLd?.description ?? fromOg?.description ?? '';
    const description =
      bodyDesc && (bodyDesc.length > ldOrOg.length || /reviews?, ratings?, (and )?trailers|stay updated/i.test(ldOrOg))
        ? bodyDesc
        : ldOrOg;

    const merged: Partial<RawItem> = {
      externalId: hash(url),
      sourcePageUrl: url,
      category: fromLd?.category ?? fromOg?.category ?? fallbackCategory,
      title: fromLd?.title ?? fromOg?.title,
      description,
      genres: dedupe([...(fromLd?.genres ?? []), ...(fromOg?.genres ?? [])]),
      tags: dedupe([...(fromLd?.tags ?? []), ...(fromOg?.tags ?? [])]),
      year: fromLd?.year ?? fromOg?.year ?? null,
      rating: fromLd?.rating ?? null,
      posterUrl: fromLd?.posterUrl ?? fromOg?.posterUrl ?? null,
      releasedAt: fromLd?.releasedAt ?? fromOg?.releasedAt ?? null,
      startsAt: fromLd?.startsAt ?? null,
    };
    return isUsable(merged) ? merged : null;
  }

  /** Common on-page synopsis containers, tried in order; returns the first solid hit. */
  private fromBody($: cheerio.CheerioAPI): string {
    const selectors = [
      '[data-qa*="synopsis" i]',
      '[data-testid*="synopsis" i]',
      'rt-text[slot="content"]',
      '#synopsis',
      '.synopsis',
      '[class*="synopsis" i]',
      '[itemprop="description"]',
      '#movieSynopsis',
      '.plot-summary',
      '[class*="summary" i] p',
    ];
    for (const sel of selectors) {
      const text = $(sel).first().text().replace(/\s+/g, ' ').trim();
      if (text.length >= 40 && text.length <= 3000) return text;
    }
    return '';
  }

  private fromJsonLd(
    $: cheerio.CheerioAPI,
    url: string,
    fallbackCategory: Category,
  ): Partial<RawItem> | null {
    const blocks: unknown[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      const raw = $(el).contents().text();
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        Array.isArray(parsed) ? blocks.push(...parsed) : blocks.push(parsed);
      } catch {
        /* ignore malformed block */
      }
    });

    const node = blocks
      .flatMap((b) => (b && typeof b === 'object' && '@graph' in (b as object) ? (b as { '@graph': unknown[] })['@graph'] : [b]))
      .find((b) => {
        const t = (b as { '@type'?: string | string[] })?.['@type'];
        const types = Array.isArray(t) ? t : [t];
        return types.some((x) =>
          ['Movie', 'TVSeries', 'VideoObject', 'CreativeWork', 'Documentary', 'SportsEvent', 'BroadcastEvent', 'Episode'].includes(String(x)),
        );
      }) as Record<string, unknown> | undefined;
    if (!node) return null;

    const type = String(([] as string[]).concat(node['@type'] as never)[0] ?? '');
    const category: Category =
      /SportsEvent|BroadcastEvent/i.test(type)
        ? 'sports'
        : /Documentary/i.test(type) || /documentar/i.test(JSON.stringify(node['genre'] ?? ''))
          ? 'documentaries'
          : /Movie|Film/i.test(type)
            ? 'movies'
            : coerceCategory(node['genre'], fallbackCategory);

    const agg = node['aggregateRating'] as { ratingValue?: unknown } | undefined;

    return {
      title: str(node['name']) || str(node['headline']),
      description: str(node['description']),
      category,
      genres: toStringArray(node['genre'] ?? node['keywords']),
      tags: toStringArray(node['keywords'] ?? node['actor'] ?? node['competitor']),
      year: coerceYear(node['datePublished'] ?? node['dateCreated'] ?? node['copyrightYear']),
      rating: coerceRating(agg?.ratingValue),
      posterUrl: this.absolute(imageUrl(node['image']), url),
      releasedAt: coerceDate(node['datePublished'] ?? node['dateCreated']),
      startsAt: coerceDate(node['startDate']),
    };
  }

  private fromMeta(
    $: cheerio.CheerioAPI,
    url: string,
    fallbackCategory: Category,
  ): Partial<RawItem> {
    const og = (p: string) =>
      $(`meta[property="${p}"]`).attr('content') || $(`meta[name="${p}"]`).attr('content') || undefined;

    const title = og('og:title') || $('title').first().text().trim() || undefined;
    const description = og('og:description') || og('description') || og('twitter:description');
    const ogType = og('og:type') ?? '';
    const tagList = toStringArray(og('article:tag') ?? og('keywords'));

    return {
      title: title?.slice(0, 300),
      description,
      category: /video\.movie|movie/i.test(ogType)
        ? 'movies'
        : coerceCategory(ogType.split(/[.:]/).pop(), fallbackCategory),
      genres: tagList,
      tags: tagList,
      year: coerceYear(og('video:release_date') ?? og('article:published_time')),
      posterUrl: this.absolute(og('og:image') ?? og('twitter:image'), url),
      releasedAt: coerceDate(og('video:release_date') ?? og('article:published_time')),
    };
  }

  private categoryForUrl(url: string): Category {
    const path = safePath(url).toLowerCase();
    if (this.cfg.categories.length === 1) return this.cfg.categories[0] as Category;
    if (/sport|match|fixture|live|game/.test(path)) return 'sports';
    if (/doc(u|s)|documentary/.test(path)) return 'documentaries';
    if (/movie|film|cinema/.test(path)) return 'movies';
    return (this.cfg.categories[0] as Category) ?? 'movies';
  }

  private absolute(u: string | null | undefined, base: string): string | null {
    if (!u) return null;
    try {
      return new URL(u, base).toString();
    } catch {
      return null;
    }
  }
}

/* ----------------------------- utils ----------------------------- */

function split(v: string | undefined): string[] | null {
  if (!v) return null;
  const parts = v.split(',').map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts : null;
}
function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}
function dedupe(a: string[]): string[] {
  return [...new Set(a.map((s) => s.trim()).filter(Boolean))];
}
function imageUrl(v: unknown): string | null {
  if (!v) return null;
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return imageUrl(v[0]);
  if (typeof v === 'object' && v && 'url' in v) return String((v as { url: unknown }).url);
  return null;
}
function safePath(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}
function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return `x${(h >>> 0).toString(36)}`;
}
