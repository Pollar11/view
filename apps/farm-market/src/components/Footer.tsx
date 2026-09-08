import Link from "next/link";
import { CATALOG, CATEGORY_LABELS } from "@/lib/products";
import { FARM_ADDRESS_LABEL, FARM_PHONE, FARM_PHONE_TEL, GOOGLE_MAPS_DIRECTIONS_URL } from "@/lib/site";
import type { Category } from "@/lib/types";

const CATEGORY_ORDER: Category[] = ["sheep", "goat", "beef", "chicken", "eggs", "duck", "rabbit"];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line-light dark:border-line-dark">
      <div className="mx-auto max-w-6xl px-5 py-12 text-sm">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="text-[15px] font-bold">🐑 Meadow &amp; Market</div>
            <p className="mt-2 max-w-xs text-ink-light/85 dark:text-ink-dark/85">
              Pasture-raised sheep, goat, beef, chicken, duck, rabbit, and eggs —
              cut to order and delivered to your door.
            </p>
            <address className="mt-4 not-italic text-ink-light/85 dark:text-ink-dark/85">
              <a href={GOOGLE_MAPS_DIRECTIONS_URL} target="_blank" rel="noreferrer" className="block hover:underline">
                {FARM_ADDRESS_LABEL}
              </a>
              <a href={`tel:${FARM_PHONE_TEL}`} className="mt-1 block hover:underline">
                {FARM_PHONE}
              </a>
            </address>
          </div>

          <div>
            <div className="font-semibold">Shop</div>
            <ul className="mt-2 space-y-1.5 text-ink-light/85 dark:text-ink-dark/85">
              <li><Link href="/shop" className="hover:underline">All products</Link></li>
              {CATEGORY_ORDER.map((c) => (
                <li key={c}>
                  <Link href={`/shop?category=${c}`} className="hover:underline">
                    {CATEGORY_LABELS[c]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-semibold">Company</div>
            <ul className="mt-2 space-y-1.5 text-ink-light/85 dark:text-ink-dark/85">
              <li><Link href="/about" className="hover:underline">About us</Link></li>
              <li><Link href="/locations" className="hover:underline">Locations</Link></li>
              <li><Link href="/deals" className="hover:underline">Deals</Link></li>
              <li><Link href="/membership" className="hover:underline">Membership</Link></li>
              <li><Link href="/subscribe" className="hover:underline">Monthly subscriptions</Link></li>
              <li><Link href="/admin" className="hover:underline">Farm dashboard</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold">Support</div>
            <ul className="mt-2 space-y-1.5 text-ink-light/85 dark:text-ink-dark/85">
              <li><Link href="/faq" className="hover:underline">FAQ</Link></li>
              <li><Link href="/terms" className="hover:underline">Terms of service</Link></li>
              <li><Link href="/privacy" className="hover:underline">Privacy policy</Link></li>
              <li>Free delivery on orders $75+</li>
              <li>We deliver within a ~320 mile radius</li>
            </ul>
          </div>
        </div>

        <details className="mt-10 text-xs text-ink-light/80 dark:text-ink-dark/80">
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

        <p className="mt-8 text-xs text-ink-light/75 dark:text-ink-dark/75">
          © {new Date().getFullYear()} Meadow &amp; Market Farm. Demo storefront —
          payments shown here are simulated, no real card is charged.
        </p>
      </div>
    </footer>
  );
}
