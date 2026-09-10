import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/products";
import { StockBadge } from "./StockBadge";
import { fromPriceLabel } from "@/lib/display";

export function ProductCard({ product, stock }: { product: Product; stock: number }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="card group flex flex-col overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-float dark:hover:shadow-floatDark"
    >
      <div className="product-photo-frame relative aspect-[4/3] overflow-hidden bg-black/5 dark:bg-white/5">
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="product-photo object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="badge-solid absolute left-3 top-3">{CATEGORY_LABELS[product.category]}</span>
        <span className="badge-solid-moss absolute right-3 top-3">
          {product.cutType === "whole" ? "Whole animal" : "Butchered"}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 border-t-2 border-transparent p-4 transition-colors duration-200 group-hover:border-accent dark:group-hover:border-accent-dark">
        <h3 className="font-semibold leading-snug">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-ink-light/85 dark:text-ink-dark/85">
          {product.description}
        </p>
        <div className="mt-auto flex items-end justify-between pt-2">
          <span className="text-base font-bold text-accent dark:text-accent-light">{fromPriceLabel(product)}</span>
          <StockBadge stock={stock} />
        </div>
      </div>
    </Link>
  );
}
