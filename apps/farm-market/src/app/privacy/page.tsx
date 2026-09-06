import { FARM_PHONE } from "@/lib/site";

export const metadata = { title: "Privacy Policy — Meadow & Market" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-3xl font-bold tracking-tight">Privacy policy</h1>
      <p className="mt-2 text-sm text-ink-light/50 dark:text-ink-dark/50">
        Demo storefront — this text is illustrative, not reviewed legal counsel.
      </p>

      <div className="mt-8 space-y-6 text-sm text-ink-light/80 dark:text-ink-dark/80">
        <Section title="What we collect">
          Name, delivery address, phone number, and order contents when you
          check out. Your cart itself lives only in your browser&apos;s local
          storage — we never see it until you place an order or explicitly
          tap &quot;Text me this cart.&quot;
        </Section>
        <Section title="SMS">
          We only text customers who opt in at checkout, or who request a
          one-time cart reminder. We never share your number with anyone
          outside sending that message via our SMS provider. Reply STOP
          anytime to opt out.
        </Section>
        <Section title="Payment data">
          &quot;Pay on delivery&quot; involves no card data collection at all.
          The demo card / Apple Pay / PayPal options on this site are for
          demonstration only — no real payment processor is contacted, and no
          card number is stored.
        </Section>
        <Section title="Chat assistant">
          Messages you send the chat assistant are used only to answer your
          question in that session and are not stored beyond the browser tab.
        </Section>
        <Section title="Your rights">
          Contact us at {FARM_PHONE} to ask what data we hold about you or to
          request deletion.
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
