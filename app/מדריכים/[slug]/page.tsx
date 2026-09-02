import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { manifest, siteConfig } from "@/lib/site-config";
import { serviceCards } from "@/lib/content";
import { guides, guideClusterLabels } from "@/lib/guides";
import { faqJsonLd, breadcrumbJsonLd, jsonLdScript } from "@ishub/site-kit/seo";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { GuideBody } from "@/components/marketing/GuideBody";
import { GuideDiagram } from "@/components/marketing/GuideDiagram";
import { FinalCta } from "@/components/marketing/FinalCta";

export function generateStaticParams(): { slug: string }[] {
  return guides.map((g) => ({ slug: g.slug }));
}

/** Match the route param against a slug, tolerant of URL-encoding + Unicode normalization.
 *  The parent segment (מדריכים) is a Hebrew static directory; the slugs themselves are
 *  English, matching the two existing dynamic routes — see CLAUDE.md §6 on the Hebrew-slug trap. */
function findGuide(param: string) {
  const target = decodeURIComponent(param).normalize("NFC");
  return guides.find((g) => g.slug.normalize("NFC") === target);
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const guide = findGuide(params.slug);
  if (!guide) return {};
  return {
    alternates: { canonical: `/מדריכים/${guide.slug}/` },
    // No brand suffix — the root `template` in app/layout.tsx already appends "| חם בבית".
    title: guide.title,
    description: guide.description,
  };
}

/** Israeli date format (dd/mm/yyyy) from an ISO date, for the visible "עודכן" line. */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = findGuide(params.slug);
  if (!guide) notFound();

  const related = guide.relatedServices
    .map((slug) => serviceCards.find((c) => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => c !== undefined);

  const url = `${manifest.url}/מדריכים/${guide.slug}/`;

  // The kit exports no articleJsonLd, so the node is assembled here — the same pattern the
  // location route uses for its areaServed override, and with the same caveat: a proper
  // Article builder belongs upstream in @ishub/site-kit rather than in a local fork.
  //
  // `author` and `publisher` are the BUSINESS. There is no named author anywhere on this
  // site and no evidence any specific technician exists; inventing a byline would be a
  // fabricated credential. docs/business-facts.md §3.5.
  //
  // Both carry @type + name ALONGSIDE the @id join, matching the kit's own `provider` idiom in
  // serviceJsonLd. The @id is what makes the graph cohere for a consumer that resolves it into
  // the homepage Plumber node; the @type and name keep the node self-describing for one that
  // does not, instead of an author with no type and no name.
  const businessRef = {
    "@type": manifest.schema.type ?? "LocalBusiness",
    "@id": `${manifest.url}/#business`,
    name: siteConfig.name,
  };
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.heading,
    description: guide.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: guide.published,
    dateModified: guide.updated,
    inLanguage: "he-IL",
    author: businessRef,
    publisher: businessRef,
  };
  const faqLd = faqJsonLd(guide.faqs);
  const crumbLd = breadcrumbJsonLd(manifest, [
    { name: "בית", path: "/" },
    { name: "מדריכים", path: "/מדריכים/" },
    { name: guide.heading, path: `/מדריכים/${guide.slug}/` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript([articleLd, faqLd, crumbLd]) }}
      />
      <PageHeader
        title={guide.heading}
        subtitle={guide.description}
        crumbs={[
          { label: "בית", href: "/" },
          { label: "מדריכים", href: "/מדריכים" },
          { label: guide.title },
        ]}
      />

      <Section tone="white">
        <article className="mx-auto max-w-3xl">
          {/* Freshness and authorship. The site had neither anywhere before the hub —
              and a date must reflect a real substantive edit, never a cosmetic bump. */}
          <p className="text-sm text-gray-500">
            {guideClusterLabels[guide.cluster]} · עודכן ב־
            <time dateTime={guide.updated} dir="ltr" className="ltr">
              {formatDate(guide.updated)}
            </time>
          </p>

          {/* Answer block — the 40–60 words an answer engine can lift whole. */}
          <h2 className="mt-8 font-heading text-xl font-bold text-primary">
            {guide.answer.question}
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-gray-800">
            {guide.answer.body}
          </p>

          {/* Inline SVG — explains the mechanism the answer just described. No network
              request, so it costs nothing against LCP, and it is technical rather than
              photographic, so it makes no claim about the business. */}
          {guide.diagram && <GuideDiagram name={guide.diagram} />}

          <GuideBody blocks={guide.blocks} />

          <h2 className="mt-10 font-heading text-xl font-bold text-primary">
            שאלות נפוצות
          </h2>
          <dl className="mt-4 space-y-6">
            {guide.faqs.map((f) => (
              <div key={f.q}>
                <dt className="font-heading text-base font-bold text-primary">{f.q}</dt>
                <dd className="mt-2 leading-relaxed text-gray-700">{f.a}</dd>
              </div>
            ))}
          </dl>

          {/* Every guide routes to a commercial page. A guide with no way out is a dead end. */}
          {related.length > 0 && (
            <div className="mt-12 rounded-2xl border border-gray-100 bg-gray-50 p-6">
              <h2 className="font-heading text-lg font-bold text-primary">
                צריכים טכנאי לתקלה הזו?
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {related.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/services/${s.slug}`}
                      className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:border-secondary hover:text-secondary"
                    >
                      {s.name}
                      <ChevronLeft className="h-4 w-4" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-8 text-sm text-gray-500">
            <Link
              href="/מדריכים"
              className="font-semibold text-secondary hover:underline"
            >
              חזרה לכל המדריכים
            </Link>
          </p>
        </article>
      </Section>

      <FinalCta />
    </>
  );
}
