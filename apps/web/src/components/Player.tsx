"use client";

import { useEffect, useRef, useState } from "react";
import type { VideoSource } from "@/lib/types";
import { CastButton } from "./CastButton";

/**
 * Ad-free player.
 *  - Native HLS on Safari/iOS; hls.js elsewhere, tuned for low-latency.
 *  - Progressive MP4/WebM fallback via <source> list.
 *  - No pre-roll, no VAST/VMAP, no third-party player embeds.
 */
export function Player({
  sources,
  poster,
  title,
  live = false,
  autoPlay = false,
}: {
  sources: VideoSource[];
  poster?: string;
  title?: string;
  live?: boolean;
  autoPlay?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pipSupported, setPipSupported] = useState(false);

  useEffect(() => {
    setPipSupported(
      typeof document !== "undefined" && "pictureInPictureEnabled" in document,
    );
  }, []);

  const hls = sources.find(
    (s) => s.type === "application/x-mpegURL" || s.url.includes(".m3u8"),
  );
  const progressive = sources.filter((s) => s !== hls);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hls) return;

    // Safari / iOS play HLS natively.
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hls.url;
      if (autoPlay) video.play().catch(() => {});
      return;
    }

    let destroyed = false;
    let instance: import("hls.js").default | null = null;

    (async () => {
      const mod = await import("hls.js");
      const Hls = mod.default;
      if (destroyed) return;
      if (!Hls.isSupported()) {
        if (progressive[0]) video.src = progressive[0].url;
        else setError("This browser cannot play this stream.");
        return;
      }
      instance = new Hls({
        lowLatencyMode: true,
        backBufferLength: live ? 8 : 30,
        maxBufferLength: live ? 10 : 20,
        liveSyncDurationCount: 3,
        enableWorker: true,
        startLevel: -1,
      });
      instance.loadSource(hls.url);
      instance.attachMedia(video);
      if (autoPlay) {
        instance.on(Hls.Events.MANIFEST_PARSED, () =>
          video.play().catch(() => {}),
        );
      }
      instance.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              instance?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              instance?.recoverMediaError();
              break;
            default:
              instance?.destroy();
              if (progressive[0]) video.src = progressive[0].url;
              else setError("Playback error.");
          }
        }
      });
    })();

    return () => {
      destroyed = true;
      instance?.destroy();
    };
  }, [hls, progressive, live, autoPlay]);

  // Keyboard shortcuts (when the player region has focus / is hovered)
  useEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current;
    if (!root || !video) return;
    const onKey = (e: KeyboardEvent) => {
      if (!root.matches(":hover") && !root.contains(document.activeElement)) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          video.paused ? video.play() : video.pause();
          break;
        case "m":
          video.muted = !video.muted;
          break;
        case "f":
          if (document.fullscreenElement) document.exitFullscreen();
          else root.requestFullscreen?.();
          break;
        case "arrowright":
        case "l":
          if (!live) video.currentTime += 10;
          break;
        case "arrowleft":
        case "j":
          if (!live) video.currentTime -= 10;
          break;
        case "arrowup":
          video.volume = Math.min(1, video.volume + 0.1);
          break;
        case "arrowdown":
          video.volume = Math.max(0, video.volume - 0.1);
          break;
        case "p":
          void video
            .requestPictureInPicture?.()
            .catch(() => {});
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [live]);

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      className="group relative w-full overflow-hidden rounded-lg bg-black outline-none"
    >
      <video
        ref={videoRef}
        controls
        playsInline
        preload="metadata"
        poster={poster}
        aria-label={title}
        {...{ "x-webkit-airplay": "allow" }}
        className="aspect-video h-full w-full bg-black"
        onError={() => {
          if (!hls && progressive.length === 0) setError("No playable source.");
        }}
      >
        {!hls &&
          progressive.map((s) => (
            <source key={s.url} src={s.url} type={s.type ?? undefined} />
          ))}
      </video>

      <div className="absolute right-3 top-3 flex gap-2">
        {pipSupported && (
          <button
            onClick={() =>
              document.pictureInPictureElement
                ? document.exitPictureInPicture()
                : videoRef.current?.requestPictureInPicture?.().catch(() => {})
            }
            aria-label="Picture in picture"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z" />
            </svg>
          </button>
        )}
        <CastButton videoRef={videoRef} />
      </div>

      <div className="pointer-events-none absolute bottom-14 left-3 rounded bg-black/55 px-2 py-1 text-[0.62rem] uppercase tracking-[0.1em] text-white/70 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
        space play · f full · m mute{live ? "" : " · j/l ±10s"} · p pip
      </div>

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-6 text-center text-sm tracking-[0.08em] text-white">
          {error}
        </div>
      )}
    </div>
  );
}
