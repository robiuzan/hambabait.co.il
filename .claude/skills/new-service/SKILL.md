---
name: new-service
description: Add or deepen a service page the data-driven way — append to the services array in lib/site-config.ts, add the matching serviceMeta/serviceCards entry AND the matching serviceDepth entry in lib/content.ts, and the route, the services grid, the location-page cross-links, the Service + FAQPage + BreadcrumbList JSON-LD and the sitemap all update automatically. serviceDepth is a total Record, so typecheck refuses a service with no depth content. Use when adding a service or deepening one of the 6 existing service pages. Triggers: "add a service", "new service page", "deepen the service copy", "per-service FAQ", "service page is thin", "service description".
---

# Add or deepen a service page

## The mechanism

Two files, three structures, all of which must stay in sync.

**1. `lib/site-config.ts` — the route axis**

```ts
export const services = [
  { slug: "solar", name: "תיקון דוד שמש" },
  …6 entries
] as const;

export type ServiceSlug = (typeof services)[number]["slug"];
```

**2. `lib/content.ts` — the card copy**

`serviceMeta` carries the per-slug `tagline`, `description` and `icon`; `serviceCards` is
`services.map(...)` over it, so the Hebrew `name` comes from site-config and the display copy from
content. One source per fact.

**3. `lib/content.ts` — the depth**

```ts
export interface ServiceDepth {
  answer: { question: string; body: string }; // question-form H2 + a self-contained answer
  symptomsHeading: string;
  symptoms: SymptomRow[]; // { symptom, cause } — rendered as a real table
  onSite: string[]; // what the technician actually does
  repairVsReplace: string;
  faqs: Faq[];
  related: RelatedService[]; // { slug, reason } — reason is a SHARED SYMPTOM
}

export const serviceDepth: Record<ServiceSlug, ServiceDepth> = { … };
```

This is a **total `Record`, not a `Partial`.** Widening `ServiceSlug` without adding the matching depth
entry is a **type error** that `npm run typecheck` catches. That is deliberate: `serviceDepth` replaced a
module-level `triggers` array that rendered **identically on all six pages**, and six pages sharing one
symptom list are a find-and-replace away from being one page. The type gate is what stops that
regressing.

Append to all three and everything downstream follows:

- `app/services/[service]/page.tsx` → `generateStaticParams()` prerenders the route
- `components/marketing/ServicesGrid.tsx` → the homepage grid picks it up
- `app/locations/[city]/page.tsx` → **all 18 city pages** link it automatically (they map `serviceCards`)
- `components/layout/Footer.tsx` → the site-wide services block, on every page
- `app/sitemap.ts` → the `<loc>` appears
- `serviceJsonLd` + `faqJsonLd` + `breadcrumbJsonLd` → the three nodes are emitted

Two things that do **not** follow: `public/llms.txt` is hand-maintained (add the line), and the route
thresholds in `scripts/qa-gate.mjs` are hard-coded (bump all three).

Slugs are English, lowercase, hyphenated; `name` is Hebrew and is what renders. Keep `as const`.

**Adding one service adds 1 page but 20+ links** (grid + footer + 18 city pages). That leverage is why
the service axis is the right place to invest, and why a weak service page propagates widely.

## The description does double duty — treat it as schema

The per-slug description is used as:

1. the card copy in the services grid,
2. the page's meta description,
3. **the JSON-LD `Service.description`**.

So an unsourced claim written into a service description becomes an unsourced claim in structured data.
Before writing one, check `docs/business-facts.md` §3.5 — the six existing descriptions are all authored
and unevidenced, and the site-wide unsourced set (warranty, same-day arrival, "כשעה עד שעתיים") is
tracked there.

Write capability, not promises. "מאתרים ומתקנים נזילות בדוד ובחיבורים" is a capability. "תיקון תוך שעה
עם אחריות מלאה" is two unsourced claims.

## Depth bar for a service page

A service page must clear `docs/content-standards.md`. The `ServiceDepth` shape encodes it:

- **`answer`** — a question-form H2 and a self-contained direct answer. The six shipped bodies run
  32–47 words; self-contained and extractable is the bar, the word range is guidance (`aeo-answer-content`).
