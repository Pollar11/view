"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { VideoCard } from "@/components/VideoCard";
import { LiveTile } from "@/components/live/LiveTile";
import type { LiveEvent, Video } from "@/lib/types";

type Results = { q: string; live: LiveEvent[]; videos: Video[] };
const fetcher = (u: string) => fetch(u).then((r) => r.json() as Promise<Results>);

export default function SearchPage() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");

  // debounce
  useEffect(() => {
    const t = setTimeout(() => setQuery(input.trim()), 250);
    return () => clearTimeout(t);
  }, [input]);

  const { data, isLoading } = useSWR(
    query ? `/api/search?q=${encodeURIComponent(query)}` : null,
    fetcher,
    { keepPreviousData: true },
  );

  const live = data?.live ?? [];
  const videos = data?.videos ?? [];
  const empty = query && !isLoading && live.length === 0 && videos.length === 0;

  return (
    <div className="pt-12">
      <div className="mx-auto max-w-rail px-5 md:px-10">
        <p className="eyebrow">Search</p>
        <div className="mt-3 flex items-center gap-3 border-b hairline pb-3">
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search live &amp; videos"
            className="w-full bg-transparent text-2xl font-light tracking-[0.02em] outline-none placeholder:text-[var(--muted)]"
          />
          {isLoading && <span className="eyebrow">…</span>}
        </div>
      </div>

      <div className="mx-auto max-w-rail px-5 md:px-10">
        {!query && (
          <p className="py-24 text-center text-sm tracking-[0.08em] text-[var(--muted)]">
            Search across live events and the full library.
          </p>
        )}

        {empty && (
          <p className="py-24 text-center text-sm tracking-[0.08em] text-[var(--muted)]">
            No results for “{query}”.
          </p>
        )}

        {live.length > 0 && (
          <section className="mt-10">
            <h2 className="flex items-center gap-2 text-lg font-medium tracking-[0.04em]">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
              Live
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {live.map((e) => (
                <LiveTile
                  key={e.id}
                  event={e}
                  active={false}
                  focused={false}
                  onFocus={() => {}}
                />
              ))}
            </div>
          </section>
        )}

        {videos.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-medium tracking-[0.04em]">Videos</h2>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:grid-cols-4">
              {videos.map((v, i) => (
                <VideoCard key={v.id} video={v} priority={i < 4} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
