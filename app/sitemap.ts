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

  /**
   * `encodeURI` percent-escapes the Hebrew static-page slugs. The sitemap protocol
   * requires escaped URLs, and Cloudflare Pages only matches the escaped asset key — it
   * 404s a path sent as raw UTF-8 bytes. Escaping also makes `loc` byte-identical to the
   * page's canonical. The English service/location slugs pass through unchanged.
   */
  const url = (path: string) => encodeURI(path ? `${base}/${path}/` : `${base}/`);

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: url(path),
    lastModified: now,
  }));

  const serviceEntries: MetadataRoute.Sitemap = services.map((s) => ({
    url: url(`services/${s.slug}`),
    lastModified: now,
  }));

  const locationEntries: MetadataRoute.Sitemap = locations.map((c) => ({
    url: url(`locations/${c.slug}`),
    lastModified: now,
  }));

  return [...staticEntries, ...serviceEntries, ...locationEntries];
}
