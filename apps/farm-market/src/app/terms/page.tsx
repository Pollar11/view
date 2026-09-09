import { FARM_ADDRESS_LABEL, FARM_EMAIL, FARM_NAME, FARM_PHONE, LEGAL_LAST_UPDATED } from "@/lib/site";

export const metadata = {
  title: "Terms of Service",
  description: "Terms covering orders, pricing, delivery, payment, quality guarantees, SMS, and subscriptions.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-3xl font-bold tracking-tight">Terms of service</h1>
      <p className="mt-2 text-sm text-ink-light/80 dark:text-ink-dark/80">
        Demo storefront — this text is illustrative and written to show a
        complete, structured terms page, not reviewed legal counsel.
      </p>
      <p className="mt-1 text-xs text-ink-light/70 dark:text-ink-dark/70">
        Effective / last updated: {LEGAL_LAST_UPDATED}
      </p>

      <div className="mt-8 space-y-6 text-sm text-ink-light/80 dark:text-ink-dark/80">
        <Section title="1. Acceptance of these terms">
          By placing an order, creating a subscription request, or otherwise
          using this site, you agree to these terms. If you don&apos;t agree,
          please don&apos;t place an order — you&apos;re welcome to call{" "}
          {FARM_PHONE} with questions first.
        </Section>
        <Section title="2. No account required">
          There&apos;s no login or password on this site. Your order history
          and loyalty tier are looked up by the phone number you provide at
          checkout — see our{" "}
          <a href="/privacy" className="underline">Privacy Policy</a> for how
          that&apos;s handled.
        </Section>
        <Section title="3. Orders and pricing">
          Prices are set against current regional livestock and specialty-meat
          market rates and may change week to week. Placing an order is an
          offer to buy at the price shown at checkout; we confirm availability
          and stock before your order is finalized, and will contact you if an
          item sells out between browsing and checkout.
        </Section>
        <Section title="4. Delivery">
          We deliver within roughly a 320 mile radius of {FARM_ADDRESS_LABEL}.
          Delivery estimates shown at checkout are based on ZIP-code distance
          and are approximate, not guaranteed arrival windows — weather, road
          conditions, and processing time can shift them.
        </Section>
        <Section title="5. Payment">
          Pay with cash or card on delivery, or pay online by card through
          Stripe at checkout — both are real, working payment methods. Card
          payments are processed entirely by Stripe on their own secure
          page; your card number is never entered on or stored by this site.
        </Section>
        <Section title="6. Quality and satisfaction">
          Everything ships fresh, cut to order after you purchase — nothing
          sits in a warehouse. If an order arrives damaged, incorrect, or
          below the quality you expect, call {FARM_PHONE} within 48 hours of
          delivery and we&apos;ll make it right with a replacement or refund.
        </Section>
        <Section title="7. SMS communications">
          We text only customers who explicitly opt in at checkout, or who
          request a one-time cart reminder from the cart page. Message
          frequency varies; standard message and data rates may apply. Reply
          STOP to any message to opt out at any time, or HELP for support.
        </Section>
        <Section title="8. Subscriptions">
          Monthly subscription plans described on the Subscribe page are
          recurring by design, but in this demo environment no recurring
          billing is actually processed — starting a plan records your
          interest and we follow up by phone to confirm and arrange actual
          recurring delivery and payment.
        </Section>
        <Section title="9. Acceptable use">
          Please don&apos;t attempt to interfere with the site&apos;s
          operation, submit false order or contact information, or use any
          automated system to place orders or scrape pricing at a rate a
          human wouldn&apos;t.
        </Section>
        <Section title="10. Limitation of liability">
          This is a small, real farm operation, not a large retailer — our
          liability for any issue with an order is limited to the price paid
          for that order. We&apos;re not liable for indirect damages arising
          from a delayed or missed delivery window.
        </Section>
        <Section title="11. Changes to these terms">
          We may update these terms as the business changes; the
          &quot;Effective / last updated&quot; date above reflects the most
          recent revision. Continued use of the site after a change means you
          accept the updated terms.
        </Section>
        <Section title="12. Governing law">
          These terms are governed by the laws of the State of California,
          without regard to conflict-of-law principles.
        </Section>
        <Section title="13. Contact">
          Questions about these terms: call {FARM_PHONE}, email{" "}
          <a href={`mailto:${FARM_EMAIL}`} className="underline">{FARM_EMAIL}</a>,
          or see our <a href="/faq" className="underline">FAQ</a>.
        </Section>
      </div>

      <p className="mt-10 text-xs text-ink-light/60 dark:text-ink-dark/60">
        © {new Date().getFullYear()} {FARM_NAME}.
      </p>
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
