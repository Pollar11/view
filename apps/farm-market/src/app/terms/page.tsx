import { FARM_ADDRESS_LABEL, FARM_PHONE } from "@/lib/site";

export const metadata = {
  title: "Terms of Service",
  description: "Terms covering orders, pricing, delivery, payment, SMS, and subscriptions.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-3xl font-bold tracking-tight">Terms of service</h1>
      <p className="mt-2 text-sm text-ink-light/80 dark:text-ink-dark/80">
        Demo storefront — this text is illustrative, not reviewed legal counsel.
      </p>

      <div className="mt-8 space-y-6 text-sm text-ink-light/80 dark:text-ink-dark/80">
        <Section title="1. Orders and pricing">
          Prices are set against current regional livestock and specialty-meat
          market rates and may change week to week. Placing an order is an
          offer to buy at the price shown at checkout; we confirm availability
          before your order is finalized.
        </Section>
        <Section title="2. Delivery">
          We deliver within roughly a 320 mile radius of {FARM_ADDRESS_LABEL}.
          Delivery estimates are based on ZIP-code distance and are
          approximate, not guaranteed arrival windows.
        </Section>
        <Section title="3. Payment">
          &quot;Pay on delivery&quot; is settled with the driver. Card, Apple
          Pay, and PayPal options shown at checkout are demo-only in this
          environment and do not process a real charge.
        </Section>
        <Section title="4. SMS communications">
          We text only customers who explicitly opt in at checkout, or who
          request a one-time cart reminder from the cart page. Reply STOP to
          any message to opt out at any time.
        </Section>
        <Section title="5. Subscriptions">
          Monthly subscription plans described on the Subscribe page are
          recurring by design, but in this demo environment no recurring
          billing is actually processed — starting a plan records your
          interest and we follow up directly.
        </Section>
        <Section title="6. Contact">
          Questions about these terms: call {FARM_PHONE} or see our{" "}
          <a href="/faq" className="underline">FAQ</a>.
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-semibold text-ink-light dark:text-ink-dark">{title}</h2>
      <p className="mt-1.5">{children}</p>
    </section>
  );
}
