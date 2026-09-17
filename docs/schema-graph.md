# Schema graph — חם בבית

> The JSON-LD graph, and the gap between it and what ships today. Cited by `schema-auditor`,
> `schema-structured-data`, `new-city` and `new-service`.
>
> **Re-baselined 2026-08-31 against a fresh `out/`.**

All nodes are built with `@ishub/site-kit/seo`, except the two the kit does not export — `WebSite`
and `Article`, both assembled inline in their routes and both flagged as such below. **Never
hand-write JSON-LD anywhere else.**

---

## 1. Current state — the graph is COMPLETE

Every node in the target graph now ships. What remains is not markup: it is the three data gaps in
§2, and those are the owner's to close.

| Route                  | Count | Emits today                                            |
| ---------------------- | ----- | ------------------------------------------------------ |
| `/`                    | 1     | `Plumber` + `WebSite` + `FAQPage`                      |
| `/services/<slug>/`    | 6     | `Service` + `FAQPage` + `BreadcrumbList`               |
| `/locations/<slug>/`   | 18    | `Service` (area-scoped) + `FAQPage` + `BreadcrumbList` |
| `/מדריכים/`            | 1     | `BreadcrumbList`                                       |
| `/מדריכים/<slug>/`     | 12    | `Article` + `FAQPage` + `BreadcrumbList`               |
| 7 Hebrew static routes | 7     | `BreadcrumbList`                                       |
| `/תודה/`               | 1     | nothing (correct — noindex)                            |
| `out/404`              | 1     | nothing (correct)                                      |

Measured coverage across the built output:

```
find out -name index.html | wc -l                                # 47  (45 indexable + 404 + /תודה/)
grep -rl 'application/ld+json' out --include=index.html | wc -l  # 45  → 45/45 indexable, 100%
grep -rl 'rel="canonical"'     out --include=index.html | wc -l  # 45
grep -o '<loc>' out/sitemap.xml | wc -l                          # 45

grep -rl '"@type":"WebSite"'  out --include=index.html | wc -l   #  1
grep -rl '"@type":"Article"'  out --include=index.html | wc -l   # 12
grep -rl 'FAQPage'            out --include=index.html | wc -l   # 37
grep -rl '"@type":"Service"'  out --include=index.html | wc -l   # 24
grep -rl 'BreadcrumbList'     out --include=index.html | wc -l   # 44
grep -rl '"@type":"Plumber"'  out --include=index.html | wc -l   # 37  ← read §2.1 before believing this
```

The only two pages without JSON-LD are the 404 and `/תודה/`, **both correct**.

`FAQPage` at 37 = homepage + 6 services + 18 locations + 12 guides. `Service` at 24 = 6 service
pages + 18 area-scoped location pages. `BreadcrumbList` at 44 = every indexable page except the
homepage, which renders no `PageHeader` and correctly has no trail.

### The `WebSite` node — shipped, and deliberately shallow

The kit exports **no `websiteJsonLd`**, so `app/page.tsx` assembles it inline.

```
@type        WebSite
@id          https://hambabait.co.il/#website
url          https://hambabait.co.il
name         חם בבית
inLanguage   he-IL
publisher    { @id: https://hambabait.co.il/#business }
```

`publisher` joins the `Plumber` node by `@id`, so the two nodes on the homepage resolve as one
entity rather than two unrelated ones. Preserve that join.

> **No `potentialAction`, no `SearchAction` — and that is not an omission to "fix."** This site has
> no search of any kind: no search route, no query parameter, nothing an action could point at.
> Declaring one is a false capability claim, and Google may render a sitelinks searchbox that
> submits to a dead URL. `npm run qa:gate` asserts both properties are absent from `out/`. If site
> search is ever built, the action gets added **in that same change** — never before it.

### The `Article` node

The kit exports **no `articleJsonLd`** either, so `app/מדריכים/[slug]/page.tsx` assembles the node
inline — the same pattern the location route uses for its `areaServed` override, and with the same
caveat: a proper builder belongs upstream in `@ishub/site-kit`, not in a local fork.

```
@type              Article
headline           ← guide.heading
datePublished      ← guide.published
dateModified       ← guide.updated
inLanguage         he-IL
author             { @type: Plumber, @id: https://hambabait.co.il/#business, name: חם בבית }
publisher          { @type: Plumber, @id: https://hambabait.co.il/#business, name: חם בבית }
mainEntityOfPage   { @type: WebPage, @id: <canonical> }
```

> **`author` and `publisher` are the BUSINESS, never a person.** There is no named author anywhere on
> this site and no evidence any specific technician exists. A byline would be a fabricated
> credential — see [business-facts.md](business-facts.md) §3.5.

