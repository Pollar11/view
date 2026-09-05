"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { useCart } from "@/store/cart-context";
import { money } from "@/lib/format";

export function AddToCartPanel({ product, stock }: { product: Product; stock: number }) {
  const { addLine } = useCart();
  const [portionIdx, setPortionIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const portion = product.portionOptions?.[portionIdx];
  const weightLb =
    product.unitType === "per_lb" ? portion?.weightLb ?? product.avgWeightLb ?? null : null;

  const unitLabel = useMemo(() => {
    if (product.unitType === "per_unit") {
      return product.unitNoun === "dozen" ? "Dozen" : "Each";
    }
    if (portion) return portion.label;
    if (product.avgWeightLb) return `Whole (~${product.avgWeightLb} lb)`;
    return "Per lb";
  }, [product, portion]);

  const lineTotal =
    product.unitType === "per_lb"
      ? (product.pricePerLb ?? 0) * (weightLb ?? 0) * qty
      : (product.pricePerUnit ?? 0) * qty;

  const maxQty = Math.max(1, stock);
  const soldOut = stock <= 0;

  function handleAdd() {
    addLine({ slug: product.slug, unitLabel, weightLb, qty });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2200);
  }

  return (
    <div className="card p-5">
      {product.portionOptions && (
        <div className="mb-4">
          <span className="label">Portion</span>
          <div className="flex flex-wrap gap-2">
            {product.portionOptions.map((opt, i) => (
              <button
                key={opt.label}
                onClick={() => setPortionIdx(i)}
                className={`pill border transition ${
                  i === portionIdx
                    ? "border-ink-light bg-ink-light text-canvas-light dark:border-ink-dark dark:bg-ink-dark dark:text-canvas-dark"
                    : "border-line-light hover:bg-black/5 dark:border-line-dark dark:hover:bg-white/10"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4">
        <span className="label">
          {product.unitType === "per_unit" ? `Quantity (${product.unitNoun}s)` : "Quantity"}
        </span>
        <div className="inline-flex items-center rounded-full border border-line-light dark:border-line-dark">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-9 w-9 items-center justify-center text-lg"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-semibold">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            className="flex h-9 w-9 items-center justify-center text-lg"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-baseline justify-between border-t border-line-light pt-4 dark:border-line-dark">
        <span className="text-sm text-ink-light/60 dark:text-ink-dark/60">Line total</span>
        <span className="text-xl font-bold">{money(lineTotal)}</span>
      </div>

      <button onClick={handleAdd} disabled={soldOut} className="btn-primary w-full">
        {soldOut ? "Sold out this week" : justAdded ? "Added ✓" : "Add to cart"}
      </button>

      {justAdded && (
        <p className="mt-3 text-center text-sm">
          <Link href="/cart" className="font-semibold text-accent underline dark:text-accent-light">
            View cart &amp; checkout →
          </Link>
        </p>
      )}
    </div>
  );
}
