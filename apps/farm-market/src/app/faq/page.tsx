import { FAQ } from "@/lib/faq";

export const metadata = { title: "FAQ — Meadow & Market" };

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-3xl font-bold tracking-tight">Frequently asked questions</h1>
      <p className="mt-2 text-ink-light/60 dark:text-ink-dark/60">
        Can&apos;t find your answer? The chat assistant in the corner of this
        site is trained on exactly this list, or call (510) 535-1111.
      </p>
      <div className="mt-8 space-y-4">
        {FAQ.map((entry) => (
          <details key={entry.question} className="card p-5">
            <summary className="cursor-pointer select-none font-semibold">
              {entry.question}
            </summary>
            <p className="mt-2 text-sm text-ink-light/70 dark:text-ink-dark/70">{entry.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
