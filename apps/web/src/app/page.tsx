import { getProvider } from "@/lib/content";
import { config } from "@/lib/config";
import { groupLiveBySport } from "@/lib/live";
import { getOverrides, getSportOrder } from "@/lib/overrides";
import { Hero } from "@/components/Hero";
import { VideoRail } from "@/components/VideoRail";
import { LiveWall } from "@/components/live/LiveWall";
import { LiveSpotlight } from "@/components/live/LiveSpotlight";
import { SectionJump } from "@/components/SectionJump";
import type { LiveEvent, Video } from "@/lib/types";

// Rendered per request so the feed is never stale and never depends on what
// data existed at build time. Upstream calls are served from the process
// micro-cache (src/lib/cache.ts), so this stays fast.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const provider = getProvider();

  let sections: Awaited<ReturnType<typeof provider.getSections>> = [];
  let live: LiveEvent[] = [];
  let sportOrder = config.sportOrder;
  let overrides: Awaited<ReturnType<typeof getOverrides>> = {};
  try {
    [sections, live, sportOrder, overrides] = await Promise.all([
      provider.getSections(),
      provider.getLiveEvents().catch(() => [] as LiveEvent[]),
      getSportOrder(),
      getOverrides(),
    ]);
  } catch {
    return <ProviderError />;
  }

  const rails = await Promise.all(
    sections.map(async (s) => {
      try {
        const page = await provider.getVideos({ section: s.slug, limit: 12 });
        return { section: s, videos: page.items };
      } catch {
        return { section: s, videos: [] as Video[] };
      }
    }),
  );

  const liveGroups = groupLiveBySport(live, sportOrder);
  const hasLive = liveGroups.length > 0;
  const populated = rails.filter((r) => r.videos.length > 0);

  const liveNow = live.filter((e) => e.status === "live");
  const spotlight =
    (overrides.featuredLiveId &&
      liveNow.find(
        (e) =>
          e.id === overrides.featuredLiveId ||
          e.slug === overrides.featuredLiveId,
      )) ||
    liveGroups[0]?.events.find((e) => e.status === "live") ||
    liveGroups[0]?.events[0];

  const allVideos = populated.flatMap((r) => r.videos);
  const pinnedVideo = overrides.featuredVideoId
    ? allVideos.find(
        (v) =>
          v.id === overrides.featuredVideoId ||
          v.slug === overrides.featuredVideoId,
      )
    : undefined;
  const hero = !hasLive
    ? (pinnedVideo ?? allVideos.find((v) => v.thumbnail))
    : undefined;

  const jump = [
    ...(hasLive ? [{ id: "live", label: "Live" }] : []),
    ...populated.map((r) => ({
      id: `sec-${r.section.slug}`,
      label: r.section.title,
    })),
  ];

  return (
    <div className="snap-y-section">
      {hasLive && spotlight ? (
        <LiveSpotlight event={spotlight} />
      ) : (
        hero && <Hero video={hero} />
      )}

      <SectionJump items={jump} />

      <div id="showcase" className="scroll-mt-[var(--nav-h)]" />

      {hasLive && (
        <div id="live" className="snap-section scroll-mt-[var(--nav-h)] pt-12 md:pt-16">
          <LiveWall groups={liveGroups} maxPreviews={config.maxLivePreviews} />
        </div>
      )}

      <div>
        {populated.map(({ section, videos }) => (
          <VideoRail key={section.slug} section={section} videos={videos} />
        ))}
      </div>

      {!hasLive && populated.length === 0 && (
        <p className="mx-auto max-w-rail px-5 py-24 text-center text-sm tracking-[0.08em] text-[var(--muted)]">
          Connected to the <b>{config.provider}</b> provider, but no content came
          back. Check your configuration in <code>.env.local</code>.
        </p>
      )}
    </div>
  );
}

function ProviderError() {
  return (
    <div className="mx-auto max-w-rail px-5 py-32 text-center md:px-10">
      <p className="eyebrow">Configuration</p>
      <h1 className="mt-3 text-2xl font-medium">Content source unreachable</h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[var(--muted)]">
        View is set to the <b>{config.provider}</b> provider but could not load
        content. Verify <code>SITE_API_URL</code> / <code>RSS_FEEDS</code> in your
        environment, or set <code>CONTENT_PROVIDER=mock</code> to preview with
        demo data.
      </p>
    </div>
  );
}
