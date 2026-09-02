import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { siteConfig, telHref, whatsappHref } from "@/lib/site-config";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { LeadForm } from "@/components/forms/LeadForm";
import { FinalCta } from "@/components/marketing/FinalCta";

export const metadata: Metadata = {
  alternates: { canonical: "/צור-קשר/" },
  title: "צור קשר",
  description:
    "צרו קשר עם חם בבית לתיקון דודים בכל הארץ. טלפון, וואטסאפ או טופס — נחזור אליכם ונתאם הגעת טכנאי.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="צור קשר"
        subtitle="מענה מהיר, אבחון ראשוני והצעת מחיר ללא התחייבות."
        crumbs={[{ label: "בית", href: "/" }, { label: "צור קשר" }]}
        currentPath="/צור-קשר/"
      />

      <Section tone="white">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Details */}
          <div>
            <h2 className="font-heading text-xl font-bold text-primary">פרטי התקשרות</h2>
            <ul className="mt-5 space-y-4 text-gray-700">
              <li className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                  <Phone className="h-5 w-5" aria-hidden />
                </span>
                <a
                  href={telHref}
                  data-cta="contact-call"
                  className="font-medium hover:text-primary"
                  dir="ltr"
                >
                  {siteConfig.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                {/* #1da851 measured 2.88:1 on the 10%-alpha WhatsApp tint (#e9fbf0), under the
                    3:1 non-text floor. The icon is aria-hidden and duplicated by the adjacent
                    text link, so it is decorative and technically exempt — but accent-600 costs
                    nothing and measures 6.32:1, and it uses a token like the sibling rows do. */}
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#25D366]/10 text-accent-600">
                  <MessageCircle className="h-5 w-5" aria-hidden />
                </span>
                <a
                  href={whatsappHref("היי, אני מעוניין/ת בשירות תיקון דוד")}
                  data-cta="contact-whatsapp"
                  className="font-medium hover:text-primary"
                >
                  וואטסאפ
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-50 text-secondary">
                  <Mail className="h-5 w-5" aria-hidden />
                </span>
                <a
                  href={`mailto:${siteConfig.email}`}
                  data-cta="contact-email"
                  className="font-medium hover:text-primary"
                  dir="ltr"
                >
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                  <MapPin className="h-5 w-5" aria-hidden />
                </span>
                <span>{siteConfig.serviceArea}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                  <Clock className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  {siteConfig.hours.weekday}
                  <br />
                  {siteConfig.hours.friday}
                  <br />
                  <span className="text-sm text-accent-600">
                    {siteConfig.hours.emergency}
                  </span>
                </span>
              </li>
            </ul>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 sm:p-8">
            <h2 className="font-heading text-xl font-bold text-primary">
              קבלו הצעת מחיר / זימון טכנאי
            </h2>
            <p className="mt-1 text-sm text-gray-600">השאירו פרטים ונחזור אליכם בהקדם.</p>
            <div className="mt-5">
              <LeadForm ctaPlacement="contact-form" />
            </div>
          </div>
        </div>
      </Section>
      <FinalCta />
    </>
  );
}
