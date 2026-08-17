---
name: new-service
description: Add or deepen a service page the data-driven way — append to the services array in lib/site-config.ts and add the matching serviceCards entry in lib/content.ts, so the route, the services grid, the location-page cross-links, the Service JSON-LD and the sitemap all update automatically. Use when adding a service or deepening one of the 6 existing service pages. Triggers: "add a service", "new service page", "deepen the service copy", "per-service FAQ", "service page is thin", "service description".
---

# Add or deepen a service page

## The mechanism

Two arrays, in two files, must stay in sync.

**1. `lib/site-config.ts` — the route axis**

```ts
export const services = [
  { slug: "solar", name: "תיקון דוד שמש" },
  …6 entries
] as const;

export type ServiceSlug = (typeof services)[number]["slug"];
```

**2. `lib/content.ts` — the copy**

`serviceCards` carries the per-slug marketing copy (the description that becomes both the meta
description and the JSON-LD `Service.description`).

Append to both and everything downstream follows:

- `app/services/[service]/page.tsx` → `generateStaticParams()` prerenders the route
- `components/marketing/ServicesGrid.tsx` → the homepage grid picks it up
- `app/locations/[city]/page.tsx` → **all 18 city pages** link it automatically (they map
  `serviceCards`)
- `app/sitemap.ts` → the `<loc>` appears
- `serviceJsonLd` → the `Service` node is emitted
- `ServiceSlug` widens for anything switching on it

Slugs are English, lowercase, hyphenated; `name` is Hebrew and is what renders. Keep `as const`.

**Adding one service adds 1 page but 19 links** (grid + 18 city pages). That leverage is why the
service axis is the right place to invest, and why a weak service page propagates widely.

## The description does double duty — treat it as schema

The per-slug description is used as:

1. the card copy in the services grid,
2. the page's meta description,
3. **the JSON-LD `Service.description`**.

So an unsourced claim written into a service description becomes an unsourced claim in structured
data. Before writing one, check `docs/business-facts.md` §3.5 — the existing six descriptions are all
authored and unevidenced, and several carry warranty or speed language.

Write capability, not promises. "מאתרים ומתקנים נזילות בדוד ובחיבורים" is a capability. "תיקון תוך
שעה עם אחריות מלאה" is two unsourced claims.

## Depth bar for a service page

A service page must clear `docs/content-standards.md`. In practice, for this domain:

- **What the fault actually is**, in plain Hebrew — what fails and why.
- **Symptoms** the reader recognises: no hot water, lukewarm water, a leak, the boiler tripping the
  breaker.
- **What the technician does** on site — diagnosis, the part, the test.
- **Repair vs. replace** — when the honest answer is a new boiler. This builds more trust than any
  badge, and it is safe to write because it is technical judgement, not a promise.
- **Per-service FAQs**, 3–5, in question-form H2s with a 40–60 word answer first (see
  `aeo-answer-content`).
- **Links out**: the areas index and a few cities (service → location links **do not exist today** and
  are the main gap in the mesh — see `internal-linking`), plus genuinely related services.

The related-service link is where symptoms overlap in reality: a leaking tank often becomes a
`replacement`; a suspected `thermostat` fault is often a `heating-element` fault. Link on that logic,
not on "here are the other five".

## Metadata

`generateMetadata` currently produces `title: \`${card.name} | ${siteConfig.name}\``— which
**double-appends the brand**, since the layout template already adds`| חם בבית`. It ships
`תיקון דוד שמש | חם בבית | חם בבית`on all six pages. Drop the suffix. See`seo-metadata`.

Canonical is `/services/<slug>/` — self-referencing, trailing slash. Keep it.

## Schema

`serviceJsonLd(manifest, { name, description, slug })` emits the `Service` node with
`provider.@id → #business`. That join is correct; preserve it.

Still missing on these pages: **`BreadcrumbList`**, even though the route already passes a full crumb
trail to `PageHeader` and it renders visibly. Wiring `breadcrumbJsonLd` is the cheapest structured-data
win on the site. See `schema-structured-data`.

Do not add `Offer` with a price — the business publishes no prices, so any figure is invented.

## Naming a new service

Use the term a customer would search, not an industry term. `החלפת אלמנט חימום` over
`אלמנט 2000W`. Check it does not overlap an existing page's intent — two pages competing for
`תיקון דוד חשמל` cannibalise each other and neither ranks. See `docs/keyword-map.md`.

If a proposed service is really a variation of an existing one, deepen the existing page instead.

## Checklist

- [ ] Entry in `services` (`lib/site-config.ts`) with English slug + Hebrew name; `as const` intact
- [ ] Matching `serviceCards` entry in `lib/content.ts`
- [ ] Description makes no unsourced claim (it becomes JSON-LD)
- [ ] Distinct search intent — no cannibalisation
- [ ] Body clears the depth bar; 3–5 question-form FAQs
- [ ] Links to the areas index and a few cities
- [ ] Title does not append the brand twice
- [ ] `npm run typecheck && npm run build`, then confirm the route, the grid, the 18 city links and
      the sitemap entry
