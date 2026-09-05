import { NextResponse } from "next/server";
import { findValidCoupon } from "@/lib/db";

export async function GET(req: Request) {
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
