import { Logger } from '@nestjs/common';
import robotsParser from 'robots-parser';
import type { PoliteHttp } from './http';

/**
 * robots.txt gate. Fetched once per origin, cached for the process lifetime.
 * Also surfaces the site's declared Crawl-delay so we can honour it.
 */
export class RobotsGate {
  private readonly cache = new Map<string, ReturnType<typeof robotsParser>>();
  private readonly logger = new Logger('Robots');

  constructor(
    private readonly http: PoliteHttp,
    private readonly userAgent: string,
    private readonly enabled: boolean,
  ) {}

  private async load(origin: string): Promise<ReturnType<typeof robotsParser>> {
    const cached = this.cache.get(origin);
    if (cached) return cached;
    const robotsUrl = `${origin}/robots.txt`;
    const body = (await this.http.text(robotsUrl, { delayMs: 0 }).catch(() => null)) ?? '';
    const parser = robotsParser(robotsUrl, body);
    this.cache.set(origin, parser);
    return parser;
  }

  async allowed(url: string): Promise<boolean> {
    if (!this.enabled) return true;
    try {
      const origin = new URL(url).origin;
      const parser = await this.load(origin);
      const ok = parser.isAllowed(url, this.userAgent);
      if (ok === false) this.logger.warn(`robots.txt disallows a path on ${new URL(url).host}`);
      return ok !== false;
    } catch {
      return true;
    }
  }

  async crawlDelayMs(url: string, fallback: number): Promise<number> {
    if (!this.enabled) return fallback;
    try {
      const origin = new URL(url).origin;
      const parser = await this.load(origin);
      const d = parser.getCrawlDelay(this.userAgent);
      return d ? Math.max(d * 1000, fallback) : fallback;
    } catch {
      return fallback;
    }
  }
}
