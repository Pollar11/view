"use client";

import Link from "next/link";
import { useCart } from "@/store/cart-context";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const { lines, isHydrated } = useCart();
  const count = lines.reduce((sum, l) => sum + l.qty, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-line-light bg-canvas-light/80 backdrop-blur dark:border-line-dark dark:bg-canvas-dark/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link href="/" className="flex items-center gap-2 text-[15px] font-bold tracking-tight">
          <span aria-hidden>🐑</span>
          Meadow &amp; Market
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-ink-light/70 dark:text-ink-dark/70 md:flex">
          <Link href="/shop" className="transition hover:text-ink-light dark:hover:text-ink-dark">
            Shop all
          </Link>
          <Link href="/shop?category=sheep" className="transition hover:text-ink-light dark:hover:text-ink-dark">
            Sheep
          </Link>
          <Link href="/shop?category=goat" className="transition hover:text-ink-light dark:hover:text-ink-dark">
            Goat
          </Link>
          <Link href="/shop?category=chicken" className="transition hover:text-ink-light dark:hover:text-ink-dark">
            Chicken &amp; Eggs
          </Link>
          <Link href="/shop?category=duck" className="transition hover:text-ink-light dark:hover:text-ink-dark">
            Duck
          </Link>
          <Link href="/shop?category=rabbit" className="transition hover:text-ink-light dark:hover:text-ink-dark">
            Rabbit
          </Link>
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
        </div>
      </div>
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
