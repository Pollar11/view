import { NextResponse } from "next/server";
import { getProvider } from "@/lib/content";
import { config } from "@/lib/config";

// Always run per-request so a native client sees live data the moment the
// upstream changes. Edge/CDN latency is handled by the Cache-Control header
// below (s-maxage + stale-while-revalidate), not by build-time prerendering.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sections = await getProvider().getSections();
    return NextResponse.json(
      { items: sections },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${config.revalidate}, stale-while-revalidate=300`,
        },
      },
    );
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 },
    );
  }
}
