import type {
  LiveEvent,
  LiveStatus,
  Section,
  Video,
  VideoSource,
} from "./types";
import { cleanRichText, cleanText, isBlockedUrl } from "./sanitize";

function inferType(url: string): string | undefined {
  const u = url.split("?")[0].toLowerCase();
  if (u.endsWith(".m3u8")) return "application/x-mpegURL";
  if (u.endsWith(".mpd")) return "application/dash+xml";
  if (u.endsWith(".mp4")) return "video/mp4";
  if (u.endsWith(".webm")) return "video/webm";
  if (u.endsWith(".ogv")) return "video/ogg";
  return undefined;
}

function normalizeSources(input: unknown): VideoSource[] {
  const arr: unknown[] = Array.isArray(input) ? input : input ? [input] : [];
  const out: VideoSource[] = [];
  for (const raw of arr) {
    let url = "";
    let type: string | undefined;
    let label: string | undefined;
    if (typeof raw === "string") {
      url = raw;
    } else if (raw && typeof raw === "object") {
      const o = raw as Record<string, unknown>;
      url = String(o.url ?? o.src ?? o.file ?? "");
      type = o.type ? String(o.type) : undefined;
      label = o.label ? String(o.label) : undefined;
    }
    if (!url || isBlockedUrl(url)) continue;
    if (!/^https?:\/\//i.test(url)) continue;
    out.push({ url, type: type ?? inferType(url), label });
  }
  return out;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function normalizeVideo(raw: Record<string, unknown>): Video | null {
  const id = String(raw.id ?? raw.guid ?? raw.uid ?? raw.slug ?? "").trim();
  const title = cleanText(String(raw.title ?? raw.name ?? "")) || "Untitled";
  const sources = normalizeSources(
    raw.sources ?? raw.media ?? raw.videos ?? raw.url ?? raw.playbackUrl,
  );
  if (!id && sources.length === 0) return null;

  const thumbRaw = String(
    raw.thumbnail ?? raw.poster ?? raw.image ?? raw.thumb ?? "",
  );
  const thumbnail = thumbRaw && !isBlockedUrl(thumbRaw) ? thumbRaw : undefined;

  const sectionsRaw = raw.sections ?? raw.categories ?? raw.category ?? [];
  const sections = (Array.isArray(sectionsRaw) ? sectionsRaw : [sectionsRaw])
    .map((s) => slugify(String(s)))
    .filter(Boolean);

  return {
    id: id || slugify(title),
    slug: raw.slug ? slugify(String(raw.slug)) : slugify(title),
    title,
    description: cleanRichText(
      String(raw.description ?? raw.summary ?? raw.content ?? "") || "",
    ),
    thumbnail,
    sources,
    durationSeconds: raw.durationSeconds
      ? Number(raw.durationSeconds)
      : raw.duration
        ? Number(raw.duration)
        : undefined,
    publishedAt: raw.publishedAt
      ? String(raw.publishedAt)
      : raw.pubDate
        ? String(raw.pubDate)
        : undefined,
    views: raw.views != null ? Number(raw.views) : undefined,
    sections,
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : undefined,
    canonicalUrl:
      raw.canonicalUrl && !isBlockedUrl(String(raw.canonicalUrl))
        ? String(raw.canonicalUrl)
        : raw.link && !isBlockedUrl(String(raw.link))
          ? String(raw.link)
          : undefined,
  };
}

function toStatus(raw: unknown, startsAt?: string): LiveStatus {
  const s = String(raw ?? "").toLowerCase();
  if (s === "live" || s === "inplay" || s === "in_play") return "live";
  if (s === "ended" || s === "finished" || s === "final") return "ended";
  if (s === "upcoming" || s === "scheduled" || s === "pre") return "upcoming";
  if (startsAt) {
    const t = new Date(startsAt).getTime();
    if (!Number.isNaN(t)) return t > Date.now() ? "upcoming" : "live";
  }
  return "live";
}

export function normalizeLiveEvent(
  raw: Record<string, unknown>,
): LiveEvent | null {
  const id = String(raw.id ?? raw.guid ?? raw.slug ?? "").trim();
  const title = cleanText(String(raw.title ?? raw.name ?? "")) || "Live event";
  const sources = normalizeSources(
    raw.sources ?? raw.media ?? raw.playbackUrl ?? raw.url ?? raw.stream,
  );
  if (!id && sources.length === 0) return null;

  const sportSlug = slugify(
    String(raw.sport ?? raw.category ?? raw.league ?? "other"),
  );
  const startsAt = raw.startsAt
    ? String(raw.startsAt)
    : raw.startTime
      ? String(raw.startTime)
      : raw.date
        ? String(raw.date)
        : undefined;

  const thumbRaw = String(raw.thumbnail ?? raw.poster ?? raw.image ?? "");
  const previewRaw = raw.previewSource ?? raw.preview ?? raw.clip;
  const previewSources = normalizeSources(previewRaw);

  const scoreRaw = raw.score as
    | { home?: unknown; away?: unknown }
    | undefined;

  return {
    id: id || slugify(title),
    slug: raw.slug ? slugify(String(raw.slug)) : slugify(title),
    title,
    sport: sportSlug,
    sportLabel:
      cleanText(String(raw.sportLabel ?? "")) ||
      sportSlug.replace(/(^|\s)\S/g, (c) => c.toUpperCase()),
    competition: cleanText(String(raw.competition ?? raw.league ?? "")) || undefined,
    status: toStatus(raw.status, startsAt),
    startsAt,
    endsAt: raw.endsAt ? String(raw.endsAt) : undefined,
    thumbnail: thumbRaw && !isBlockedUrl(thumbRaw) ? thumbRaw : undefined,
    sources,
    previewSource: previewSources[0],
    home: cleanText(String(raw.home ?? raw.homeTeam ?? "")) || undefined,
    away: cleanText(String(raw.away ?? raw.awayTeam ?? "")) || undefined,
    score: scoreRaw
      ? { home: Number(scoreRaw.home ?? 0), away: Number(scoreRaw.away ?? 0) }
      : undefined,
    viewers: raw.viewers != null ? Number(raw.viewers) : undefined,
    canonicalUrl:
      raw.canonicalUrl && !isBlockedUrl(String(raw.canonicalUrl))
        ? String(raw.canonicalUrl)
        : undefined,
  };
}

export function normalizeSection(raw: Record<string, unknown>): Section {
  const title = cleanText(String(raw.title ?? raw.name ?? "")) || "Section";
  return {
    slug: slugify(String(raw.slug ?? raw.id ?? title)),
    title,
    description: cleanText(String(raw.description ?? "")) || undefined,
    order: raw.order != null ? Number(raw.order) : undefined,
    layout: raw.layout === "grid" ? "grid" : "rail",
  };
}
