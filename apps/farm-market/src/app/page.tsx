import Link from "next/link";
import { CATALOG } from "@/lib/products";
import { getAllStock } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { SocialProofTicker } from "@/components/SocialProofTicker";

export default function HomePage() {
  const stock = getAllStock();

  return (
    <div>
      {/* Tesla-style full-bleed hero */}
      <section className="relative flex min-h-[86vh] items-end overflow-hidden bg-black text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://commons.wikimedia.org/wiki/Special:FilePath/Sheep.jpg"
          alt="Pasture-raised sheep grazing at Meadow & Market farm"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-40 animate-fadeUp">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            Raised on pasture · Delivered to your door
          </p>
          <h1 className="max-w-2xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Farm to your door,
            <br /> cut to order.
          </h1>
          <p className="mt-5 max-w-md text-base text-white/80">
            Sheep, goat, chicken, duck, rabbit, and farm-fresh eggs — raised
            outdoors, priced against today&apos;s market, delivered fresh.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="btn-primary">
              Shop the farm
            </Link>
            <Link
              href="#why"
              className="btn-secondary border-white/30 text-white hover:bg-white/10"
            >
              Why Meadow &amp; Market
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5">
        <div className="-mt-6 flex justify-center">
          <SocialProofTicker />
        </div>

        <section className="py-16">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-bold tracking-tight">
              This week on the farm
            </h2>
            <Link href="/shop" className="text-sm font-semibold underline underline-offset-4">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CATALOG.map((p) => (
              <ProductCard key={p.slug} product={p} stock={stock[p.slug] ?? 0} />
            ))}
          </div>
        </section>

        <section id="why" className="scroll-mt-24 border-t border-line-light py-16 dark:border-line-dark">
          <h2 className="text-2xl font-bold tracking-tight">Why buy direct from the farm</h2>
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
      <p className="mt-1.5 text-sm text-ink-light/60 dark:text-ink-dark/60">{body}</p>
    </div>
  );
}
