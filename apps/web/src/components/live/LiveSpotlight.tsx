"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { LiveEvent } from "@/lib/types";
import { LivePreview } from "./LivePreview";
import { matchClock, formatViews } from "@/lib/format";

/**
 * Full-bleed hero for the single top live event — Tesla-style opening frame,
 * but it's a live stream. Muted auto-preview; the real thing is one tap away.
 */
export function LiveSpotlight({ event }: { event: LiveEvent }) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const href = `/live/${event.slug ?? event.id}`;
  const sources = event.previewSource
    ? [event.previewSource, ...event.sources]
    : event.sources;

  return (
    <section
      ref={ref}
      className="snap-section relative flex h-[calc(100svh-var(--nav-h))] min-h-[520px] w-full flex-col items-center justify-end overflow-hidden bg-black"
    >
      <LivePreview
        sources={sources}
        poster={event.thumbnail}
        active={visible}
        className="absolute inset-0 h-full w-full [&>video]:object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/85" />

      <div className="relative z-10 mb-[12vh] flex w-full max-w-rail flex-col items-center px-6 text-center text-white fadeup">
        <p className="eyebrow flex items-center gap-2 !text-white/80">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
          Live · {event.competition ?? event.sportLabel} · {matchClock(event.startsAt)}
        </p>
        {event.home && event.away ? (
          <h1 className="mt-3 flex flex-wrap items-baseline justify-center gap-x-4 gap-y-1 text-[1.9rem] font-medium leading-[1.05] tracking-[-0.01em] sm:text-5xl md:text-6xl">
            <span>{event.home}</span>
            <span className="tabular-nums text-white/60">
              {event.score ? `${event.score.home}–${event.score.away}` : "v"}
            </span>
            <span>{event.away}</span>
          </h1>
        ) : (
          <h1 className="mt-3 max-w-3xl text-[2rem] font-medium leading-[1.05] tracking-[-0.01em] sm:text-5xl md:text-6xl">
            {event.title}
          </h1>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={href} className="tsl-btn tsl-btn-solid !bg-white !text-black">
            Watch live
          </Link>
          <Link href="/live" className="tsl-btn tsl-btn-ghost !border-white/50 !text-white">
            All live{event.viewers ? ` · ${formatViews(event.viewers)}` : ""}
          </Link>
        </div>
      </div>

      <a href="#showcase" aria-label="Scroll" className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 text-white/60">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="animate-bounce">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </a>
    </section>
  );
}
