import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/content";
import { config } from "@/lib/config";
import type { LiveEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

function liveMatches(e: LiveEvent, q: string): boolean {
  const hay = [
    e.title,
    e.competition,
    e.sport,
    e.sportLabel,
    e.home,
    e.away,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();
  if (!q) return NextResponse.json({ q, videos: [], live: [] });

  try {
    const provider = getProvider();
    const [videoPage, allLive] = await Promise.all([
      provider.getVideos({ query: q, limit: 40 }),
      provider.getLiveEvents().catch(() => [] as LiveEvent[]),
    ]);

    return NextResponse.json(
      {
        q,
        live: allLive.filter((e) => liveMatches(e, q)),
        videos: videoPage.items,
      },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${config.liveRevalidate}, stale-while-revalidate=120`,
        },
      },
    );
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
