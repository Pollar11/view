"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Section } from "@/lib/types";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function Nav({ sections }: { sections: Pick<Section, "slug" | "title">[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "bg-[var(--bg)]/90 backdrop-blur-md border-b hairline"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-14 max-w-rail items-center justify-between px-5 md:px-10">
        <Link href="/" aria-label="View — home" className="text-[1.05rem]">
          <Logo />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/live"
            className="flex items-center gap-1.5 text-[0.8rem] font-medium tracking-[0.08em] text-[var(--fg)]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
            LIVE
          </Link>
          {sections.slice(0, 5).map((s) => (
            <Link
              key={s.slug}
              href={`/s/${s.slug}`}
              className="text-[0.8rem] font-medium tracking-[0.08em] text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
            >
              {s.title}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/scores"
            className="hidden text-[0.8rem] font-medium tracking-[0.08em] text-[var(--muted)] hover:text-[var(--fg)] md:block"
          >
            Scores
          </Link>
          <Link
            href="/search"
            aria-label="Search"
            className="text-[0.8rem] font-medium tracking-[0.08em] text-[var(--muted)] hover:text-[var(--fg)]"
          >
            Search
          </Link>
          <Link
            href="/watchlist"
            aria-label="Watchlist"
            className="text-[var(--muted)] hover:text-[var(--fg)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </Link>
          <ThemeToggle />
          <button
            aria-label="Menu"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="block h-[1.5px] w-6 bg-current" />
            <span className="mt-1.5 block h-[1.5px] w-6 bg-current" />
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t hairline bg-[var(--bg)] px-5 py-4 md:hidden">
          <Link
            href="/live"
            className="flex items-center gap-2 py-3 text-sm tracking-[0.08em]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
            LIVE
          </Link>
          <Link href="/scores" className="block py-3 text-sm tracking-[0.08em] text-[var(--muted)]">
            SCORES
          </Link>
          <Link href="/multiview" className="block py-3 text-sm tracking-[0.08em] text-[var(--muted)]">
            MULTIVIEW
          </Link>
          <Link href="/watchlist" className="block py-3 text-sm tracking-[0.08em] text-[var(--muted)]">
            WATCHLIST
          </Link>
          {sections.map((s) => (
            <Link
              key={s.slug}
              href={`/s/${s.slug}`}
              className="block py-3 text-sm tracking-[0.08em] text-[var(--muted)]"
            >
              {s.title}
            </Link>
          ))}
          <button
            onClick={async () => {
              await fetch("/api/auth/login", { method: "DELETE" });
              window.location.href = "/login";
            }}
            className="mt-2 block py-3 text-sm tracking-[0.08em] text-[var(--muted)]"
          >
            SIGN OUT
          </button>
        </div>
      )}
    </header>
  );
}
