import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { locations } from "@/lib/site-config";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { FinalCta } from "@/components/marketing/FinalCta";

export const metadata: Metadata = {
  alternates: { canonical: "/איזורי-שירות/" },
  title: "אזורי שירות",
  description:
    "תיקון דודים בפריסה ארצית — מהצפון ועד הדרום. שירות מהיר לכל סוגי הדודים. בחרו את העיר שלכם.",
};

export default function AreasPage() {
  return (
    <>
      <PageHeader
        title="אזורי שירות"
        subtitle="נותנים שירות תיקון דודים בכל הארץ — מהצפון ועד הדרום. בחרו את העיר שלכם."
        crumbs={[{ label: "בית", href: "/" }, { label: "אזורי שירות" }]}
        currentPath="/איזורי-שירות/"
      />

      <Section tone="white">
        <ul className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/locations/${c.slug}`}
                className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 hover:border-secondary hover:text-secondary"
              >
                <MapPin className="h-4 w-4 shrink-0 text-secondary" aria-hidden />
                תיקון דודים ב{c.name}
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <FinalCta />
    </>
  );
}
