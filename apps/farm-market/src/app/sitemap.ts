import type { MetadataRoute } from "next";
import { CATALOG } from "@/lib/products";
import { SITE_URL } from "@/lib/site";

const STATIC_ROUTES = [
  "",
  "/shop",
  "/about",
  "/locations",
  "/deals",
  "/membership",
  "/subscribe",
  "/faq",
  "/terms",
  "/privacy",
  "/accessibility",
  "/blog",
  "/cart",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticEntries = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const productEntries = CATALOG.map((p) => ({
    url: `${SITE_URL}/product/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...productEntries];
}
