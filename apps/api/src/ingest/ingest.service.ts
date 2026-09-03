import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import type { Cache } from 'cache-manager';
import type { Category } from '@view/shared';
import { PrismaService } from '../common/prisma/prisma.service';
import { TextSanitizer } from '../common/text/sanitize';
import { SourceRegistry } from '../sources/source-registry';
import type { RawItem } from '../sources/types';

interface IngestSummary {
  startedAt: string;
  finishedAt: string;
  sources: { id: string; kind: string; ok: boolean; items: number; message: string }[];
  upserted: number;
}

@Injectable()
export class IngestService implements OnApplicationBootstrap {
  private readonly logger = new Logger('Ingest');
  private running = false;
  private lastSummary: IngestSummary | null = null;

  constructor(
    private readonly registry: SourceRegistry,
    private readonly prisma: PrismaService,
    private readonly sanitizer: TextSanitizer,
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (!this.config.get<boolean>('ingest.enabled')) return;
    const count = await this.prisma.item.count();
    if (count === 0 && this.registry.all().length > 0) {
      this.logger.log('Empty catalogue — running an initial ingest.');
      void this.run().catch((e) => this.logger.error(e));
    }
  }

  @Cron(process.env.INGEST_CRON?.trim() || '0 */30 * * * *')
  async scheduled(): Promise<void> {
    if (!this.config.get<boolean>('ingest.enabled')) return;
    await this.run().catch((e) => this.logger.error(`Scheduled ingest failed: ${e}`));
  }

  getLastSummary(): IngestSummary | null {
    return this.lastSummary;
  }

  async run(): Promise<IngestSummary> {
    if (this.running) {
      this.logger.warn('Ingest already in progress — skipping.');
      return this.lastSummary ?? this.emptySummary();
    }
    this.running = true;
    const startedAt = new Date();
    const perSourceCap = this.config.get<number>('ingest.perSourceItemCap') ?? 120;
    const summary: IngestSummary = { ...this.emptySummary(), startedAt: startedAt.toISOString() };

    try {
      for (const adapter of this.registry.all()) {
        const run = await this.prisma.sourceRun.create({
          data: { sourceId: adapter.id, kind: adapter.kind, ok: false },
        });
        let raw: RawItem[] = [];
        let message = '';
        let ok = false;
        try {
          raw = await adapter.fetchItems(perSourceCap);
          ok = true;
        } catch (err) {
          message = (err as Error).message.slice(0, 200);
          this.logger.error(`Source ${adapter.id} failed: ${message}`);
        }

        const upserted = ok ? await this.persist(adapter.id, adapter.kind, raw) : 0;
        summary.upserted += upserted;
        summary.sources.push({ id: adapter.id, kind: adapter.kind, ok, items: upserted, message });

        await this.prisma.sourceRun.update({
          where: { id: run.id },
          data: { ok, itemCount: upserted, message, finishedAt: new Date() },
        });
      }

      await this.decayPopularity();
      await this.pruneStale();
      await this.clearCache();
    } finally {
      this.running = false;
    }

    summary.finishedAt = new Date().toISOString();
    this.lastSummary = summary;
    this.logger.log(`Ingest done: ${summary.upserted} item(s) upserted across ${summary.sources.length} source(s).`);
    return summary;
  }

  /* --------------------------- persist --------------------------- */

  private async persist(sourceId: string, kind: string, raw: RawItem[]): Promise<number> {
    let count = 0;
    for (const r of raw) {
      const clean = this.sanitize(r);
      if (!clean) continue;
      try {
        await this.prisma.item.upsert({
          where: { sourceId_externalId: { sourceId, externalId: clean.externalId } },
          create: {
            slug: await this.uniqueSlug(clean.title, clean.externalId),
            title: clean.title,
            description: clean.description,
            category: clean.category,
            year: clean.year ?? null,
            rating: clean.rating ?? null,
            posterUrl: clean.posterUrl ?? null,
            releasedAt: clean.releasedAt ? new Date(clean.releasedAt) : null,
            startsAt: clean.startsAt ? new Date(clean.startsAt) : null,
            genresKey: genresKey(clean.genres),
            genresJson: JSON.stringify(clean.genres),
            tagsJson: JSON.stringify(clean.tags),
            popularity: seedPopularity(clean),
            sourceId,
            sourceKind: kind,
            externalId: clean.externalId,
            sourcePageUrl: r.sourcePageUrl,
          },
          update: {
            title: clean.title,
            description: clean.description,
            category: clean.category,
            year: clean.year ?? null,
            rating: clean.rating ?? null,
            posterUrl: clean.posterUrl ?? null,
            releasedAt: clean.releasedAt ? new Date(clean.releasedAt) : null,
            startsAt: clean.startsAt ? new Date(clean.startsAt) : null,
            genresKey: genresKey(clean.genres),
            genresJson: JSON.stringify(clean.genres),
            tagsJson: JSON.stringify(clean.tags),
            sourcePageUrl: r.sourcePageUrl,
          },
        });
        count++;
      } catch (err) {
        this.logger.warn(`Upsert failed for one item: ${(err as Error).message}`);
      }
    }
    return count;
  }

