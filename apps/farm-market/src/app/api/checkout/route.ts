import { NextResponse } from "next/server";
import { checkoutSchema, isLuhnValid } from "@/lib/validation";
import { computeTotals } from "@/lib/pricing";
import { estimateDelivery } from "@/lib/delivery";
import { getProduct } from "@/lib/products";
import {
  createOrder,
  decrementStock,
  findValidCoupon,
  getStock,
  markCouponUsed,
  newId,
  upsertCustomer,
} from "@/lib/db";
import { sendSms, orderConfirmationSms } from "@/lib/sms";
import type { Order } from "@/lib/types";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }
  const input = parsed.data;

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

  if (input.paymentMethod === "card_demo") {
    if (!input.card || !isLuhnValid(input.card.number)) {
      return NextResponse.json(
        { error: "Enter a valid demo card number." },
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

  const orderId = newId("order");
  const order: Order = {
    id: orderId,
    customerId: "",
    items: totals.items,
    subtotal: totals.subtotal,
    bundleDiscountRate: totals.bundleDiscountRate,
    bundleDiscountAmount: totals.bundleDiscountAmount,
    discountCode: totals.discountCode,
    discountAmount: totals.discountAmount,
    deliveryFee: totals.deliveryFee,
    total: totals.total,
    address: input.address,
    phone: input.phone,
    smsOptIn: input.smsOptIn,
    paymentMethod: input.paymentMethod,
    deliveryEtaDays: delivery.etaDays,
    deliveryMiles: delivery.milesEstimate,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };

  const customer = await upsertCustomer({
    phone: input.phone,
    name: input.address.fullName,
    smsOptIn: input.smsOptIn,
    address: input.address,
    orderTotal: totals.total,
  });
  order.customerId = customer.id;

  await createOrder(order);
  for (const line of input.items) {
    await decrementStock(line.slug, line.qty);
  }
  if (coupon) {
    await markCouponUsed(coupon.code);
  }

  if (input.smsOptIn) {
    await sendSms({
      to: input.phone,
      body: orderConfirmationSms({
        name: input.address.fullName,
        orderId: order.id,
        city: input.address.city,
        zip: input.address.zip,
        etaDays: delivery.etaDays,
        total: order.total,
      }),
      campaign: "order-confirmation",
      customerId: customer.id,
    });
  }

  return NextResponse.json({ order }, { status: 201 });
}
