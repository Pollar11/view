"use client";

import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      setPct(scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="print:hidden fixed inset-x-0 top-0 z-50 h-[3px] bg-transparent" aria-hidden>
      <div
        className="h-full bg-accent transition-[width] duration-150 ease-out dark:bg-accent-dark"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
