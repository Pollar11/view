import { Logger } from '@nestjs/common';
import PQueue from 'p-queue';

/**
 * Per-host polite HTTP client. One in-flight request per host, a configurable
 * delay between requests, a hard timeout, capped retries, and a fixed
 * User-Agent. Used for every outbound call to a source website.
 */
export class PoliteHttp {
  private readonly queues = new Map<string, PQueue>();
  private readonly logger = new Logger('SourceHttp');

  constructor(
    private readonly userAgent: string,
    private readonly defaultDelayMs = 1500,
    private readonly timeoutMs = 15_000,
  ) {}

  private queueFor(host: string, delayMs: number): PQueue {
    let q = this.queues.get(host);
    if (!q) {
      q = new PQueue({ concurrency: 1, interval: delayMs, intervalCap: 1 });
      this.queues.set(host, q);
    }
    return q;
  }

  async text(url: string, opts: { delayMs?: number; headers?: Record<string, string> } = {}): Promise<string | null> {
    const res = await this.raw(url, opts);
    return res ? res.text() : null;
  }

  async json<T>(url: string, opts: { delayMs?: number; headers?: Record<string, string> } = {}): Promise<T | null> {
    const res = await this.raw(url, { ...opts, headers: { Accept: 'application/json', ...opts.headers } });
    if (!res) return null;
    try {
      return (await res.json()) as T;
    } catch {
      return null;
    }
  }

  private async raw(
    url: string,
    opts: { delayMs?: number; headers?: Record<string, string> },
  ): Promise<Response | null> {
    let host: string;
    try {
      host = new URL(url).host;
    } catch {
      this.logger.warn(`Skipping invalid URL`);
      return null;
    }
    const queue = this.queueFor(host, opts.delayMs ?? this.defaultDelayMs);

    return queue.add(async () => {
      for (let attempt = 0; attempt < 3; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
          const res = await fetch(url, {
            signal: controller.signal,
            redirect: 'follow',
            headers: {
              'User-Agent': this.userAgent,
              'Accept-Language': 'en',
              ...opts.headers,
            },
          });
          clearTimeout(timer);
          if (res.status === 429 || res.status >= 500) {
            await sleep(500 * (attempt + 1) ** 2);
            continue;
          }
          if (!res.ok) {
            this.logger.warn(`${res.status} for ${host} resource`);
            return null;
          }
          return res;
        } catch (err) {
          clearTimeout(timer);
          if (attempt === 2) {
            this.logger.warn(`Request failed for ${host}: ${(err as Error).name}`);
            return null;
          }
          await sleep(400 * (attempt + 1));
        }
      }
      return null;
    }) as Promise<Response | null>;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
