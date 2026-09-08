"use client";

import { useEffect } from "react";
import { captureUtmFromLocation } from "@/lib/utm";

/** Invisible — just captures utm_* params from the landing URL into
 * sessionStorage so checkout can attribute the order to a campaign. */
export function UtmCapture() {
  useEffect(() => {
    captureUtmFromLocation();
  }, []);
  return null;
}
