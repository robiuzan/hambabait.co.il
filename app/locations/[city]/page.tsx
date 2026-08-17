import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { locations, type LocationSlug, siteConfig, manifest } from "@/lib/site-config";
import { serviceCards } from "@/lib/content";
import { serviceJsonLd, jsonLdScript } from "@ishub/site-kit/seo";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { FinalCta } from "@/components/marketing/FinalCta";
import { LeadForm } from "@/components/forms/LeadForm";

export function generateStaticParams(): { city: LocationSlug }[] {
  return locations.map((c) => ({ city: c.slug }));
}

/** Match the route param against a slug, tolerant of URL-encoding + Unicode normalization
 *  (kept from the shared template; harmless for the English slugs used here). */
function findLocation(param: string) {
  const target = decodeURIComponent(param).normalize("NFC");
  return locations.find((c) => c.slug.normalize("NFC") === target);
}

export function generateMetadata({ params }: { params: { city: string } }): Metadata {
  const loc = findLocation(params.city);
  if (!loc) return {};
  return {
    alternates: { canonical: `/locations/${loc.slug}/` },
    // No brand suffix here — the root `template` in app/layout.tsx already appends "| חם בבית".
    title: `תיקון דודים ב${loc.name}`,
    description: `תיקון דודים ב${loc.name} — דוד שמש, דוד חשמל, תרמוסטט ונזילות. שירות מהיר, אבחון מקצועי, מחיר הוגן ואחריות על העבודה.`,
  };
}

export default function LocationPage({ params }: { params: { city: string } }) {
  const loc = findLocation(params.city);
  if (!loc) notFound();

  // A city-scoped Service joined to the single #business node — NOT a per-city LocalBusiness,
  // which would fabricate 18 branches that do not exist. The kit's serviceJsonLd always takes
  // areaServed from the manifest ("שירות בכל הארץ") with no override, so the city scope is
  // applied on top of the builder's output. A proper `areaServed` option belongs upstream in
  // the hub's site-kit rather than a local fork.
  const jsonLd = {
    ...serviceJsonLd(manifest, {
      name: `תיקון דודים ב${loc.name}`,
      description: `תיקון והחלפת דודים ב${loc.name} — דוד שמש, דוד חשמל, תרמוסטט, אלמנט ונזילות.`,
      url: `${manifest.url}/locations/${loc.slug}/`,
    }),
    areaServed: { "@type": "City", name: loc.name },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <PageHeader
        title={`תיקון דודים ב${loc.name}`}
        subtitle={`שירות תיקון דודים ב${loc.name} והסביבה — דוד שמש, דוד חשמל, תרמוסטט, אלמנט ונזילות. הגעה מהירה, מחיר הוגן ואחריות על העבודה.`}
        crumbs={[
          { label: "בית", href: "/" },
          { label: "אזורי שירות", href: "/איזורי-שירות" },
          { label: loc.name },
        ]}
        currentPath={`/locations/${loc.slug}/`}
      />

      <Section tone="white">
        <div className="mx-auto max-w-3xl">
          <p className="text-lg leading-relaxed text-gray-700">
            הדוד שלכם ב{loc.name} לא מחמם, מטפטף או שהמים רותחים מדי? ב{siteConfig.name}
            מאבחנים ומתקנים כל סוג של דוד — שמש, חשמל, משולב ולחץ — בבית פרטי, בדירה
            ובעסק. אנחנו מגיעים במהירות, מאתרים את מקור התקלה ומתקנים במקום, עם חלקים
            מתאימים ובעבודה נקייה.
          </p>
          <p className="mt-4 text-gray-700">
            תיקון דוד הוא לרוב עניין דחוף, ולכן אנחנו משתדלים להגיע ל{loc.name} מהר ככל
            האפשר — במקרים דחופים אף באותו יום. לפני שמתחילים תקבלו הצעת מחיר ברורה, ועל
            כל תיקון וכל חלק שאנחנו מחליפים ניתנת אחריות.
          </p>

          <h2 className="mt-10 font-heading text-xl font-bold text-primary">
            שירותי תיקון דודים ב{loc.name}
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {serviceCards.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 hover:border-secondary hover:text-secondary"
                >
                  {s.name}
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Lead form on the local landing page itself — the whole silo previously had none. */}
      <Section tone="muted">
        <div className="mx-auto max-w-xl">
          <h2 className="text-center font-heading text-2xl font-bold text-primary">
            קבלו הצעת מחיר ב{loc.name}
          </h2>
          <p className="mt-2 text-center text-gray-600">
            השאירו פרטים ונחזור אליכם בהקדם.
          </p>
          <LeadForm className="mt-6" ctaPlacement="location-form" />
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
