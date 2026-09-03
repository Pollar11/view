import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/content";
import { config } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const provider = getProvider();
    const event = provider.getLiveEvent
      ? await provider.getLiveEvent(id)
      : null;
    if (!event) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(event, {
      headers: {
        "Cache-Control": `public, s-maxage=${config.liveRevalidate}, stale-while-revalidate=30`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
