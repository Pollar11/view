"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CATALOG } from "@/lib/products";
import { fromPriceLabel } from "@/lib/display";
import { loadRecentlyViewed } from "@/lib/recently-viewed";
import type { Product } from "@/lib/types";

/** A quiet, local-only "recently viewed" rail — the slugs never leave this
 * browser, so unlike the old saved-checkout-profile feature, nothing here
 * could ever surface one visitor's activity to a different person on a
 * shared device. Renders nothing until there's real history to show, and
 * nothing at all server-side (avoids a hydration flash of empty state). */
export function RecentlyViewed({ excludeSlug }: { excludeSlug?: string }) {
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    const slugs = loadRecentlyViewed().filter((s) => s !== excludeSlug);
    const found = slugs
      .map((slug) => CATALOG.find((p) => p.slug === slug))
      .filter((p): p is Product => Boolean(p));
    setProducts(found);
  }, [excludeSlug]);

  if (!products || products.length === 0) return null;

  return (
    <section className="border-t border-line-light py-10 dark:border-line-dark">
      <h2 className="text-lg font-semibold tracking-tight">Recently viewed</h2>
      <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
        {products.map((p) => (
          <Link
            key={p.slug}
            href={`/product/${p.slug}`}
            className="group flex w-36 shrink-0 flex-col gap-2"
          >
            <div className="product-photo-frame relative aspect-square overflow-hidden rounded-lg bg-black/5 dark:bg-white/5">
              <Image
                src={p.image}
                alt={p.imageAlt}
                fill
                sizes="144px"
                className="product-photo object-cover transition duration-300 group-hover:scale-105"
              />
            </div>
            <div>
              <p className="line-clamp-1 text-sm font-medium">{p.name}</p>
              <p className="text-xs text-ink-light/70 dark:text-ink-dark/70">{fromPriceLabel(p)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
