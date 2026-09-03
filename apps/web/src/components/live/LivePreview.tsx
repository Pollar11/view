"use client";

import { useEffect, useRef, useState } from "react";
import type { VideoSource } from "@/lib/types";

type Phase = "idle" | "loading" | "playing" | "error";

/**
 * Lightweight in-wall live preview.
 *  - only mounts a real stream when `active` (parent caps how many are active)
 *  - muted, lowest rendition, tiny buffer  -> minimal bandwidth per tile
 *  - detaches immediately when deactivated  -> no background buffering
 *  - `withAudio` + full quality only for the single focused tile
 */
export function LivePreview({
  sources,
  poster,
  active,
  withAudio = false,
  className = "",
}: {
  sources: VideoSource[];
  poster?: string;
  active: boolean;
  withAudio?: boolean;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");

  const hls = sources.find(
    (s) => s.type === "application/x-mpegURL" || s.url.includes(".m3u8"),
  );
  const mp4 = sources.find((s) => s !== hls);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!active) {
      // tear everything down
      video.pause();
      video.removeAttribute("src");
      video.load();
      setPhase("idle");
      return;
    }

    setPhase("loading");
    video.muted = !withAudio;

    const onPlaying = () => setPhase("playing");
    video.addEventListener("playing", onPlaying);

    let destroyed = false;
    let inst: import("hls.js").default | null = null;

    if (hls && video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hls.url;
      video.play().catch(() => {});
    } else if (hls) {
      import("hls.js").then(({ default: Hls }) => {
        if (destroyed || !videoRef.current) return;
        if (!Hls.isSupported()) {
          if (mp4) {
            video.src = mp4.url;
            video.play().catch(() => {});
          } else setPhase("error");
          return;
        }
        inst = new Hls({
          lowLatencyMode: true,
          capLevelToPlayerSize: true,
          startLevel: withAudio ? -1 : 0,
          maxBufferLength: withAudio ? 12 : 4,
          backBufferLength: 0,
          liveSyncDurationCount: 3,
          enableWorker: true,
        });
        inst.loadSource(hls.url);
        inst.attachMedia(video);
        inst.on(Hls.Events.ERROR, (_e, d) => {
          if (!d.fatal || !inst) return;
          if (d.type === Hls.ErrorTypes.NETWORK_ERROR) inst.startLoad();
          else if (d.type === Hls.ErrorTypes.MEDIA_ERROR)
            inst.recoverMediaError();
          else {
            inst.destroy();
            inst = null;
            setPhase("error");
          }
        });
        video.play().catch(() => {});
      });
    } else if (mp4) {
      video.src = mp4.url;
      video.play().catch(() => {});
    } else {
      setPhase("error");
    }

    return () => {
      destroyed = true;
      video.removeEventListener("playing", onPlaying);
      inst?.destroy();
    };
  }, [active, withAudio, hls, mp4]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            phase === "playing" ? "opacity-0" : "opacity-100"
          }`}
        />
      )}
      <video
        ref={videoRef}
        muted={!withAudio}
        playsInline
        preload="none"
        poster={poster}
        className="relative h-full w-full object-cover"
      />
      {active && phase === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        </div>
      )}
    </div>
  );
}
