"use client";

import "./globals.css";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-canvas-light font-sans text-ink-light dark:bg-canvas-dark dark:text-ink-dark">
        <div className="mx-auto max-w-lg px-5 py-16 text-center">
          <div className="text-5xl" aria-hidden>
            🐑
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">The site hit a snag</h1>
          <p className="mt-2 text-sm opacity-80">Please reload the page — if it keeps happening, call (510) 535-1111.</p>
          <button onClick={reset} className="btn-primary mt-6">
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
