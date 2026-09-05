"use client";

import Link from "next/link";
import { useCart } from "@/store/cart-context";
import { getProduct, CATALOG, CATEGORY_LABELS } from "@/lib/products";
import { money } from "@/lib/format";
import { FreeDeliveryBar } from "@/components/FreeDeliveryBar";

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

  const cartCategories = new Set(
    lines.map((l) => getProduct(l.slug)?.category).filter(Boolean),
  );
  const suggestions = CATALOG.filter((p) => !cartCategories.has(p.category)).slice(0, 3);

  if (!isHydrated) {
    return <div className="mx-auto max-w-4xl px-5 py-16 text-center text-ink-light/50">Loading cart…</div>;
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-ink-light/60 dark:text-ink-dark/60">
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
                  className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                />
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link href={`/product/${product.slug}`} className="font-semibold hover:underline">
                        {product.name}
                      </Link>
                      <p className="text-xs text-ink-light/50 dark:text-ink-dark/50">{line.unitLabel}</p>
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
                      onClick={() => removeLine(idx)}
                      className="text-xs font-medium text-ink-light/50 underline hover:text-red-500 dark:text-ink-dark/50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {suggestions.length > 0 && (
            <div className="pt-4">
              <p className="mb-3 text-sm font-semibold">
                Add a category, save more — mix 2+ and get 5% off automatically:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((p) => (
                  <Link key={p.slug} href={`/product/${p.slug}`} className="pill border border-line-light hover:bg-black/5 dark:border-line-dark dark:hover:bg-white/10">
                    + {CATEGORY_LABELS[p.category]}
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
        </div>
      </div>
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