All three nodes ship in **one** `<script type="application/ld+json">` as an array, so a guide page has
exactly one schema block. The route deliberately does **not** pass `currentPath` to `PageHeader`
(which would emit a second `BreadcrumbList`); the hub index does, and relies on `PageHeader` for its.

---

## 2. The business node

`localBusinessJsonLd(manifest)` on the homepage.

```
@type      Plumber
@id        https://hambabait.co.il/#business
name       חם בבית
alternateName  Cham BaBait
description    ← manifest shortPitch
url        https://hambabait.co.il
telephone  +972556601006
email      info@hambabait.co.il
priceRange ₪₪
areaServed { @type: AdministrativeArea, name: "שירות בכל הארץ" }
openingHoursSpecification  Su–Th 08:00–18:00, Fr 08:00–14:00
knowsLanguage
```

**`@id` is the anchor of the whole graph.** One business, one `@id`. Every `Service` joins to it via
`provider.@id`; every `Article` via `author.@id` and `publisher.@id`; `WebSite` via `publisher.@id`.

### 2.1 Why `"@type":"Plumber"` greps to 37 pages and not 1

The **full** business node ships **once**, on the homepage. The other 36 hits are reference stubs:
the kit types its join objects, so a service page carries
`"provider":{"@type":"Plumber","@id":"https://hambabait.co.il/#business"}` and a guide carries the
same shape under `author` and `publisher`.

That is correct — a typed `@id` reference is not a duplicate entity. But it means **a bare grep for
`Plumber` counts references, not nodes.** Anyone auditing "how many LocalBusiness nodes ship" has to
parse the JSON and look for a node carrying `name`, `telephone` and `openingHoursSpecification` —
not string-match. Getting this wrong leads somewhere bad in either direction: a false alarm about 37
fabricated branches, or a real per-city `LocalBusiness` slipping past unnoticed.

### Three honest gaps — do not paper over them

1. **No `address`, no `geo`.** The manifest carries neither, so the kit's `prune()` drops them.
   Google treats address as effectively required for LocalBusiness rich results, so this node likely
   does not qualify. **This is a data gap for the owner — never invent an address to satisfy a
   validator.**
2. **`areaServed` is a marketing phrase**, not a real administrative area. The honest alternatives
   (a list of real areas, or a `GeoCircle`) both need coverage data nobody has supplied.
3. **`sameAs` is empty** and therefore pruned. The site claims no profile anywhere. The moment a
   Google Business Profile exists, its URL goes in the manifest — that single link is the strongest
   available entity signal.

All three are **owner problems, not markup problems.** The markup is already as good as the data
allows, and inventing any of the three makes the site worse rather than better.

Minor: `url` ships as `https://hambabait.co.il` with no trailing slash while the homepage canonical
has one. Both resolve to the same page and nothing breaks, but they are not byte-identical. Fix at
the roster manifest, then sync — never by editing `site.config.json`.

---

## 3. Service nodes

`serviceJsonLd(manifest, { name, description, slug })` on each of the 6 service pages.

```
@type        Service
name         ← services[].name
description  ← per-slug copy in lib/content.ts
url          https://hambabait.co.il/services/<slug>/
provider     { @type: Plumber, @id: https://hambabait.co.il/#business }
```

The `provider.@id` join is correct — **preserve it**.

**On location pages**, the node is the same `Service` type scoped by `areaServed` to that city, with
the same `provider.@id` join. All 18 ship it, which is why `Service` greps to 24 and not 6.

> **Never emit a per-city `LocalBusiness`.** Eighteen of them would fabricate eighteen branches that
> do not exist. One business, one `@id`.

⚠️ `Service.description` is the _same string_ used as the meta description. Unsourced marketing copy
therefore reaches structured data by design — see §6.

---

## 4. BreadcrumbList — shipped

`breadcrumbJsonLd` is imported and called in `components/layout/PageHeader.tsx`, which also renders
the visible `<nav aria-label="פירורי לחם">` trail. It fires whenever a route passes both `crumbs` and
`currentPath` — which every nested route does.

So `BreadcrumbList` ships on all 6 service pages, all 18 location pages, the hub index, all 12 guides
and all 7 Hebrew static routes: **44 pages**. It correctly does **not** ship on the homepage, the 404
or `/תודה/`, none of which render `PageHeader`.

```
בית  ›  אזורי שירות  ›  תל אביב
בית  ›  שירותים      ›  תיקון דוד שמש
בית  ›  מדריכים      ›  אין מים חמים בכלל: איך מאתרים את הסיבה
```

**Rule: the markup trail must match the visible trail item for item.** Never emit a crumb the user
cannot see.

---

## 5. FAQPage — 37 pages

Homepage (6 visible questions), all 6 service pages, all 18 location pages and all 12 guides. Every
one is matched to FAQs that actually render on that page.

