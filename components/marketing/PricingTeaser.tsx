import { ClipboardCheck, Coins, ShieldCheck } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { pricingApproach, pricingNote } from "@/lib/content";

const icons = [ClipboardCheck, Coins, ShieldCheck];

export function PricingTeaser() {
  return (
    <Section id="pricing" tone="white">
      <SectionHeading
        eyebrow="מחירון"
        title="מחירים הוגנים ושקופים"
        subtitle="אנחנו לא עובדים עם מחירון 'עיוור'. המחיר נקבע לפי סוג הדוד והתקלה — תמיד בשקיפות ולפני תחילת העבודה."
      />

      <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-3">
        {pricingApproach.map((item, i) => {
          const Icon = icons[i] ?? ClipboardCheck;
          return (
            <div
              key={item.title}
              className="flex h-full flex-col rounded-2xl border border-gray-100 bg-gray-50 p-7"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="mt-4 font-heading text-lg font-bold text-primary">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.body}</p>
            </div>
          );
        })}
      </div>

      <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-gray-500">
        {pricingNote}
      </p>

      <div className="mt-8 flex justify-center">
        <Button href="/צור-קשר" data-cta="pricing-quote" variant="accent" size="lg">
          <ClipboardCheck className="h-5 w-5" aria-hidden />
          קבלו הצעת מחיר
        </Button>
      </div>
    </Section>
  );
}
