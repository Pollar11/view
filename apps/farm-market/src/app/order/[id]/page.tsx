import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/db";
import { money } from "@/lib/format";

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const order = getOrder(params.id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-2xl">
          ✓
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Order confirmed</h1>
        <p className="mt-2 text-ink-light/60 dark:text-ink-dark/60">
          Order #{order.id.slice(-6).toUpperCase()} — delivery to {order.address.city}, {order.address.state} in
          about {order.deliveryEtaDays} day{order.deliveryEtaDays === 1 ? "" : "s"} (~{order.deliveryMiles} mi from the farm).
        </p>
        {order.smsOptIn && (
          <p className="mt-1 text-sm text-ink-light/50 dark:text-ink-dark/50">
            A confirmation text is on its way to {order.phone}.
          </p>
        )}
      </div>

      <div className="card mt-10 space-y-2.5 p-6 text-sm">
        {order.items.map((item) => (
          <div key={item.slug} className="flex justify-between text-ink-light/70 dark:text-ink-dark/70">
            <span>{item.qty}× {item.name} ({item.unitLabel})</span>
            <span>{money(item.lineTotal)}</span>
          </div>
        ))}
        <div className="border-t border-line-light pt-2.5 dark:border-line-dark">
          <div className="flex justify-between"><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
          {order.bundleDiscountAmount > 0 && (
            <div className="flex justify-between text-accent dark:text-accent-light">
              <span>Farm Basket discount</span><span>−{money(order.bundleDiscountAmount)}</span>
            </div>
          )}
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-accent dark:text-accent-light">
              <span>Promo {order.discountCode}</span><span>−{money(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between"><span>Delivery</span><span>{order.deliveryFee === 0 ? "Free" : money(order.deliveryFee)}</span></div>
          <div className="flex justify-between pt-1 text-base font-bold"><span>Total</span><span>{money(order.total)}</span></div>
        </div>
        <p className="border-t border-line-light pt-2.5 text-xs text-ink-light/50 dark:border-line-dark dark:text-ink-dark/50">
          Payment: {order.paymentMethod === "cod" ? "Pay on delivery" : "Demo card (no real charge)"}
        </p>
      </div>

      <div className="mt-8 text-center">
        <Link href="/shop" className="btn-secondary">Keep shopping</Link>
      </div>
    </div>
  );
}
