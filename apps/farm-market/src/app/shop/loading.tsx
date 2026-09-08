export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-black/5 dark:bg-white/10" />
      <div className="mt-3 h-4 w-72 animate-pulse rounded-lg bg-black/5 dark:bg-white/10" />
      <div className="mt-6 flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-20 animate-pulse rounded-md bg-black/5 dark:bg-white/10" />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl2 border border-line-light dark:border-line-dark">
            <div className="aspect-[4/3] animate-pulse bg-black/5 dark:bg-white/10" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-black/5 dark:bg-white/10" />
              <div className="h-3 w-full animate-pulse rounded bg-black/5 dark:bg-white/10" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-black/5 dark:bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
