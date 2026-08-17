import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { ServicesGrid } from "@/components/marketing/ServicesGrid";
import { FinalCta } from "@/components/marketing/FinalCta";

export const metadata: Metadata = {
  alternates: { canonical: "/שירותים/" },
  title: "השירותים שלנו",
  description:
    "שירותי תיקון דודים: תיקון דוד שמש, תיקון דוד חשמל, החלפת תרמוסטט, תיקון נזילות, החלפת אלמנט חימום והחלפת דוד — עם אחריות על העבודה ומחיר הוגן.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        title="השירותים שלנו"
        subtitle="פתרון לכל תקלה בדוד — משמש וחשמל ועד תרמוסטט, אלמנט ונזילות, עם אבחון מהיר ואחריות על העבודה."
        crumbs={[{ label: "בית", href: "/" }, { label: "השירותים שלנו" }]}
        currentPath="/שירותים/"
      />
      <ServicesGrid />
      <FinalCta />
    </>
  );
}
