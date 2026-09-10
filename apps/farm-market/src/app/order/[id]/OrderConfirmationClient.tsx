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
  stripe: "Card (via Stripe)",
};

function paymentDetailLine(order: Order): string {
  const label = PAYMENT_LABELS[order.paymentMethod];
  if (order.paymentMethod === "stripe" && order.cardLast4) {
    const brand = order.cardBrand ? capitalize(order.cardBrand) : "Card";
    return `${brand} ending in ${order.cardLast4}`;
  }
  return label;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

type LoadState = { status: "loading" } | { status: "found"; order: Order } | { status: "not-found" };

const POLL_MS = 30_000;

/**
 * Vercel's serverless functions don't share memory between invocations, so
 * the order this page needs might not be visible to whichever instance
 * handles this request even though checkout genuinely succeeded. To avoid
 * a false "order not found", we render from sessionStorage (set by the
 * checkout page right after a successful order) first — instant and
 * independent of which instance answers — then always also fetch from the
 * API, which is the source of truth and the only way to see a status an
 * admin has since set from /admin.
 *
 * Once that first API fetch lands, this keeps polling every 30s (paused
 * while the tab isn't visible) so a customer who leaves the page open sees
 * a farm-set status update without reloading — that's what makes this
 * "live" rather than a one-time snapshot. Polling stops once the order is
 * delivered, since nothing can change after that.
 */
export function OrderConfirmationClient({ id }: { id: string }) {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [lastCheckedAt, setLastCheckedAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let haveOrder = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    function applyOrder(order: Order) {
      if (cancelled) return;
      haveOrder = true;
      setState({ status: "found", order });
      setLastCheckedAt(Date.now());
      if (order.status === "delivered" && intervalId) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
    }

    async function fetchOrder(): Promise<Order | null> {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) return null;
        const data = await res.json();
        return (data?.order as Order) ?? null;
      } catch {
        return null;
      }
    }

    try {
      const stored = sessionStorage.getItem(`order:${id}`);
      if (stored) applyOrder(JSON.parse(stored) as Order);
    } catch {
      // sessionStorage unavailable — fall through to the API.
    }

    fetchOrder().then((order) => {
      if (cancelled) return;
      if (order) {
        applyOrder(order);
        intervalId = setInterval(async () => {
          if (document.visibilityState !== "visible") return;
          const next = await fetchOrder();
          if (next) applyOrder(next);
        }, POLL_MS);
      } else if (!haveOrder) {
        setState({ status: "not-found" });
      }
    });

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">{stage.label}</h2>
            {stage.isLive && (
              <span className="badge-solid-moss inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
                Live
              </span>
            )}
          </div>
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
          {stage.isLive
            ? "This is the actual stage the farm has marked your order at — this page checks for updates automatically while it's open."
            : "The farm hasn't marked a stage yet, so this is based on time since your order was placed — an estimate, not a live GPS feed."}
          {stage.index < 3 && lastCheckedAt && (
            <>
              {" "}
              Last checked {new Date(lastCheckedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}.
            </>
          )}
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
