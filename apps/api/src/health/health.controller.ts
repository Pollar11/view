import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Category, HealthReport } from '@view/shared';
import { CATEGORIES } from '@view/shared';
import { PrismaService } from '../common/prisma/prisma.service';
import { IngestService } from '../ingest/ingest.service';
import type { SourceConfig } from '../config/configuration';

@Controller()
export class HealthController {
  private readonly startedAt = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly ingest: IngestService,
  ) {}

  @Get('health')
  async health(): Promise<HealthReport> {
    const sourcesCfg: SourceConfig[] = this.config.get('sources') ?? [];

    const byCategory = {} as Record<Category, number>;
    for (const c of CATEGORIES) byCategory[c] = 0;
    let total = 0;
    let lastIngestAt: string | null = null;

    try {
      const grouped = await this.prisma.item.groupBy({ by: ['category'], _count: true });
      for (const g of grouped) {
        if ((CATEGORIES as readonly string[]).includes(g.category)) {
          byCategory[g.category as Category] = g._count;
          total += g._count;
        }
      }
      const lastRun = await this.prisma.sourceRun.findFirst({
        where: { ok: true },
        orderBy: { finishedAt: 'desc' },
      });
      lastIngestAt = lastRun?.finishedAt?.toISOString() ?? null;
    } catch {
      return degraded(this.startedAt);
    }

    const runs = await this.prisma.sourceRun.findMany({
      where: { sourceId: { in: sourcesCfg.map((s) => s.id) } },
      orderBy: { startedAt: 'desc' },
      take: 30,
    });

    const sources = sourcesCfg.map((cfg) => {
      const latest = runs.find((r) => r.sourceId === cfg.id);
      return {
        id: cfg.id,
        kind: cfg.kind,
        ok: latest?.ok ?? false,
        items: latest?.itemCount ?? 0,
        lastRunAt: latest?.finishedAt?.toISOString() ?? null,
      };
    });

    return {
      status: 'ok',
      uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1000),
      catalogue: { total, byCategory, lastIngestAt },
      sources,
    };
  }
}

function degraded(startedAt: number): HealthReport {
  const byCategory = {} as Record<Category, number>;
  for (const c of CATEGORIES) byCategory[c] = 0;
  return {
    status: 'degraded',
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    catalogue: { total: 0, byCategory, lastIngestAt: null },
    sources: [],
  };
}
