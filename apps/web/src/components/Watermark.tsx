import { ViewMark } from "./Logo";

/**
 * Fixed brand watermark behind all content. Opacity set to 9% per brand
 * direction — override with --watermark-opacity if needed.
 */
export function Watermark() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden"
      style={{ opacity: "var(--watermark-opacity, 0.09)" }}
    >
      <ViewMark className="w-[62vw] max-w-[820px] text-[var(--fg)]" />
    </div>
  );
}
