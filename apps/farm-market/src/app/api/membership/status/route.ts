import { NextResponse } from "next/server";
import { phoneSchema } from "@/lib/validation";
import { findCustomerByPhone } from "@/lib/db";
import { findTier } from "@/lib/membership";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Looks up membership tier by the phone number the visitor themselves
 * provides — mirrors a real loyalty-program phone lookup. Returns only
 * aggregate, non-sensitive fields (tier, order count, total spent), never
 * the customer's address or other PII.
 */
export async function GET(req: Request) {
  if (!rateLimit(req, "membership-status", { limit: 20, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const parsed = phoneSchema.safeParse(searchParams.get("phone") ?? "");
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid phone number" }, { status: 400 });
  }

  const customer = findCustomerByPhone(parsed.data);
  if (!customer) {
    return NextResponse.json({ found: false });
  }

  const tier = findTier(customer.totalOrders);
  return NextResponse.json({
    found: true,
    tier: tier.name,
    perk: tier.perk,
    totalOrders: customer.totalOrders,
    totalSpent: customer.totalSpent,
  });
}
