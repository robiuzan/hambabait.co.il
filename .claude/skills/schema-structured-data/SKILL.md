---
name: schema-structured-data
description: Emit the JSON-LD graph with the @ishub/site-kit/seo builders — Plumber from the manifest, Service per service page, area-scoped Service on all 18 location pages, BreadcrumbList emitted from PageHeader on every nested route, FAQPage matched to visible FAQs, Article for the knowledge hub, and the hard bar on Review/AggregateRating and priced Offer. Coverage now stands at 32 of 32 indexable pages; only the 404 and /תודה/ are bare, both correctly. Use when wiring or auditing structured data, or before a Rich Results Test. Triggers: "add schema", "JSON-LD", "BreadcrumbList", "structured data", "rich results", "Offer", "Article schema".
---

# Structured data

## Builders — use these, never hand-write JSON-LD

From `@ishub/site-kit/seo`:

| Builder                                              | Emits                                                          | Used today            |
| ---------------------------------------------------- | -------------------------------------------------------------- | --------------------- |
| `localBusinessJsonLd(manifest)`                      | the `Plumber` node                                             | ✅ homepage           |
| `serviceJsonLd(manifest, {name, description, slug})` | `Service` + `provider.@id` join                                | ✅ 6 service pages    |
| `faqJsonLd(faqs)`                                    | `FAQPage`                                                      | ✅ homepage           |
| `breadcrumbJsonLd(items)`                            | `BreadcrumbList`                                               | ❌ **never imported** |
| `jsonLdScript(node)`                                 | the `<script type="application/ld+json">` wrapper, `<` escaped | ✅                    |

A `prune()` helper inside the kit silently drops null/empty fields. That is why absent manifest data
disappears rather than emitting `null` — convenient, but it also means a missing field fails silently.

## Current state vs target

**Today: 7 of 33 pages emit any JSON-LD.**

| Route                    | Today                 | Target                                                |
| ------------------------ | --------------------- | ----------------------------------------------------- |
| `/`                      | `Plumber` + `FAQPage` | keep; add `WebSite`                                   |
| `/services/<slug>/` ×6   | `Service`             | + `BreadcrumbList`                                    |
| `/locations/<slug>/` ×18 | **nothing**           | `Service` (area-scoped) + `BreadcrumbList`            |
| 7 Hebrew static routes   | nothing               | `BreadcrumbList`; `FAQPage` where FAQs are visible    |
| `/מחירון/`               | nothing               | `Offer` **without a price** — or nothing. See §Offer. |

The 18-page location silo — the entire local-SEO surface, and 56% of the site's indexable URLs —
ships with no structured data at all. That is the biggest single schema gap.

## BreadcrumbList — the free win

`breadcrumbJsonLd` exists, works, and is imported by nothing. Meanwhile **every nested route already
builds a full crumb trail** and passes it to `components/layout/PageHeader.tsx`, which renders it as
visible `<nav aria-label="פירורי לחם">` HTML with zero markup.

The data is already there. Emitting it is wiring the existing array through `breadcrumbJsonLd` in
`PageHeader` (or per route) — not authoring anything new. Visible breadcrumbs plus matching
`BreadcrumbList` is exactly what Google asks for.

Rule: **the JSON-LD trail must match the visible trail item for item.** Never emit a crumb the user
cannot see.

## The `Plumber` node

Built from the manifest, so fix data in the roster, not in code. It currently carries name,
`alternateName`, description (from `shortPitch`), url, telephone, email, `priceRange`, `areaServed`,
`openingHoursSpecification`, `knowsLanguage`, and `@id: https://hambabait.co.il/#business`.

Three honest gaps — **do not paper over them**:

1. **No `address`, no `geo`.** The manifest has none, so `prune()` removes them. Google's
   LocalBusiness guidance treats address as effectively required, so this node likely does not
   qualify for a rich result. That is a _data_ gap for the owner to fill, not a reason to invent an
   address.
2. **`areaServed` is `{"@type":"AdministrativeArea","name":"שירות בכל הארץ"}`** — a marketing phrase
   in a field consumers read as a place name. If it is ever restructured, the honest form is a list of
   real administrative areas or a `GeoCircle`, sourced from actual coverage.
3. **`sameAs` is empty**, so it is pruned. The site claims no social or GBP profile. Correct today.

Also note `url` is emitted without a trailing slash (straight from the manifest) while the homepage
canonical has one. Minor entity-consistency nit worth fixing at the manifest.

## `Service` nodes

`serviceJsonLd` joins `provider.@id` to the `#business` node — that join is correct and must be
preserved. `Service.description` comes from the same per-slug copy used as the meta description,
which means **an unsourced claim in service copy becomes an unsourced claim in structured data**.
Check `docs/business-facts.md` §3.5 before editing service descriptions.

For the location pages, the right node is a `Service` scoped by `areaServed` to that city, with the
same `provider.@id` join — not a second `LocalBusiness`. **There is one business, one `@id`.** Emitting
a per-city LocalBusiness would fabricate 18 branches that do not exist.

## `FAQPage`

Only where FAQs are **visible on that page**, and the question/answer text must match the rendered
text. The homepage does this correctly with 6 questions. Do not attach `FAQPage` to a page whose FAQs
are collapsed away or absent.

## Offer and pricing — the honest position

The business deliberately publishes **no price table** (`app/מחירון/page.tsx`, `lib/content.ts`), and
no shekel figure appears anywhere on the site. Therefore:

- **Any `Offer` with a `price` would be fabricated.** Do not add one.
- The defensible options are an `Offer` with `priceCurrency: "ILS"` and no price, or no `Offer` at
  all. Prefer no `Offer` unless there is a concrete reason.
- `priceRange: "₪₪"` already ships on the business node. It is itself unsourced
  (`docs/business-facts.md` §1) but it is at least a band, not a number.

## The absolute bar

**`Review`, `AggregateRating`, `ratingValue`, `reviewCount` must never be emitted.** There are no
reviews. The site is currently clean of them and that is a deliberate, verified state.

Same for `foundingDate` (`foundedYear` is `null` — the kit already omits it) and for any
`warrantyPromise` (the warranty has no term anywhere; see `docs/business-facts.md` §3.1).

Fabricated review markup is a Google policy violation with manual-action risk. It is not a growth
tactic and it is not negotiable.

## Verifying

```bash
npm run build
grep -rl 'application/ld+json' out --include=index.html | wc -l     # 7 today
grep -rEo '"(aggregateRating|review|ratingValue|foundingDate)"' out # must be empty
```

Then paste a built page's JSON-LD into the Rich Results Test. Validate the **built output**, never
the source — `prune()` means what you wrote is not what ships.
