import type { Metadata } from "next";
import { Check } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { TrustBar } from "@/components/marketing/TrustBar";
import { FinalCta } from "@/components/marketing/FinalCta";

export const metadata: Metadata = {
  alternates: { canonical: "/אודות/" },
  title: "אודות חם בבית",
  description:
    "חם בבית — מומחים לתיקון דודים בכל הארץ: דוד שמש, דוד חשמל, תרמוסטט, אלמנט ונזילות. אבחון מהיר, עבודה מקצועית, מחיר הוגן ואחריות על העבודה.",
};

const values = [
  "שירות מהיר וזמינות גבוהה",
  "מומחיות בכל סוגי הדודים",
  "אחריות על העבודה ועל החלקים",
  "מחירים הוגנים ושקופים",
  "עבודה נקייה ומקצועית",
  "שירות ארצי — מהצפון ועד הדרום",
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="אודות חם בבית"
        subtitle="מומחים לתיקון דודים — כדי שיהיו לכם מים חמים, מתי שאתם צריכים."
        crumbs={[{ label: "בית", href: "/" }, { label: "אודות" }]}
      />

      <Section tone="white">
        <div className="mx-auto max-w-3xl">
          <p className="text-lg leading-relaxed text-gray-700">
            ב{siteConfig.name} אנחנו מתמחים בתיקון דודים מכל הסוגים — דוד שמש, דוד חשמל,
            דוד משולב ודוד לחץ. אנחנו יודעים שדוד מקולקל הוא לא דבר שיכול לחכות, ולכן
            אנחנו זמינים בטלפון, מגיעים במהירות ומאבחנים את התקלה במקום.
          </p>
          <p className="mt-4 text-gray-700">
            הטכנאים שלנו מטפלים בכל התקלות הנפוצות: גוף חימום (אלמנט) שרוף, תרמוסטט תקול,
            מים שלא מתחממים, מים רותחים מדי, נזילות מהדוד ומהצנרת, וכן החלפת דוד ישן בחדש.
            אנחנו עובדים עם חלקים מתאימים, נותנים הצעת מחיר שקופה לפני שמתחילים, ומגבים כל
            עבודה באחריות.
          </p>
          <p className="mt-4 text-gray-700">
            אנחנו נותנים שירות תיקון דודים בפריסה ארצית — בבית פרטי, בדירה ובעסק — עם
            מחויבות לשירות מהיר, מקצועי והוגן.
          </p>

          <h2 className="mt-10 font-heading text-xl font-bold text-primary">
            מה חשוב לנו
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {values.map((v) => (
              <li key={v} className="flex items-start gap-2 text-gray-700">
                <Check className="mt-1 h-4 w-4 shrink-0 text-accent-600" aria-hidden />
                {v}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <TrustBar />
      <FinalCta />
    </>
  );
}
