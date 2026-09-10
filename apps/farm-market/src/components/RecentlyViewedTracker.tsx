"use client";

import { useEffect } from "react";
import { recordProductView } from "@/lib/recently-viewed";

/** Invisible — just records that this product was viewed, on this browser
 * only, so the "Recently viewed" rail elsewhere can show it. */
export function RecentlyViewedTracker({ slug }: { slug: string }) {
  useEffect(() => {
    recordProductView(slug);
  }, [slug]);
  return null;
}
