import { cached } from "@/lib/cache";
import { config } from "@/lib/config";
import type {
  ContentProvider,
  LiveEvent,
  LiveStatus,
  Page,
  Section,
  Video,
} from "@/lib/types";

/**
 * Wraps any ContentProvider in the process-local micro-cache. Live data gets a
 * short TTL (config.liveRevalidate), catalog data a longer one (config.revalidate).
 */
export class CachedProvider implements ContentProvider {
  name: string;
  constructor(private inner: ContentProvider) {
    this.name = inner.name;
  }

  getSections(): Promise<Section[]> {
    return cached("sections", () => this.inner.getSections(), {
      ttlMs: config.revalidate * 1000,
      staleMs: 300_000,
    });
  }

  getVideos(opts: {
    section?: string;
    cursor?: string | null;
    limit?: number;
    query?: string;
  }): Promise<Page<Video>> {
    const key = `videos:${opts.section ?? ""}:${opts.cursor ?? ""}:${
      opts.limit ?? ""
    }:${opts.query ?? ""}`;
    return cached(key, () => this.inner.getVideos(opts), {
      ttlMs: config.revalidate * 1000,
      staleMs: 300_000,
    });
  }

  getVideo(idOrSlug: string): Promise<Video | null> {
    return cached(`video:${idOrSlug}`, () => this.inner.getVideo(idOrSlug), {
      ttlMs: config.revalidate * 1000,
      staleMs: 300_000,
    });
  }

  getLiveEvents(opts?: {
    sport?: string;
    status?: LiveStatus;
  }): Promise<LiveEvent[]> {
    const key = `live:${opts?.sport ?? ""}:${opts?.status ?? ""}`;
    return cached(key, () => this.inner.getLiveEvents(opts), {
      ttlMs: config.liveRevalidate * 1000,
      staleMs: 30_000,
    });
  }

  getLiveEvent(idOrSlug: string): Promise<LiveEvent | null> {
    return cached(
      `live-event:${idOrSlug}`,
      () =>
        this.inner.getLiveEvent
          ? this.inner.getLiveEvent(idOrSlug)
          : Promise.resolve(null),
      { ttlMs: config.liveRevalidate * 1000, staleMs: 30_000 },
    );
  }
}
