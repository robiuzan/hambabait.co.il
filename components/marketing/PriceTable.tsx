import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { priceRanges, pricingNote, pricingTableCopy } from "@/lib/content";

/**
 * Thousands separator without pulling in ICU. `toLocaleString` would vary with the
 * build machine's locale data; this is deterministic, which the output QA gate needs.
 */
function withThousands(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * A ₪ range rendered as an LTR island. Without `dir="ltr"` the shekel sign and the
 * dash reorder against the surrounding Hebrew and the range reads backwards.
 * CLAUDE.md §6.
 *
 * The string is assembled in JS rather than interpolated inline, so React emits ONE
 * text node instead of `₪<!-- -->250<!-- -->–₪<!-- -->850`. The comment separators are
 * invisible to a browser but they fragment the figure for anything reading the raw
 * HTML — which on this site is the point of the page.
 */
function PriceRangeCell({ low, high }: { low: number; high: number }) {
  const range = `₪${withThousands(low)}–₪${withThousands(high)}`;
  return (
    <span className="ltr font-semibold whitespace-nowrap text-primary" dir="ltr">
      {range}
    </span>
  );
}

/**
 * The published price table. Every figure is owner-confirmed and VAT-inclusive —
 * see the comment above `priceRanges` in lib/content.ts before changing anything here.
 *
 * Real <table> markup rather than a grid of divs: it is what screen readers announce
 * as tabular data, and what answer engines lift. docs/content-standards.md §4.
 */
export function PriceTable() {
  return (
    <Section id="price-table" tone="white">
      <SectionHeading
        eyebrow={pricingTableCopy.eyebrow}
        title={pricingTableCopy.title}
        subtitle={pricingTableCopy.subtitle}
      />

      {/* tabIndex + role + label: an overflow-x-auto region with no focusable child
          cannot be scrolled by keyboard at all — WCAG 2.1.1. Matches the pattern already
          used by GuideBody and GuideDiagram. docs/accessibility-and-i18n.md §38. */}
      <div
        className="mx-auto mt-10 max-w-3xl overflow-x-auto"
        tabIndex={0}
        role="group"
        aria-label={pricingTableCopy.scrollLabel}
      >
        <table className="w-full border-collapse text-start">
          <caption className="sr-only">{pricingTableCopy.caption}</caption>
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th scope="col" className="pe-4 pb-3 text-start text-sm text-gray-500">
                {pricingTableCopy.colService}
              </th>
              <th scope="col" className="pb-3 text-end text-sm text-gray-500">
                {pricingTableCopy.colPrice}
              </th>
            </tr>
          </thead>
          <tbody>
            {priceRanges.map((row) => (
              <tr key={row.label} className="border-b border-gray-100 align-top">
                {/* aria-label keeps the row header's accessible name to the service
                    name alone. Without it the header announced to the price cell is the
                    label PLUS the whole scope sentence — ~150 chars re-read on every row
                    in screen-reader table navigation. The sentence stays visible and is
                    still read in normal document order. */}
                <th
                  scope="row"
                  aria-label={row.label}
                  className="py-4 pe-4 text-start font-normal"
                >
                  <span className="font-heading font-bold text-primary">{row.label}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-gray-600">
                    {row.scope}
                  </span>
                </th>
                <td className="py-4 text-end">
                  <PriceRangeCell low={row.low} high={row.high} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mx-auto mt-6 max-w-3xl text-sm leading-relaxed text-gray-500">
        {pricingNote}
      </p>

      <div className="mt-8 flex justify-center">
        <Button href="/צור-קשר" data-cta="pricing-table-quote" variant="accent" size="lg">
          {pricingTableCopy.cta}
        </Button>
      </div>
    </Section>
  );
}
