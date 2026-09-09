import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validation";
import { computeTotals } from "@/lib/pricing";
import { estimateDelivery } from "@/lib/delivery";
import { getProduct } from "@/lib/products";
import { findValidCoupon, getStock } from "@/lib/db";
import { fulfillOrder } from "@/lib/order-fulfillment";
import { rateLimit } from "@/lib/rate-limit";
import { readBoundedJson } from "@/lib/request-body";

export async function POST(req: Request) {
  if (!rateLimit(req, "checkout", { limit: 10, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json(
      { error: "Too many attempts — please wait a few minutes and try again." },
      { status: 429 },
    );
  }

  const body = await readBoundedJson(req);
  if (body === null) {
    return NextResponse.json({ error: "Invalid or oversized request body" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }
  const input = parsed.data;

  // This route only ever creates an order immediately, with no payment
  // confirmation step in between — that's only ever correct for "pay on
  // delivery". A real charge (Stripe) goes through /api/checkout/stripe
  // instead, which creates the order only once payment is confirmed.
  if (input.paymentMethod !== "cod") {
    return NextResponse.json(
      { error: "Use /api/checkout/stripe for card payment." },
      { status: 400 },
    );
  }

  // Server-side stock check — the source of truth, never trust the client.
  for (const line of input.items) {
    const product = getProduct(line.slug);
    if (!product) {
      return NextResponse.json(
        { error: `Unknown product: ${line.slug}` },
        { status: 422 },
      );
    }
    if (getStock(line.slug) < line.qty) {
      return NextResponse.json(
        {
          error: `Only ${getStock(line.slug)} of ${product.name} left in stock — please update your cart.`,
        },
        { status: 409 },
      );
    }
  }

  const delivery = estimateDelivery(input.address.zip);
  if (!delivery.inServiceArea) {
    return NextResponse.json(
      {
        error:
          "That address is outside our current delivery radius. We'll reach out about special arrangements.",
      },
      { status: 422 },
    );
  }

  let coupon = null;
  if (input.discountCode) {
    coupon = findValidCoupon(input.discountCode) ?? null;
    if (!coupon) {
      return NextResponse.json(
        { error: "That discount code is invalid or has expired." },
        { status: 422 },
      );
    }
  }

  const totals = computeTotals(
    input.items,
    coupon ? { code: coupon.code, percentOff: coupon.percentOff } : null,
  );

  if (totals.items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 422 });
  }

  const order = await fulfillOrder({
    items: totals.items,
    subtotal: totals.subtotal,
    bundleDiscountRate: totals.bundleDiscountRate,
    bundleDiscountAmount: totals.bundleDiscountAmount,
    discountCode: totals.discountCode,
    discountAmount: totals.discountAmount,
    deliveryFee: totals.deliveryFee,
    total: totals.total,
    deliveryEtaDays: delivery.etaDays,
    deliveryMiles: delivery.milesEstimate,
    address: input.address,
    phone: input.phone,
    smsOptIn: input.smsOptIn,
    paymentMethod: "cod",
    cardLast4: null,
    cardBrand: null,
    utm: input.utm && Object.keys(input.utm).length > 0 ? input.utm : null,
  });

  return NextResponse.json({ order }, { status: 201 });
}
