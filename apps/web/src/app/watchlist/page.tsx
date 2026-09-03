"use client";

import Link from "next/link";
import { useWatchlist, removeFromWatchlist } from "@/lib/watchlist";

export default function WatchlistPage() {
  const items = useWatchlist();

  return (
    <div className="mx-auto max-w-rail px-5 pt-12 md:px-10">
      <p className="eyebrow">Your list</p>
      <h1 className="mt-2 text-3xl font-medium tracking-[0.02em] md:text-4xl">
        Watchlist
      </h1>

      {items.length === 0 ? (
        <p className="py-24 text-center text-sm tracking-[0.08em] text-[var(--muted)]">
          Nothing saved yet. Tap the ★ on any video or match.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:grid-cols-4">
          {items.map((it) => (
            <div key={`${it.type}:${it.id}`} className="group">
              <Link href={it.href} className="block">
                <div className="relative aspect-video overflow-hidden rounded-md bg-[var(--panel)]">
                  {it.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.thumbnail}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  )}
                  {it.type === "live" && (
                    <span className="absolute left-2 top-2 flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[0.62rem] font-semibold tracking-[0.06em] text-white">
                      LIVE
                    </span>
                  )}
                </div>
              </Link>
              <div className="mt-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[0.9rem] font-medium">{it.title}</p>
                  {it.subtitle && (
                    <p className="truncate text-[0.72rem] text-[var(--muted)]">
                      {it.subtitle}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeFromWatchlist(it.id, it.type)}
                  aria-label="Remove"
                  className="shrink-0 text-[var(--muted)] hover:text-[var(--fg)]"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
