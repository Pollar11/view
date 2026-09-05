export function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return <span className="pill bg-red-500/10 text-red-600 dark:text-red-400">Sold out</span>;
  }
  if (stock <= 5) {
    return (
      <span className="pill bg-amber-500/10 text-amber-600 dark:text-amber-400">
        Only {stock} left this week
      </span>
    );
  }
  return (
    <span className="pill bg-accent/10 text-accent dark:text-accent-light">
      In stock
    </span>
  );
}
