import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Deliberately does NOT list /admin, /api/, or /order/ in a Disallow rule.
 * robots.txt is a plain-text file anyone (crawler or attacker) can fetch
 * without authenticating — listing sensitive paths there only broadcasts
 * "look here" to something that was otherwise no easier to find than
 * guessing "/admin" (the single most common admin path on the internet) or
 * reading the fetch() calls already sitting in this site's public JS
 * bundle. It adds zero real protection and a small amount of free
 * reconnaissance for an attacker, so we don't do it.
 *
 * Those paths are kept out of search results the correct way instead:
 * /admin and /order/[id] send `X-Robots-Tag: noindex, nofollow` (see
 * next.config.mjs and their route metadata) — a crawler only sees that
 * once it requests the page directly, not by reading a public manifest in
 * advance. /api/ routes return JSON, which search engines don't index as
 * page content regardless. Actual access control is the admin password +
 * signed session + CSRF token on state-changing requests, and rate
 * limiting on every route — none of which robots.txt has any part in.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