  /**
   * Sanitises every text field. `sourcePageUrl` is deliberately NOT part of the
   * returned object — it is written straight from the raw item and never
   * sanitised/echoed.
   */
  private sanitize(r: RawItem): (Omit<RawItem, 'sourcePageUrl'> & { genres: string[]; tags: string[]; description: string }) | null {
    const title = this.sanitizer.text(r.title);
    if (!title || title.length < 2) return null;
    return {
      externalId: r.externalId,
      title: title.slice(0, 300),
      description: this.sanitizer.description(r.description).slice(0, 4000),
      category: r.category as Category,
      genres: cleanGenres(this.sanitizer.list(r.genres)).slice(0, 6),
      tags: cleanGenres(this.sanitizer.list(r.tags)).slice(0, 20),
      year: r.year ?? null,
      rating: r.rating ?? null,
      posterUrl: safeHttpUrl(r.posterUrl),
      releasedAt: r.releasedAt ?? null,
      startsAt: r.startsAt ?? null,
    };
  }

  private async uniqueSlug(title: string, externalId: string): Promise<string> {
    const base = slugify(title) || 'item';
    for (const candidate of [base, `${base}-${slugify(externalId).slice(0, 6)}`]) {
      const clash = await this.prisma.item.findUnique({ where: { slug: candidate } });
      if (!clash) return candidate;
    }
    return `${base}-${Date.now().toString(36)}`;
  }

  private async decayPopularity(): Promise<void> {
    // Gentle multiplicative decay so trending reflects recent behaviour.
    await this.prisma.$executeRawUnsafe(
      `UPDATE "Item" SET "popularity" = "popularity" * 0.92 WHERE "popularity" > 0.5`,
    );
  }

  private async pruneStale(): Promise<void> {
    const cutoff = new Date(Date.now() - 30 * 86400_000);
    const { count } = await this.prisma.item.deleteMany({
      where: { updatedAt: { lt: cutoff }, interactions: { none: {} } },
    });
    if (count) this.logger.log(`Pruned ${count} stale item(s).`);
  }

  private async clearCache(): Promise<void> {
    const resettable = this.cache as Cache & { reset?: () => Promise<void> };
    if (typeof resettable.reset === 'function') {
      await resettable.reset().catch(() => undefined);
    }
  }

  private emptySummary(): IngestSummary {
    const now = new Date().toISOString();
    return { startedAt: now, finishedAt: now, sources: [], upserted: 0 };
  }
}

/* ----------------------------- helpers ----------------------------- */

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}
/**
 * Tidies genre/tag lists from verbose sources (e.g. Library-of-Congress style
 * "Atomic-nuclear: Weapons") into short, title-cased labels and drops junk.
 */
function cleanGenres(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of list) {
    let v = raw.split(/[:/–—|]/).pop()?.trim() ?? '';
    v = v.replace(/\s+/g, ' ').trim();
    if (v.length < 2 || v.length > 24) continue;
    if (/^(need keyword|keyword|n\/?a|none|unknown|misc|other|uncategor)/i.test(v)) continue;
    if (/\d{4}/.test(v)) continue;
    const label = v.replace(/\b\w/g, (c) => c.toUpperCase());
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(label);
  }
  return out;
}

function genresKey(genres: string[]): string {
  if (!genres.length) return '';
  return `|${genres.map((g) => g.toLowerCase().replace(/\s+/g, '-')).join('|')}|`;
}
function seedPopularity(item: { rating?: number | null; startsAt?: string | null }): number {
  let p = 1;
  if (item.rating) p += item.rating / 2;
  if (item.startsAt) {
    const hrs = (new Date(item.startsAt).getTime() - Date.now()) / 3600_000;
    if (hrs > -3 && hrs < 48) p += 6; // live/imminent sport gets a boost
  }
  return p;
}
function safeHttpUrl(u: string | null | undefined): string | null {
  if (!u) return null;
  try {
    const url = new URL(u);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}