Extend only where FAQs actually render, and the question/answer text must match the rendered text
exactly. Per-service, per-city and per-guide FAQs each get their own `FAQPage` on their own page —
**never a single site-wide FAQ node**, and never the same question string on two pages. That last
rule is not cosmetic: a duplicate question was found and fixed this way, and the story is in
[keyword-map.md](keyword-map.md) §8.

---

## 6. What must never ship

```bash
grep -rEo '"(aggregateRating|review|ratingValue|reviewCount|foundingDate|warrantyPromise)"' out | sort -u
# must return nothing
```

`npm run qa:gate` asserts every row below over `out/` on each release, so a regression fails the gate
rather than reaching a validator.

| Property                                                  | Why barred                                                                                                                                                                                                          |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Review`, `AggregateRating`, `ratingValue`, `reviewCount` | **There are no reviews.** Fabricated review markup is a Google policy violation with manual-action risk. The site is currently clean; that state is deliberate and verified.                                        |
| `foundingDate`                                            | `foundedYear` is `null`. The kit already omits it, and `lib/site-config.ts` keeps `founded` at `null` rather than falling back to `0`.                                                                              |
| `warrantyPromise`                                         | The warranty is asserted with **no term, scope or document anywhere**. See [business-facts.md](business-facts.md) §3.1.                                                                                             |
| `Offer` with a `price`                                    | The site publishes ranges on `/מחירון/`, and keeping them out of schema is a **deliberate choice**, not an absence of data. A range is easy to express wrongly in schema and can surface directly in SERPs. See §7. |
| `potentialAction` / `SearchAction`                        | There is no site search. See §1.                                                                                                                                                                                    |
| per-city `LocalBusiness`                                  | Fabricates branches.                                                                                                                                                                                                |

### ✅ The one claim that used to reach schema — closed 2026-08-31

The business `description` comes from the manifest's `shortPitch`, and that string used to end
`…עם אחריות על העבודה`. The warranty was softened everywhere else in the repo first, which left the
manifest as the last carrier — and because `shortPitch` is re-emitted verbatim as the JSON-LD
`description`, the unsourced claim was still shipping as **structured data on the homepage** after it
had been removed from the visible copy. It looked manifest-sourced; the manifest was just the same
authored copy one level up.

**Fixed at the source.** The roster manifest was edited and synced with `ops/sync-manifest.ps1`,
which now exists — see [manifest-assumptions.md](manifest-assumptions.md). The homepage `description`
now reads `…אבחון מדויק, עבודה מקצועית והצעת מחיר ברורה לפני שמתחילים.`, and
`grep -rl "אחריות על העבודה" out --include=index.html` returns exactly **one** file: `out/index.html`,
in a deliberately-softened homepage FAQ answer saying that warranty terms are given with the quote,
before work begins. That is a different and defensible sentence, and it is **not** in the JSON-LD.

**Keep the lesson.** Softening the visible copy does not soften the schema. Anything living in
`shortPitch`, a service `description` or a city description reaches structured data by design, and
the only fix is a roster edit plus a sync — never an edit to `site.config.json`.

---

## 7. Pricing — the honest position

`/מחירון/` emits `BreadcrumbList` and nothing else — and since 2026-09-17 that is a **deliberate
choice rather than an empty cupboard**. The page publishes eight owner-approved VAT-inclusive ranges
([business-facts.md](business-facts.md) §1a) and carries an answer block stating them. The figures
are on the page; they are kept out of the graph on purpose.

**Why they stay out.** A range is awkward to express correctly — `Offer.price` wants one figure, and
`AggregateOffer` wants `lowPrice`/`highPrice` plus currency — and whatever ships can surface directly
in a search result, where a reader reads it as a quote rather than as a range. A wrong price in a
SERP is worse than no price in a SERP. `qa:gate` fails any `Offer` carrying a `price` and **that
assertion stays** until someone reverses it deliberately, with the owner.

If it is ever reversed: `AggregateOffer` per service, `priceCurrency: "ILS"`, `lowPrice` and
`highPrice` copied verbatim from §1a — כולל מע״מ, because §17א applies to a rich result exactly as it
applies to the page — and the `qa:gate` assertion changed in the same commit. Never a bare `price`.

`priceRange: "₪₪"` already ships on the business node — a band rather than a number, and now
consistent with a page that states the real ones.

---

## 8. Validation

Always validate the **built output**, never the source — `prune()` means what you pass in is not what
ships.

```bash
npm run build
npm run qa:gate                                              # 28 assertions, several of them schema
grep -rl 'application/ld+json' out --include=index.html      # which pages
grep -rEo '"(aggregateRating|review|foundingDate)"' out      # must be empty
```

Then paste a built page's JSON-LD into the Rich Results Test. Expect the `Plumber` node to fall short
of a local rich result while `address` is absent — that is the known data gap in §2, not a markup bug.
