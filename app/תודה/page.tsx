import type { Metadata } from "next";
import Link from "next/link";
import { Check, Phone } from "lucide-react";
import { siteConfig, telHref } from "@/lib/site-config";
import { Button } from "@/components/ui/Button";

/**
 * Thank-you destination after a confirmed lead submit (LeadForm navigates here).
 *
 * Exists so GA4/Ads can use a destination-URL conversion instead of relying on the
 * dataLayer event alone. Deliberately noindex, no canonical, and NOT in app/sitemap.ts —
 * a conversion receipt is not an indexable page. Do not add it to staticPaths.
 */
export const metadata: Metadata = {
  title: "תודה על הפנייה",
  description: "קיבלנו את הפנייה ונחזור אליכם בהקדם.",
  robots: { index: false, follow: true },
  alternates: {},
};

export default function ThanksPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-center justify-center px-4 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
        <Check className="h-8 w-8" aria-hidden />
      </span>
      <h1 className="mt-5 font-heading text-3xl font-extrabold text-primary">
        תודה! קיבלנו את הפנייה
      </h1>
      <p className="mt-3 max-w-md text-gray-600">
        נחזור אליכם בהקדם לתיאום ביקור טכנאי והצעת מחיר. צריכים מענה מיידי? התקשרו — זה
        הכי מהיר.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href={telHref} variant="accent" size="lg" data-cta="thanks-call">
          <Phone className="h-5 w-5" aria-hidden />
          <span dir="ltr">{siteConfig.phone}</span>
        </Button>
        <Button href="/" variant="outline" size="lg">
          חזרה לדף הבית
        </Button>
      </div>
      <p className="mt-6 text-sm text-gray-500">
        בינתיים אפשר לקרוא{" "}
        <Link href="/מחירון/" className="font-medium text-secondary underline">
          איך נקבע המחיר
        </Link>{" "}
        או להציץ{" "}
        <Link href="/שירותים/" className="font-medium text-secondary underline">
          בשירותים שלנו
        </Link>
        .
      </p>
    </div>
  );
}
