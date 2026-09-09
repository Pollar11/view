import Link from "next/link";
import { CATALOG, CATEGORY_LABELS } from "@/lib/products";
import {
  FARM_ADDRESS_LABEL,
  FARM_EMAIL,
  FARM_HOURS,
  FARM_PHONE,
  FARM_PHONE_TEL,
  GOOGLE_MAPS_DIRECTIONS_URL,
  SOCIAL_LINKS,
} from "@/lib/site";
import type { Category } from "@/lib/types";

const CATEGORY_ORDER: Category[] = ["sheep", "goat", "beef", "chicken", "eggs", "duck", "rabbit"];

export function Footer() {
  return (
    <footer className="print:hidden mt-24 border-t border-line-light dark:border-line-dark">
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
              <a href={`tel:${FARM_PHONE_TEL}`} className="mt-1 block font-medium hover:underline">
                {FARM_PHONE}
              </a>
              <a href={`mailto:${FARM_EMAIL}`} className="mt-1 block hover:underline">
                {FARM_EMAIL}
              </a>
            </address>

            <dl className="mt-4 space-y-0.5 text-xs text-ink-light/75 dark:text-ink-dark/75">
              {FARM_HOURS.map((h) => (
                <div key={h.day} className="flex gap-2">
                  <dt className="w-16 font-medium">{h.day}</dt>
                  <dd>{h.hours}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 flex items-center gap-3">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.name}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-line-light text-ink-light/70 transition hover:border-accent hover:text-accent dark:border-line-dark dark:text-ink-dark/70 dark:hover:border-accent-light dark:hover:text-accent-light"
                >
                  <SocialIcon name={s.icon} />
                </a>
              ))}
            </div>
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
              <li><Link href="/blog" className="hover:underline">Blog</Link></li>
              <li><Link href="/locations" className="hover:underline">Locations</Link></li>
              <li><Link href="/deals" className="hover:underline">Deals</Link></li>
              <li><Link href="/membership" className="hover:underline">Membership</Link></li>
              <li><Link href="/subscribe" className="hover:underline">Monthly subscriptions</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold">Support</div>
            <ul className="mt-2 space-y-1.5 text-ink-light/85 dark:text-ink-dark/85">
              <li><Link href="/faq" className="hover:underline">FAQ</Link></li>
              <li><Link href="/track" className="hover:underline">Track your order</Link></li>
              <li><Link href="/terms" className="hover:underline">Terms of service</Link></li>
              <li><Link href="/privacy" className="hover:underline">Privacy policy</Link></li>
              <li><Link href="/accessibility" className="hover:underline">Accessibility</Link></li>
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
          © {new Date().getFullYear()} Meadow &amp; Market Farm. Card payments are
          processed securely by Stripe — this site never sees or stores your card details.
        </p>
      </div>
    </footer>
  );
}

function SocialIcon({ name }: { name: "instagram" | "facebook" | "x" }) {
  if (name === "instagram") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (name === "facebook") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    );
  }
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M18.9 1.2h3.7l-8 9.2 9.5 12.4h-7.4l-5.8-7.6-6.6 7.6H.6l8.6-9.8L0 1.2h7.6l5.3 7 6-7zm-1.3 19.4h2L6.5 3.3H4.3l13.3 17.3z" />
    </svg>
  );
}
