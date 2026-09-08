import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 py-20 text-center">
      <div className="text-6xl">🐑</div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">This pasture is empty</h1>
      <p className="mt-3 text-ink-light/85 dark:text-ink-dark/85">
        We couldn&apos;t find that page. It may have moved, or the link might
        be off.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          Back to the farm
        </Link>
        <Link href="/shop" className="btn-secondary">
          Shop all products
        </Link>
      </div>
    </div>
  );
}
