"use client";

import { useEffect, useRef, useState } from "react";

type RemoteEl = HTMLVideoElement & {
  remote?: {
    prompt: () => Promise<void>;
    watchAvailability?: (cb: (available: boolean) => void) => Promise<number>;
    cancelWatchAvailability?: (id?: number) => Promise<void>;
    state?: string;
  };
  webkitShowPlaybackTargetPicker?: () => void;
};

/**
 * Casts the current <video> to Chromecast / AirPlay using the browser-native
 * Remote Playback API — no third-party Cast SDK, so the strict CSP stays intact.
 * Falls back to Safari's `webkitShowPlaybackTargetPicker`.
 */
export function CastButton({
  videoRef,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}) {
  const [available, setAvailable] = useState(false);
  const watchId = useRef<number | undefined>(undefined);

  useEffect(() => {
    const el = videoRef.current as RemoteEl | null;
    if (!el) return;

    let cancelled = false;

    if (el.remote?.watchAvailability) {
      el.remote
        .watchAvailability((a) => !cancelled && setAvailable(a))
        .then((id) => (watchId.current = id))
        .catch(() => {
          // Some browsers reject watchAvailability but still support prompt()
          if (!cancelled) setAvailable(true);
        });
    } else if (
      typeof el.webkitShowPlaybackTargetPicker === "function" ||
      "WebKitPlaybackTargetAvailabilityEvent" in window
    ) {
      const onAvail = (e: Event) =>
        setAvailable((e as unknown as { availability: string }).availability === "available");
      el.addEventListener(
        "webkitplaybacktargetavailabilitychanged",
        onAvail as EventListener,
      );
      return () => {
        cancelled = true;
        el.removeEventListener(
          "webkitplaybacktargetavailabilitychanged",
          onAvail as EventListener,
        );
      };
    }

    return () => {
      cancelled = true;
      if (watchId.current != null)
        el.remote?.cancelWatchAvailability?.(watchId.current).catch(() => {});
    };
  }, [videoRef]);

  if (!available) return null;

  const cast = () => {
    const el = videoRef.current as RemoteEl | null;
    if (!el) return;
    if (el.remote?.prompt) el.remote.prompt().catch(() => {});
    else el.webkitShowPlaybackTargetPicker?.();
  };

  return (
    <button
      onClick={cast}
      aria-label="Cast to TV"
      className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm0-4v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11zm20-7H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
      </svg>
    </button>
  );
}
