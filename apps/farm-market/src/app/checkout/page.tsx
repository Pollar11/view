"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/store/cart-context";
import { checkoutSchema, isLuhnValid } from "@/lib/validation";
import { money } from "@/lib/format";

interface DeliveryPreview {
  milesEstimate: number;
  etaDays: number;
  inServiceArea: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, totals, appliedCoupon, clear, isHydrated } = useCart();

  const [fullName, setFullName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card_demo">("cod");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<DeliveryPreview | null>(null);

  useEffect(() => {
    if (!/^\d{5}$/.test(zip)) {
      setDelivery(null);
      return;
    }
    const controller = new AbortController();
    fetch(`/api/delivery-estimate?zip=${zip}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setDelivery(data))
      .catch(() => undefined);
    return () => controller.abort();
  }, [zip]);

  if (isHydrated && lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <h1 className="text-2xl font-bold">Nothing to check out yet</h1>
        <Link href="/shop" className="btn-primary mt-6 inline-flex">Browse the farm</Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const payload = {
      items: lines,
      address: { fullName, street, city, state, zip },
      phone,
      smsOptIn,
      paymentMethod,
      discountCode: appliedCoupon?.code ?? "",
      card:
        paymentMethod === "card_demo"
          ? { number: cardNumber, expiry: cardExpiry, cvc: cardCvc }
          : undefined,
    };

    const parsed = checkoutSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path.join(".")] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    if (paymentMethod === "card_demo" && !isLuhnValid(cardNumber)) {
      setErrors({ "card.number": "Enter a valid demo card number" });
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      clear();
      router.push(`/order/${data.order.id}`);
    } catch {
      setServerError("Network error — please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section className="card space-y-4 p-5">
            <h2 className="font-semibold">Delivery address</h2>
            <Field label="Full name" error={errors["address.fullName"]}>
              <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </Field>
            <Field label="Street address" error={errors["address.street"]}>
              <input className="input" value={street} onChange={(e) => setStreet(e.target.value)} />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="City" error={errors["address.city"]}>
                <input className="input" value={city} onChange={(e) => setCity(e.target.value)} />
              </Field>
              <Field label="State" error={errors["address.state"]}>
                <input className="input" maxLength={2} value={state} onChange={(e) => setState(e.target.value.toUpperCase())} />
              </Field>
              <Field label="ZIP" error={errors["address.zip"]}>
                <input className="input" value={zip} onChange={(e) => setZip(e.target.value)} />
              </Field>
            </div>

            {delivery && (
              <p className={`text-xs ${delivery.inServiceArea ? "text-accent dark:text-accent-light" : "text-red-500"}`}>
                {delivery.inServiceArea
                  ? `Estimated ${delivery.milesEstimate} mi from the farm — delivery in about ${delivery.etaDays} day${delivery.etaDays === 1 ? "" : "s"}.`
                  : "That ZIP is outside our current delivery radius."}
              </p>
            )}
          </section>

          <section className="card space-y-4 p-5">
            <h2 className="font-semibold">Contact &amp; SMS updates</h2>
            <Field label="Phone number" error={errors.phone}>
              <input className="input" placeholder="(555) 123-4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
            <label className="flex items-start gap-2.5 text-sm">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={smsOptIn}
                onChange={(e) => setSmsOptIn(e.target.checked)}
              />
              <span className="text-ink-light/70 dark:text-ink-dark/70">
                Text me my delivery confirmation, and occasional real offers
                (like surplus or seasonal discounts) — you can reply STOP anytime.
              </span>
            </label>
          </section>

          <section className="card space-y-4 p-5">
            <h2 className="font-semibold">Payment</h2>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2.5 rounded-lg border border-line-light p-3 text-sm dark:border-line-dark">
                <input type="radio" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                Pay on delivery (cash or card with the driver)
              </label>
              <label className="flex items-center gap-2.5 rounded-lg border border-line-light p-3 text-sm dark:border-line-dark">
                <input type="radio" checked={paymentMethod === "card_demo"} onChange={() => setPaymentMethod("card_demo")} />
                Pay now — demo card (no real charge)
              </label>
            </div>

            {paymentMethod === "card_demo" && (
              <div className="space-y-3 pt-2">
                <Field label="Card number" error={errors["card.number"]}>
                  <input className="input" placeholder="4242 4242 4242 4242" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Expiry">
                    <input className="input" placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} />
                  </Field>
                  <Field label="CVC">
                    <input className="input" placeholder="123" value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} />
                  </Field>
                </div>
                <p className="text-xs text-ink-light/50 dark:text-ink-dark/50">
                  Demo mode: this validates like a real card (Luhn check) but never contacts a payment processor.
                </p>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <div className="card space-y-2.5 p-5 text-sm">
            <h2 className="mb-1 font-semibold">Order summary</h2>
            {totals.items.map((item) => (
              <div key={item.slug + item.unitLabel} className="flex justify-between text-ink-light/70 dark:text-ink-dark/70">
                <span>{item.qty}× {item.name} ({item.unitLabel})</span>
                <span>{money(item.lineTotal)}</span>
              </div>
            ))}
            <div className="border-t border-line-light pt-2.5 dark:border-line-dark">
              <div className="flex justify-between"><span>Subtotal</span><span>{money(totals.subtotal)}</span></div>
              {totals.bundleDiscountAmount > 0 && (
                <div className="flex justify-between text-accent dark:text-accent-light">
                  <span>Farm Basket discount</span><span>−{money(totals.bundleDiscountAmount)}</span>
                </div>
              )}
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-accent dark:text-accent-light">
                  <span>Promo {totals.discountCode}</span><span>−{money(totals.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between"><span>Delivery</span><span>{totals.deliveryFee === 0 ? "Free" : money(totals.deliveryFee)}</span></div>
              <div className="flex justify-between text-base font-bold pt-1"><span>Total</span><span>{money(totals.total)}</span></div>
            </div>
          </div>

          {serverError && (
            <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">{serverError}</p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Placing order…" : `Place order — ${money(totals.total)}`}
          </button>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="label">{label}</span>
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
