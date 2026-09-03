/**
 * Central config. Source URLs live ONLY here, read from the environment, and
 * are never placed on any object that leaves the process boundary.
 */

export interface SourceConfig {
  /** Stable public id (e.g. "s1"). Safe to expose. */
  id: string;
  kind: 'api' | 'scrape';
  /** Base URL of the source. NEVER serialised. */
  baseUrl: string;
  /** Optional API key/token for the API source. NEVER serialised. */
  apiKey?: string;
  /**
   * Which catalogue this source feeds. A source may feed one category
   * ("movies") or several ("movies,documentaries").
   */
  categories: string[];
  /** Human name(s) of the site — used to scrub mentions from text. */
  brandTerms: string[];
  /** Politeness delay between requests to this host, ms. */
  crawlDelayMs: number;
}

function parseSource(idx: 1 | 2 | 3): SourceConfig | null {
  const baseUrl = process.env[`SOURCE_${idx}_URL`]?.trim();
  if (!baseUrl) return null;

  const kind = (process.env[`SOURCE_${idx}_KIND`]?.trim() as 'api' | 'scrape') ||
    (idx === 1 ? 'api' : 'scrape');

  const categories = (process.env[`SOURCE_${idx}_CATEGORIES`]?.trim() || defaultCategory(idx))
    .split(',')
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);

  const brandTerms = new Set<string>();
  for (const t of (process.env[`SOURCE_${idx}_NAME`]?.split(',') ?? [])) {
    const v = t.trim();
    if (v) brandTerms.add(v);
  }
  try {
    const host = new URL(baseUrl).hostname.replace(/^www\./, '');
    brandTerms.add(host);
    const bare = host.split('.').slice(0, -1).join(' ').replace(/[-_]/g, ' ').trim();
    if (bare) brandTerms.add(bare);
  } catch {
    /* invalid URL is validated separately */
  }

  return {
    id: `s${idx}`,
    kind,
    baseUrl: baseUrl.replace(/\/+$/, ''),
    apiKey: process.env[`SOURCE_${idx}_API_KEY`]?.trim() || undefined,
    categories,
    brandTerms: [...brandTerms],
    crawlDelayMs: Number(process.env[`SOURCE_${idx}_CRAWL_DELAY_MS`] ?? 1500),
  };
}

function defaultCategory(idx: number): string {
  return (['movies', 'sports', 'documentaries'][idx - 1] ?? 'movies');
}

export interface AppConfig {
  port: number;
  corsOrigins: string[];
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessTtl: string;
    refreshTtl: string;
    accessTtlSeconds: number;
  };
  ingest: {
    enabled: boolean;
    cron: string;
    perSourceItemCap: number;
    userAgent: string;
    respectRobots: boolean;
  };
  cacheTtlSeconds: number;
  sources: SourceConfig[];
  /** Every brand term / hostname across every source, for the sanitiser. */
  scrubTerms: string[];
}

export default (): AppConfig => {
  const sources = [parseSource(1), parseSource(2), parseSource(3)].filter(
    (s): s is SourceConfig => s !== null,
  );

  const scrub = new Set<string>();
  for (const s of sources) for (const t of s.brandTerms) scrub.add(t);
  for (const extra of (process.env.SCRUB_TERMS?.split(',') ?? [])) {
    const v = extra.trim();
    if (v) scrub.add(v);
  }

  const accessTtl = process.env.JWT_ACCESS_TTL?.trim() || '900s';

  return {
    port: Number(process.env.PORT ?? 4000),
    corsOrigins: (process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean)) || [
      'http://localhost:3000',
      'http://localhost:8081',
      'http://localhost:19006',
      'tauri://localhost',
    ],
    jwt: {
      accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me',
      refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
      accessTtl,
      refreshTtl: process.env.JWT_REFRESH_TTL?.trim() || '30d',
      accessTtlSeconds: ttlToSeconds(accessTtl),
    },
    ingest: {
      enabled: (process.env.INGEST_ENABLED ?? 'true') !== 'false',
      cron: process.env.INGEST_CRON?.trim() || '0 */30 * * * *',
      perSourceItemCap: Number(process.env.INGEST_ITEM_CAP ?? 120),
      userAgent:
        process.env.INGEST_USER_AGENT?.trim() ||
        'ViewAggregator/1.0 (+metadata-only; respects robots.txt)',
      respectRobots: (process.env.INGEST_RESPECT_ROBOTS ?? 'true') !== 'false',
    },
    cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS ?? 60),
    sources,
    scrubTerms: [...scrub],
  };
};

export function ttlToSeconds(ttl: string): number {
  const m = /^(\d+)\s*([smhd])?$/.exec(ttl.trim());
  if (!m) return 900;
  const n = Number(m[1]);
  switch (m[2]) {
    case 's':
    case undefined:
      return n;
    case 'm':
      return n * 60;
    case 'h':
      return n * 3600;
    case 'd':
      return n * 86400;
    default:
      return n;
  }
}
