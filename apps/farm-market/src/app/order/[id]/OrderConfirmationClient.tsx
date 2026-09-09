"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { money } from "@/lib/format";
import { FARM_NAME } from "@/lib/site";
import { computeOrderStage, STAGE_LABELS } from "@/lib/order-status";
import type { Order, PaymentMethod } from "@/lib/types";
import { CopyButton } from "@/components/CopyButton";
import { PrintButton } from "@/components/PrintButton";
import { Spinner } from "@/components/Spinner";

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cod: "Pay on delivery",
  card_demo: "Demo card (no real charge)",
  apple_pay_demo: "Apple Pay (demo — no real charge)",
  paypal_demo: "PayPal (demo — no real charge)",
};

function paymentDetailLine(order: Order): string {
  const label = PAYMENT_LABELS[order.paymentMethod];
  return order.paymentMethod === "card_demo" && order.cardLast4
    ? `${label} ending in ${order.cardLast4}`
    : label;
}

type LoadState = { status: "loading" } | { status: "found"; order: Order } | { status: "not-found" };

/**
 * Vercel's serverless functions don't share memory between invocations, so
 * the order this page needs might not be visible to whichever instance
 * handles this request even though checkout genuinely succeeded. To avoid
 * a false "order not found", we render from sessionStorage (set by the
 * checkout page right after a successful order) first — instant and
 * independent of which instance answers — and only fall back to the API
 * (which reads the same disk-backed store checkout wrote to) if that's
 * empty, e.g. a reload or a link opened fresh.
 */
export function OrderConfirmationClient({ id }: { id: string }) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    try {
      const stored = sessionStorage.getItem(`order:${id}`);
      if (stored) {
        setState({ status: "found", order: JSON.parse(stored) as Order });
        return;
      }
    } catch {
      // sessionStorage unavailable — fall through to the API.
    }

    fetch(`/api/orders/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.order) setState({ status: "found", order: data.order as Order });
        else setState({ status: "not-found" });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "not-found" });
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state.status === "loading") {
    return (
      <div className="mx-auto flex max-w-2xl justify-center px-5 py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (state.status === "not-found") {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <h1 className="text-2xl font-bold">We couldn&apos;t find that order</h1>
        <p className="mt-2 text-ink-light/70 dark:text-ink-dark/70">
          The link may be off, or this browser session doesn&apos;t have it cached anymore.
        </p>
        <Link href="/shop" className="btn-primary mt-6 inline-flex">Shop all products</Link>
      </div>
    );
  }

  const order = state.order;
  const stage = computeOrderStage(order);

  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-2xl">
          ✓
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Order confirmed</h1>
        <p className="mt-2 text-ink-light/85 dark:text-ink-dark/85">
          Order #{order.id.slice(-6).toUpperCase()} — delivery to {order.address.city}, {order.address.state} in
          about {order.deliveryEtaDays} day{order.deliveryEtaDays === 1 ? "" : "s"} (~{order.deliveryMiles} mi from the farm).
        </p>
        <div className="mt-2 flex items-center justify-center gap-4">
          <CopyButton text={order.id.slice(-6).toUpperCase()} label="Copy order #" />
          <PrintButton />
        </div>
        {order.smsOptIn && (
          <p className="mt-1 text-sm text-ink-light/80 dark:text-ink-dark/80">
            A confirmation text is on its way to {order.phone}.
          </p>
        )}
      </div>

      <div className="card mt-8 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{stage.label}</h2>
          <span className="text-xs text-ink-light/70 dark:text-ink-dark/70">{stage.estimatedDeliveryLabel}</span>
        </div>
        <ol className="mt-4 flex items-center gap-1">
          {STAGE_LABELS.map((label, i) => (
            <li key={label} className="flex flex-1 items-center gap-1 last:flex-none">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  i <= stage.index
                    ? "bg-accent text-white"
                    : "bg-black/10 text-ink-light/50 dark:bg-white/10 dark:text-ink-dark/50"
                }`}
                title={label}
              >
                {i < stage.index ? "✓" : i + 1}
              </div>
              {i < STAGE_LABELS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${i < stage.index ? "bg-accent" : "bg-black/10 dark:bg-white/10"}`}
                  aria-hidden
                />
              )}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-ink-light/70 dark:text-ink-dark/70">
          This tracker updates based on time since your order was placed — there&apos;s
          no live GPS feed behind it, so treat the stage as an estimate.
        </p>
      </div>

      <div className="card mt-6 space-y-2.5 p-6 text-sm">
        <div className="flex items-start justify-between border-b border-line-light pb-3 dark:border-line-dark">
          <div className="flex items-center gap-2 text-base font-bold tracking-tight">
            <span aria-hidden>🐑</span> {FARM_NAME}
          </div>
          <div className="text-right text-xs text-ink-light/75 dark:text-ink-dark/75">
            <div>Order #{order.id.slice(-6).toUpperCase()}</div>
            <div>{new Date(order.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</div>
          </div>
        </div>
        <div className="flex justify-between text-xs text-ink-light/75 dark:text-ink-dark/75">
          <span>Order type</span>
          <span className="font-medium text-ink-light dark:text-ink-dark">Home delivery</span>
        </div>

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
        <div className="border-t border-line-light pt-2.5 text-xs text-ink-light/80 dark:border-line-dark dark:text-ink-dark/80">
          <p>Payment: {paymentDetailLine(order)}</p>
          <p className="mt-0.5">Delivering to: {order.address.fullName}, {order.address.street}, {order.address.city}, {order.address.state} {order.address.zip}</p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/shop" className="btn-secondary">Keep shopping</Link>
      </div>
    </div>
  );
}
