---
name: new-city
description: Add or deepen a location page the data-driven way — append to the locations array in lib/site-config.ts and the route, areas index, link mesh and sitemap follow automatically, but the page body is 100% templated today with no per-city content map, so deepening means introducing one. Use when expanding coverage or retrofitting one of the 18 thin city pages. Triggers: "add a city", "new location page", "cover <city>", "this city page is thin", "doorway", "deepen the city copy".
---

# Add or deepen a location page

## Read this before adding anything

**Do not add a 19th city until the existing 18 clear the doorway bar.** Breadth before depth is how
this silo got thin, and adding to it makes the whole domain's position worse, not better. See
`docs/content-standards.md` and `local-seo-il`.

Nine times out of ten the right answer to "add a city" is "deepen the eighteen we have".

## The mechanism — what adding a city actually does

`lib/site-config.ts` holds a flat, `as const` array:

```ts
export const locations = [
  { slug: "tel-aviv", name: "תל אביב" },
  …18 entries
] as const;

export type LocationSlug = (typeof locations)[number]["slug"];
```

Append one entry and **everything else follows automatically**:

- `app/locations/[city]/page.tsx` → `generateStaticParams()` maps the array, so the route prerenders.
- `app/sitemap.ts` → the `<loc>` appears, trailing-slashed and `encodeURI`'d.
- `LocationSlug` widens, so anything switching on the slug type-checks against the new value.
- The areas index and any link mesh driven by the array pick it up.

Slugs are **English**, lowercase, hyphenated. The `name` is Hebrew and is what renders. `as const` is
load-bearing for `LocationSlug` — do not drop it.

## What does NOT follow automatically: the content

This is the crux. `app/locations/[city]/page.tsx` renders **one template** with the city name
substituted into a fixed subtitle and two fixed paragraphs, then lists all 6 services.

There is **no per-city content map**. Every one of the 18 pages says the same thing with a different
noun. A find-and-replace could regenerate any of them from any other — which is the textbook
definition of a doorway page.

So "adding a city" today means adding a 19th near-duplicate. **That is the thing to avoid.**

## Deepening a city — the actual work

Introduce a `cityContent` map keyed by slug, in the content layer (`lib/content.ts`), and have the
route read it. Shape it so a city with no entry still renders (fall back to the current template)
rather than breaking the build.

```ts
// lib/content.ts
export const cityContent: Partial<Record<LocationSlug, {
  intro: string;          // replaces the generic opening paragraph
  localNotes: string[];   // genuinely city-specific observations
  faqs?: { q: string; a: string }[];
}>> = { … };
```

`noUncheckedIndexedAccess` is on, so `cityContent[slug]` is `T | undefined` — narrow it, do not `!`.

### What counts as genuinely city-specific

Write only what is true and checkable:

- **Housing stock and boiler mix** — where solar dominates vs. where electric/pressure systems are
  common, older buildings vs. new construction.
- **Access realities** — roof access in low-rise vs. high-rise, older buildings without lifts,
  shared-roof solar arrays in apartment blocks.
- **Local geography that affects the job** — coastal corrosion in Bat Yam, Ashdod, Netanya, Ashkelon
  and Haifa is a real, defensible technical point about anodes and tank life.
- **City-specific FAQs** — questions that genuinely differ by area.

### What does not count

- Synonym spinning ("מקצועי ואמין" → "אמין ומקצועי").
- Population figures, neighbourhood lists or distance-from-Tel-Aviv padding.
- Claims of a local branch, local technician or per-city response time. **There is no address, no geo
  and no per-city coverage data.** See `docs/business-facts.md` §3.6.

**If nothing truthful and specific can be written for a city, that city does not deserve a page.**
That is a legitimate outcome — remove it rather than pad it.

## Metadata

`generateMetadata` in the route currently produces:

- `title: \`תיקון דודים ב${loc.name} | ${siteConfig.name}\``— **this double-appends the brand**,
because the layout template already adds`| חם בבית`. Drop the suffix. See `seo-metadata`.
- `description` — templated per city. Deepening should make these distinct too.
- `alternates.canonical: \`/locations/${loc.slug}/\`` — correct, keep the trailing slash.

Hebrew grammar: `תיקון דודים **ב**<עיר>`, always prefixed. If a city needs a different prefix form,
put the prefixed form in the data, not in a conditional at the call site.

## Schema

Location pages currently emit **no JSON-LD at all** — 18 of 32 indexable URLs shipping bare.

The correct node is a `Service` scoped by `areaServed` to that city, joined to the single
`#business` node via `provider.@id`, plus a `BreadcrumbList` matching the visible crumbs `PageHeader`
already renders.

**Never emit a per-city `LocalBusiness`.** There is one business and one `@id`; 18 of them would
fabricate 18 branches. See `schema-structured-data`.

## Checklist

- [ ] All 18 existing cities clear the doorway bar (or you are deepening, not adding)
- [ ] Entry appended to `locations` with an English slug and Hebrew name; `as const` intact
- [ ] Per-city content that could not be produced by substituting another city's name
- [ ] No claim of local presence, local staff or a per-city SLA
- [ ] Title does not append the brand twice
- [ ] Unique description; canonical trailing-slashed
- [ ] `npm run typecheck && npm run build`, then confirm the route and the sitemap entry exist
