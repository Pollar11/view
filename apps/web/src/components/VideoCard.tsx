"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Video } from "@/lib/types";
import { formatDate, formatDuration, formatViews } from "@/lib/format";
import { WatchlistButton } from "./WatchlistButton";
import { LivePreview } from "./live/LivePreview";

const HOVER_DELAY = 450;

export function VideoCard({
  video,
  priority = false,
}: {
  video: Video;
  priority?: boolean;
}) {
  const router = useRouter();
  const href = `/watch/${video.slug ?? video.id}`;

  const [expanded, setExpanded] = useState(false);
  const [preview, setPreview] = useState(false);
  const [canHover, setCanHover] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setCanHover(
      window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    );
    return () => clearTimeout(timer.current);
  }, []);

  const open = useCallback((withPreview: boolean) => {
    setExpanded(true);
    if (withPreview) {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setPreview(true), HOVER_DELAY);
    }
  }, []);

  const close = useCallback(() => {
    clearTimeout(timer.current);
    setExpanded(false);
    setPreview(false);
  }, []);

  const meta = [formatViews(video.views), formatDate(video.publishedAt)]
    .filter(Boolean)
    .join("  ·  ");
  const blurb = video.description?.replace(/<[^>]+>/g, "").trim();

  return (
    <div
      className="group relative"
      onPointerEnter={() => canHover && open(true)}
      onPointerLeave={() => canHover && close()}
    >
      <div
        role="link"
        tabIndex={0}
        aria-label={video.title}
        onClick={(e) => {
          // first tap on touch = reveal; second = navigate
          if (!canHover && !expanded) {
            e.preventDefault();
            open(true);
            return;
          }
          router.push(href);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") router.push(href);
        }}
        className="relative block aspect-video cursor-pointer overflow-hidden rounded-lg bg-[var(--panel)] ring-1 ring-inset ring-black/5 outline-none focus-visible:ring-2 focus-visible:ring-[var(--fg)] dark:ring-white/5"
      >
        {video.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumbnail}
            alt=""
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className={`h-full w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
              expanded ? "scale-[1.05]" : ""
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--muted)]">
            <PlayGlyph />
          </div>
        )}

        {preview && video.sources?.length > 0 && (
          <LivePreview
            sources={video.sources}
            poster={video.thumbnail}
            active
            className="absolute inset-0 h-full w-full"
          />
        )}

        {video.durationSeconds ? (
          <span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-[0.7rem] font-medium tabular-nums text-white">
            {formatDuration(video.durationSeconds)}
          </span>
        ) : null}

        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            expanded && !preview ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-black">
            <PlayGlyph />
          </span>
        </div>

        <div
          className={`absolute right-2 top-2 transition-opacity duration-200 ${
            expanded ? "opacity-100" : "opacity-0 focus-within:opacity-100"
          }`}
        >
          <WatchlistButton
            item={{
              id: video.id,
              type: "video",
              title: video.title,
              href,
              thumbnail: video.thumbnail,
              subtitle: formatViews(video.views) || undefined,
            }}
          />
        </div>

        {/* details overlay */}
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-3 pb-3 pt-8 text-white transition-all duration-300 ${
            expanded
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-2 opacity-0"
          }`}
        >
          <p className="line-clamp-1 text-[0.85rem] font-medium">{video.title}</p>
          {meta && <p className="mt-0.5 text-[0.68rem] text-white/70">{meta}</p>}
          {blurb && (
            <p className="mt-1 line-clamp-2 text-[0.72rem] leading-snug text-white/80">
              {blurb}
            </p>
          )}
          {video.tags && video.tags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {video.tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/15 px-1.5 py-0.5 text-[0.62rem] tracking-[0.04em]"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <div className="mt-2 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(href);
              }}
              className="rounded bg-white px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.06em] text-black"
            >
              Watch
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <h3 className="line-clamp-2 text-[0.95rem] font-medium leading-snug">
          <Link href={href} className="transition-opacity hover:opacity-70">
            {video.title}
          </Link>
        </h3>
        {meta && (
          <p className="mt-1 text-[0.75rem] tracking-[0.06em] text-[var(--muted)]">
            {meta}
          </p>
        )}
      </div>
    </div>
  );
}

function PlayGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
