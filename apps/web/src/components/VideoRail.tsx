"use client";

import { useRef } from "react";
import Link from "next/link";
import type { Section, Video } from "@/lib/types";
import { VideoCard } from "./VideoCard";

export function VideoRail({
  section,
  videos,
}: {
  section: Pick<Section, "slug" | "title" | "description">;
  videos: Video[];
}) {
  const scroller = useRef<HTMLDivElement>(null);

  const nudge = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  if (!videos.length) return null;

  return (
    <section
      id={`sec-${section.slug}`}
      className="snap-section scroll-mt-[var(--nav-h)] py-12 fadeup md:py-16"
    >
      <div className="mx-auto flex max-w-rail items-end justify-between px-5 md:px-10">
        <div>
          <p className="eyebrow">Section</p>
          <h2 className="mt-2 text-2xl font-medium md:text-[2rem]">
            <Link href={`/s/${section.slug}`} className="transition-opacity hover:opacity-60">
              {section.title}
            </Link>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/s/${section.slug}`}
            className="hidden text-[0.72rem] font-medium uppercase tracking-[0.1em] text-[var(--muted)] hover:text-[var(--fg)] sm:block"
          >
            View all
          </Link>
          <div className="hidden gap-2 md:flex">
            <button
              aria-label="Scroll left"
              onClick={() => nudge(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border hairline transition-colors hover:bg-[var(--fg)] hover:text-[var(--bg)]"
            >
              ‹
            </button>
            <button
              aria-label="Scroll right"
              onClick={() => nudge(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border hairline transition-colors hover:bg-[var(--fg)] hover:text-[var(--bg)]"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scroller}
        className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-5 md:gap-6 md:px-10"
      >
        {videos.map((v, i) => (
          <div
            key={v.id}
            className="w-[78%] flex-none snap-start sm:w-[46%] md:w-[31%] lg:w-[23.5%]"
          >
            <VideoCard video={v} priority={i < 2} />
          </div>
        ))}
      </div>
    </section>
  );
}
