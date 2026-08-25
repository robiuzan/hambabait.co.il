import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { locations, type LocationSlug, manifest } from "@/lib/site-config";
import { serviceCards, cityContent } from "@/lib/content";
import { serviceJsonLd, faqJsonLd, jsonLdScript } from "@ishub/site-kit/seo";
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

/** Trim to a whole word inside the 140–160 char description budget. The source is the
 *  city's own answer block, so every description is genuinely different — the previous
 *  one was a single string with the city name interpolated, identical on all 18. */
function toDescription(text: string, max = 155): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd()}…`;
}

export function generateMetadata({ params }: { params: { city: string } }): Metadata {
  const loc = findLocation(params.city);
  if (!loc) return {};
  const city = cityContent[loc.slug];
  return {
    alternates: { canonical: `/locations/${loc.slug}/` },
    // No brand suffix here — the root `template` in app/layout.tsx already appends "| חם בבית".
    title: `תיקון דודים ב${loc.name}`,
    description: toDescription(city.answer.body),
  };
}

export default function LocationPage({ params }: { params: { city: string } }) {
  const loc = findLocation(params.city);
  if (!loc) notFound();

  // Per-city content. Before this, the whole silo was one template with `loc.name`
  // substituted — 18 pages a find-and-replace could regenerate from each other, which is
  // the definition of a doorway page. docs/content-standards.md §0.
  const city = cityContent[loc.slug];
  const nearby = city.nearby
    .map((slug) => locations.find((l) => l.slug === slug))
    .filter((l): l is NonNullable<typeof l> => l !== undefined);

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
  // FAQPage per city, matched item for item to the rendered Q&A below.
  const faqLd = faqJsonLd(city.faqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(faqLd) }}
      />
      <PageHeader
        title={`תיקון דודים ב${loc.name}`}
        // Was: "הגעה מהירה, מחיר הוגן ואחריות על העבודה" — an arrival-speed claim and a
        // warranty claim, neither sourced, shipping on all 18 pages. docs/business-facts.md §3.
        subtitle={`שירות תיקון דודים ב${loc.name} והסביבה — דוד שמש, דוד חשמל, תרמוסטט, אלמנט ונזילות.`}
        crumbs={[
          { label: "בית", href: "/" },
          { label: "אזורי שירות", href: "/איזורי-שירות" },
          { label: loc.name },
        ]}
        currentPath={`/locations/${loc.slug}/`}
      />

      <Section tone="white">
        <div className="mx-auto max-w-3xl">
          {/* Answer block — question-form H2 then a 40–60 word self-contained answer,
              specific to THIS city. */}
          <h2 className="font-heading text-xl font-bold text-primary">
            {city.answer.question}
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-gray-800">{city.answer.body}</p>

          {/* The two paragraphs that could not be written about any other city on the
              list. Anchored to building height and the solar mandate, coastal exposure,
              climate or building-stock age — never to a local branch, a local technician
              or a per-city response time, none of which exist. */}
          {city.profile.map((para) => (
            <p key={para.slice(0, 32)} className="mt-4 leading-relaxed text-gray-700">
              {para}
            </p>
          ))}

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

          {/* Per-city FAQ, matched to the FAQPage node above. */}
          <h2 className="mt-10 font-heading text-xl font-bold text-primary">
            שאלות נפוצות ב{loc.name}
          </h2>
          <dl className="mt-4 space-y-6">
            {city.faqs.map((f) => (
              <div key={f.q}>
                <dt className="font-heading text-base font-bold text-primary">{f.q}</dt>
                <dd className="mt-2 leading-relaxed text-gray-700">{f.a}</dd>
              </div>
            ))}
          </dl>

          {/* City → city links. The site had none at all: every city linked the six
              services and nothing else, so the location silo had no internal structure. */}
          {nearby.length > 0 && (
            <div className="mt-10 border-t border-gray-100 pt-8">
              <h2 className="font-heading text-lg font-bold text-primary">
                ערים נוספות באזור
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2.5">
                {nearby.map((n) => (
                  <li key={n.slug}>
                    <Link
                      href={`/locations/${n.slug}`}
                      className="inline-flex min-h-11 items-center rounded-lg border border-gray-100 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:border-secondary hover:text-secondary"
                    >
                      תיקון דודים ב{n.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
