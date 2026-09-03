"use client";

import Link from "next/link";
import useSWR from "swr";
import { useEffect, useRef, useState } from "react";
import type { LiveEvent } from "@/lib/types";
import type { SportGroup } from "@/lib/live";
import { matchClock, timeUntil } from "@/lib/format";

const fetcher = (u: string) =>
  fetch(u).then((r) => r.json() as Promise<{ groups: SportGroup[] }>);

/**
 * Score-only mode: every live match, no video. Polls /api/live on an interval
 * so it works on the tightest connection — a few KB per refresh.
 */
export function ScoreBoard({
  intervalMs = 15000,
  initial,
}: {
  intervalMs?: number;
  initial?: { groups: SportGroup[] };
}) {
  const { data } = useSWR("/api/live?grouped=1", fetcher, {
    refreshInterval: intervalMs,
    fallbackData: initial,
    revalidateOnFocus: true,
  });

  const groups = data?.groups ?? [];
  if (groups.length === 0) {
    return (
      <p className="py-24 text-center text-sm tracking-[0.08em] text-[var(--muted)]">
        Nothing live right now.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      {groups.map((g) => (
        <section key={g.sport}>
          <h2 className="eyebrow px-1">{g.label}</h2>
          <ul className="mt-3 divide-y hairline border-y hairline">
            {g.events.map((e) => (
              <ScoreRow key={e.id} e={e} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function ScoreRow({ e }: { e: LiveEvent }) {
  const isLive = e.status === "live";
  const score = e.score ? `${e.score.home}-${e.score.away}` : "";
  const [flash, setFlash] = useState(false);
  const prev = useRef(score);

  useEffect(() => {
    if (score && prev.current && score !== prev.current) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 1200);
      return () => clearTimeout(t);
    }
    prev.current = score;
  }, [score]);

  return (
    <li>
      <Link
        href={`/live/${e.slug ?? e.id}`}
        className="flex items-center gap-3 py-3 pl-1 pr-2 transition-colors hover:bg-[var(--panel)]"
      >
        <span
          className={`w-12 shrink-0 text-[0.7rem] font-semibold tracking-[0.05em] ${
            isLive ? "text-red-600" : "text-[var(--muted)]"
          }`}
        >
          {isLive ? matchClock(e.startsAt) : timeUntil(e.startsAt)}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-3 text-[0.95rem]">
            <span className="truncate">{e.home ?? e.title}</span>
            {e.score && (
              <span
                className={`shrink-0 tabular-nums font-semibold transition-colors ${
                  flash ? "text-red-600" : ""
                }`}
              >
                {e.score.home}
              </span>
            )}
          </span>
          {e.away && (
            <span className="mt-0.5 flex items-center justify-between gap-3 text-[0.95rem]">
              <span className="truncate">{e.away}</span>
              {e.score && (
                <span
                  className={`shrink-0 tabular-nums font-semibold transition-colors ${
                    flash ? "text-red-600" : ""
                  }`}
                >
                  {e.score.away}
                </span>
              )}
            </span>
          )}
        </span>

        <span className="hidden w-32 shrink-0 truncate text-right text-[0.72rem] text-[var(--muted)] sm:block">
          {e.competition}
        </span>
      </Link>
    </li>
  );
}
