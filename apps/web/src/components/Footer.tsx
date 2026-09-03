import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t hairline">
      <div className="mx-auto flex max-w-rail flex-col gap-4 px-5 py-10 text-[0.72rem] tracking-[0.08em] text-[var(--muted)] md:flex-row md:items-center md:justify-between md:px-10">
        <span className="flex items-center gap-2 text-[0.9rem] text-[var(--fg)]">
          <Logo />
          <span className="text-[0.72rem] text-[var(--muted)]">
            © {new Date().getFullYear()}
          </span>
        </span>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/">Home</Link>
          <Link href="/search">Search</Link>
          <span>No ads. No trackers.</span>
        </div>
      </div>
    </footer>
  );
}
