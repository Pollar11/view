"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/store/cart-context";
import { CATEGORY_LABELS } from "@/lib/products";
import type { Category } from "@/lib/types";
import { ThemeToggle } from "./ThemeToggle";

const CATEGORY_ORDER: Category[] = ["sheep", "goat", "beef", "chicken", "eggs", "duck", "rabbit"];

const TOP_LINKS = [
  { href: "/subscribe", label: "Subscribe" },
  { href: "/locations", label: "Locations" },
  { href: "/deals", label: "Deals" },
];

export function Header() {
  const { lines, isHydrated } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const count = lines.reduce((sum, l) => sum + l.qty, 0);

  function openShop() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setShopOpen(true);
  }
  function scheduleCloseShop() {
    closeTimer.current = setTimeout(() => setShopOpen(false), 150);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line-light bg-canvas-light/80 backdrop-blur dark:border-line-dark dark:bg-canvas-dark/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link href="/" className="flex items-center gap-2 text-[15px] font-bold tracking-tight">
          <span aria-hidden>🐑</span>
          Meadow &amp; Market
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-ink-light/70 dark:text-ink-dark/70 md:flex">
          <div className="relative" onMouseEnter={openShop} onMouseLeave={scheduleCloseShop}>
            <button
              onClick={() => setShopOpen((v) => !v)}
              aria-expanded={shopOpen}
              className="flex items-center gap-1 transition hover:text-ink-light dark:hover:text-ink-dark"
            >
              Shop
              <ChevronIcon />
            </button>
            {shopOpen && (
              <div className="absolute left-0 top-full pt-2">
                <div className="w-56 rounded-xl2 border border-line-light bg-surface-light p-2 shadow-soft dark:border-line-dark dark:bg-surface-dark dark:shadow-softDark">
                  <Link
                    href="/shop"
                    className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    All products
                  </Link>
                  <div className="my-1 h-px bg-line-light dark:bg-line-dark" />
                  {CATEGORY_ORDER.map((c) => (
                    <Link
                      key={c}
                      href={`/shop?category=${c}`}
                      className="block rounded-lg px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      {CATEGORY_LABELS[c]}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {TOP_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-ink-light dark:hover:text-ink-dark">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/cart"
            className="relative flex h-9 items-center gap-1.5 rounded-full border border-line-light px-3.5 text-sm font-semibold transition hover:bg-black/5 dark:border-line-dark dark:hover:bg-white/10"
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
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line-light transition hover:bg-black/5 dark:border-line-dark dark:hover:bg-white/10 md:hidden"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-line-light px-5 py-3 text-sm font-medium dark:border-line-dark md:hidden">
          <ul className="flex flex-col gap-1">
            <li className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-ink-light/40 dark:text-ink-dark/40">
              Shop by animal
            </li>
            <li>
              <Link
                href="/shop"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-2 py-2.5 text-ink-light/80 transition hover:bg-black/5 dark:text-ink-dark/80 dark:hover:bg-white/10"
              >
                All products
              </Link>
            </li>
            {CATEGORY_ORDER.map((c) => (
              <li key={c}>
                <Link
                  href={`/shop?category=${c}`}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-2 py-2.5 text-ink-light/80 transition hover:bg-black/5 dark:text-ink-dark/80 dark:hover:bg-white/10"
                >
                  {CATEGORY_LABELS[c]}
                </Link>
              </li>
            ))}
            <li className="px-2 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-ink-light/40 dark:text-ink-dark/40">
              More
            </li>
            {[...TOP_LINKS, { href: "/admin", label: "Farm dashboard" }].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-2 py-2.5 text-ink-light/80 transition hover:bg-black/5 dark:text-ink-dark/80 dark:hover:bg-white/10"
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

function CartIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
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
