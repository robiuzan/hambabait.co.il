import type { MetadataRoute } from "next";
import { siteConfig, services, locations } from "@/lib/site-config";
import { guides } from "@/lib/guides";

/**
 * Generates /sitemap.xml from the static routes + the service and location matrices.
 * Static pages use Hebrew slugs; the service/location silos use English slugs. Extend
 * `staticPaths` when new top-level pages are added.
 *
 * Every `loc` ends with a trailing slash to match `trailingSlash: true` in
 * next.config.mjs — the host 301s `/path` to `/path/`, so a slashless sitemap entry
 * makes crawlers pay for a redirect hop on every URL.
 *
 * `lastModified` is emitted ONLY where the content carries a real date — the 12 guides,
 * which have an editorial `updated` field. A build timestamp is not a content date: it
 * moves on every deploy whether or not the page changed. Stamping `new Date()` on the
 * other 33 URLs (which is what this file used to do) told Google that all 33 changed on
 * every deploy, and the cost was not the 33 — an untrustworthy lastmod gets the signal
 * discounted site-wide, including on the guides where the date is true. Omitting it is
 * valid per the sitemap protocol. Do NOT "restore" it by inventing per-page dates.
 * `scripts/qa-gate.mjs` asserts the count and the date-only shape.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.domain;

  const staticPaths = [
    "",
    "שירותים",
    "איזורי-שירות",
    "מחירון",
    "אודות",
    "צור-קשר",
    "מדיניות-פרטיות",
    "הצהרת-נגישות",
    "מדריכים",
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
  }));

  const serviceEntries: MetadataRoute.Sitemap = services.map((s) => ({
    url: url(`services/${s.slug}`),
  }));

  const locationEntries: MetadataRoute.Sitemap = locations.map((c) => ({
    url: url(`locations/${c.slug}`),
  }));

  /**
   * Hub guides. `encodeURI` escapes the Hebrew parent segment; the slugs are English.
   * The only entries carrying `lastModified`, because they are the only pages with a real
   * editorial date. `guides[].updated` is a date-only ISO string, so `<lastmod>` lands as
   * midnight UTC — which is how the gate tells a content date from a build timestamp.
   */
  const guideEntries: MetadataRoute.Sitemap = guides.map((g) => ({
    url: url(`מדריכים/${g.slug}`),
    lastModified: new Date(g.updated),
  }));

  return [...staticEntries, ...serviceEntries, ...locationEntries, ...guideEntries];
}
