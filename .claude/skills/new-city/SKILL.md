---
name: new-city
description: Add or deepen a location page the data-driven way — append to the locations array in lib/site-config.ts and add the matching cityContent entry in lib/content.ts, and the route, areas index, link mesh, JSON-LD and sitemap all follow. All 18 cities already carry an answer block, ≥2 city-specific paragraphs, FAQs and nearby links, so a new city must clear the same bar rather than ship as a template. Use when expanding coverage or deepening one of the 18. Triggers: "add a city", "new location page", "cover <city>", "this city page is thin", "doorway", "deepen the city copy".
---

# Add or deepen a location page

## Read this before adding anything

**Do not add a 19th city until the existing 18 clear the doorway bar.** Breadth before depth is how
this silo got thin in the first place, and adding to it makes the whole domain's position worse, not
better. See `docs/content-standards.md` and `local-seo-il`.

Nine times out of ten the right answer to "add a city" is "deepen one of the eighteen we have".

## The mechanism — two arrays, both required

**1. `lib/site-config.ts` — the route axis**

```ts
export const locations = [
  { slug: "tel-aviv", name: "תל אביב" },
  …18 entries
] as const;

export type LocationSlug = (typeof locations)[number]["slug"];
```

Append one entry and the plumbing follows automatically:

- `app/locations/[city]/page.tsx` → `generateStaticParams()` maps the array, so the route prerenders.
- `app/sitemap.ts` → the `<loc>` appears, trailing-slashed and `encodeURI`'d.
- `LocationSlug` widens, so anything switching on the slug type-checks against the new value.
- The areas index, the footer's 18-city block and any link mesh driven by the array pick it up.

Slugs are **English**, lowercase, hyphenated. The `name` is Hebrew and is what renders. `as const` is
load-bearing for `LocationSlug` — do not drop it.

**2. `lib/content.ts` — the content axis**

```ts
export interface CityContent {
  answer: { question: string; body: string }; // question-form H2 + a self-contained answer
  profile: string[]; // ≥2 paragraphs impossible to write about another city
  faqs: Faq[];
  nearby: LocationSlug[]; // city→city links
}

export const cityContent: Record<LocationSlug, CityContent> = { … };
```

This is a **total `Record`, not a `Partial`.** Widening `LocationSlug` without adding the matching
entry is a **type error**, and `npm run typecheck` catches it. That is deliberate: it makes shipping an
empty, templated city page impossible. There is no fallback to a generic template any more, and none
should be reintroduced.

Two things that do **not** follow automatically:

- **`public/llms.txt`** is hand-maintained (currently 45/45 sitemap coverage). Add the line.
- **Other cities' `nearby` arrays.** A new city that nobody links to is reachable but isolated; add it
  to the 2–4 geographically sensible neighbours' arrays too.

## What a city page renders today

`app/locations/[city]/page.tsx` reads the entry and renders: the answer block, the profile paragraphs,
all 6 services as links under `שירותי תיקון דודים ב<עיר>`, the city FAQs, and the `nearby` city links.
Measured across the 18: `nearby` arrays hold **2–4 entries** (50 links total), never fewer than 2.

So "adding a city" is a content task with a hard type gate in front of it, not a data append.

## Deepening a city — the actual work

### What counts as genuinely city-specific

Write only what is true and checkable. The four discriminators the shipped entries were built from:

- **Housing stock and boiler mix** — where solar dominates vs. where electric/pressure systems are
  common, older buildings vs. new construction.
- **Access realities** — roof access in low-rise vs. high-rise, older buildings without lifts,
  shared-roof solar arrays in apartment blocks.
- **Local geography and climate that affect the job** — coastal corrosion in Bat Yam, Ashdod, Netanya,
  Ashkelon and Haifa is a real, defensible technical point about anodes and tank life; Jerusalem's
  altitude shifts the winter load onto the electric element; hard water in the south changes the
  failure mode to scale.
- **City-specific FAQs** — questions that genuinely differ by area.

Proportions stay **qualitative**. There is no source in this repo for "N% of buildings in X", so
nothing may claim one.

### What does not count

- Synonym spinning ("מקצועי ואמין" → "אמין ומקצועי").
- Population figures, neighbourhood lists or distance-from-Tel-Aviv padding.
- Claims of a local branch, local technician or per-city response time. **There is no address, no geo
  and no per-city coverage data.** See `docs/business-facts.md` §3.6.

**If nothing truthful and specific can be written for a city, that city does not deserve a page.**
That is a legitimate outcome — remove it rather than pad it. See `city-research` for the source tiers
and the removal procedure.

## Metadata

`generateMetadata` in the route:

- `title` is `תיקון דודים ב<עיר>` with **no brand suffix** — the layout `template` already appends
  `| חם בבית`. Re-appending it is the doubled-brand regression that once shipped on 24 of 33 pages;
  `npm run qa:gate` now fails the build output if it returns. See `seo-metadata`.
- `description` — must be distinct per city, and must not make a claim the body does not make.
- `alternates.canonical: /locations/<slug>/` — self-referencing, trailing slash, byte-identical to the
  sitemap `<loc>`. The gate asserts that parity.

Hebrew grammar: `תיקון דודים **ב**<עיר>`, always prefixed. If a city needs a different prefix form, put
the prefixed form in the data, not in a conditional at the call site.

## Schema

All 18 location pages emit JSON-LD today: an area-scoped **`Service`** joined to the single `#business`
node via `provider.@id`, plus a **`BreadcrumbList`** matching the visible `PageHeader` crumbs. A new
city inherits both from the route — nothing to wire, but confirm they appear in `out/`.

**Never emit a per-city `LocalBusiness`.** There is one business and one `@id`; 18 of them would
fabricate 18 branches. And no priced `Offer` — prices are published on `/מחירון/` only, never in
schema and never per city, so no page can imply a city-specific rate. See `schema-structured-data`.

## Checklist

- [ ] All 18 existing cities clear the doorway bar (or you are deepening, not adding)
- [ ] Entry appended to `locations` with an English slug and Hebrew name; `as const` intact
- [ ] Matching `cityContent` entry — the `Record` is total, so typecheck enforces this
- [ ] `answer` block that is genuinely about this city, self-contained, ~30–60 words
- [ ] ≥2 `profile` paragraphs that could not be produced by substituting another city's name
- [ ] `nearby` has ≥2 entries, and the new slug is added to its neighbours' arrays
- [ ] No claim of local presence, local staff or a per-city SLA; no invented proportion
- [ ] Title does not append the brand twice; description unique; canonical trailing-slashed
- [ ] Line added to `public/llms.txt`
- [ ] `npm run lint && npm run typecheck && npm run format:check && npm run build && npm run qa:gate`,
      then bump the route-count thresholds in `scripts/qa-gate.mjs` — they are hard-coded on purpose
