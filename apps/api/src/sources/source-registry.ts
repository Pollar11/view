import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SourceConfig } from '../config/configuration';
import { PoliteHttp } from './http';
import { RobotsGate } from './robots';
import { ApiSourceAdapter } from './adapters/api-source.adapter';
import { ScrapeSourceAdapter } from './adapters/scrape-source.adapter';
import type { SourceAdapter } from './types';

/**
 * Builds the concrete source adapters from configuration. This is the only
 * component that ever sees a source base URL; everything downstream works with
 * the already-normalised `RawItem[]` it produces.
 */
@Injectable()
export class SourceRegistry implements OnModuleInit {
  private readonly logger = new Logger('SourceRegistry');
  private adapters: SourceAdapter[] = [];
  private http!: PoliteHttp;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const sources: SourceConfig[] = this.config.get('sources') ?? [];
    const ua = this.config.get<string>('ingest.userAgent')!;
    const respectRobots = this.config.get<boolean>('ingest.respectRobots') ?? true;

    this.http = new PoliteHttp(ua);
    const robots = new RobotsGate(this.http, ua, respectRobots);

    this.adapters = sources.map((cfg) => {
      if (cfg.kind === 'api') {
        return new ApiSourceAdapter(cfg.id, cfg, this.http);
      }
      return new ScrapeSourceAdapter(cfg.id, cfg, this.http, robots);
    });

    if (this.adapters.length === 0) {
      this.logger.warn('No sources configured. Ingest will be a no-op; use `npm run seed` for demo data.');
    } else {
      this.logger.log(
        `Registered ${this.adapters.length} source(s): ${this.adapters.map((a) => `${a.id}(${a.kind})`).join(', ')}`,
      );
    }
  }

  all(): SourceAdapter[] {
    return this.adapters;
  }
}
