"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/store/cart-context";
import { checkoutSchema, isLuhnValid } from "@/lib/validation";
import { money } from "@/lib/format";
import { getStoredUtm } from "@/lib/utm";
import { Spinner } from "@/components/Spinner";
import { stateFromZip } from "@/lib/zip-state";

interface DeliveryPreview {
  milesEstimate: number;
  etaDays: number;
  inServiceArea: boolean;
}

interface AddressSuggestion {
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
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
  const [paymentMethod, setPaymentMethod] = useState<
    "cod" | "card_demo" | "apple_pay_demo" | "paypal_demo"
  >("cod");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<DeliveryPreview | null>(null);

  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const justSelectedSuggestion = useRef(false);

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

  // Suggest a state from the ZIP once it's complete — fires only on a new
  // ZIP (not on every keystroke in State), and never overwrites a state the
  // customer already typed or is in the middle of clearing/retyping.
  const suggestedForZip = useRef<string | null>(null);
  useEffect(() => {
    if (zip === suggestedForZip.current) return;
    suggestedForZip.current = zip;
    if (state.trim()) return;
    const suggestion = stateFromZip(zip);
    if (suggestion) setState(suggestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zip]);

  // Address autocomplete: debounced so we're not firing a request on every
  // keystroke, skipped right after picking a suggestion (that fill-in
  // shouldn't immediately re-trigger a new search against itself).
  useEffect(() => {
    if (justSelectedSuggestion.current) {
      justSelectedSuggestion.current = false;
      return;
    }
    if (street.trim().length < 4) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setSuggestionsLoading(true);
      fetch(`/api/address-autocomplete?q=${encodeURIComponent(street)}`, { signal: controller.signal })
        .then((r) => (r.ok ? r.json() : { suggestions: [] }))
        .then((data) => {
          setAddressSuggestions(data.suggestions ?? []);
          setShowSuggestions((data.suggestions ?? []).length > 0);
        })
        .catch(() => undefined)
        .finally(() => setSuggestionsLoading(false));
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [street]);

  function selectAddressSuggestion(s: AddressSuggestion) {
    justSelectedSuggestion.current = true;
    setStreet(s.street);
    setCity(s.city);
    setState(s.state);
    setZip(s.zip);
    setShowSuggestions(false);
    setAddressSuggestions([]);
  }

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
      utm: getStoredUtm(),
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
      // Vercel's serverless functions don't share memory between
      // invocations, so the confirmation page's own request can land on a
      // different instance that never saw this order. Stash it here so the
      // confirmation page can render instantly from what we already have,
      // falling back to the API (which reads from disk-backed storage) if
      // it's missing — e.g. a reload or a shared link.
      try {
        sessionStorage.setItem(`order:${data.order.id}`, JSON.stringify(data.order));
      } catch {
        // sessionStorage can throw in private-browsing/storage-restricted
        // contexts — the API fallback on the confirmation page still works.
      }
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
              <div className="relative">
                <input
                  className="input"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  onFocus={() => addressSuggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  autoComplete="off"
                  placeholder="Start typing your address…"
                />
                {suggestionsLoading && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Spinner className="text-ink-light/50 dark:text-ink-dark/50" />
                  </span>
                )}
                {showSuggestions && addressSuggestions.length > 0 && (
                  <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-line-light bg-surface-light shadow-soft dark:border-line-dark dark:bg-surface-dark dark:shadow-softDark">
                    {addressSuggestions.map((s, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectAddressSuggestion(s)}
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
                        >
                          {s.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <p className="mt-1 text-xs text-ink-light/70 dark:text-ink-dark/70">
                Start typing and pick your address — city, state, and ZIP fill in automatically.
              </p>
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
              <PaymentOption
                label="Pay on delivery"
                sublabel="Cash or card with the driver"
                badge="real"
                selected={paymentMethod === "cod"}
                onSelect={() => setPaymentMethod("cod")}
              />
              <PaymentOption
                label="Card"
                sublabel="Pay now online"
                badge="demo"
                selected={paymentMethod === "card_demo"}
                onSelect={() => setPaymentMethod("card_demo")}
              />
              <PaymentOption
                label="Apple Pay"
                sublabel="Pay now online"
                badge="demo"
                selected={paymentMethod === "apple_pay_demo"}
                onSelect={() => setPaymentMethod("apple_pay_demo")}
              />
              <PaymentOption
                label="PayPal"
                sublabel="Pay now online"
                badge="demo"
                selected={paymentMethod === "paypal_demo"}
                onSelect={() => setPaymentMethod("paypal_demo")}
              />
            </div>

            {paymentMethod !== "cod" && (
              <p className="rounded-lg bg-black/5 p-3 text-xs text-ink-light/80 dark:bg-white/5 dark:text-ink-dark/80">
                <strong>Demo mode:</strong> this option isn&apos;t wired to a real payment
                processor in this build — placing the order confirms it without an actual charge.
                Only &quot;Pay on delivery&quot; is a real, working payment method here.
              </p>
            )}

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
                <p className="text-xs text-ink-light/80 dark:text-ink-dark/80">
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

          <button type="submit" disabled={submitting} className="btn-primary w-full gap-2">
            {submitting && <Spinner />}
            {submitting ? "Placing order…" : `Place order — ${money(totals.total)}`}
          </button>
        </aside>
      </form>
    </div>
  );
}

function PaymentOption({
  label,
  sublabel,
  badge,
  selected,
  onSelect,
}: {
  label: string;
  sublabel: string;
  badge: "real" | "demo";
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition ${
        selected
          ? "border-accent bg-accent/5 dark:border-accent-light dark:bg-accent-light/10"
          : "border-line-light hover:bg-black/5 dark:border-line-dark dark:hover:bg-white/5"
      }`}
    >
      <input type="radio" checked={selected} onChange={onSelect} className="shrink-0" />
      <span className="flex-1">
        <span className="font-medium">{label}</span>
        <span className="ml-2 text-xs text-ink-light/70 dark:text-ink-dark/70">{sublabel}</span>
      </span>
      <span
        className={`pill shrink-0 text-[10px] ${
          badge === "real"
            ? "bg-accent/10 text-accent dark:text-accent-light"
            : "bg-black/5 text-ink-light/70 dark:bg-white/10 dark:text-ink-dark/70"
        }`}
      >
        {badge === "real" ? "Real" : "Demo"}
      </span>
    </label>
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
