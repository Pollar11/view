"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/store/cart-context";
import { getProduct, CATALOG, CATEGORY_LABELS, CATEGORY_PAIRINGS } from "@/lib/products";
import type { Category } from "@/lib/types";
import { money } from "@/lib/format";
import { FreeDeliveryBar } from "@/components/FreeDeliveryBar";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Spinner } from "@/components/Spinner";

export default function CartPage() {
  const {
    lines,
    totals,
    removeLine,
    updateQty,
    isHydrated,
    promoInput,
    setPromoInput,
    promoStatus,
    appliedCoupon,
    applyPromo,
    clearPromo,
  } = useCart();

  const [textPhone, setTextPhone] = useState("");
  const [textStatus, setTextStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [removeIdx, setRemoveIdx] = useState<number | null>(null);
  const [website, setWebsite] = useState(""); // honeypot — real users never see or fill this

  const cartCategories = new Set(
    lines
      .map((l) => getProduct(l.slug)?.category)
      .filter((c): c is Category => c !== undefined),
  );
  const pairedCategories = Array.from(
    new Set(Array.from(cartCategories).flatMap((c) => CATEGORY_PAIRINGS[c])),
  ).filter((c) => !cartCategories.has(c));
  const suggestedCategories = pairedCategories.slice(0, 3);

  async function sendCartText() {
    setTextStatus("sending");
    try {
      const res = await fetch("/api/cart/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: textPhone, items: lines, website }),
      });
      setTextStatus(res.ok ? "sent" : "error");
    } catch {
      setTextStatus("error");
    }
  }

  if (!isHydrated) {
    return <div className="mx-auto max-w-4xl px-5 py-16 text-center text-ink-light/80">Loading cart…</div>;
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-ink-light/85 dark:text-ink-dark/85">
          Fresh sheep, goat, chicken, duck, rabbit, and eggs are waiting.
        </p>
        <Link href="/shop" className="btn-primary mt-6 inline-flex">
          Browse the farm
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Your cart</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {lines.map((line, idx) => {
            const product = getProduct(line.slug);
            if (!product) return null;
            const weight =
              product.unitType === "per_lb" ? line.weightLb ?? product.avgWeightLb ?? 0 : null;
            const lineTotal =
              product.unitType === "per_lb"
                ? (product.pricePerLb ?? 0) * (weight ?? 0) * line.qty
                : (product.pricePerUnit ?? 0) * line.qty;

            return (
              <div key={`${line.slug}-${line.unitLabel}`} className="card flex gap-4 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image}
                  alt={product.imageAlt}
                  className="product-photo h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                />
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link href={`/product/${product.slug}`} className="font-semibold hover:underline">
                        {product.name}
                      </Link>
                      <p className="text-xs text-ink-light/80 dark:text-ink-dark/80">{line.unitLabel}</p>
                    </div>
                    <span className="font-bold">{money(lineTotal)}</span>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="inline-flex items-center rounded-full border border-line-light dark:border-line-dark">
                      <button
                        onClick={() => updateQty(idx, line.qty - 1)}
                        className="flex h-7 w-7 items-center justify-center"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-xs font-semibold">{line.qty}</span>
                      <button
                        onClick={() => updateQty(idx, line.qty + 1)}
                        className="flex h-7 w-7 items-center justify-center"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => setRemoveIdx(idx)}
                      className="text-xs font-medium text-ink-light/80 underline hover:text-red-500 dark:text-ink-dark/80"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {suggestedCategories.length > 0 && (
            <div className="pt-4">
              <p className="mb-3 text-sm font-semibold">
                Add a category, save more — mix 2+ and get 5% off automatically:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedCategories.map((c) => (
                  <Link key={c} href={`/shop?category=${c}`} className="pill border border-line-light hover:bg-black/5 dark:border-line-dark dark:hover:bg-white/10">
                    + {CATEGORY_LABELS[c]}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <FreeDeliveryBar remaining={totals.freeDeliveryRemaining} />

          <div className="card space-y-2.5 p-5 text-sm">
            <Row label="Subtotal" value={money(totals.subtotal)} />
            {totals.bundleDiscountAmount > 0 && (
              <Row
                label={`Farm Basket discount (${Math.round(totals.bundleDiscountRate * 100)}%)`}
                value={`−${money(totals.bundleDiscountAmount)}`}
                accent
              />
            )}
            {totals.discountAmount > 0 && (
              <Row label={`Promo ${totals.discountCode}`} value={`−${money(totals.discountAmount)}`} accent />
            )}
            <Row
              label="Delivery"
              value={totals.deliveryFee === 0 ? "Free" : money(totals.deliveryFee)}
            />
            <div className="border-t border-line-light pt-2.5 dark:border-line-dark">
              <Row label="Total" value={money(totals.total)} bold />
            </div>
          </div>

          <div className="card p-5">
            <label className="label" htmlFor="promo">Discount code</label>
            {appliedCoupon ? (
              <div className="flex items-center justify-between rounded-lg bg-accent/10 px-3 py-2 text-sm">
                <span className="font-semibold text-accent dark:text-accent-light">
                  {appliedCoupon.code} applied
                </span>
                <button onClick={clearPromo} className="text-xs underline">
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  id="promo"
                  className="input"
                  placeholder="e.g. WINB-A1B2C3"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                />
                <button onClick={applyPromo} className="btn-secondary shrink-0 px-4">
                  Apply
                </button>
              </div>
            )}
            {promoStatus === "invalid" && (
              <p className="field-error">That code is invalid or expired.</p>
            )}
          </div>

          <Link href="/checkout" className="btn-primary block w-full text-center">
            Checkout
          </Link>

          <div className="card p-5">
            <p className="label mb-1">Not ready yet?</p>
            {textStatus === "sent" ? (
              <p className="text-sm text-accent dark:text-accent-light">
                Text sent — check your phone.
              </p>
            ) : (
              <>
                <p className="mb-2 text-xs text-ink-light/85 dark:text-ink-dark/85">
                  Text yourself a reminder of what&apos;s in your cart right now (one message, sent only when you tap this).
                </p>
                <input
                  type="text"
                  name="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute h-0 w-0 opacity-0"
                  style={{ left: "-9999px" }}
                />
                <div className="flex gap-2">
                  <input
                    className="input"
                    placeholder="(555) 123-4567"
                    value={textPhone}
                    onChange={(e) => setTextPhone(e.target.value)}
                  />
                  <button
                    onClick={sendCartText}
                    disabled={textStatus === "sending" || !textPhone}
                    className="btn-secondary shrink-0 gap-1.5 px-4"
                  >
                    {textStatus === "sending" && <Spinner />}
                    {textStatus === "sending" ? "Sending…" : "Text me"}
                  </button>
                </div>
                {textStatus === "error" && (
                  <p className="field-error">Couldn&apos;t send — check the number and try again.</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={removeIdx !== null}
        title="Remove item?"
        message={
          removeIdx !== null && getProduct(lines[removeIdx]!.slug)
            ? `Remove ${getProduct(lines[removeIdx]!.slug)!.name} from your cart?`
            : "Remove this item from your cart?"
        }
        confirmLabel="Remove"
        danger
        onConfirm={() => {
          if (removeIdx !== null) removeLine(removeIdx);
          setRemoveIdx(null);
        }}
        onCancel={() => setRemoveIdx(null)}
      />
    </div>
  );
}

function Row({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "text-base font-bold" : ""}`}>
      <span className={accent ? "text-accent dark:text-accent-light" : "text-ink-light/70 dark:text-ink-dark/70"}>
        {label}
      </span>
      <span className={accent ? "text-accent dark:text-accent-light" : ""}>{value}</span>
    </div>
  );
}
