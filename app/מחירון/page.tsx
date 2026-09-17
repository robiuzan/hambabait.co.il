import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { PriceTable } from "@/components/marketing/PriceTable";
import { PricingTeaser } from "@/components/marketing/PricingTeaser";
import { FinalCta } from "@/components/marketing/FinalCta";
import { pricingAnswer } from "@/lib/content";

export const metadata: Metadata = {
  alternates: { canonical: "/מחירון/" },
  title: "מחירון תיקון דודים",
  description:
    "מחירון תיקון דודים כולל מע״מ: החלפת תרמוסטט ₪250 עד ₪500, גוף חימום ₪300 עד ₪800, תיקון נזילה ₪300 עד ₪880, החלפת דוד חשמל ₪1,300 עד ₪3,300. ללא דמי ביקור.",
};

export default function PricingPage() {
  return (
    <>
      <PageHeader
        title="מחירון תיקון דודים"
        subtitle="מה עולה כל עבודה, בשקלים ובלי כוכביות. ללא דמי ביקור וללא תוספות."
        crumbs={[{ label: "בית", href: "/" }, { label: "מחירון" }]}
        currentPath="/מחירון/"
      />

      {/* Answer block: question-form H2 followed immediately by a self-contained answer
          carrying real figures. This route carried no answer block until there were
          prices to state — backlog P1-4 / N-5. */}
      <Section tone="white">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-xl font-bold text-primary">
            {pricingAnswer.question}
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-gray-800">
            {pricingAnswer.body}
          </p>
        </div>
      </Section>

      <PriceTable />
      <PricingTeaser standalone={false} />
      <FinalCta />
    </>
  );
}
