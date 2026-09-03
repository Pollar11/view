import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getOverrides, saveOverrides, storeKind } from "@/lib/overrides";
import type { Overrides, SectionOverride } from "@/lib/overrides";
import { getBaseProvider } from "@/lib/content";
import { invalidate } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Read straight from the base provider so hidden sections still show in admin.
  const [overrides, sections, live] = await Promise.all([
    getOverrides(),
    getBaseProvider().getSections(),
    getBaseProvider().getLiveEvents().catch(() => []),
  ]);
  const sports = [...new Set(live.map((e) => e.sport))];
  return NextResponse.json({
    store: storeKind(),
    overrides,
    sections: sections.map((s) => ({ slug: s.slug, title: s.title })),
    sports,
  });
}

function sanitize(input: unknown): Overrides {
  const o = (input ?? {}) as Record<string, unknown>;
  const out: Overrides = {};

  if (Array.isArray(o.sportOrder)) {
    out.sportOrder = o.sportOrder
      .map((s) => String(s).toLowerCase().trim())
      .filter(Boolean)
      .slice(0, 40);
  }

  if (o.sections && typeof o.sections === "object") {
    out.sections = {};
    for (const [slug, raw] of Object.entries(
      o.sections as Record<string, unknown>,
    )) {
      const r = (raw ?? {}) as Record<string, unknown>;
      const so: SectionOverride = {};
      if (typeof r.hidden === "boolean") so.hidden = r.hidden;
      if (r.order != null && !Number.isNaN(Number(r.order)))
        so.order = Number(r.order);
      if (typeof r.title === "string" && r.title.trim())
        so.title = r.title.trim().slice(0, 80);
      if (r.layout === "rail" || r.layout === "grid") so.layout = r.layout;
      out.sections[slug.slice(0, 80)] = so;
    }
  }

  if (typeof o.featuredVideoId === "string")
    out.featuredVideoId = o.featuredVideoId.trim().slice(0, 120) || undefined;
  if (typeof o.featuredLiveId === "string")
    out.featuredLiveId = o.featuredLiveId.trim().slice(0, 120) || undefined;

  return out;
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const clean = sanitize(body);
  await saveOverrides(clean);
  invalidate("sections");
  return NextResponse.json({ ok: true, overrides: clean });
}
