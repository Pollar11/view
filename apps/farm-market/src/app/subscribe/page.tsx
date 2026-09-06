"use client";

import { useEffect, useState } from "react";
import { SUBSCRIPTION_PLANS } from "@/lib/subscriptions";
import { CATEGORY_LABELS } from "@/lib/products";
import type { Category } from "@/lib/types";
import { money } from "@/lib/format";

interface Quote {
  monthlyDeliveryFee: number;
  monthlyTotal: number;
  deliveryMiles: number;
  deliveryEtaDays: number;
  inServiceArea: boolean;
}

export default function SubscribePage() {
  const [selected, setSelected] = useState<Category>(SUBSCRIPTION_PLANS[0]!.category);
  const [zip, setZip] = useState("92801");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const plan = SUBSCRIPTION_PLANS.find((p) => p.category === selected)!;

  useEffect(() => {
    if (!/^\d{5}$/.test(zip)) {
      setQuote(null);
      return;
    }
    const controller = new AbortController();
    fetch(`/api/subscriptions/quote?category=${selected}&zip=${zip}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then(setQuote)
      .catch(() => undefined);
    return () => controller.abort();
  }, [selected, zip]);

  async function startSubscription(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/subscriptions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: selected, zip, name, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong.");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setErrorMsg("Network error — please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <h1 className="text-3xl font-bold tracking-tight">Monthly subscription boxes</h1>
      <p className="mt-2 text-ink-light/60 dark:text-ink-dark/60">
        Pick an animal, enter your ZIP, and see the real monthly price —
        including delivery, calculated the same way as at checkout.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SUBSCRIPTION_PLANS.map((p) => (
              <button
                key={p.category}
                onClick={() => setSelected(p.category)}
                className={`rounded-xl2 border p-3 text-left text-sm transition ${
                  selected === p.category
                    ? "border-ink-light bg-ink-light text-canvas-light dark:border-ink-dark dark:bg-ink-dark dark:text-canvas-dark"
                    : "border-line-light hover:bg-black/5 dark:border-line-dark dark:hover:bg-white/10"
                }`}
              >
                <div className="font-semibold">{CATEGORY_LABELS[p.category]}</div>
                <div className="mt-0.5 text-xs opacity-70">{p.quantityLabel}</div>
              </button>
            ))}
          </div>

          <form onSubmit={startSubscription} className="card mt-6 space-y-4 p-5">
            <div>
              <span className="label">Delivery ZIP</span>
              <input className="input" value={zip} onChange={(e) => setZip(e.target.value)} maxLength={5} />
              <p className="mt-1 text-xs text-ink-light/50 dark:text-ink-dark/50">
                Try 92801 (Anaheim, CA) or your own ZIP.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="label">Your name</span>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <span className="label">Phone</span>
                <input className="input" placeholder="(555) 123-4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            {errorMsg && <p className="field-error">{errorMsg}</p>}
            {status === "done" ? (
              <p className="text-sm font-semibold text-accent dark:text-accent-light">
                Request received — we&apos;ll text and call to confirm your first delivery.
              </p>
            ) : (
              <button type="submit" disabled={status === "sending" || !quote?.inServiceArea} className="btn-primary w-full">
                {status === "sending" ? "Sending…" : "Start subscription request"}
              </button>
            )}
            <p className="text-xs text-ink-light/50 dark:text-ink-dark/50">
              This records your interest and texts a confirmation — it does not
              charge a card. The farm calls to actually set up recurring
              delivery and payment.
            </p>
          </form>
        </div>

        <div className="card h-fit space-y-3 p-5 text-sm">
          <h2 className="font-semibold">{CATEGORY_LABELS[selected]} plan</h2>
          <Row label="Box contents" value={plan.quantityLabel} />
          <Row label="Box price" value={money(plan.basePrice)} />
          {quote ? (
            <>
              <Row
                label="Delivery"
                value={
                  quote.inServiceArea
                    ? quote.monthlyDeliveryFee === 0
                      ? "Free (included)"
                      : money(quote.monthlyDeliveryFee)
                    : "Outside delivery area"
                }
              />
              {quote.inServiceArea && (
                <p className="text-xs text-ink-light/50 dark:text-ink-dark/50">
                  ~{quote.deliveryMiles} mi from the farm — about {quote.deliveryEtaDays} day
                  {quote.deliveryEtaDays === 1 ? "" : "s"} per delivery.
                </p>
              )}
              <div className="border-t border-line-light pt-2.5 dark:border-line-dark">
                <Row
                  label="Monthly total"
                  value={quote.inServiceArea ? money(quote.monthlyTotal) : "—"}
                  bold
                />
              </div>
            </>
          ) : (
            <p className="text-xs text-ink-light/50 dark:text-ink-dark/50">Enter a 5-digit ZIP to see delivery pricing.</p>
          )}
          <p className="text-xs text-ink-light/50 dark:text-ink-dark/50">
            Delivery included free once the box itself is $50+; otherwise the
            standard delivery fee applies each month.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "text-base font-bold" : ""}`}>
      <span className="text-ink-light/70 dark:text-ink-dark/70">{label}</span>
      <span>{value}</span>
    </div>
  );
}
