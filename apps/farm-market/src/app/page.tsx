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
      {/* Split hero on a soft gradient band so it reads as a distinct zone,
          not a continuation of the plain canvas background. */}
      <section className="relative overflow-hidden bg-gradient-to-b from-accent/[0.07] via-canvas-light to-canvas-light dark:from-accent-dark/[0.09] dark:via-canvas-dark dark:to-canvas-dark">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:pb-20 sm:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fadeUp">
              <p className="mb-4 pill w-fit bg-accent/10 text-accent dark:bg-accent-dark/15 dark:text-accent-light">
                🐑 Family-run · Pasture-raised
              </p>
              <h1 className="text-5xl font-bold leading-[1.03] tracking-tight sm:text-6xl lg:text-[3.4rem]">
                Real animals,
                <br />
                raised right,
                <br />
                <span className="text-accent dark:text-accent-light">delivered to your door.</span>
              </h1>
              <p className="mt-6 max-w-md text-base text-ink-light/70 dark:text-ink-dark/70">
                Sheep, goat, beef, chicken, duck, rabbit, and eggs — whole or
                butchered, priced against today&apos;s market, cut fresh and
                delivered straight to you.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-6">
                <Link href="/shop" className="btn-primary">
                  Start shopping
                </Link>
                <Link href="/subscribe" className="text-sm font-semibold underline underline-offset-4 hover:text-accent">
                  Or set up a monthly box →
                </Link>
              </div>
              <div className="mt-9 flex flex-wrap gap-2">
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

            <div className="relative">
              <div className="product-photo-frame card relative aspect-[4/3] overflow-hidden rounded-xl3 shadow-float dark:shadow-floatDark lg:aspect-[5/4]">
                <Image
                  src="https://images.pexels.com/photos/6622957/pexels-photo-6622957.jpeg"
                  alt="Pasture-raised sheep at Meadow & Market"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  priority
                  className="product-photo object-cover"
                />
              </div>
              {/* Floating trust card, overlapping the photo corner — a
                  concrete, easy-to-spot signal that this is a redesigned
                  layout, not a variant of the old plain-framed photo. */}
              <div className="card absolute -bottom-6 -left-4 flex items-center gap-3 rounded-xl2 px-4 py-3 shadow-float dark:shadow-floatDark sm:-left-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-moss/10 text-lg dark:bg-moss-dark/20">
                  ✅
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-bold">Cut after you order</p>
                  <p className="text-xs text-ink-light/60 dark:text-ink-dark/60">Never frozen in a warehouse</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5">
        {/* Trust band — four quick, scannable reasons to trust the site,
            directly under the hero where a new visitor's eyes land next. */}
        <section className="grid grid-cols-2 gap-px overflow-hidden rounded-xl2 border border-line-light bg-line-light dark:border-line-dark dark:bg-line-dark sm:grid-cols-4 -mt-8 mb-2 relative z-10">
          <TrustStat icon="🚚" label="Free delivery" sub="On orders $75+" />
          <TrustStat icon="🌾" label="Pasture-raised" sub="Not feedlot beef" />
          <TrustStat icon="🔪" label="Cut fresh" sub="After you order" />
          <TrustStat icon="🔒" label="Secure checkout" sub="Card via Stripe" />
        </section>

        <div className="flex justify-center py-6">
          <SocialProofTicker />
        </div>

        <section className="py-10">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="eyebrow">This week</p>
              <h2 className="text-3xl font-bold tracking-tight">Featured cuts</h2>
            </div>
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
          <p className="eyebrow">Delivery area</p>
          <h2 className="text-3xl font-bold tracking-tight">Where we deliver</h2>
          <p className="mt-2 text-ink-light/85 dark:text-ink-dark/85">
            We deliver within about a 320-mile radius — including all the way toward Anaheim, CA.
          </p>
          <div className="mt-6">
            <LocationCard />
          </div>
        </section>

        <section id="why" className="scroll-mt-24 border-t border-line-light py-16 dark:border-line-dark">
          <p className="eyebrow">Why direct</p>
          <h2 className="text-3xl font-bold tracking-tight">Why buy direct</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
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

function TrustStat({ icon, label, sub }: { icon: string; label: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 bg-surface-light px-4 py-4 dark:bg-surface-dark">
      <span aria-hidden className="text-xl">
        {icon}
      </span>
      <div className="leading-tight">
        <p className="text-xs font-bold sm:text-sm">{label}</p>
        <p className="text-[11px] text-ink-light/60 dark:text-ink-dark/60">{sub}</p>
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
