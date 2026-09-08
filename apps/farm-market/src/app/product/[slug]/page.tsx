import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProduct, CATALOG, CATEGORY_LABELS, CATEGORY_PAIRINGS } from "@/lib/products";
import { getStock } from "@/lib/db";
import { AddToCartPanel } from "@/components/AddToCartPanel";
import { StockBadge } from "@/components/StockBadge";
import { ProductCard } from "@/components/ProductCard";

export function generateStaticParams() {
  return CATALOG.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = getProduct(params.slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { images: [{ url: product.image }] },
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  if (!product) notFound();
  const stock = getStock(product.slug);

  const pairedCategories = CATEGORY_PAIRINGS[product.category];
  const others = CATALOG.filter(
    (p) => p.slug !== product.slug && pairedCategories.includes(p.category),
  )
    .sort((a, b) => pairedCategories.indexOf(a.category) - pairedCategories.indexOf(b.category))
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <nav className="mb-6 text-sm text-ink-light/80 dark:text-ink-dark/80">
        <Link href="/shop" className="hover:underline">Shop</Link> /{" "}
        <Link href={`/shop?category=${product.category}`} className="hover:underline">
          {CATEGORY_LABELS[product.category]}
        </Link>{" "}
        / {product.name}
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="product-photo-frame card overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.imageAlt}
            className="product-photo aspect-[4/3] w-full object-cover"
          />
        </div>

        <div>
          <span className="pill bg-black/5 dark:bg-white/10">{CATEGORY_LABELS[product.category]}</span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">{product.name}</h1>
          <div className="mt-2">
            <StockBadge stock={stock} />
          </div>
          <p className="mt-4 text-ink-light/70 dark:text-ink-dark/70">{product.description}</p>

          <ul className="mt-4 space-y-1.5 text-sm text-ink-light/70 dark:text-ink-dark/70">
            {product.bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="text-accent dark:text-accent-light">✓</span> {b}
              </li>
            ))}
          </ul>

          <p className="mt-4 rounded-lg bg-black/5 p-3 text-xs text-ink-light/85 dark:bg-white/5 dark:text-ink-dark/85">
            <span className="font-semibold">On pricing:</span> {product.marketNote}
          </p>

          <div className="mt-6">
            <AddToCartPanel product={product} stock={stock} />
          </div>
        </div>
      </div>

      <section className="mt-16 border-t border-line-light pt-10 dark:border-line-dark">
        <h2 className="mb-5 text-xl font-bold tracking-tight">Frequently bought together</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {others.map((p) => (
            <ProductCard key={p.slug} product={p} stock={getStock(p.slug)} />
          ))}
        </div>
        <p className="mt-4 text-xs text-ink-light/80 dark:text-ink-dark/80">
          Suggestions above are things that genuinely pair with {CATEGORY_LABELS[product.category].toLowerCase()}
          {" "}— not random cross-sells. Mix 2 or more animal categories in one order and save 5%
          automatically, 4 or more saves 10%, applied in your cart.
        </p>
      </section>
    </div>
  );
}
