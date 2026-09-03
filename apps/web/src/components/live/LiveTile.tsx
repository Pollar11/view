"use client";

import Link from "next/link";
import { forwardRef } from "react";
import type { LiveEvent } from "@/lib/types";
import { LivePreview } from "./LivePreview";
import { WatchlistButton } from "@/components/WatchlistButton";
import { matchClock, timeUntil, formatViews } from "@/lib/format";

type Props = {
  event: LiveEvent;
  active: boolean;
  focused: boolean;
  onFocus: () => void;
};

export const LiveTile = forwardRef<HTMLDivElement, Props>(function LiveTile(
  { event, active, focused, onFocus },
  ref,
) {
  const href = `/live/${event.slug ?? event.id}`;
  const isLive = event.status === "live";
  const previewSources = event.previewSource
    ? [event.previewSource, ...event.sources]
    : event.sources;

  return (
    <div
      ref={ref}
      data-event-id={event.id}
      className="group relative"
      onMouseEnter={onFocus}
      onFocus={onFocus}
    >
      <Link
        href={href}
        prefetch
        className="block overflow-hidden rounded-md bg-[var(--panel)] outline-none ring-[var(--fg)] focus-visible:ring-2"
        onClick={onFocus}
      >
        <div className="relative aspect-video">
          {isLive ? (
            <LivePreview
              sources={previewSources}
              poster={event.thumbnail}
              active={active}
              withAudio={focused}
              className="h-full w-full"
            />
          ) : event.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.thumbnail}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover opacity-70"
            />
          ) : (
            <div className="h-full w-full" />
          )}

          {/* status chip */}
          <span className="absolute left-2 top-2 flex items-center gap-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[0.68rem] font-semibold tracking-[0.06em] text-white">
            {isLive ? (
              <>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                {matchClock(event.startsAt)}
              </>
            ) : (
              <span className="text-white/80">{timeUntil(event.startsAt)}</span>
            )}
          </span>

          <div className="absolute right-2 top-2 flex items-center gap-1.5">
            {typeof event.viewers === "number" && event.viewers > 0 && (
              <span className="rounded bg-black/75 px-1.5 py-0.5 text-[0.66rem] tabular-nums text-white">
                {formatViews(event.viewers).replace(" views", "")}
              </span>
            )}
            <span className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <WatchlistButton
                item={{
                  id: event.id,
                  type: "live",
                  title: event.title,
                  href,
                  thumbnail: event.thumbnail,
                  subtitle: event.competition ?? event.sportLabel,
                }}
              />
            </span>
          </div>

          {/* score / matchup overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2.5 text-white">
            {event.home && event.away ? (
              <div className="flex items-center justify-between text-[0.8rem] font-medium">
                <span className="truncate">{event.home}</span>
                {event.score ? (
                  <span className="mx-2 tabular-nums">
                    {event.score.home}–{event.score.away}
                  </span>
                ) : (
                  <span className="mx-2 text-white/60">vs</span>
                )}
                <span className="truncate text-right">{event.away}</span>
              </div>
            ) : (
              <div className="truncate text-[0.8rem] font-medium">
                {event.title}
              </div>
            )}
          </div>
        </div>
      </Link>

      <div className="mt-2 flex items-center justify-between">
        <p className="truncate text-[0.75rem] tracking-[0.04em] text-[var(--muted)]">
          {event.competition ?? event.sportLabel}
        </p>
        <Link
          href={href}
          prefetch
          className="text-[0.7rem] font-medium tracking-[0.08em] text-[var(--muted)] hover:text-[var(--fg)]"
        >
          {isLive ? "WATCH" : "DETAILS"}
        </Link>
      </div>
    </div>
  );
});
