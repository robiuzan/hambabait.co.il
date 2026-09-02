import { manifest, siteConfig } from "@/lib/site-config";
import { faqs } from "@/lib/content";
import { localBusinessJsonLd, faqJsonLd, jsonLdScript } from "@ishub/site-kit/seo";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Hero } from "@/components/marketing/Hero";
import { TrustBar } from "@/components/marketing/TrustBar";
import { ServicesGrid } from "@/components/marketing/ServicesGrid";
import { WhyUs } from "@/components/marketing/WhyUs";
import { Process } from "@/components/marketing/Process";
import { PricingTeaser } from "@/components/marketing/PricingTeaser";
import { ServiceAreas } from "@/components/marketing/ServiceAreas";
import { Faq } from "@/components/marketing/Faq";
import { FinalCta } from "@/components/marketing/FinalCta";

// The kit exports no websiteJsonLd, so the WebSite node is assembled here — the same pattern
// the guide route uses for its Article node, and with the same caveat: a proper builder belongs
// upstream in @ishub/site-kit rather than in a local fork.
//
// NO `potentialAction`/SearchAction. This site has no search of any kind — no search route, no
// query param, nothing to point an action at. Declaring one is a false capability claim, and
// Google would render a sitelinks searchbox that leads to a dead URL.
//
// `publisher` joins the Plumber node by @id (the kit mints `${url}/#business`) so the two nodes
// on this page resolve as one graph instead of two unrelated entities.
const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${manifest.url}/#website`,
  url: manifest.url,
  name: siteConfig.name,
  inLanguage: manifest.locale,
  publisher: { "@id": `${manifest.url}/#business` },
};

// Site-wide LocalBusiness + WebSite + FAQ JSON-LD — LocalBusiness and FAQ from the shared
// @ishub/site-kit builders (manifest-driven), WebSite assembled above.
const jsonLd = [localBusinessJsonLd(manifest), websiteLd, faqJsonLd([...faqs])];

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <Hero />
      <TrustBar />
      <ServicesGrid />
      <WhyUs />
      <Process />
      <PricingTeaser />
      <ServiceAreas />

      <Section id="faq" tone="white">
        <SectionHeading eyebrow="שאלות נפוצות" title="כל מה שרציתם לדעת על תיקון דודים" />
        <Faq items={faqs} />
      </Section>

      <FinalCta />
    </>
  );
}
