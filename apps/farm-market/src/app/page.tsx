import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CATALOG, CATEGORY_LABELS } from "@/lib/products";
import { getAllStock } from "@/lib/db";

export const metadata: Metadata = {
  title: "Farm-to-Door Sheep, Goat, Beef, Chicken, Duck & Rabbit",
  description:
    "Pasture-raised meat and eggs from a real Oakland, CA farm — whole or butchered, priced against today's market, delivered to your door.",
  alternates: { canonical: "/" },
};
import { ProductCard } from "@/components/ProductCard";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { SocialProofTicker } from "@/components/SocialProofTicker";
import { LocationCard } from "@/components/LocationCard";
import type { Category } from "@/lib/types";

const CATEGORY_ICON: Record<Category, string> = {
  sheep: "🐑",
  goat: "🐐",
  beef: "🐄",
  chicken: "🐓",
  eggs: "🥚",
  duck: "🦆",
  rabbit: "🐇",
};
const CATEGORY_ORDER: Category[] = ["sheep", "goat", "beef", "chicken", "eggs", "duck", "rabbit"];

export default function HomePage() {
  const stock = getAllStock();

  return (
    <div>
      {/* Split hero — warm canvas + a framed photo card, not a full-bleed dark banner */}
      <section className="mx-auto max-w-6xl px-5 pb-6 pt-14">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="animate-fadeUp">
            <p className="mb-3 pill w-fit bg-accent/10 text-accent dark:text-accent-light">
              Family-run · Pasture-raised
            </p>
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
              Real animals, raised right,
              <br />
              delivered to your door.
            </h1>
            <p className="mt-5 max-w-md text-base text-ink-light/70 dark:text-ink-dark/70">
              Sheep, goat, beef, chicken, duck, rabbit, and eggs — whole or
              butchered, priced against today&apos;s market, cut fresh and
              delivered straight to you.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link href="/shop" className="btn-primary">
                Start shopping
              </Link>
              <Link href="/subscribe" className="text-sm font-semibold underline underline-offset-4 hover:text-accent">
                Or set up a monthly box →
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {CATEGORY_ORDER.map((c) => (
                <Link
                  key={c}
                  href={`/shop?category=${c}`}
                  className="pill border border-line-light bg-surface-light hover:bg-black/5 dark:border-line-dark dark:bg-surface-dark dark:hover:bg-white/10"
                >
                  <span aria-hidden>{CATEGORY_ICON[c]}</span> {CATEGORY_LABELS[c]}
                </Link>
              ))}
            </div>
          </div>

          <div className="product-photo-frame card relative aspect-[4/3] overflow-hidden lg:aspect-[5/4]">
            <Image
              src="https://commons.wikimedia.org/wiki/Special:FilePath/Sheep.jpg"
              alt="Pasture-raised sheep at Meadow & Market"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
              className="product-photo object-cover"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5">
        <div className="flex justify-center py-6">
          <SocialProofTicker />
        </div>

        <section className="py-10">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-bold tracking-tight">
              Featured this week
            </h2>
            <Link href="/shop" className="text-sm font-semibold underline underline-offset-4">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CATALOG.slice(0, 6).map((p) => (
              <ProductCard key={p.slug} product={p} stock={stock[p.slug] ?? 0} />
            ))}
          </div>
        </section>

        <RecentlyViewed />

        <section className="border-t border-line-light py-16 dark:border-line-dark">
          <h2 className="text-2xl font-bold tracking-tight">Where we deliver</h2>
          <p className="mt-2 text-ink-light/85 dark:text-ink-dark/85">
            We deliver within about a 320-mile radius — including all the way toward Anaheim, CA.
          </p>
          <div className="mt-6">
            <LocationCard />
          </div>
        </section>

        <section id="why" className="scroll-mt-24 border-t border-line-light py-16 dark:border-line-dark">
          <h2 className="text-2xl font-bold tracking-tight">Why buy direct</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            <Why
              title="Priced against today's market"
              body="Every price on this site is set against current regional livestock and specialty-meat rates — not marked up, not a loss leader."
            />
            <Why
              title="Cut to order, delivered fresh"
              body="Nothing sits in a warehouse. Animals are processed after you order and delivered on a route built around your ZIP code."
            />
            <Why
              title="A relationship, not a transaction"
              body="Opt in at checkout and we'll text you real offers when we have surplus or a seasonal discount — never more than that."
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function Why({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-light/85 dark:text-ink-dark/85">{body}</p>
    </div>
  );
}
