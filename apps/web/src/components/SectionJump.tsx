"use client";

import { useEffect, useState } from "react";

/**
 * Sticky "jump to" chip bar under the nav. Keeps every part of a long page one
 * tap away and highlights the section currently in view.
 */
export function SectionJump({
  items,
}: {
  items: { id: string; label: string }[];
}) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5] },
    );
    for (const it of items) {
      const el = document.getElementById(it.id);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <div className="sticky top-14 z-40 border-b hairline bg-[var(--bg)]/85 backdrop-blur-md">
      <div className="no-scrollbar mx-auto flex max-w-rail gap-1 overflow-x-auto px-5 py-2.5 md:px-10">
        {items.map((it) => (
          <a
            key={it.id}
            href={`#${it.id}`}
            className={`flex-none rounded-full px-3 py-1 text-[0.72rem] font-medium tracking-[0.08em] transition-colors ${
              active === it.id
                ? "bg-[var(--fg)] text-[var(--bg)]"
                : "text-[var(--muted)] hover:text-[var(--fg)]"
            }`}
          >
            {it.label.toUpperCase()}
          </a>
        ))}
      </div>
    </div>
  );
}
