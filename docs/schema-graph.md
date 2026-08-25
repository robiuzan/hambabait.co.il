# Schema graph — חם בבית

> The target JSON-LD graph, and the gap between it and what ships today. Cited by `schema-auditor`,
> `schema-structured-data`, `new-city` and `new-service`.

All nodes are built with `@ishub/site-kit/seo`. **Never hand-write JSON-LD.**

---

## 1. Current state — 45 of 45 indexable pages emit JSON-LD

**Verified 2026-08-25 against a fresh `out/`.**

| Route                  | Count | Emits today                                            |
| ---------------------- | ----- | ------------------------------------------------------ |
| `/`                    | 1     | `Plumber` + `FAQPage`                                  |
| `/services/<slug>/`    | 6     | `Service` + `FAQPage` + `BreadcrumbList`               |
| `/locations/<slug>/`   | 18    | `Service` (area-scoped) + `FAQPage` + `BreadcrumbList` |
| `/מדריכים/`            | 1     | `BreadcrumbList`                                       |
| `/מדריכים/<slug>/`     | 12    | `Article` + `FAQPage` + `BreadcrumbList`               |
| 7 Hebrew static routes | 7     | `BreadcrumbList`                                       |
| `/תודה/`               | 1     | nothing (correct — noindex)                            |
| `out/404`              | 1     | nothing (correct)                                      |

```bash
npm run build
find out -name index.html | wc -l                                  # 47
grep -rl 'application/ld+json' out --include=index.html | wc -l    # 45
grep -o '<loc>' out/sitemap.xml | wc -l                            # 45
```

The only two pages without JSON-LD are the 404 and `/תודה/`, **both correct**.

**Coverage and depth are both done.** What remains are the three honest data gaps in §2 — no
`address`, no `geo`, empty `sameAs` — and those are owner problems, not markup problems.

### The `Article` node

The kit exports **no `articleJsonLd`**, so `app/מדריכים/[slug]/page.tsx` assembles the node inline —
the same pattern the location route uses for its `areaServed` override, and with the same caveat: a
proper builder belongs upstream in `@ishub/site-kit`, not in a local fork.

```
@type              Article
headline           ← guide.heading
datePublished      ← guide.published
dateModified       ← guide.updated
inLanguage         he-IL
author             { @id: https://hambabait.co.il/#business }
publisher          { @id: https://hambabait.co.il/#business }
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
`provider.@id`.

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

Minor: `url` ships without a trailing slash while the homepage canonical has one. Fix at the manifest.

---

## 3. Service nodes

`serviceJsonLd(manifest, { name, description, slug })` on each of the 6 service pages.

```
@type        Service
name         ← services[].name
description  ← per-slug copy in lib/content.ts
url          https://hambabait.co.il/services/<slug>/
provider     { @id: https://hambabait.co.il/#business }
```

The `provider.@id` join is correct — **preserve it**.

**On location pages**, the right node is the same `Service` type scoped by `areaServed` to that city,
with the same `provider.@id` join.

> **Never emit a per-city `LocalBusiness`.** Eighteen of them would fabricate eighteen branches that
> do not exist. One business, one `@id`.

⚠️ `Service.description` is the _same string_ used as the meta description. Unsourced marketing copy
therefore reaches structured data by design — see §6.

---

## 4. BreadcrumbList — shipped

`breadcrumbJsonLd` is imported and called in `components/layout/PageHeader.tsx`, which also renders
the visible `<nav aria-label="פירורי לחם">` trail. It fires whenever a route passes both `crumbs` and
`currentPath` — which every nested route does.

So `BreadcrumbList` ships on all 6 service pages, all 18 location pages and all 7 Hebrew static
routes. It correctly does **not** ship on the homepage, the 404 or `/תודה/`, none of which render
`PageHeader`.

```
בית  ›  אזורי שירות  ›  תל אביב
בית  ›  שירותים      ›  תיקון דוד שמש
```

**Rule: the markup trail must match the visible trail item for item.** Never emit a crumb the user
cannot see.

---

## 5. FAQPage

On the homepage, from 6 visible questions. Correct today.

Extend only where FAQs actually render, and the question/answer text must match the rendered text
exactly. Per-service and per-city FAQs each get their own `FAQPage` on their own page — never a single
site-wide FAQ node.

---

## 6. What must never ship

```bash
grep -rEo '"(aggregateRating|review|ratingValue|reviewCount|foundingDate|warrantyPromise)"' out | sort -u
# must return nothing
```

| Property                                                  | Why barred                                                                                                                                                                   |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Review`, `AggregateRating`, `ratingValue`, `reviewCount` | **There are no reviews.** Fabricated review markup is a Google policy violation with manual-action risk. The site is currently clean; that state is deliberate and verified. |
| `foundingDate`                                            | `foundedYear` is `null`. The kit already omits it.                                                                                                                           |
| `warrantyPromise`                                         | The warranty is asserted across ~15 surfaces with **no term anywhere**. See [business-facts.md](business-facts.md) §3.1.                                                     |
| `Offer` with a `price`                                    | The business publishes no price table and no shekel figure appears on the site. Any number is invented.                                                                      |
| per-city `LocalBusiness`                                  | Fabricates branches.                                                                                                                                                         |

### The one claim already reaching schema

The business `description` comes from the manifest's `shortPitch`, which **ends with an unsourced
warranty claim**. It looks manifest-sourced but the manifest is just the same authored copy.

This is a live finding, not a hypothetical — see [business-facts.md](business-facts.md) §0. Fixing it
means editing the roster manifest, not the code.

---

## 7. Pricing — the honest position

`/מחירון/` emits nothing today, and that is **partly by design**: the business deliberately publishes
no fixed price list.

Defensible options: an `Offer` with `priceCurrency: "ILS"` and **no** price, or no `Offer` at all.
Prefer the latter unless there is a concrete reason. `priceRange: "₪₪"` already ships on the business
node — itself unsourced, but a band rather than a number.

---

## 8. Validation

Always validate the **built output**, never the source — `prune()` means what you pass in is not what
ships.

```bash
npm run build
grep -rl 'application/ld+json' out --include=index.html      # which pages
grep -rEo '"(aggregateRating|review|foundingDate)"' out      # must be empty
```

Then paste a built page's JSON-LD into the Rich Results Test. Expect the `Plumber` node to fall short
of a local rich result while `address` is absent — that is the known data gap in §2, not a markup bug.
