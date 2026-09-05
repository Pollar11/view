import Link from "next/link";
import { CATALOG } from "@/lib/products";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line-light dark:border-line-dark">
      <div className="mx-auto max-w-6xl px-5 py-12 text-sm">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <div className="text-[15px] font-bold">🐑 Meadow &amp; Market</div>
            <p className="mt-2 max-w-xs text-ink-light/60 dark:text-ink-dark/60">
              Pasture-raised sheep, goat, chicken, duck, rabbit, and eggs — cut
              to order and delivered to your door.
            </p>
          </div>
          <div>
            <div className="font-semibold">Shop</div>
            <ul className="mt-2 space-y-1.5 text-ink-light/60 dark:text-ink-dark/60">
              <li><Link href="/shop" className="hover:underline">All products</Link></li>
              <li><Link href="/admin" className="hover:underline">Farm dashboard</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Delivery</div>
            <ul className="mt-2 space-y-1.5 text-ink-light/60 dark:text-ink-dark/60">
              <li>Free delivery on orders $75+</li>
              <li>Order by Thursday for Saturday delivery</li>
              <li>We deliver within a ~320 mile radius of the farm</li>
            </ul>
          </div>
        </div>

        <details className="mt-10 text-xs text-ink-light/50 dark:text-ink-dark/50">
          <summary className="cursor-pointer select-none font-medium">
            Photo credits
          </summary>
          <ul className="mt-2 space-y-1">
            {CATALOG.map((p) => (
              <li key={p.slug}>
                {p.name}:{" "}
                <a
                  href={p.imageCredit.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {p.imageCredit.title}
                </a>{" "}
                — {p.imageCredit.license}
              </li>
            ))}
          </ul>
        </details>

        <p className="mt-8 text-xs text-ink-light/40 dark:text-ink-dark/40">
          © {new Date().getFullYear()} Meadow &amp; Market Farm. Demo storefront —
          payments shown here are simulated, no real card is charged.
        </p>
      </div>
    </footer>
  );
}
