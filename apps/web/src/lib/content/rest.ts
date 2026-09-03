import { config } from "@/lib/config";
import {
  normalizeLiveEvent,
  normalizeSection,
  normalizeVideo,
} from "@/lib/normalize";
import type {
  ContentProvider,
  LiveEvent,
  LiveStatus,
  Page,
  Section,
  Video,
} from "@/lib/types";

/**
 * Talks to your site's HTTP API. Expected endpoints (JSON):
 *
 *   GET {SITE_API_URL}/sections
 *       -> Section[]  OR  { items: Section[] }
 *
 *   GET {SITE_API_URL}/videos?section=<slug>&cursor=<c>&limit=<n>&q=<query>
 *       -> { items: Video[], nextCursor?: string|null }  OR  Video[]
 *
 *   GET {SITE_API_URL}/videos/<idOrSlug>
 *       -> Video
 *
 * Field names are flexible — see src/lib/normalize.ts for accepted aliases.
 */
export class RestProvider implements ContentProvider {
  name = "rest";

  private async req<T>(path: string, revalidate = config.revalidate): Promise<T> {
    if (!config.siteApiUrl) {
      throw new Error("SITE_API_URL is not set");
    }
    const res = await fetch(`${config.siteApiUrl}${path}`, {
      headers: {
        Accept: "application/json",
        ...(config.siteApiToken
          ? { Authorization: `Bearer ${config.siteApiToken}` }
          : {}),
      },
      next: { revalidate },
    });
    if (!res.ok) {
      throw new Error(`Upstream ${path} -> ${res.status}`);
    }
    return (await res.json()) as T;
  }

  async getSections(): Promise<Section[]> {
    const data = await this.req<unknown>("/sections");
    const list = Array.isArray(data)
      ? data
      : ((data as { items?: unknown[] })?.items ?? []);
    return (list as Record<string, unknown>[])
      .map(normalizeSection)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  async getVideos(opts: {
    section?: string;
    cursor?: string | null;
    limit?: number;
    query?: string;
  }): Promise<Page<Video>> {
    const qs = new URLSearchParams();
    if (opts.section) qs.set("section", opts.section);
    if (opts.cursor) qs.set("cursor", opts.cursor);
    if (opts.limit) qs.set("limit", String(opts.limit));
    if (opts.query) qs.set("q", opts.query);

    const data = await this.req<unknown>(
      `/videos${qs.toString() ? `?${qs}` : ""}`,
    );
    const rawItems = Array.isArray(data)
      ? data
      : ((data as { items?: unknown[] })?.items ?? []);
    const nextCursor = Array.isArray(data)
      ? null
      : ((data as { nextCursor?: string | null })?.nextCursor ?? null);

    const items = (rawItems as Record<string, unknown>[])
      .map(normalizeVideo)
      .filter((v): v is Video => v !== null);
    return { items, nextCursor };
  }

  async getVideo(idOrSlug: string): Promise<Video | null> {
    try {
      const data = await this.req<Record<string, unknown>>(
        `/videos/${encodeURIComponent(idOrSlug)}`,
      );
      return normalizeVideo(data);
    } catch {
      return null;
    }
  }

  async getLiveEvents(opts?: {
    sport?: string;
    status?: LiveStatus;
  }): Promise<LiveEvent[]> {
    const qs = new URLSearchParams();
    if (opts?.sport) qs.set("sport", opts.sport);
    if (opts?.status) qs.set("status", opts.status);
    try {
      const data = await this.req<unknown>(
        `/live${qs.toString() ? `?${qs}` : ""}`,
        config.liveRevalidate,
      );
      const list = Array.isArray(data)
        ? data
        : ((data as { items?: unknown[] })?.items ?? []);
      return (list as Record<string, unknown>[])
        .map(normalizeLiveEvent)
        .filter((e): e is LiveEvent => e !== null);
    } catch {
      return [];
    }
  }

  async getLiveEvent(idOrSlug: string): Promise<LiveEvent | null> {
    try {
      const data = await this.req<Record<string, unknown>>(
        `/live/${encodeURIComponent(idOrSlug)}`,
        config.liveRevalidate,
      );
      return normalizeLiveEvent(data);
    } catch {
      return null;
    }
  }
}
