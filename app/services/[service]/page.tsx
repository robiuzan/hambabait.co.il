import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Check, ChevronLeft, MessageCircle, Phone } from "lucide-react";
import {
  services,
  type ServiceSlug,
  siteConfig,
  manifest,
  telHref,
  whatsappHref,
} from "@/lib/site-config";
import { serviceCards, processSteps } from "@/lib/content";
import { serviceJsonLd, jsonLdScript } from "@ishub/site-kit/seo";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { FinalCta } from "@/components/marketing/FinalCta";

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
    title: `${card.name} | ${siteConfig.name}`,
    description: card.description,
  };
}

const triggers = [
  "אין מים חמים או שהמים מתחממים לאט",
  "הדוד מטפטף, נוזל או יש שלולית מתחתיו",
  "מפסק הפחת קופץ כשמדליקים את הדוד",
  "המים רותחים מדי או שהחימום לא נפסק",
];

export default function ServicePage({ params }: { params: { service: string } }) {
  const card = findCard(params.service);
  if (!card) notFound();

  const others = serviceCards.filter((c) => c.slug !== card.slug).slice(0, 4);
  const jsonLd = serviceJsonLd(manifest, {
    name: card.name,
    description: card.description,
    slug: card.slug,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <PageHeader
        title={card.name}
        subtitle={card.tagline}
        crumbs={[
          { label: "בית", href: "/" },
          { label: "השירותים שלנו", href: "/שירותים" },
          { label: card.name },
        ]}
      />

      <Section tone="white">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-lg leading-relaxed text-gray-700">{card.description}</p>

            <h2 className="mt-10 font-heading text-xl font-bold text-primary">
              מתי כדאי לפנות אלינו?
            </h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {triggers.map((t) => (
                <li key={t} className="flex items-start gap-2 text-gray-700">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-accent-600" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>

            <h2 className="mt-10 font-heading text-xl font-bold text-primary">
              איך אנחנו עובדים
            </h2>
            <ol className="mt-4 space-y-3">
              {processSteps.map((step, i) => (
                <li key={step.title} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-gray-700">
                    <strong className="text-primary">{step.title}.</strong> {step.body}
                  </span>
                </li>
              ))}
            </ol>
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
                <Button href={telHref} variant="accent" size="lg">
                  <Phone className="h-5 w-5" aria-hidden />
                  <span dir="ltr">{siteConfig.phone}</span>
                </Button>
                <Button
                  href={whatsappHref(`היי, אני מעוניין/ת בהצעת מחיר ל${card.name}`)}
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
      </Section>

      <FinalCta />
    </>
  );
}
