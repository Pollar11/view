"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { SportGroup } from "@/lib/live";
import { LiveTile } from "./LiveTile";

/**
 * The live wall: a sport tab bar (soccer first, per server ordering) and a grid
 * of auto-previewing tiles. At most `maxPreviews` tiles stream at once — the
 * ones actually on screen — so bandwidth stays bounded no matter how many
 * events are listed. On hover-capable devices the pointed-at tile gets audio +
 * full quality; everything else stays muted and capped to the lowest rendition.
 */
export function LiveWall({
  groups,
  maxPreviews = 6,
  showTabs = true,
  heading,
  initialSport,
}: {
  groups: SportGroup[];
  maxPreviews?: number;
  showTabs?: boolean;
  heading?: string;
  initialSport?: string;
}) {
  const [sport, setSport] = useState(
    (initialSport && groups.some((g) => g.sport === initialSport)
      ? initialSport
      : groups[0]?.sport) ?? "",
  );
  const group = groups.find((g) => g.sport === sport) ?? groups[0];
  const events = useMemo(() => group?.events ?? [], [group]);

  const [visible, setVisible] = useState<string[]>([]);
  const [focused, setFocused] = useState<string | null>(null);
  const canHover = useRef(false);
  const tileRefs = useRef(new Map<string, HTMLDivElement>());
  const io = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    canHover.current =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }, []);

  // reset when switching sport
  useEffect(() => {
    setVisible([]);
    setFocused(null);
  }, [sport]);

  const register = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      const map = tileRefs.current;
      const prev = map.get(id);
      if (prev && io.current) io.current.unobserve(prev);
      if (el) {
        map.set(id, el);
        io.current?.observe(el);
      } else {
        map.delete(id);
      }
    },
    [],
  );

  useEffect(() => {
    io.current = new IntersectionObserver(
      (entries) => {
        setVisible((cur) => {
          const next = new Set(cur);
          for (const e of entries) {
            const id = (e.target as HTMLElement).dataset.eventId!;
            if (e.isIntersecting) next.add(id);
            else next.delete(id);
          }
          // keep document order
          return events.map((ev) => ev.id).filter((id) => next.has(id));
        });
      },
      { threshold: 0.5 },
    );
    for (const el of tileRefs.current.values()) io.current.observe(el);
    return () => io.current?.disconnect();
  }, [events]);

  const activeIds = new Set(visible.slice(0, maxPreviews));

  if (!group) return null;

  return (
    <section className="fadeup">
      <div className="mx-auto flex max-w-rail items-center justify-between px-5 md:px-10">
        <h2 className="flex items-center gap-2 text-xl font-medium tracking-[0.04em] md:text-2xl">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" />
          {heading ?? "Live now"}
        </h2>
        <Link
          href="/live"
          className="text-[0.75rem] font-medium tracking-[0.08em] text-[var(--muted)] hover:text-[var(--fg)]"
        >
          ALL LIVE ›
        </Link>
      </div>

      {showTabs && groups.length > 1 && (
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-5 md:px-10">
          {groups.map((g) => (
            <button
              key={g.sport}
              onClick={() => setSport(g.sport)}
              className={`flex-none rounded-full border px-3.5 py-1.5 text-[0.72rem] font-medium tracking-[0.08em] transition-colors ${
                g.sport === sport
                  ? "border-transparent bg-[var(--fg)] text-[var(--bg)]"
                  : "hairline text-[var(--muted)] hover:text-[var(--fg)]"
              }`}
            >
              {g.label.toUpperCase()}
              <span className="ml-1.5 opacity-60">{g.events.length}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mx-auto mt-5 grid max-w-rail grid-cols-1 gap-x-4 gap-y-7 px-5 sm:grid-cols-2 md:grid-cols-3 md:px-10 lg:grid-cols-4">
        {events.map((ev) => (
          <LiveTile
            key={ev.id}
            ref={register(ev.id)}
            event={ev}
            active={activeIds.has(ev.id)}
            focused={canHover.current && focused === ev.id}
            onFocus={() => canHover.current && setFocused(ev.id)}
          />
        ))}
      </div>
    </section>
  );
}
