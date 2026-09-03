import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/content";
import { config } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  try {
    const page = await getProvider().getVideos({
      section: searchParams.get("section") ?? undefined,
      cursor: searchParams.get("cursor"),
      limit: searchParams.get("limit")
        ? Number(searchParams.get("limit"))
        : undefined,
      query: searchParams.get("q") ?? undefined,
    });
    return NextResponse.json(page, {
      headers: {
        "Cache-Control": `public, s-maxage=${config.revalidate}, stale-while-revalidate=300`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
