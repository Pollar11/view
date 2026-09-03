import type { Metadata } from "next";
import { getProvider } from "@/lib/content";
import { config } from "@/lib/config";
import { groupLiveBySport, type SportGroup } from "@/lib/live";
import { getSportOrder } from "@/lib/overrides";
import { LiveWall } from "@/components/live/LiveWall";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Live",
  description: "Every live event, previewing in place. Soccer first.",
};

export default async function LivePage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string }>;
}) {
  const { sport } = await searchParams;

  let groups: SportGroup[];
  try {
    const [events, order] = await Promise.all([
      getProvider().getLiveEvents(),
      getSportOrder(),
    ]);
    groups = groupLiveBySport(events, order);
  } catch {
    groups = [];
  }

  return (
    <div className="pt-10">
      <header className="mx-auto max-w-rail px-5 pb-6 md:px-10">
        <p className="eyebrow">Live</p>
        <h1 className="mt-2 text-3xl font-medium tracking-[0.02em] md:text-4xl">
          Watch live
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
          Previews play right here — pick a match to open it full-screen with
          low-latency playback.
        </p>
      </header>

      {groups.length > 0 ? (
        <LiveWall
          groups={groups}
          maxPreviews={config.maxLivePreviews}
          initialSport={sport}
          heading="All live"
        />
      ) : (
        <p className="mx-auto max-w-rail px-5 py-24 text-center text-sm tracking-[0.08em] text-[var(--muted)] md:px-10">
          Nothing live right now.
        </p>
      )}
    </div>
  );
}
