import { manifest } from "@/lib/site-config";
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

// Site-wide LocalBusiness + FAQ JSON-LD — from the shared @ishub/site-kit builder (manifest-driven).
const jsonLd = [localBusinessJsonLd(manifest), faqJsonLd([...faqs])];

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
