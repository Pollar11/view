import Link from "next/link";
import type { Product } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/products";
import { StockBadge } from "./StockBadge";
import { fromPriceLabel } from "@/lib/display";

export function ProductCard({ product, stock }: { product: Product; stock: number }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-black/5 dark:bg-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.imageAlt}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 pill bg-canvas-light/90 text-ink-light dark:bg-canvas-dark/90 dark:text-ink-dark">
          {CATEGORY_LABELS[product.category]}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-ink-light/60 dark:text-ink-dark/60">
          {product.description}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm font-bold">{fromPriceLabel(product)}</span>
          <StockBadge stock={stock} />
        </div>
      </div>
    </Link>
  );
}
