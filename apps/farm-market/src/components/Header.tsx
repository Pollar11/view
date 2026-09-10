"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart-context";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/subscribe", label: "Subscribe" },
  { href: "/membership", label: "Membership" },
  { href: "/locations", label: "Locations" },
  { href: "/deals", label: "Deals" },
  { href: "/track", label: "Track Order" },
];

export function Header() {
  const router = useRouter();
  const { lines, isHydrated } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const count = lines.reduce((sum, l) => sum + l.qty, 0);

  function openSearch() {
    setSearchOpen(true);
    requestAnimationFrame(() => searchInputRef.current?.focus());
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/shop?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setSearchQuery("");
  }

  return (
    <header className="print:hidden sticky top-0 z-40 border-b-2 border-line-light bg-canvas-light dark:border-line-dark dark:bg-canvas-dark">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <span aria-hidden>🐑</span>
          Meadow &amp; Market
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-ink-light/85 dark:text-ink-dark/85 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-accent dark:hover:text-accent-dark">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={openSearch}
            aria-label="Search products and orders"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line-light transition hover:bg-black/5 dark:border-line-dark dark:hover:bg-white/10"
          >
            <SearchIcon />
          </button>
          <ThemeToggle />
          <Link
            href="/cart"
            className="relative flex h-9 items-center gap-1.5 rounded-lg border border-line-light px-3.5 text-sm font-semibold transition hover:bg-black/5 dark:border-line-dark dark:hover:bg-white/10"
          >
            <CartIcon />
            Cart
            {isHydrated && count > 0 && (
              <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line-light transition hover:bg-black/5 dark:border-line-dark dark:hover:bg-white/10 md:hidden"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-line-light px-5 py-3 dark:border-line-dark">
          <form onSubmit={submitSearch} className="mx-auto flex max-w-6xl gap-2">
            <input
              ref={searchInputRef}
              className="input"
              placeholder="Search products (e.g. lamb chops, eggs)…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
            />
            <button type="submit" className="btn-secondary shrink-0 px-4">
              Search
            </button>
          </form>
        </div>
      )}

      {menuOpen && (
        <nav className="border-t border-line-light px-5 py-3 text-sm font-medium dark:border-line-dark md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-2 py-2.5 text-ink-light/90 transition hover:bg-black/5 dark:text-ink-dark/90 dark:hover:bg-white/10"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}
