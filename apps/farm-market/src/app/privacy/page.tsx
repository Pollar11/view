import { FARM_EMAIL, FARM_NAME, FARM_PHONE, LEGAL_LAST_UPDATED } from "@/lib/site";

export const metadata = {
  title: "Privacy Policy",
  description: "What we collect, how SMS opt-in works, cookies, and your rights.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-3xl font-bold tracking-tight">Privacy policy</h1>
      <p className="mt-2 text-sm text-ink-light/80 dark:text-ink-dark/80">
        Demo storefront — this text is illustrative and written to show a
        complete, structured privacy page, not reviewed legal counsel.
      </p>
      <p className="mt-1 text-xs text-ink-light/70 dark:text-ink-dark/70">
        Effective / last updated: {LEGAL_LAST_UPDATED}
      </p>

      <div className="mt-8 space-y-6 text-sm text-ink-light/80 dark:text-ink-dark/80">
        <Section title="Who this applies to">
          This policy covers {FARM_NAME}&apos;s website. We&apos;re a small,
          real farm-to-door business — not a data broker, and not in the
          business of selling your information to anyone.
        </Section>
        <Section title="What we collect">
          Name, delivery address, phone number, and order contents when you
          check out. Your cart itself lives only in your browser&apos;s local
          storage — we never see it until you place an order or explicitly
          tap &quot;Text me this cart.&quot; If you arrive via a marketing
          link, we record which one (source/campaign) so we know what&apos;s
          working — never anything more specific than that.
        </Section>
        <Section title="Cookies and analytics">
          We use one essential cookie to keep the farm dashboard signed in
          for the owner. With your consent (the banner on your first visit),
          we also use privacy-friendly, cookieless pageview analytics to see
          which pages are useful — it doesn&apos;t track you across other
          sites or build an ad profile. Decline any time from the banner; it
          doesn&apos;t affect your ability to shop or check out.
        </Section>
        <Section title="SMS">
          We only text customers who opt in at checkout, or who request a
          one-time cart reminder. We never share your number with anyone
          outside sending that message via our SMS provider. Reply STOP
          anytime to opt out, or HELP for support.
        </Section>
        <Section title="Payment data">
          &quot;Pay on delivery&quot; involves no card data collection at all.
          Paying online by card goes through Stripe&apos;s own hosted
          checkout page — your card details are entered there, never on this
          site, and we never see or store your full card number. We keep
          only what Stripe tells us is safe to show on a receipt: the card
          brand and last 4 digits.
        </Section>
        <Section title="Chat assistant">
          Messages you send the chat assistant are used only to answer your
          question in that session and are not stored beyond the browser tab.
        </Section>
        <Section title="How long we keep data">
          Order and customer records are kept as long as needed to fulfill
          orders, handle returns, and run our loyalty tiers — reach out any
          time to ask us to delete yours sooner.
        </Section>
        <Section title="Children's privacy">
          This site is intended for adults placing food orders and is not
          directed at children under 13; we don&apos;t knowingly collect
          information from them.
        </Section>
        <Section title="Your rights">
          Contact us at {FARM_PHONE} or{" "}
          <a href={`mailto:${FARM_EMAIL}`} className="underline">{FARM_EMAIL}</a>{" "}
          to ask what data we hold about you, correct it, or request deletion.
        </Section>
        <Section title="Changes to this policy">
          If this policy changes, we&apos;ll update the date at the top of
          this page. Significant changes will be noted here.
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
