import { FARM_EMAIL, FARM_NAME, FARM_PHONE, LEGAL_LAST_UPDATED } from "@/lib/site";

export const metadata = {
  title: "Accessibility Statement",
  description: "Our commitment to an accessible site, standards we target, and how to report an issue.",
  alternates: { canonical: "/accessibility" },
};

export default function AccessibilityPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-3xl font-bold tracking-tight">Accessibility statement</h1>
      <p className="mt-2 text-sm text-ink-light/80 dark:text-ink-dark/80">
        Demo storefront — this text is illustrative, not a completed formal
        audit, but reflects real practices built into this site.
      </p>
      <p className="mt-1 text-xs text-ink-light/70 dark:text-ink-dark/70">
        Last updated: {LEGAL_LAST_UPDATED}
      </p>

      <div className="mt-8 space-y-6 text-sm text-ink-light/80 dark:text-ink-dark/80">
        <Section title="Our commitment">
          {FARM_NAME} wants everyone — including customers using a screen
          reader, keyboard-only navigation, or voice control — to be able to
          browse the farm and place an order. We build accessibility in as we
          go, not as an afterthought.
        </Section>
        <Section title="Standard we target">
          We aim to meet WCAG 2.1 Level AA, the widely-used benchmark for web
          accessibility. That includes sufficient color contrast, visible
          keyboard focus states, a &quot;skip to content&quot; link, alt text
          on every product photo, and form fields that are properly labeled
          for assistive technology.
        </Section>
        <Section title="What's built in today">
          <ul className="mt-1.5 list-disc space-y-1 pl-5">
            <li>A &quot;Skip to content&quot; link for keyboard users, visible on focus</li>
            <li>Descriptive alt text on every product photo</li>
            <li>Labeled form fields throughout checkout, cart, and subscriptions</li>
            <li>Keyboard-operable navigation, cart, and confirmation dialogs</li>
            <li>Color contrast checked against WCAG AA text-contrast ratios</li>
            <li>Respects your device&apos;s light/dark mode preference, with a manual toggle</li>
          </ul>
        </Section>
        <Section title="Known limitations">
          This is a demo build and not yet independently audited by an
          accessibility specialist — some third-party embeds (like the map on
          our Locations page) may not fully meet the same standard we hold
          our own content to. We&apos;re working through these.
        </Section>
        <Section title="Let us know">
          If you hit an accessibility barrier anywhere on this site, please
          tell us — call {FARM_PHONE} or email{" "}
          <a href={`mailto:${FARM_EMAIL}`} className="underline">{FARM_EMAIL}</a>.
          Include the page and what happened, and we&apos;ll look into it.
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-semibold text-ink-light dark:text-ink-dark">{title}</h2>
      <div className="mt-1.5">{children}</div>
    </section>
  );
}
