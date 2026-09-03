import type { Metadata } from "next";
import Link from "next/link";
import { getProvider } from "@/lib/content";
import { config } from "@/lib/config";
import { groupLiveBySport } from "@/lib/live";
import { getSportOrder } from "@/lib/overrides";
import { ScoreBoard } from "@/components/live/ScoreBoard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Scores",
  description: "Live scores, no video — updates every few seconds.",
};

export default async function ScoresPage() {
  let initial: { groups: ReturnType<typeof groupLiveBySport> } = { groups: [] };
  try {
    const [events, order] = await Promise.all([
      getProvider().getLiveEvents(),
      getSportOrder(),
    ]);
    initial = { groups: groupLiveBySport(events, order) };
  } catch {
    /* client will retry */
  }

  return (
    <div className="mx-auto max-w-2xl px-5 pt-12 md:px-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow">Score mode</p>
          <h1 className="mt-2 text-3xl font-medium tracking-[0.02em]">Scores</h1>
        </div>
        <Link
          href="/live"
          className="text-[0.75rem] font-medium tracking-[0.08em] text-[var(--muted)] hover:text-[var(--fg)]"
        >
          WATCH LIVE ›
        </Link>
      </div>
      <p className="mt-2 text-[0.8rem] text-[var(--muted)]">
        Auto-refreshing every {Math.round(config.liveRevalidate)}s · minimal data
      </p>

      <div className="mt-8">
        <ScoreBoard intervalMs={config.liveRevalidate * 1000} initial={initial} />
      </div>
    </div>
  );
}
