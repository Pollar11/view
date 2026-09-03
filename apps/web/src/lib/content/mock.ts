import type {
  ContentProvider,
  LiveEvent,
  LiveStatus,
  Page,
  Section,
  Video,
} from "@/lib/types";
import { MOCK_SECTIONS, MOCK_VIDEOS } from "./mock-data";
import { MOCK_LIVE } from "./mock-live";

export class MockProvider implements ContentProvider {
  name = "mock";

  async getSections(): Promise<Section[]> {
    return [...MOCK_SECTIONS].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  async getVideos(opts: {
    section?: string;
    cursor?: string | null;
    limit?: number;
    query?: string;
  }): Promise<Page<Video>> {
    const limit = Math.min(opts.limit ?? 24, 60);
    let items = [...MOCK_VIDEOS];

    if (opts.section) {
      items = items.filter((v) => v.sections?.includes(opts.section!));
    }
    if (opts.query) {
      const q = opts.query.toLowerCase();
      items = items.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.tags?.some((t) => t.toLowerCase().includes(q)),
      );
    }
    items.sort(
      (a, b) =>
        new Date(b.publishedAt ?? 0).getTime() -
        new Date(a.publishedAt ?? 0).getTime(),
    );

    const start = opts.cursor ? Number(opts.cursor) || 0 : 0;
    const slice = items.slice(start, start + limit);
    const nextCursor =
      start + limit < items.length ? String(start + limit) : null;
    return { items: slice, nextCursor };
  }

  async getVideo(idOrSlug: string): Promise<Video | null> {
    return (
      MOCK_VIDEOS.find((v) => v.id === idOrSlug || v.slug === idOrSlug) ?? null
    );
  }

  async getLiveEvents(opts?: {
    sport?: string;
    status?: LiveStatus;
  }): Promise<LiveEvent[]> {
    let items = [...MOCK_LIVE];
    if (opts?.sport) items = items.filter((e) => e.sport === opts.sport);
    if (opts?.status) items = items.filter((e) => e.status === opts.status);
    return items;
  }

  async getLiveEvent(idOrSlug: string): Promise<LiveEvent | null> {
    return (
      MOCK_LIVE.find((e) => e.id === idOrSlug || e.slug === idOrSlug) ?? null
    );
  }
}
