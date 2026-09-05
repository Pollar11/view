import { FREE_DELIVERY_THRESHOLD } from "@/lib/pricing";
import { money } from "@/lib/format";

export function FreeDeliveryBar({ remaining }: { remaining: number }) {
  const progress = Math.min(
    100,
    Math.round(((FREE_DELIVERY_THRESHOLD - remaining) / FREE_DELIVERY_THRESHOLD) * 100),
  );

  return (
    <div className="card p-4">
      <p className="text-sm font-medium">
        {remaining <= 0 ? (
          <>🎉 Your order qualifies for <span className="text-accent dark:text-accent-light">free delivery</span>.</>
        ) : (
          <>Add <span className="font-bold">{money(remaining)}</span> more for free delivery.</>
        )}
      </p>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
