import type { Metadata } from "next";
import Link from "next/link";
import { Phone } from "lucide-react";
import { siteConfig, telHref } from "@/lib/site-config";
import { Button } from "@/components/ui/Button";

/**
 * 404 (הדף לא נמצא).
 *
 * Declares its own metadata deliberately: without it the route inherits the root layout's
 * `alternates: { canonical: "/" }`, so the 404 shipped a canonical claiming to BE the homepage
 * while also carrying `noindex` — a contradictory pair of signals. A 404 gets no canonical.
 */
export const metadata: Metadata = {
  title: "הדף לא נמצא",
  description: "הדף שחיפשתם לא נמצא באתר חם בבית.",
  // Next already emits `noindex` for not-found; declaring `robots` here only duplicates the tag.
  alternates: {},
};

const popular = [
  { label: "השירותים שלנו", href: "/שירותים/" },
  { label: "אזורי שירות", href: "/איזורי-שירות/" },
  { label: "מחירון", href: "/מחירון/" },
  { label: "צור קשר", href: "/צור-קשר/" },
];

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-center justify-center px-4 py-16 text-center">
      {/* Fleet live-kit: this page answers every unknown URL, so no path in live.config.mjs can
          mark it calm — it marks itself: no seasonal line, no card (lib/live/live-core.css,
          public/assets/live.js). */}
      <div data-live-calm-page hidden />
      <h1 className="font-heading text-5xl font-extrabold text-primary">404</h1>
      <p className="mt-4 text-gray-600">
        הדף שחיפשתם לא נמצא. אולי אחד מהעמודים האלה יעזור — ואם הדוד לא מחמם, אפשר פשוט
        להתקשר.
      </p>

      <nav aria-label="עמודים מבוקשים" className="mt-6">
        <ul className="flex flex-wrap justify-center gap-2">
          {popular.map((p) => (
            <li key={p.href}>
              <Link
                href={p.href}
                className="inline-flex rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-secondary hover:text-secondary focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:outline-none"
              >
                {p.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href="/" variant="outline" size="lg">
          חזרה לדף הבית
        </Button>
        <Button href={telHref} variant="accent" size="lg" data-cta="notfound-call">
          <Phone className="h-5 w-5" aria-hidden />
          <span dir="ltr">{siteConfig.phone}</span>
        </Button>
      </div>
    </div>
  );
}
