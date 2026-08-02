import type { MetadataRoute } from "next";
import { siteConfig, services, locations } from "@/lib/site-config";

/**
 * Generates /sitemap.xml from the static routes + the service and location matrices.
 * Static pages use Hebrew slugs; the service/location silos use English slugs. Extend
 * `staticPaths` when new top-level pages are added.
 *
 * Every `loc` ends with a trailing slash to match `trailingSlash: true` in
 * next.config.mjs — the host 301s `/path` to `/path/`, so a slashless sitemap entry
 * makes crawlers pay for a redirect hop on every URL.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.domain;
  const now = new Date();

  const staticPaths = [
    "",
    "שירותים",
    "איזורי-שירות",
    "מחירון",
    "אודות",
    "צור-קשר",
    "מדיניות-פרטיות",
    "הצהרת-נגישות",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: path ? `${base}/${path}/` : `${base}/`,
    lastModified: now,
  }));

  const serviceEntries: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${base}/services/${s.slug}/`,
    lastModified: now,
  }));

  const locationEntries: MetadataRoute.Sitemap = locations.map((c) => ({
    url: `${base}/locations/${c.slug}/`,
    lastModified: now,
  }));

  return [...staticEntries, ...serviceEntries, ...locationEntries];
}
