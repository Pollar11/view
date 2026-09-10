import { createOrder, decrementStock, markCouponUsed, newId, upsertCustomer } from "./db";
import { sendSms, orderConfirmationSms } from "./sms";
import type { Address, Order, OrderItem, PaymentMethod, UtmAttribution } from "./types";

export interface FulfillOrderInput {
  items: OrderItem[];
  subtotal: number;
  bundleDiscountRate: number;
  bundleDiscountAmount: number;
  discountCode: string | null;
  discountAmount: number;
  deliveryFee: number;
  total: number;
  deliveryEtaDays: number;
  deliveryMiles: number;
  address: Address;
  phone: string;
  smsOptIn: boolean;
  paymentMethod: PaymentMethod;
  cardLast4: string | null;
  cardBrand: string | null;
  utm: UtmAttribution | null;
}

/**
 * Creates the Order record and runs every side effect that should happen
 * exactly once a purchase is confirmed — customer upsert, stock decrement,
 * marking a used coupon, and the confirmation SMS. Shared by the COD path
 * (called synchronously at checkout, since there's nothing to wait on) and
 * the Stripe path (called only once payment is actually confirmed — from
 * the webhook, or the processing page's fallback poll), so "what happens
 * when an order is confirmed" exists in exactly one place either way.
 */
export async function fulfillOrder(input: FulfillOrderInput): Promise<Order> {
  const order: Order = {
    id: newId("order"),
    customerId: "",
    items: input.items,
    subtotal: input.subtotal,
    bundleDiscountRate: input.bundleDiscountRate,
    bundleDiscountAmount: input.bundleDiscountAmount,
    discountCode: input.discountCode,
    discountAmount: input.discountAmount,
    deliveryFee: input.deliveryFee,
    total: input.total,
    address: input.address,
    phone: input.phone,
    smsOptIn: input.smsOptIn,
    paymentMethod: input.paymentMethod,
    cardLast4: input.cardLast4,
    cardBrand: input.cardBrand,
    deliveryEtaDays: input.deliveryEtaDays,
    deliveryMiles: input.deliveryMiles,
    status: "confirmed",
    statusUpdatedAt: null,
    createdAt: new Date().toISOString(),
    utm: input.utm,
  };

  const customer = await upsertCustomer({
    phone: input.phone,
    name: input.address.fullName,
    smsOptIn: input.smsOptIn,
    address: input.address,
    orderTotal: input.total,
  });
  order.customerId = customer.id;

  await createOrder(order);
  for (const item of input.items) {
    await decrementStock(item.slug, item.qty);
  }
  if (input.discountCode) {
    await markCouponUsed(input.discountCode);
  }

  if (input.smsOptIn) {
    await sendSms({
      to: input.phone,
      body: orderConfirmationSms({
        name: input.address.fullName,
        orderId: order.id,
        city: input.address.city,
        zip: input.address.zip,
        etaDays: input.deliveryEtaDays,
        total: order.total,
      }),
      campaign: "order-confirmation",
      customerId: customer.id,
    });
  }

  return order;
}
