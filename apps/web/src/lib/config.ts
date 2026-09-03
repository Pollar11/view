export const config = {
  provider: (process.env.CONTENT_PROVIDER ?? "mock").toLowerCase() as
    | "mock"
    | "rest"
    | "rss",
  siteApiUrl: process.env.SITE_API_URL?.replace(/\/+$/, "") ?? "",
  siteApiToken: process.env.SITE_API_TOKEN ?? "",
  rssFeeds: (process.env.RSS_FEEDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  revalidate: Number(process.env.CONTENT_REVALIDATE_SECONDS ?? "60"),
  /** How often live-event lists are refreshed from upstream (seconds). */
  liveRevalidate: Number(process.env.LIVE_REVALIDATE_SECONDS ?? "15"),
  /** Sport slugs in display order; anything not listed sorts after, A–Z. */
  sportOrder: (
    process.env.LIVE_SPORT_ORDER ??
    "soccer,basketball,tennis,cricket,motorsport,americanfootball,baseball,hockey"
  )
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
  /** Max simultaneously-playing preview tiles in the live wall. */
  maxLivePreviews: Number(process.env.MAX_LIVE_PREVIEWS ?? "6"),
};

/** Order comparator for sport slugs honoring config.sportOrder (soccer first). */
export function sportRank(slug: string): number {
  const i = config.sportOrder.indexOf(slug.toLowerCase());
  return i === -1 ? config.sportOrder.length + 1 : i;
}

export type AppConfig = typeof config;
