"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled route error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-5 py-16 text-center">
      <div className="text-5xl" aria-hidden>
        🐑
      </div>
      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">Something went wrong</h1>
      <p className="mt-2 text-sm text-ink-light/85 dark:text-ink-dark/85">
        That&apos;s on us, not you. Try again, or head back to the farm.
      </p>
      <div className="mt-6 flex gap-3">
        <button onClick={reset} className="btn-primary">
          Try again
        </button>
        <Link href="/" className="btn-secondary">
          Back to the farm
        </Link>
      </div>
    </div>
  );
}
