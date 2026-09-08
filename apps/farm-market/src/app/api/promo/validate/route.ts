import { NextResponse } from "next/server";
import { findValidCoupon } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  if (!rateLimit(req, "promo-validate", { limit: 20, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code") ?? "";
  const coupon = findValidCoupon(code);
  if (!coupon) {
    return NextResponse.json({ valid: false }, { status: 404 });
  }
  return NextResponse.json({
    valid: true,
    code: coupon.code,
    percentOff: coupon.percentOff,
  });
}
