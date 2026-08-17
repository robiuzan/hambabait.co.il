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

export const siteConfig = {
  name: manifest.brandName ?? "",
  nameEn: manifest.brandNameEn ?? "",
  /** One-line elevator pitch. */
  tagline: manifest.tagline ?? "",
  domain: manifest.url,
  founded: manifest.foundedYear ?? 0,

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

  /** Business hours (authored — confirm with client). */
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
