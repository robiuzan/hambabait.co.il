import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { PricingTeaser } from "@/components/marketing/PricingTeaser";

export const metadata: Metadata = {
  title: "מחירון תיקון דודים",
  description:
    "כמה עולה תיקון דוד? המחיר נקבע לפי סוג הדוד, מהות התקלה והחלקים הנדרשים — הצעת מחיר שקופה ניתנת לאחר אבחון, לפני תחילת העבודה.",
};

export default function PricingPage() {
  return (
    <>
      <PageHeader
        title="מחירון תיקון דודים"
        subtitle="מחירים הוגנים ושקופים. המחיר הסופי נקבע לאחר אבחון הדוד — תמיד ברור מראש, לפני שמתחילים."
        crumbs={[{ label: "בית", href: "/" }, { label: "מחירון" }]}
      />
      <PricingTeaser />
      <Section tone="muted">
        <p className="mx-auto max-w-2xl text-center text-sm text-gray-500">
          עלות תיקון דוד משתנה לפי סוג הדוד (שמש / חשמל / משולב), מהות התקלה והחלק שדורש
          החלפה — תרמוסטט, אלמנט, ווסת, גומיות או צנרת. איננו מפרסמים מחירון קבוע, כי כל
          תקלה שונה; הצעת מחיר מדויקת ניתנת לאחר אבחון הדוד בפועל, בשקיפות מלאה ולפני תחילת
          העבודה.
        </p>
      </Section>
    </>
  );
}
