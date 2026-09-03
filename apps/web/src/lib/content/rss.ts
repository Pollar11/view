import { XMLParser } from "fast-xml-parser";
import { config } from "@/lib/config";
import { normalizeVideo } from "@/lib/normalize";
import type {
  ContentProvider,
  LiveEvent,
  Page,
  Section,
  Video,
} from "@/lib/types";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  removeNSPrefix: true,
});

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function asArray<T>(v: T | T[] | undefined): T[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

type FeedCache = { at: number; sections: Section[]; videos: Video[] };
let cache: FeedCache | null = null;

async function load(): Promise<FeedCache> {
  if (cache && Date.now() - cache.at < config.revalidate * 1000) return cache;

  const sections: Section[] = [];
  const videos: Video[] = [];

  await Promise.all(
    config.rssFeeds.map(async (feedUrl, idx) => {
      try {
        const res = await fetch(feedUrl, {
          next: { revalidate: config.revalidate },
        });
        if (!res.ok) return;
        const xml = parser.parse(await res.text());
        const channel = xml?.rss?.channel ?? xml?.feed ?? {};
        const feedTitle = String(channel.title ?? `Feed ${idx + 1}`);
        const sectionSlug = slugify(feedTitle) || `feed-${idx + 1}`;
        sections.push({
          slug: sectionSlug,
          title: feedTitle,
          order: idx,
          layout: "grid",
        });

        const entries = asArray(channel.item ?? channel.entry);
        for (const e of entries) {
          const media =
            asArray(e["content"]).find(
              (m: Record<string, unknown>) =>
                String((m as { "@_medium"?: string })["@_medium"]) === "video" ||
                String((m as { "@_type"?: string })["@_type"] ?? "").includes(
                  "video",
                ),
            ) ?? asArray(e["content"])[0];

          const enclosure = e.enclosure;
          const url =
            (media as { "@_url"?: string })?.["@_url"] ??
            (enclosure as { "@_url"?: string })?.["@_url"] ??
            (typeof e.link === "string" ? e.link : e.link?.["@_href"]);

          const thumb =
            asArray(e["thumbnail"])[0]?.["@_url"] ??
            (e["group"]?.["thumbnail"]?.["@_url"] as string | undefined);

          const v = normalizeVideo({
            id: String(e.guid?.["#text"] ?? e.guid ?? e.id ?? url ?? ""),
            title: String(e.title?.["#text"] ?? e.title ?? "Untitled"),
            description: String(
              e.description ?? e.summary ?? e["group"]?.["description"] ?? "",
            ),
            thumbnail: thumb,
            sources: url ? [{ url: String(url) }] : [],
            pubDate: String(e.pubDate ?? e.published ?? e.updated ?? ""),
            sections: [sectionSlug],
          });
          if (v && v.sources.length) videos.push(v);
        }
      } catch {
        /* skip bad feed */
      }
    }),
  );

  cache = { at: Date.now(), sections, videos };
  return cache;
}

export class RssProvider implements ContentProvider {
  name = "rss";

  async getSections(): Promise<Section[]> {
    return (await load()).sections;
  }

  async getVideos(opts: {
    section?: string;
    cursor?: string | null;
    limit?: number;
    query?: string;
  }): Promise<Page<Video>> {
    const { videos } = await load();
    const limit = Math.min(opts.limit ?? 24, 60);
    let items = videos;
    if (opts.section)
      items = items.filter((v) => v.sections?.includes(opts.section!));
    if (opts.query) {
      const q = opts.query.toLowerCase();
      items = items.filter((v) => v.title.toLowerCase().includes(q));
    }
    const start = opts.cursor ? Number(opts.cursor) || 0 : 0;
    const slice = items.slice(start, start + limit);
    return {
      items: slice,
      nextCursor: start + limit < items.length ? String(start + limit) : null,
    };
  }

  async getVideo(idOrSlug: string): Promise<Video | null> {
    const { videos } = await load();
    return videos.find((v) => v.id === idOrSlug || v.slug === idOrSlug) ?? null;
  }

  // RSS feeds carry no live-event data.
  async getLiveEvents(): Promise<LiveEvent[]> {
    return [];
  }

  async getLiveEvent(): Promise<LiveEvent | null> {
    return null;
  }
}
