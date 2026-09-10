import Link from "next/link";
import { FARM_ADDRESS_LABEL, FARM_HOURS, FARM_PHONE } from "@/lib/site";

export const metadata = {
  title: "About Us",
  description: "A family-run farm at 845 Kennedy St, Oakland, CA, selling direct to households instead of through a wholesale middleman.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-3xl font-bold tracking-tight">About Meadow &amp; Market</h1>
      <p className="mt-3 text-ink-light/85 dark:text-ink-dark/85">
        A family-run farm at {FARM_ADDRESS_LABEL}, selling meat and eggs
        directly to households instead of through a wholesale middleman.
      </p>

      <div className="prose-farm mt-10 space-y-10 text-ink-light/80 dark:text-ink-dark/80">
        <Section title="Why we sell direct">
          <p>
            Most meat sold in a grocery store passes through a processor, a
            distributor, and a retailer before it reaches a plate — each one
            adding a markup and a few more days between the animal and your
            table. We cut that chain out entirely. When you order here,
            you&apos;re paying for the animal, the processing, and the
            delivery — nothing else. That&apos;s the entire reason our
            prices can sit below typical retail while the animal itself is
            raised the same way, or better.
          </p>
          <p className="mt-3">
            It also means we only raise what we can actually sell, and we
            know exactly where every order comes from, because it came from
            here.
          </p>
        </Section>

        <Section title="How the animals are raised">
          <p>
            Sheep, goats, and cattle are raised on open pasture — grass-fed,
            never confined to a feedlot. Chickens and ducks are free-range
            with daily access to pasture and, for the ducks, pond water.
            Rabbits are raised in open hutches with regular time outside
            their pens. None of our animals receive antibiotics or added
            hormones as a routine practice.
          </p>
          <p className="mt-3">
            We&apos;re upfront that we are not USDA Organic certified —
            certification is a paperwork and inspection process most
            small direct-to-consumer farms don&apos;t carry, not a
            reflection of how the animals are actually kept. If that
            distinction matters to your decision, ask us directly and
            we&apos;ll tell you exactly what our practices are and
            aren&apos;t.
          </p>
        </Section>

        <Section title="From pasture to your door">
          <p>
            Nothing here sits in a warehouse waiting for a buyer. Whole,
            half, and quarter animal listings are processed only after you
            order — that&apos;s what &quot;cut to order&quot; means on this
            site. Butchered cuts (chops, steaks, thighs, ground meat) are
            prepared in small batches close to when they ship, not held in
            long-term freezer stock. Eggs are collected within about 72
            hours of your delivery.
          </p>
          <p className="mt-3">
            Delivery routes are built around ZIP codes, generally covering
            a few-hundred-mile radius — enter yours at checkout for an
            exact distance and timing estimate before you order.
          </p>
        </Section>

        <Section title="How pricing works">
          <p>
            Every price on this site is checked against current regional
            livestock and specialty-meat market rates — see the &quot;On
            pricing&quot; note on each product page for the specific
            comparison. We don&apos;t mark prices up above what the direct
            model already saves, and we don&apos;t use a loss-leader price
            to pull you in and upsell you later. Whole and half-animal
            listings are priced per pound at our lowest, direct-from-farm
            rate; pre-cut retail-style cuts cost a bit more per pound to
            cover the extra butchering and packaging — the same tradeoff
            you&apos;d see at any real butcher counter.
          </p>
        </Section>

        <Section title="What we promise">
          <p>
            If an order arrives damaged, incorrect, or below the quality
            you expect, call us within 48 hours of delivery and we&apos;ll
            make it right with a replacement or a refund — see our{" "}
            <Link href="/terms" className="underline">Terms of Service</Link>{" "}
            for the full policy. We&apos;d rather lose a sale on a bad batch
            than lose your trust.
          </p>
        </Section>

        <Section title="Hours &amp; contact">
          <dl className="mt-1 space-y-1 text-sm">
            {FARM_HOURS.map((h) => (
              <div key={h.day} className="flex gap-2">
                <dt className="w-20 font-medium text-ink-light dark:text-ink-dark">{h.day}</dt>
                <dd>{h.hours}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3">
            Questions before you order? Call us at {FARM_PHONE}, use the chat
            assistant in the corner of this site, or see our{" "}
            <Link href="/faq" className="underline">FAQ</Link>. Directions
            and the exact address are on the{" "}
            <Link href="/locations" className="underline">Locations</Link>{" "}
            page.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-ink-light dark:text-ink-dark">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}
