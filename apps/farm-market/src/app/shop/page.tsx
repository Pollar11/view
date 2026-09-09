import type { Metadata } from "next";
import Link from "next/link";
import { CATALOG, CATEGORY_LABELS } from "@/lib/products";
import { getAllStock } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import type { Category } from "@/lib/types";

export const metadata: Metadata = {
  title: "Shop All Products",
  description:
    "Browse sheep, goat, beef, chicken, duck, rabbit, and eggs — whole or butchered, priced against today's market.",
  alternates: { canonical: "/shop" },
};

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

export default function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  const active = searchParams.category as Category | undefined;
  const q = (searchParams.q ?? "").trim().toLowerCase();
  const stock = getAllStock();

  let products = active ? CATALOG.filter((p) => p.category === active) : CATALOG;
  if (q) {
    // Match every word of the query somewhere in the product's searchable
    // text, not the query as one exact phrase — so "lamb chops" finds
    // "Lamb Rib Chops" even though "chops" isn't immediately after "lamb".
    const queryWords = q.split(/\s+/).filter(Boolean);
    products = products.filter((p) => {
      const haystack = [p.name, p.description, CATEGORY_LABELS[p.category], p.cutType, ...p.bullets]
        .join(" ")
        .toLowerCase();
      return queryWords.every((w) => haystack.includes(w));
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Shop the farm</h1>
      <p className="mt-2 text-ink-light/85 dark:text-ink-dark/85">
        Pasture-raised meat and eggs, priced against current market rates.
      </p>

      <form action="/shop" method="GET" className="mt-6 flex max-w-md gap-2">
        {active && <input type="hidden" name="category" value={active} />}
        <input
          type="search"
          name="q"
          defaultValue={searchParams.q ?? ""}
          placeholder="Search products…"
          className="input"
        />
        <button type="submit" className="btn-secondary shrink-0 px-4">Search</button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        <FilterChip href="/shop" label="All" active={!active} />
        {CATEGORIES.map((c) => (
          <FilterChip key={c} href={`/shop?category=${c}`} label={CATEGORY_LABELS[c]} active={active === c} />
        ))}
      </div>

      {q && (
        <p className="mt-4 text-sm text-ink-light/70 dark:text-ink-dark/70">
          {products.length} result{products.length === 1 ? "" : "s"} for &ldquo;{searchParams.q}&rdquo;
          {" — "}
          <Link href={active ? `/shop?category=${active}` : "/shop"} className="underline">
            clear search
          </Link>
        </p>
      )}

      {products.length === 0 ? (
        <p className="mt-10 text-ink-light/70 dark:text-ink-dark/70">
          No products matched. Try a different word, or{" "}
          <Link href="/shop" className="underline">browse everything</Link>.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} stock={stock[p.slug] ?? 0} />
          ))}
        </div>
      )}
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
