import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { guides, guideClusterLabels, type GuideCluster } from "@/lib/guides";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { FinalCta } from "@/components/marketing/FinalCta";

export const metadata: Metadata = {
  alternates: { canonical: "/מדריכים/" },
  // No brand suffix — the root `template` in app/layout.tsx already appends "| חם בבית".
  title: "מדריכים",
  description:
    "מדריכים על תקלות דודים: למה אין מים חמים, מה גורם לנזילה, דוד שמש או חשמל, ומתי כדאי להחליף. הסברים טכניים בעברית, בלי מחירים ובלי הבטחות.",
};

/** Cluster order is editorial, not alphabetical: symptoms first, because that is the
 *  state a reader arrives in — something is broken and they do not know why. */
const clusterOrder: GuideCluster[] = ["symptom", "comparison", "definition", "seasonal"];

export default function GuidesIndexPage() {
  return (
    <>
      <PageHeader
        title="מדריכים"
        subtitle="הסברים טכניים על דודים — מה נכשל, איך מזהים ומה עושים. בלי מחירים ובלי הבטחות."
        crumbs={[{ label: "בית", href: "/" }, { label: "מדריכים" }]}
        // PageHeader emits BreadcrumbList only when currentPath is supplied too — it needs a
        // URL for the terminal crumb. The guide pages deliberately omit it and emit their own
        // node alongside Article, so nothing is double-emitted.
        currentPath="/מדריכים/"
      />

      <Section tone="white">
        <div className="mx-auto max-w-3xl">
          {clusterOrder.map((cluster) => {
            const inCluster = guides.filter((g) => g.cluster === cluster);
            if (inCluster.length === 0) return null;
            return (
              <section key={cluster} className="mt-10 first:mt-0">
                <h2 className="font-heading text-xl font-bold text-primary">
                  {guideClusterLabels[cluster]}
                </h2>
                <ul className="mt-5 grid gap-3">
                  {inCluster.map((g) => (
                    <li key={g.slug}>
                      <Link
                        href={`/מדריכים/${g.slug}`}
                        className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-5 py-4 hover:border-secondary"
                      >
                        <span>
                          <span className="block font-heading font-bold text-primary">
                            {g.heading}
                          </span>
                          <span className="mt-1 block text-sm text-gray-600">
                            {g.answer.question}
                          </span>
                        </span>
                        <ChevronLeft
                          className="mt-1 h-4 w-4 shrink-0 text-secondary"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
