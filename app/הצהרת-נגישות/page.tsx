import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { FinalCta } from "@/components/marketing/FinalCta";

export const metadata: Metadata = {
  alternates: { canonical: "/הצהרת-נגישות/" },
  title: "הצהרת נגישות",
  description:
    "הצהרת הנגישות של אתר חם בבית — מה נבדק בפועל, מתי, ומה המגבלות הידועות. ללא הצהרת עמידה בתקן שלא בוצעה עבורה בדיקה חיצונית.",
};

/**
 * Statement date. Update it ONLY when the accessibility state actually changes and is
 * re-verified — a date that moves without a real check is exactly the kind of unverifiable
 * signal this page is being rewritten to remove.
 */
const STATEMENT_DATE = "25/08/2026";

export default function AccessibilityPage() {
  return (
    <>
      <PageHeader
        title="הצהרת נגישות"
        crumbs={[{ label: "בית", href: "/" }, { label: "הצהרת נגישות" }]}
        currentPath="/הצהרת-נגישות/"
      />
      <Section tone="white">
        <div className="mx-auto max-w-3xl space-y-4 text-gray-700">
          {/* This page previously asserted conformance with ת״י 5568 and WCAG 2.0 AA with no
              audit, no date and no contact behind it, and listed "alt text for meaningful
              images" on a site that ships no images at all. It now states what was actually
              checked, when, and what is not covered. Do not re-add a conformance claim
              without a real audit to point at. docs/business-facts.md §4.2. */}
          <p>
            {siteConfig.name} רואה חשיבות במתן שירות שוויוני לכלל הגולשים, ופועלת לשפר את
            נגישות האתר באופן שוטף. הדף הזה מתאר מה נבדק בפועל — ולא מצהיר על עמידה בתקן
            שלא בוצעה עבורה בדיקה חיצונית.
          </p>
          <p>
            <strong>מצב נוכחי:</strong> לא בוצעה ביקורת נגישות חיצונית ולא נערכה בדיקה
            מקצועית מול ת״י 5568 או מול WCAG. הבדיקות שבוצעו הן פנימיות, והן מפורטות להלן.
          </p>

          <h2 className="font-heading text-lg font-bold text-primary">מה נבדק בפועל</h2>
          <ul className="list-disc space-y-1 ps-5">
            <li>מבנה סמנטי: כותרת ראשית אחת בכל עמוד וסדר כותרות תקין.</li>
            <li>קישור ״דילוג לתוכן הראשי״ בתחילת כל עמוד, ואזור תוכן מסומן.</li>
            <li>ניווט מקלדת בתפריט הנייד, כולל סגירה במקש Escape והחזרת מיקוד לכפתור.</li>
            <li>סימון העמוד הנוכחי בתפריט עבור קוראי מסך.</li>
            <li>תוויות מקושרות לכל שדה בטופס יצירת הקשר.</li>
            <li>כיווניות RTL מלאה, עם בידוד מספרי טלפון וכתובות דוא״ל.</li>
            <li>ניגודיות הצבע הראשי של האתר מול רקע לבן.</li>
          </ul>

          <h2 className="font-heading text-lg font-bold text-primary">מגבלות ידועות</h2>
          <ul className="list-disc space-y-1 ps-5">
            <li>לא בוצעה בדיקה עם קוראי מסך בפועל (NVDA, JAWS או VoiceOver).</li>
            <li>לא בוצעה בדיקת נגישות אוטומטית או ידנית על ידי גורם חיצוני.</li>
            <li>לא כל שילובי הצבעים באתר נבדקו אחד־אחד.</li>
            <li>ייתכנו רכיבים שאינם נגישים במלואם ולא אותרו בבדיקה הפנימית.</li>
          </ul>

          <h2 className="font-heading text-lg font-bold text-primary">
            פניות בנושא נגישות
          </h2>
          <p>
            נתקלתם בקושי? נשמח לדעת ולתקן. ניתן לפנות בטלפון{" "}
            <span dir="ltr" className="ltr">
              {siteConfig.phone}
            </span>{" "}
            או בדוא״ל{" "}
            <span dir="ltr" className="ltr">
              {siteConfig.email}
            </span>
            . נשתדל לטפל בכל פנייה ולעדכן את ההצהרה בהתאם.
          </p>

          <p className="text-sm text-gray-500">
            תאריך עדכון ההצהרה:{" "}
            <span dir="ltr" className="ltr">
              {STATEMENT_DATE}
            </span>
          </p>
        </div>
      </Section>
      <FinalCta />
    </>
  );
}
