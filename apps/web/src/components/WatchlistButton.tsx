"use client";

import { useWatchlistItem, type WatchlistItem } from "@/lib/watchlist";

export function WatchlistButton({
  item,
  variant = "icon",
}: {
  item: Omit<WatchlistItem, "addedAt">;
  variant?: "icon" | "full";
}) {
  const { saved, toggle } = useWatchlistItem(item.id, item.type);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(item);
  };

  if (variant === "full") {
    return (
      <button onClick={onClick} className="tsl-btn tsl-btn-ghost gap-2">
        <Star filled={saved} />
        {saved ? "In your list" : "Add to list"}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      aria-label={saved ? "Remove from watchlist" : "Add to watchlist"}
      aria-pressed={saved}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
    >
      <Star filled={saved} />
    </button>
  );
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
