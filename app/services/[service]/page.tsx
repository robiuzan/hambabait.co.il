import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Check, ChevronLeft, MessageCircle, Phone } from "lucide-react";
import {
  services,
  type ServiceSlug,
  siteConfig,
  manifest,
  locations,
  telHref,
  whatsappHref,
} from "@/lib/site-config";
import { serviceCards, serviceDepth } from "@/lib/content";
import { serviceJsonLd, faqJsonLd, jsonLdScript } from "@ishub/site-kit/seo";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { FinalCta } from "@/components/marketing/FinalCta";
import { LeadForm } from "@/components/forms/LeadForm";

export function generateStaticParams(): { service: ServiceSlug }[] {
  return services.map((s) => ({ service: s.slug }));
}

/** Match the route param against a slug, tolerant of URL-encoding + Unicode normalization
 *  (Hebrew dynamic segments arrive percent-encoded during static export). */
function findCard(param: string) {
  const target = decodeURIComponent(param).normalize("NFC");
  return serviceCards.find((c) => c.slug.normalize("NFC") === target);
}

export function generateMetadata({ params }: { params: { service: string } }): Metadata {
  const card = findCard(params.service);
  if (!card) return {};
  return {
    alternates: { canonical: `/services/${card.slug}/` },
    // No brand suffix here — the root `template` in app/layout.tsx already appends "| חם בבית".
    title: card.name,
    description: card.description,
  };
}