- **`symptoms`** — the symptom → likely cause rows the reader recognises: no hot water, lukewarm water,
  a leak, the boiler tripping the breaker. Rendered as a real `<table>` with a `<caption>` derived from
  the service name, inside a keyboard-reachable scroll container. Tables get lifted by answer engines
  far more reliably than prose.
- **`onSite`** — what the technician does: diagnosis, the part, the test. Capability, never a promise.
- **`repairVsReplace`** — when the honest answer is a new boiler. This builds more trust than any badge,
  and it is safe to write because it is technical judgement, not a claim.
- **`faqs`** — 3–5, emitted as a per-page `FAQPage` whose text must match the rendered text exactly.
  Never one site-wide node.
- **`related`** — the sibling service pages, each with a `reason` that is a **shared symptom**: a leaking
  tank often becomes a `replacement`; a suspected `thermostat` fault is often a `heating-element` fault.
  Link on that logic, never on "here are the other five".

**Links out are already wired.** The route maps `locations` in full plus `/איזורי-שירות/`. That block
shipped as `locations.slice(0, 8)`, which left cities 9–18 with no inbound link from any service page —
silently, because the page looked complete. Same defect as `.slice(0, 4)` on the sibling-services block.
Both are fixed. **Distrust any `.slice()` on a link list.**

**Still missing, and worth adding on the next pass:** a link from the service page to the guide that
explains its fault in depth (`/services/thermostat/` → `/מדריכים/how-thermostat-works/`,
`/services/leak-repair/` → `/מדריכים/leaking-boiler/`). Every guide currently has an in-degree of exactly
1, and service→guide is the natural fix. It belongs in the content model, not in JSX. See
`internal-linking`.

## Metadata

`generateMetadata` sets `title: card.name` with **no brand suffix** — the root `template` in
`app/layout.tsx` already appends `| חם בבית`. It once shipped `תיקון דוד שמש | חם בבית | חם בבית` on all
six pages; that is fixed, and `npm run qa:gate` fails the output if it returns.

Canonical is `/services/<slug>/` — self-referencing, trailing slash, byte-identical to the sitemap
`<loc>`. The gate asserts that parity.

## Schema

All six service pages emit three nodes today:

- **`Service`** via `serviceJsonLd(manifest, { name, description, slug })`, with `provider.@id → #business`.
  That join is correct; preserve it.
- **`FAQPage`** via `faqJsonLd(depth.faqs)` — per page, matched to the visible FAQs.
- **`BreadcrumbList`** emitted from `PageHeader`, matching the visible crumb trail item for item.

Do not add `Offer` with a price. The business does publish ranges — on `/מחירון/`, rendered from
`priceRanges` — but deliberately keeps them out of the graph, where a range is easy to express wrongly
and can surface in a SERP stripped of the scope line that qualifies it. The gate fails on a priced
`Offer` and that assertion stays. Same for `warrantyPromise`, `aggregateRating` and the rest of the
banned set. See `schema-structured-data`.

## Naming a new service

Use the term a customer would search, not an industry term. `החלפת אלמנט חימום` over `אלמנט 2000W`.
Check it does not overlap an existing page's intent — two pages competing for `תיקון דוד חשמל`
cannibalise each other and neither ranks. See `docs/keyword-map.md`.

If a proposed service is really a variation of an existing one, **deepen the existing page instead.**
And check the knowledge hub first: a symptom that is really an explanation, not a job, belongs in
`/מדריכים/` — see `new-article`.

## Checklist

- [ ] Entry in `services` (`lib/site-config.ts`) with English slug + Hebrew name; `as const` intact
- [ ] Matching `serviceMeta` entry in `lib/content.ts`
- [ ] Matching `serviceDepth` entry — the `Record` is total, so typecheck enforces this
- [ ] Description makes no unsourced claim (it becomes JSON-LD)
- [ ] Distinct search intent — no cannibalisation with a service page or a guide
- [ ] `symptoms` table distinct from every other service's; 3–5 FAQs; `related` reasons are shared symptoms
- [ ] Links to all 18 cities and the areas index — **no `.slice()` on a link list**
- [ ] Title does not append the brand twice; canonical trailing-slashed
- [ ] Line added to `public/llms.txt`; thresholds bumped in `scripts/qa-gate.mjs`
- [ ] `npm run lint && npm run typecheck && npm run format:check && npm run build && npm run qa:gate`,
      then confirm the route, the grid, the footer block, the 18 city links and the sitemap entry
