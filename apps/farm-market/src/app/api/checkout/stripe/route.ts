import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validation";
import { computeTotals } from "@/lib/pricing";
import { estimateDelivery } from "@/lib/delivery";
import { getProduct } from "@/lib/products";
import { attachStripeSessionId, createPendingCheckout, findValidCoupon, getStock } from "@/lib/db";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";
import { SITE_URL } from "@/lib/site";
import { rateLimit } from "@/lib/rate-limit";
import { readBoundedJson } from "@/lib/request-body";

/**
 * Creates a Stripe-hosted Checkout Session and returns its URL for the
 * client to redirect to. Card details are entered on Stripe's own page and
 * never touch this server at all. The order itself isn't created here —
 * only once Stripe confirms payment (webhook, or the processing page's
 * fallback poll) does a PendingCheckout become a real Order, so nothing is
 * marked "confirmed" before money has actually moved.
 */
export async function POST(req: Request) {
  if (!rateLimit(req, "checkout-stripe", { limit: 10, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json(
      { error: "Too many attempts — please wait a few minutes and try again." },
      { status: 429 },
    );
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Card payment isn't set up on this deployment yet — choose Pay on delivery, or contact the farm." },
      { status: 503 },
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

  if (input.paymentMethod !== "stripe") {
    return NextResponse.json({ error: "Use /api/checkout for pay on delivery." }, { status: 400 });
  }

  for (const line of input.items) {
    const product = getProduct(line.slug);
    if (!product) {
      return NextResponse.json({ error: `Unknown product: ${line.slug}` }, { status: 422 });
    }
    if (getStock(line.slug) < line.qty) {
      return NextResponse.json(
        { error: `Only ${getStock(line.slug)} of ${product.name} left in stock — please update your cart.` },
        { status: 409 },
      );
    }
  }

  const delivery = estimateDelivery(input.address.zip);
  if (!delivery.inServiceArea) {
    return NextResponse.json(
      { error: "That address is outside our current delivery radius. We'll reach out about special arrangements." },
      { status: 422 },
    );
  }

  let coupon = null;
  if (input.discountCode) {
    coupon = findValidCoupon(input.discountCode) ?? null;
    if (!coupon) {
      return NextResponse.json({ error: "That discount code is invalid or has expired." }, { status: 422 });
    }
  }

  const totals = computeTotals(
    input.items,
    coupon ? { code: coupon.code, percentOff: coupon.percentOff } : null,
  );
  if (totals.items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 422 });
  }

  // Locked in now, at the exact amount Stripe is about to charge — the
  // eventual Order is built from these numbers verbatim, never recomputed
  // after the customer has already paid this amount.
  const pending = await createPendingCheckout({
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
    utm: input.utm && Object.keys(input.utm).length > 0 ? input.utm : null,
    stripeSessionId: null,
  });

  const stripe = getStripeClient()!;
  const itemCount = totals.items.reduce((sum, i) => sum + i.qty, 0);

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: pending.id,
      metadata: { pendingCheckoutId: pending.id },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Meadow & Market order (${itemCount} item${itemCount === 1 ? "" : "s"})`,
            },
            unit_amount: Math.round(totals.total * 100),
          },
          quantity: 1,
        },
      ],
      // No payment_method_types here on purpose — Checkout Sessions default
      // to whatever's enabled in the Stripe Dashboard (card, plus Apple
      // Pay/Google Pay automatically for eligible browsers once card is on).
      success_url: `${SITE_URL}/checkout/processing?pending=${pending.id}`,
      cancel_url: `${SITE_URL}/checkout?canceled=1`,
    });
  } catch (err) {
    console.error("[stripe] failed to create checkout session:", err);
    return NextResponse.json(
      { error: "Couldn't reach Stripe to start checkout — please try again, or choose Pay on delivery." },
      { status: 502 },
    );
  }

  await attachStripeSessionId(pending.id, session.id);

  if (!session.url) {
    return NextResponse.json({ error: "Could not start Stripe checkout — please try again." }, { status: 502 });
  }

  return NextResponse.json({ url: session.url }, { status: 201 });
}
