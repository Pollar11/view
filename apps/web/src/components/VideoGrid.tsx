"use client";

import useSWRInfinite from "swr/infinite";
import type { Page, Video } from "@/lib/types";
import { VideoCard } from "./VideoCard";

const fetcher = (url: string) => fetch(url).then((r) => r.json() as Promise<Page<Video>>);

export function VideoGrid({
  section,
  query,
  initial,
}: {
  section?: string;
  query?: string;
  initial?: Page<Video>;
}) {
  const getKey = (index: number, prev: Page<Video> | null) => {
    if (prev && !prev.nextCursor) return null;
    const params = new URLSearchParams();
    if (section) params.set("section", section);
    if (query) params.set("q", query);
    if (index > 0 && prev?.nextCursor) params.set("cursor", prev.nextCursor);
    return `/api/videos?${params.toString()}`;
  };

  const { data, size, setSize, isLoading, isValidating } = useSWRInfinite(
    getKey,
    fetcher,
    {
      fallbackData: initial ? [initial] : undefined,
      revalidateFirstPage: false,
    },
  );

  const pages = data ?? [];
  const videos = pages.flatMap((p) => p?.items ?? []);
  const canLoadMore = pages[pages.length - 1]?.nextCursor;
  const busy = isLoading || isValidating;

  if (!busy && videos.length === 0) {
    return (
      <p className="mx-auto max-w-rail px-5 py-24 text-center text-sm tracking-[0.08em] text-[var(--muted)] md:px-10">
        Nothing here yet.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-rail px-5 md:px-10">
      <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
        {videos.map((v, i) => (
          <VideoCard key={`${v.id}-${i}`} video={v} priority={i < 4} />
        ))}
      </div>

      <div className="flex justify-center py-12">
        {canLoadMore ? (
          <button
            className="tsl-btn tsl-btn-ghost"
            disabled={busy}
            onClick={() => setSize(size + 1)}
          >
            {busy ? "Loading…" : "Load more"}
          </button>
        ) : videos.length > 0 ? (
          <span className="eyebrow">End</span>
        ) : null}
      </div>
    </div>
  );
}
