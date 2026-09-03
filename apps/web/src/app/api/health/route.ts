import { NextResponse } from "next/server";
import { getProvider } from "@/lib/content";
import { config } from "@/lib/config";
import { cacheStats } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  let ok = true;
  let sections = 0;
  let live = 0;
  try {
    const provider = getProvider();
    const [s, l] = await Promise.all([
      provider.getSections(),
      provider.getLiveEvents().catch(() => []),
    ]);
    sections = s.length;
    live = l.filter((e) => e.status === "live").length;
  } catch {
    ok = false;
  }
  return NextResponse.json({
    status: ok ? "ok" : "degraded",
    provider: config.provider,
    sections,
    live,
    cache: cacheStats(),
    latencyMs: Date.now() - started,
    time: new Date().toISOString(),
  });
}