export default function ServicePage({ params }: { params: { service: string } }) {
  const card = findCard(params.service);
  if (!card) notFound();

  // All five siblings — a `.slice(0, 4)` here used to silently drop one service per page.
  const others = serviceCards.filter((c) => c.slug !== card.slug);

  // Per-service depth. This replaced a module-level `triggers` array that rendered
  // IDENTICALLY on all six pages — six pages sharing one symptom list is a
  // find-and-replace away from being one page. See docs/content-standards.md §0.
  const depth = serviceDepth[card.slug];
  const related = depth.related
    .map((r) => {
      const target = serviceCards.find((c) => c.slug === r.slug);
      return target ? { ...r, name: target.name } : null;
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  // The symptom table's accessible name, used twice: as the <caption> a screen reader
  // announces before reading the cells, and as the label of the focusable scroll
  // container around it. All twelve guide tables carry a caption and these six carried
  // none. Derived from the service name rather than six hand-written strings, so it
  // stays accurate on every page and describes only what the table holds.
  const symptomsCaption = `תסמינים וסיבות סבירות — ${card.name}`;

  const jsonLd = serviceJsonLd(manifest, {
    name: card.name,
    description: card.description,
    slug: card.slug,
  });
  // FAQPage per service page — never one site-wide node, and the Q&A text must match
  // the rendered text exactly. docs/schema-graph.md §5.
  const faqLd = faqJsonLd(depth.faqs);

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
        title={card.name}
        subtitle={card.tagline}
        crumbs={[
          { label: "בית", href: "/" },
          { label: "השירותים שלנו", href: "/שירותים" },
          { label: card.name },
        ]}
        currentPath={`/services/${card.slug}/`}
      />

      <Section tone="white">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-lg leading-relaxed text-gray-700">{card.description}</p>

            {/* Answer block: question-form H2 followed immediately by a 40–60 word
                self-contained answer. This is the block answer engines lift, and an
                answer that needs the next paragraph to make sense gets skipped. */}
            <h2 className="mt-10 font-heading text-xl font-bold text-primary">
              {depth.answer.question}
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-gray-800">
              {depth.answer.body}
            </p>

            {/* Symptom → likely cause. Real <table> markup: it is lifted far more
                reliably than prose. docs/content-standards.md §4. */}
            <h2 className="mt-10 font-heading text-xl font-bold text-primary">
              {depth.symptomsHeading}
            </h2>
            {/* The scroll container is focusable: `overflow-x-auto` on its own is
                mouse- and touch-only, so on a viewport narrower than the table's
                min-w-[30rem] a keyboard user could never reach the second column
                (SC 2.1.1). role="group" and not role="region" — a landmark per table
                would bury the page's real landmarks. The global
                `[tabindex]:focus-visible` rule in app/globals.css draws the ring. */}
            <div
              className="mt-4 overflow-x-auto"
              tabIndex={0}
              role="group"
              aria-label={symptomsCaption}
            >
              <table className="w-full min-w-[30rem] border-collapse text-start text-sm">
                {/* sr-only, unlike the guide tables' visible captions: those sit under a
                    generic heading, but here the <h2> directly above already names this
                    table for a sighted reader, so a visible caption renders as a duplicate
                    subhead. Screen readers still get the caption before the cells. */}
                <caption className="sr-only">{symptomsCaption}</caption>
                <thead>
                  <tr className="border-b border-gray-200">
                    <th
                      scope="col"
                      className="py-3 pe-4 text-start font-bold text-primary"
                    >
                      מה אתם רואים
                    </th>
                    <th
                      scope="col"
                      className="py-3 ps-4 text-start font-bold text-primary"
                    >
                      הסיבה הסבירה
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {depth.symptoms.map((row) => (
                    <tr key={row.symptom} className="border-b border-gray-100 align-top">
                      <td className="py-3 pe-4 font-medium text-gray-800">
                        {row.symptom}
                      </td>
                      <td className="py-3 ps-4 text-gray-600">{row.cause}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="mt-10 font-heading text-xl font-bold text-primary">
              מה הטכנאי עושה באתר
            </h2>
            <ol className="mt-4 space-y-3">
              {depth.onSite.map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ol>

            {/* Repair vs replace. Builds more trust than any badge, and is safe to write
                because it is technical judgement rather than a promise. */}
            <h2 className="mt-10 font-heading text-xl font-bold text-primary">
              לתקן או להחליף?
            </h2>
            <p className="mt-3 leading-relaxed text-gray-700">{depth.repairVsReplace}</p>

            {/* Contextual cross-links on a SHARED SYMPTOM — not "here are the other five".
                This is the cannibalisation guard made visible: it says which page covers
                which fault. docs/topical-map.md §2. */}
            {related.length > 0 && (
              <div className="mt-10 rounded-2xl border border-gray-100 bg-gray-50 p-6">
                <h2 className="font-heading text-lg font-bold text-primary">
                  תסמינים שמובילים לשירות אחר
                </h2>
                <ul className="mt-4 space-y-3">
                  {related.map((r) => (
                    <li key={r.slug} className="flex items-start gap-2 text-gray-700">
                      <Check
                        className="mt-1 h-4 w-4 shrink-0 text-accent-600"
                        aria-hidden
                      />
                      <span>
                        {r.reason} —{" "}
                        <Link
                          href={`/services/${r.slug}`}
                          className="font-semibold text-secondary hover:underline"
                        >
                          {r.name}
                        </Link>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Per-service FAQ. Question-form H3s, answer-first, matched item for item
                to the FAQPage node emitted above. */}
            <h2 className="mt-10 font-heading text-xl font-bold text-primary">
              שאלות נפוצות על {card.name}
            </h2>
            <dl className="mt-4 space-y-6">
              {depth.faqs.map((f) => (
                <div key={f.q}>
                  <dt className="font-heading text-base font-bold text-primary">{f.q}</dt>
                  <dd className="mt-2 leading-relaxed text-gray-700">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Sticky CTA card */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm">
              <p className="font-heading text-lg font-bold text-primary">
                רוצים הצעת מחיר ל{card.name}?
              </p>
              <p className="mt-1 text-sm text-gray-600">
                ביקור, אבחון והצעה שקופה — ללא התחייבות.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <Button href={telHref} data-cta="service-call" variant="accent" size="lg">
                  <Phone className="h-5 w-5" aria-hidden />
                  <span dir="ltr">{siteConfig.phone}</span>
                </Button>
                <Button
                  href={whatsappHref(`היי, אני מעוניין/ת בהצעת מחיר ל${card.name}`)}
                  data-cta="service-whatsapp"
                  variant="whatsapp"
                  size="lg"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden />
                  וואטסאפ
                </Button>
              </div>
            </div>
          </aside>
        </div>

        {/* Related services */}
        <div className="mt-14 border-t border-gray-100 pt-10">
          <h2 className="font-heading text-xl font-bold text-primary">שירותים נוספים</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((o) => (
              <li key={o.slug}>
                <Link
                  href={`/services/${o.slug}`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:border-secondary hover:text-secondary"
                >
                  {o.name}
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Service → location cross-links. The mesh was one-directional: every city page
            links all six services, but no service page linked a single city, so no equity
            flowed back into the location silo from the strongest pages on the site.
            This linked `locations.slice(0, 8)` — which left cities 9-18 (bnei-brak through
            ashkelon) with no inbound link from any service page, an asymmetry that followed
            array order rather than anything meaningful. Now all 18: the set is small enough
            to render in full, and the location silo is the surface that needs the equity. */}
        <div className="mt-14 border-t border-gray-100 pt-10">
          <h2 className="font-heading text-xl font-bold text-primary">
            השירות זמין בכל הארץ
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {locations.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/locations/${c.slug}`}
                  className="inline-flex min-h-11 items-center rounded-lg border border-gray-100 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:border-secondary hover:text-secondary"
                >
                  תיקון דודים ב{c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/איזורי-שירות"
                className="inline-flex min-h-11 items-center gap-1 px-2 py-2 text-sm font-semibold text-secondary hover:underline"
              >
                לכל אזורי השירות
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </Link>
            </li>
          </ul>
        </div>
      </Section>

      {/* Lead form on the money page itself — previously only the homepage and the contact
          page carried one, so a service-page visitor had to navigate away to leave details. */}
      <Section tone="muted">
        <div className="mx-auto max-w-xl">
          <h2 className="text-center font-heading text-2xl font-bold text-primary">
            קבלו הצעת מחיר ל{card.name}
          </h2>
          <p className="mt-2 text-center text-gray-600">
            השאירו פרטים ונחזור אליכם בהקדם.
          </p>
          <LeadForm
            className="mt-6"
            defaultService={card.name}
            ctaPlacement="service-form"
          />
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
