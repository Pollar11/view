import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProvider } from "@/lib/content";
import { config } from "@/lib/config";
import { groupLiveBySport } from "@/lib/live";
import { getSportOrder } from "@/lib/overrides";
import { Player } from "@/components/Player";
import { LiveWall } from "@/components/live/LiveWall";
import { WatchlistButton } from "@/components/WatchlistButton";
import { matchClock, timeUntil, formatViews } from "@/lib/format";

export const dynamic = "force-dynamic";

async function load(id: string) {
  const provider = getProvider();
  const event = provider.getLiveEvent
    ? await provider.getLiveEvent(id).catch(() => null)
    : null;
  return event;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await load(id);
  if (!event) return { title: "Live" };
  return {
    title: `${event.title} — Live`,
    description: `${event.competition ?? event.sportLabel} · live on View`,
    openGraph: {
      title: event.title,
      images: event.thumbnail ? [event.thumbnail] : undefined,
    },
    alternates: event.canonicalUrl
      ? { canonical: event.canonicalUrl }
      : undefined,
  };
}

export default async function LiveWatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await load(id);
  if (!event || event.sources.length === 0) notFound();

  const isLive = event.status === "live";

  const [othersRaw, order] = await Promise.all([
    getProvider()
      .getLiveEvents({ sport: event.sport })
      .catch(() => []),
    getSportOrder(),
  ]);
  const groups = groupLiveBySport(
    othersRaw.filter((e) => e.id !== event.id),
    order,
  );

  return (
    <div className="mx-auto max-w-[1100px] px-4 pt-6 md:px-6">
      {isLive ? (
        <Player
          sources={event.sources}
          poster={event.thumbnail}
          title={event.title}
          live
          autoPlay
        />
      ) : (
        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-[var(--panel)]">
          {event.thumbnail && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.thumbnail}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-40"
            />
          )}
          <div className="relative text-center">
            <p className="eyebrow">Starts</p>
            <p className="mt-1 text-2xl font-medium">
              {timeUntil(event.startsAt)}
            </p>
          </div>
        </div>
      )}

      <div className="mt-5">
        <div className="flex items-center gap-3">
          <span
            className={`flex items-center gap-1.5 rounded px-2 py-0.5 text-[0.7rem] font-semibold tracking-[0.08em] ${
              isLive ? "bg-red-600 text-white" : "bg-[var(--panel)] text-[var(--muted)]"
            }`}
          >
            {isLive ? (
              <>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                {matchClock(event.startsAt)}
              </>
            ) : (
              "UPCOMING"
            )}
          </span>
          <span className="text-[0.78rem] tracking-[0.06em] text-[var(--muted)]">
            {event.competition ?? event.sportLabel}
            {event.viewers ? `  ·  ${formatViews(event.viewers)}` : ""}
          </span>
        </div>

        {event.home && event.away ? (
          <div className="mt-4 flex items-center gap-6 text-2xl font-medium md:text-3xl">
            <span>{event.home}</span>
            {event.score ? (
              <span className="tabular-nums">
                {event.score.home}
                <span className="mx-2 text-[var(--muted)]">–</span>
                {event.score.away}
              </span>
            ) : (
              <span className="text-[var(--muted)]">vs</span>
            )}
            <span>{event.away}</span>
          </div>
        ) : (
          <h1 className="mt-3 text-2xl font-medium tracking-[0.02em] md:text-3xl">
            {event.title}
          </h1>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <WatchlistButton
            variant="full"
            item={{
              id: event.id,
              type: "live",
              title: event.title,
              href: `/live/${event.slug ?? event.id}`,
              thumbnail: event.thumbnail,
              subtitle: event.competition ?? event.sportLabel,
            }}
          />
          <Link href="/multiview" className="tsl-btn tsl-btn-ghost">
            Multiview
          </Link>
          <Link href="/scores" className="tsl-btn tsl-btn-ghost">
            Scores
          </Link>
          {event.canonicalUrl && (
            <a
              href={event.canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.75rem] tracking-[0.08em] text-[var(--muted)] underline underline-offset-4"
            >
              Original site ↗
            </a>
          )}
        </div>
      </div>

      {groups.length > 0 && (
        <div className="mt-14">
          <LiveWall
            groups={groups}
            maxPreviews={config.maxLivePreviews}
            showTabs={false}
            heading={`More ${event.sportLabel ?? "live"}`}
          />
        </div>
      )}
    </div>
  );
}
