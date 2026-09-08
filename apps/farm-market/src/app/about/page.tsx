import { FARM_ADDRESS_LABEL, FARM_PHONE } from "@/lib/site";

export const metadata = {
  title: "About Us",
  description: "A family-run farm at 845 Kennedy St, Oakland, CA, selling direct to households instead of through a wholesale middleman.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-3xl font-bold tracking-tight">About Meadow &amp; Market</h1>
      <div className="prose-farm mt-6 space-y-5 text-ink-light/80 dark:text-ink-dark/80">
        <p>
          Meadow &amp; Market is a family-run farm at {FARM_ADDRESS_LABEL}. We
          raise sheep, goats, cattle, chickens, ducks, and rabbits on open
          pasture, and keep laying hens and ducks for fresh eggs — then sell
          direct to households instead of going through a wholesale
          middleman.
        </p>
        <p>
          That direct model is the whole reason our prices can sit below
          typical retail: you&apos;re paying for the animal and the
          delivery, not a chain of distributors in between.
        </p>
        <p>
          Every animal photo and price on this site is real to our
          operation — pricing is checked against current regional market
          rates (see the &quot;On pricing&quot; note on each product page),
          and stock counts reflect what we actually have on hand that week.
        </p>
        <p>
          Questions before you order? Call us at {FARM_PHONE}, use the chat
          assistant in the corner of this site, or see our{" "}
          <a href="/faq" className="underline">FAQ</a>.
        </p>
      </div>
    </div>
  );
}
