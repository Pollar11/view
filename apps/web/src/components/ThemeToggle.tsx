"use client";

import { useEffect, useState } from "react";

type Mode = "system" | "light" | "dark";
const KEY = "view:theme";

function apply(mode: Mode) {
  const root = document.documentElement;
  if (mode === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", mode);
}

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");

  useEffect(() => {
    try {
      const saved = (localStorage.getItem(KEY) as Mode) || "system";
      setMode(saved);
      apply(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const cycle = () => {
    const next: Mode =
      mode === "system" ? "light" : mode === "light" ? "dark" : "system";
    setMode(next);
    apply(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      onClick={cycle}
      aria-label={`Theme: ${mode}`}
      title={`Theme: ${mode}`}
      className="text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
    >
      {mode === "dark" ? (
        <Moon />
      ) : mode === "light" ? (
        <Sun />
      ) : (
        <Auto />
      )}
    </button>
  );
}

const p = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, "aria-hidden": true } as const;
const Sun = () => (
  <svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
  </svg>
);
const Moon = () => (
  <svg {...p}>
    <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
  </svg>
);
const Auto = () => (
  <svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3a9 9 0 010 18z" fill="currentColor" />
  </svg>
);
