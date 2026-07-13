/**
 * Global / shared TypeScript types for the חם בבית (Cham BaBait) site.
 * Add app-wide interfaces here. Route-specific or component-specific types should live
 * next to the code that uses them.
 */

/** A water-heater repair service offering (see lib/site-config.ts `services`). */
export interface Service {
  slug: string;
  /** Hebrew display name. */
  name: string;
  /** Short marketing description (added during content phase). */
  description?: string;
}

/** A targeted service location for the local-SEO matrix (see lib/site-config.ts `locations`). */
export interface Location {
  slug: string;
  /** Hebrew display name. */
  name: string;
}

/** Payload submitted by the primary lead/quote form. */
export interface LeadFormData {
  name: string;
  phone: string;
  city?: string;
  service?: string;
  message?: string;
  /** Honeypot field — must stay empty (spam protection). */
  company?: string;
}

export {};
