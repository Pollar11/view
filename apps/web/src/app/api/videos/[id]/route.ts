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
    const video = await getProvider().getVideo(id);
    if (!video) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(video, {
      headers: {
        "Cache-Control": `public, s-maxage=${config.revalidate}, stale-while-revalidate=300`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
