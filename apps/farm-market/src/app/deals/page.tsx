import Link from "next/link";

export const metadata = {
  title: "Deals",
  description: "Automatic Farm Basket discounts, free delivery over $75, and how personal SMS codes work.",
  alternates: { canonical: "/deals" },
};

export default function DealsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
      <p className="mt-2 text-ink-light/85 dark:text-ink-dark/85">
        Real, always-on discounts — applied automatically in your cart, no
        code needed.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="card p-6">
          <span className="pill bg-accent/10 text-accent dark:text-accent-light">Automatic</span>
          <h2 className="mt-3 font-semibold">Farm Basket — 5% off</h2>
          <p className="mt-1.5 text-sm text-ink-light/70 dark:text-ink-dark/70">
            Add 2 or more different animal categories to your cart (e.g. chicken +
            eggs) and 5% comes off your subtotal automatically.
          </p>
        </div>
        <div className="card p-6">
          <span className="pill bg-accent/10 text-accent dark:text-accent-light">Automatic</span>
          <h2 className="mt-3 font-semibold">Full Farm Basket — 10% off</h2>
          <p className="mt-1.5 text-sm text-ink-light/70 dark:text-ink-dark/70">
            Mix 4 or more different animal categories in one order and the
            discount doubles to 10% off your subtotal.
          </p>
        </div>
        <div className="card p-6">
          <span className="pill bg-black/5 dark:bg-white/10">Free</span>
          <h2 className="mt-3 font-semibold">Free delivery over $75</h2>
          <p className="mt-1.5 text-sm text-ink-light/70 dark:text-ink-dark/70">
            Any order totaling $75 or more (after discounts) ships free — no
            code, tracked live in your cart.
          </p>
        </div>
        <div className="card p-6">
          <span className="pill bg-black/5 dark:bg-white/10">Personal</span>
          <h2 className="mt-3 font-semibold">Returning-customer codes</h2>
          <p className="mt-1.5 text-sm text-ink-light/70 dark:text-ink-dark/70">
            If you&apos;ve ordered before and opted into texts, we occasionally
            send a personal discount code by SMS — never a site-wide code, and
            only if you opted in at checkout.
          </p>
        </div>
      </div>

      <Link href="/shop" className="btn-primary mt-8 inline-flex">
        Shop and see it applied
      </Link>
    </div>
  );
}
