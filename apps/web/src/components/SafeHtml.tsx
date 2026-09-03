import { cleanRichText } from "@/lib/sanitize";

/** Renders upstream rich text after stripping scripts, trackers and ad iframes. */
export function SafeHtml({
  html,
  className,
}: {
  html?: string | null;
  className?: string;
}) {
  const clean = cleanRichText(html);
  if (!clean) return null;
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
