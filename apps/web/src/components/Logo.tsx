import type { SVGProps } from "react";

/**
 * The View mark — a "V" that sweeps forward into a play arrow.
 * Drawn with `currentColor` so it inverts cleanly in light/dark and anywhere
 * it is placed. This is a vector interpretation of the brand logo; the polished
 * raster render is used for OG images and store icons (see public/BRANDING.md).
 */
export function ViewMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      role="img"
      aria-label="View"
      {...props}
    >
      {/* the V / checkmark */}
      <path
        d="M30 24 L64 92 Q68 100 74 92 L104 40"
        stroke="currentColor"
        strokeWidth="15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* forward swoosh out of the V's tip */}
      <path
        d="M96 52 Q120 20 140 22"
        stroke="currentColor"
        strokeWidth="15"
        strokeLinecap="round"
      />
      {/* arrowhead */}
      <path
        d="M129 4 L156 22 L129 40 Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Horizontal lockup: mark + "view" wordmark. Use `iconOnly` for tight spots.
 */
export function Logo({
  className = "",
  iconOnly = false,
}: {
  className?: string;
  iconOnly?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <ViewMark className="h-[1.1em] w-auto" />
      {!iconOnly && (
        <span className="text-[1.15em] font-semibold lowercase tracking-[-0.01em]">
          view
        </span>
      )}
    </span>
  );
}
