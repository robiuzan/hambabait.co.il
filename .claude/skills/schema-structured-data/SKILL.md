---
name: schema-structured-data
description: Emit the JSON-LD graph with the @ishub/site-kit/seo builders — Plumber from the manifest, WebSite on the homepage with deliberately no SearchAction, Service per service page, area-scoped Service on all 18 location pages, BreadcrumbList emitted from PageHeader on every nested route, FAQPage matched to visible FAQs, Article on the 12 guides, and the hard bar on Review/AggregateRating and priced Offer. Coverage is 45 of 45 indexable pages; only the 404 and /תודה/ are bare, both correctly. Use when wiring or auditing structured data, or before a Rich Results Test. Triggers: "add schema", "JSON-LD", "BreadcrumbList", "structured data", "rich results", "Offer", "Article schema".
---

# Structured data

## Builders — use these, never hand-write JSON-LD

From `@ishub/site-kit/seo`:

| Builder                                              | Emits                                                          | Used today                 |
| ---------------------------------------------------- | -------------------------------------------------------------- | -------------------------- |
| `localBusinessJsonLd(manifest)`                      | the `Plumber` node                                             | ✅ homepage                |
| `serviceJsonLd(manifest, {name, description, slug})` | `Service` + `provider.@id` join                                | ✅ 6 service + 18 location |
| `faqJsonLd(faqs)`                                    | `FAQPage`                                                      | ✅ 37 pages                |
| `breadcrumbJsonLd(manifest, items)`                  | `BreadcrumbList`                                               | ✅ from `PageHeader`       |
| `jsonLdScript(node)`                                 | the `<script type="application/ld+json">` wrapper, `<` escaped | ✅                         |

**The kit exports no `WebSite` builder and no `Article` builder.** Those two nodes are assembled
locally — `WebSite` in `app/page.tsx`, `Article` in `app/מדריכים/[slug]/page.tsx` — each with a
comment saying a proper builder belongs upstream in `@ishub/site-kit` rather than in a local fork.
If you add a third hand-assembled node type, that is the signal to push the builder to the hub.

A `prune()` helper inside the kit silently drops null/empty fields. That is why absent manifest data
disappears rather than emitting `null` — convenient, but it also means a missing field fails silently.

## Current state — measured from the built output

**Coverage is complete: 45 of 45 indexable pages emit JSON-LD.** The only bare pages are `out/404/`
and `out/תודה/`, and both are correct that way — a noindex 404 and a noindex conversion destination
have nothing to describe.

| Node             | Pages  | Where                                                               |
| ---------------- | ------ | ------------------------------------------------------------------- |
| `WebSite`        | **1**  | homepage only                                                       |
| `Plumber`        | **37** | 1 full node (homepage) + 36 `@id` references                        |
| `Service`        | **24** | 6 service pages + 18 area-scoped location pages                     |
| `FAQPage`        | **37** | homepage + 6 services + 18 locations + 12 guides                    |
| `Article`        | **12** | every `/מדריכים/<slug>/`                                            |
| `BreadcrumbList` | **44** | every indexable page except the homepage (which has no crumb trail) |

The 37 `Plumber` hits are not 37 business nodes. The homepage carries the one real node; the other 36
are `provider` / `author` / `publisher` references that repeat `@type` alongside the `@id` join so
each node stays self-describing. **There is one business and one `@id`** — never emit a second full
business node anywhere.

The remaining schema work is not coverage. It is whatever depth a specific page actually earns.

## `WebSite` — and why it carries no `SearchAction`

The `WebSite` node ships on the homepage: `@id: …/#website`, `url`, `name`, `inLanguage`, and
`publisher` joined by `@id` to the `#business` node so the two resolve as one graph.

**It deliberately carries no `potentialAction` / `SearchAction`, and must not gain one.** This site
has no search of any kind — no search route, no query parameter, nothing to point an action at.
Declaring one is a false capability claim, and Google would render a sitelinks searchbox that leads
to a dead URL. `npm run qa:gate` fails the build if either token appears in `out/`.

## BreadcrumbList — wired, keep it matched

`breadcrumbJsonLd` fires from `components/layout/PageHeader.tsx`, which is also what renders the
visible `<nav aria-label="פירורי לחם">` trail. One source, two outputs — that is why they agree.

Rule: **the JSON-LD trail must match the visible trail item for item.** Never emit a crumb the user
cannot see, and never render a crumb the markup omits. If you add a route that bypasses `PageHeader`,
it ships no `BreadcrumbList` and the coverage count drops — check `qa:gate` after.

The homepage has no `BreadcrumbList` because it has no trail. That is correct, not a gap.

## The `Plumber` node

Built from the manifest, so fix data in the roster and sync it — never edit `site.config.json` by
hand. It carries name, `alternateName`, description (from `shortPitch`), url, telephone, email,
`priceRange`, `areaServed`, `openingHoursSpecification`, `knowsLanguage`, and
`@id: https://hambabait.co.il/#business`.

Three honest gaps — **do not paper over them**:

