/**
 * site-config.ts — single source of truth for business data (NAP, services, locations).
 *
 * חם בבית (Cham BaBait) — nationwide water-heater / boiler (דוד) repair & service.
 * Components import these values rather than hardcoding the phone number, service names,
 * or location slugs. Identity/NAP/schema come from the normalized manifest (site.config.json).
 *
 * Slugs are ENGLISH (the rebuilt site has no legacy SEO to preserve):
 *   services → /services/<en-slug>, cities → /locations/<en-slug>.
 */

import siteManifest from "@/site.config.json";
import {
  telHref as kitTelHref,
  whatsappHref as kitWhatsappHref,
  type SiteManifest,
} from "@ishub/site-kit";

/** Normalized per-site manifest (single source of truth for NAP/identity/schema). */
export const manifest = siteManifest as unknown as SiteManifest;

/**
 * The cast above goes through `unknown`, so `site.config.json` is never structurally checked
 * against `SiteManifest` at compile time. A truncated or malformed manifest therefore used to
 * surface as a TypeError in the browser, on a live page. This guard runs at module load and
 * every route imports this module, so a bad manifest fails `npm run build` instead — a runtime
 * failure traded for a build failure.
 *
 * It checks only the fields the code below actually dereferences. Fields that are nullable by
 * design — `foundedYear`, `analytics.googleSiteVerification`, `schema.sameAs`,
 * `contact.formAccessKey` — are deliberately absent: requiring any of them would fail the
 * build on a correct manifest. Hand-rolled on purpose; a schema library is not worth a
 * dependency for nine fields.
 */
function assertManifest(m: SiteManifest): void {
  const problems: string[] = [];

  const isObject = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" && v !== null && !Array.isArray(v);

  const requireString = (field: string, value: unknown): void => {
    if (typeof value !== "string" || value.trim() === "") {
      // JSON.stringify(undefined) returns undefined, not "undefined" — and a missing field is
      // the most likely failure, so it needs to read as one rather than as a blank.
      const got = value === undefined ? "undefined" : JSON.stringify(value);
      problems.push(`${field} must be a non-empty string (got ${got})`);
    }
  };

  requireString("url", m.url);
  requireString("brandName", m.brandName);

  // Read the nested objects as `unknown`: the declared types claim they are always present,
  // which is exactly the claim this guard exists to distrust.
  const contact: unknown = m.contact;
  if (!isObject(contact)) {
    problems.push("contact must be an object");
  } else {
    requireString("contact.phoneDisplay", contact.phoneDisplay);
    requireString("contact.phoneE164", contact.phoneE164);
    requireString("contact.whatsappE164", contact.whatsappE164);
    requireString("contact.email", contact.email);
  }

  const schema: unknown = m.schema;
  if (!isObject(schema)) {
    problems.push("schema must be an object");
  } else {
    requireString("schema.areaServed", schema.areaServed);
  }

  if (problems.length > 0) {
    throw new Error(
      `site.config.json is invalid (${problems.length} problem(s)):\n` +
        problems.map((p) => `  - ${p}`).join("\n") +
        "\nFix this in the ROSTER — 'Israeli services sites'/roster/sites/hambabait.json — " +
        "then run ops/sync-manifest.ps1 to carry it across. Never edit site.config.json directly.",
    );
  }
}

assertManifest(manifest);

export const siteConfig = {
  name: manifest.brandName ?? "",
  nameEn: manifest.brandNameEn ?? "",
  /** One-line elevator pitch. */
  tagline: manifest.tagline ?? "",
  domain: manifest.url,
  // Stays null when unknown — never 0. A numeric fallback makes `2026 - siteConfig.founded`
  // render "2026 שנות ניסיון", fabricating the one claim this site has never made.
  founded: manifest.foundedYear ?? null,

  // ── Contact ──────────────────────────────────────────────────────────────
  phone: manifest.contact.phoneDisplay,
  /** E.164 form for `tel:` links. */
  phoneE164: manifest.contact.phoneE164,
  whatsapp: manifest.contact.whatsappE164.replace(/\D/g, ""),
  email: manifest.contact.email,
  /** Web3Forms PUBLIC access key (per-site UUID). Delivery inbox = email. null until provisioned. */
  formAccessKey:
    (manifest.contact as { formAccessKey?: string | null }).formAccessKey ?? null,
  serviceArea: manifest.schema.areaServed ?? "",

  /** Business hours — owner-confirmed 2026-09-17. See docs/business-facts.md §1. */
  hours: {
    weekday: "ראשון–חמישי 08:00–18:00",
    friday: "שישי 08:00–14:00",
    emergency: "מענה מהיר לתקלות דחופות",
  },

  // ── Social / listings — fill when available ──────────────────────────────
  social: {
    facebook: "",
    instagram: "",
    googleBusiness: "",
  },
} as const;

/**
 * Services (water-heater repair silo), flagship first.
 * `slug` = English route segment (`app/services/[service]`); `name` = Hebrew display name.
 * Marketing descriptions live with the page content (lib/content.ts), not here.
 */
export const services = [
  { slug: "solar", name: "תיקון דוד שמש" },
  { slug: "electric", name: "תיקון דוד חשמל" },
  { slug: "thermostat", name: "החלפת תרמוסטט" },
  { slug: "leak-repair", name: "תיקון נזילות בדוד" },
  { slug: "replacement", name: "החלפת דוד" },
  { slug: "heating-element", name: "החלפת אלמנט חימום" },
] as const;

export type ServiceSlug = (typeof services)[number]["slug"];

/**
 * Local-SEO location matrix (major Israeli cities) — nationwide service.
 * Drives `app/locations/[city]` (`תיקון דודים ב[עיר]`). Slugs are English.
 */
export const locations = [
  { slug: "tel-aviv", name: "תל אביב" },
  { slug: "jerusalem", name: "ירושלים" },
  { slug: "haifa", name: "חיפה" },
  { slug: "rishon-lezion", name: "ראשון לציון" },
  { slug: "petah-tikva", name: "פתח תקווה" },
  { slug: "netanya", name: "נתניה" },
  { slug: "ashdod", name: "אשדוד" },
  { slug: "beer-sheva", name: "באר שבע" },
  { slug: "holon", name: "חולון" },
  { slug: "bnei-brak", name: "בני ברק" },
  { slug: "ramat-gan", name: "רמת גן" },
  { slug: "rehovot", name: "רחובות" },
  { slug: "herzliya", name: "הרצליה" },
  { slug: "kfar-saba", name: "כפר סבא" },
  { slug: "modiin", name: "מודיעין" },
  { slug: "bat-yam", name: "בת ים" },
  { slug: "raanana", name: "רעננה" },
  { slug: "ashkelon", name: "אשקלון" },
] as const;

export type LocationSlug = (typeof locations)[number]["slug"];

// ── Link helpers ───────────────────────────────────────────────────────────

/** `tel:` href for click-to-call (shared @ishub/site-kit, bound to the manifest). */
export const telHref = kitTelHref(manifest);

/** WhatsApp click-to-chat href, with an optional pre-filled message (shared kit). */
export function whatsappHref(message?: string): string {
  return kitWhatsappHref(manifest, message);
}
