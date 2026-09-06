import { NextResponse } from "next/server";
import { quoteSubscription } from "@/lib/subscriptions";
import type { Category } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/products";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") as Category | null;
  const zip = searchParams.get("zip") ?? "";

  if (!category || !(category in CATEGORY_LABELS)) {
    return NextResponse.json({ error: "Unknown category" }, { status: 400 });
  }
  if (!/^\d{5}(-\d{4})?$/.test(zip)) {
    return NextResponse.json({ error: "Enter a valid 5-digit ZIP code" }, { status: 400 });
  }

  const quote = quoteSubscription(category, zip);
  if (!quote) {
    return NextResponse.json({ error: "No plan for that category" }, { status: 404 });
  }
  return NextResponse.json(quote);
}
