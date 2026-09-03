import Link from "next/link";
import type { Video } from "@/lib/types";

/**
 * Full-bleed Tesla-style opening showcase: edge-to-edge imagery, a thin
 * centered headline, two stacked ghost actions, a scroll cue.
 */
export function Hero({ video }: { video: Video }) {
  const href = `/watch/${video.slug ?? video.id}`;
  return (
    <section className="snap-section relative flex h-[calc(100svh-var(--nav-h))] min-h-[560px] w-full flex-col items-center justify-end overflow-hidden">
      {video.thumbnail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={video.thumbnail}
          alt=""
          fetchPriority="high"
          className="absolute inset-0 h-full w-full scale-105 object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/75" />

      <div className="relative z-10 mb-[14vh] flex flex-col items-center px-6 text-center text-white fadeup">
        <p className="eyebrow !text-white/75">Now playing</p>
        <h1 className="mt-3 max-w-4xl text-[2.1rem] font-medium leading-[1.06] tracking-[-0.01em] sm:text-5xl md:text-6xl">
          {video.title}
        </h1>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={href} className="tsl-btn tsl-btn-solid !bg-white !text-black">
            Watch now
          </Link>
          <Link href="#showcase" className="tsl-btn tsl-btn-ghost !border-white/50 !text-white">
            Browse all
          </Link>
        </div>
      </div>

      <a
        href="#showcase"
        aria-label="Scroll"
        className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 text-white/70"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="animate-bounce">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </a>
    </section>
  );
}