1. **No `address`, no `geo`.** The manifest has none, so `prune()` removes them. Google's
   LocalBusiness guidance treats address as effectively required, so this node likely does not
   qualify for a rich result. That is a _data_ gap for the owner to fill, not a reason to invent an
   address.
2. **`areaServed` is `{"@type":"AdministrativeArea","name":"שירות בכל הארץ"}`** — a marketing phrase
   in a field consumers read as a place name. If it is ever restructured, the honest form is a list
   of real administrative areas or a `GeoCircle`, sourced from actual coverage.
3. **`sameAs` is empty**, so it is pruned. The site claims no social or GBP profile. Correct today.

`description` comes straight from the roster `shortPitch`. That phrase was softened at the roster and
**synced** (`ops/sync-manifest.ps1`), so the unsourced warranty language no longer reaches structured
data. The lesson generalises: **the roster is a schema surface.** A claim added to `shortPitch` is a
claim in the homepage JSON-LD on the next build.

Also note `url` is emitted without a trailing slash (straight from the manifest) while the homepage
canonical has one. Minor entity-consistency nit worth fixing at the manifest.

## `Service` nodes

`serviceJsonLd` joins `provider.@id` to the `#business` node — that join is correct and must be
preserved. `Service.description` comes from the same per-slug copy used as the meta description,
which means **an unsourced claim in service copy becomes an unsourced claim in structured data**.
Check `docs/business-facts.md` §3.5 before editing service descriptions.

The 18 location pages emit a `Service` scoped by `areaServed` to that city with the same
`provider.@id` join — not a second `LocalBusiness`. Emitting a per-city LocalBusiness would fabricate
18 branches that do not exist.

## `Article` — the knowledge hub

Each of the 12 guides emits an `Article` with `headline`, `description`, `url`,
`mainEntityOfPage`, `datePublished`, `dateModified`, `inLanguage`, plus `author` and `publisher`.

**`author` and `publisher` are both the business**, carrying `@type` + `name` alongside the `@id`
join. There is no named author anywhere on this site and no evidence any specific technician exists —
inventing a byline would be a fabricated credential (`docs/business-facts.md` §3.5). Do not "improve"
this by adding a `Person`.

`datePublished`/`dateModified` come from the guide record in `lib/guides.ts`. **A date must reflect a
real substantive edit.** Bumping `updated` to look fresh is a fabricated freshness signal.

## `FAQPage`

Only where FAQs are **visible on that page**, and the question/answer text must match the rendered
text. That holds today across all 37: the homepage set, the per-service sets, the per-city sets and
the per-guide sets each render from the same array they mark up. Do not attach `FAQPage` to a page
whose FAQs are absent.

## Offer and pricing — the deliberate position

Since 2026-09-17 the site **does** publish prices: owner-confirmed VAT-inclusive ranges on `/מחירון/`,
from `priceRanges` in `lib/content.ts` (`docs/business-facts.md` §1a). They stay out of the graph
anyway, and that is now a choice rather than an absence of data:

- **No priced `Offer` and no `AggregateOffer`.** A range is easy to express wrongly in schema
  (`price` vs `lowPrice`/`highPrice`, VAT, what the figure covers), and a wrong figure can surface
  directly in a SERP detached from the `scope` line that qualifies it — where the visible table always
  carries it. `qa:gate` fails the build if a priced `Offer` appears in any parsed JSON-LD block, and
  **that assertion stays.**
- The defensible options are an `Offer` with `priceCurrency: "ILS"` and no price, or no `Offer` at
  all. Prefer no `Offer` unless there is a concrete reason.
- `priceRange: "₪₪"` already ships on the business node. It is a band rather than a number, and it is
  now defensible from the published ranges (`docs/business-facts.md` §1a) instead of a guess.

## The absolute bar

**`Review`, `AggregateRating`, `ratingValue` and `reviewCount` must never be emitted.** There are no
reviews. The site is clean of them and that is a deliberate, gated state.

Same for `foundingDate` (`foundedYear` is `null` — the kit already omits it) and for any
`warrantyPromise` (the warranty has no term anywhere; see `docs/business-facts.md` §3.1).

`scripts/qa-gate.mjs` string-scans **every** `.html`, not just the `ld+json` blocks, because Next also
serialises the JSON-LD into the React Flight payload — a banned property must not survive there
either.

Fabricated review markup is a Google policy violation with manual-action risk. It is not a growth
tactic and it is not negotiable.

## Verifying

```bash
npm run build && npm run qa:gate

# coverage: 45 indexable pages, all with JSON-LD
grep -rl 'application/ld+json' out --include=index.html | wc -l     # 45

# node census
for t in WebSite Plumber Service FAQPage Article BreadcrumbList; do
  printf '%-16s %s\n' "$t" "$(grep -rl "\"@type\":\"$t\"" out --include=index.html | wc -l)"
done

# the bar
grep -rEo '"(aggregateRating|review|ratingValue|reviewCount|foundingDate|warrantyPromise)"' out
grep -rEo '"(SearchAction|potentialAction)"' out
```

Then paste a built page's JSON-LD into the Rich Results Test. Validate the **built output**, never
the source — `prune()` means what you wrote is not what ships.
