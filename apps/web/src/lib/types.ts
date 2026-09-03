export type VideoSource = {
  /** Absolute URL. .m3u8 => HLS (low-latency), .mpd => DASH, otherwise progressive MP4/WebM. */
  url: string;
  /** MIME type, e.g. "application/x-mpegURL", "video/mp4". Optional; inferred from extension. */
  type?: string;
  /** Optional label for a quality/renditions picker ("1080p", "Auto"). */
  label?: string;
};

export type Video = {
  id: string;
  slug?: string;
  title: string;
  /** Plain text or trusted-ish HTML; always sanitized before render. */
  description?: string;
  /** Poster / thumbnail image URL. */
  thumbnail?: string;
  /** Playback sources, most-preferred first. */
  sources: VideoSource[];
  durationSeconds?: number;
  publishedAt?: string;
  views?: number;
  /** Section slugs this video belongs to. */
  sections?: string[];
  tags?: string[];
  /** Optional canonical URL back to your site. */
  canonicalUrl?: string;
};

export type LiveStatus = "live" | "upcoming" | "ended";

export type LiveEvent = {
  id: string;
  slug?: string;
  title: string;
  /** Sport slug — used for grouping/ordering. e.g. "soccer", "basketball". */
  sport: string;
  /** Human sport label, e.g. "Soccer". Falls back to a title-cased slug. */
  sportLabel?: string;
  competition?: string;
  status: LiveStatus;
  startsAt?: string;
  endsAt?: string;
  thumbnail?: string;
  /** Main playback sources, most-preferred first (HLS/LL-HLS ideal). */
  sources: VideoSource[];
  /** Optional ultra-low-bitrate loop shown in the wall before full playback. */
  previewSource?: VideoSource;
  home?: string;
  away?: string;
  score?: { home: number; away: number };
  viewers?: number;
  canonicalUrl?: string;
};

export type Section = {
  slug: string;
  title: string;
  description?: string;
  /** Lower sorts first. */
  order?: number;
  /** "rail" (horizontal scroller on home) or "grid". */
  layout?: "rail" | "grid";
};

export type Page<T> = {
  items: T[];
  nextCursor?: string | null;
};

export interface ContentProvider {
  name: string;
  getSections(): Promise<Section[]>;
  getVideos(opts: {
    section?: string;
    cursor?: string | null;
    limit?: number;
    query?: string;
  }): Promise<Page<Video>>;
  getVideo(idOrSlug: string): Promise<Video | null>;
  /** Live / upcoming events. Providers without live data return []. */
  getLiveEvents(opts?: {
    sport?: string;
    status?: LiveStatus;
  }): Promise<LiveEvent[]>;
  getLiveEvent?(idOrSlug: string): Promise<LiveEvent | null>;
}
