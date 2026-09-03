import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/content";
import { config } from "@/lib/config";
import { groupLiveBySport } from "@/lib/live";
import { getSportOrder } from "@/lib/overrides";
import type { LiveStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const sport = searchParams.get("sport") ?? undefined;
  const status = (searchParams.get("status") as LiveStatus | null) ?? undefined;
  const grouped = searchParams.get("grouped") === "1";

  try {
    const events = await getProvider().getLiveEvents({ sport, status });
    const body = grouped
      ? { groups: groupLiveBySport(events, await getSportOrder()) }
      : { items: events };
    return NextResponse.json(body, {
      headers: {
        "Cache-Control": `public, s-maxage=${config.liveRevalidate}, stale-while-revalidate=30`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
