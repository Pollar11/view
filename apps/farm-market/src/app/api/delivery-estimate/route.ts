import { NextResponse } from "next/server";
import { estimateDelivery } from "@/lib/delivery";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  if (!rateLimit(req, "delivery-estimate", { limit: 60, windowMs: 60 * 1000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const zip = searchParams.get("zip") ?? "";
  if (!/^\d{5}(-\d{4})?$/.test(zip)) {
    return NextResponse.json(
      { error: "Provide a valid 5-digit ZIP code" },
      { status: 400 },
    );
  }
  return NextResponse.json(estimateDelivery(zip));
}
