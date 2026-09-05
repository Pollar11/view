import Link from "next/link";
import { CATALOG, CATEGORY_LABELS } from "@/lib/products";
import { getAllStock } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import type { Category } from "@/lib/types";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

export default function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const active = searchParams.category as Category | undefined;
  const stock = getAllStock();
  const products = active ? CATALOG.filter((p) => p.category === active) : CATALOG;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Shop the farm</h1>
      <p className="mt-2 text-ink-light/60 dark:text-ink-dark/60">
        Pasture-raised meat and eggs, priced against current market rates.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterChip href="/shop" label="All" active={!active} />
        {CATEGORIES.map((c) => (
          <FilterChip key={c} href={`/shop?category=${c}`} label={CATEGORY_LABELS[c]} active={active === c} />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} stock={stock[p.slug] ?? 0} />
        ))}
      </div>
    </div>
  );
}

function FilterChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`pill border transition ${
        active
          ? "border-ink-light bg-ink-light text-canvas-light dark:border-ink-dark dark:bg-ink-dark dark:text-canvas-dark"
          : "border-line-light text-ink-light/70 hover:bg-black/5 dark:border-line-dark dark:text-ink-dark/70 dark:hover:bg-white/10"
      }`}
    >
      {label}
    </Link>
  );
}
