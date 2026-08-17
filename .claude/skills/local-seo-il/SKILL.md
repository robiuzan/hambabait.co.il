---
name: local-seo-il
description: Israeli local-SEO doctrine for חם בבית — NAP byte-identical across site, schema and Google עסק שלי; the 6-service × 18-location matrix and its expansion cap; Hebrew ב+city grammar; the no-address/no-geo reality of a mobile trade; GBP as the top lever; and the non-negotiable doorway-page policy on 18 templated city pages. Use when populating locations or services for local ranking, or auditing local visibility. Triggers: "local SEO", "NAP", "city pages", "Google עסק שלי", "doorway pages", "areaServed", "add a city", "why don't the city pages rank".
---

# Local SEO — Israel

## The honest starting position

hambabait has **no address, no geo, no GBP profile and no reviews**. `sameAs` is empty. For a local
business, that is close to the weakest possible position — and no amount of on-page work substitutes
for it.

So be clear about leverage. In rough order of impact:

1. **A Google עסק שלי (Business Profile) listing** — service-area business type. This is the single
   biggest lever and it lives outside the repo.
2. **Real reviews on that profile.** Never on the site as fabricated markup.
3. **NAP consistency** everywhere the business appears.
4. **Genuinely distinct city pages.** Currently the weakest part of the site.
5. Everything else.

If asked "why don't the city pages rank", the answer usually starts at 1, not 4.

## NAP — byte-identical, one source

| Field | Value                              | Source                   |
| ----- | ---------------------------------- | ------------------------ |
| Name  | חם בבית                            | `site.config.json:5`     |
| Phone | 055-6601006 / +972556601006        | `site.config.json:14-15` |
| Email | info@hambabait.co.il               | `site.config.json:17`    |
| Hours | Su–Th 08:00–18:00, Fri 08:00–14:00 | `site.config.json:33-52` |
| Area  | שירות בכל הארץ                     | `site.config.json:32`    |

Rules:

- **Never hardcode any of these in a component.** Import from `lib/site-config.ts`.
- The same strings must appear on the site, in the JSON-LD, and on the GBP listing. A different
  format (`055 660 1006` vs `055-6601006`) is a different NAP to a matcher.
- **The phone is the shared fleet line** (`phoneOverride: false`) and the email is an assumption.
  Both are flagged in the hub manifest's `_needsConfirmation`. Confirm before printing them on
  anything external — see `docs/business-facts.md` §0.
- Hours are duplicated: machine-readable in the manifest, hand-typed Hebrew in
  `lib/site-config.ts:42-43`. Change one, change both.

## The matrix and its cap

6 services × 18 locations. The site publishes the two axes as **6 + 18 = 24 pages**, not 108
intersections. That restraint is correct and deliberate.

**Do not generate service×city intersection pages.** 108 near-identical pages for a business with no
address and no per-city presence is the textbook doorway pattern, and it puts the whole domain at
risk rather than just the new pages.

**Do not add a 19th city** until all 18 clear the doorway bar in `docs/content-standards.md`. Breadth
before depth is how this silo became thin in the first place.

## The doorway problem — state it plainly

All 18 location pages are rendered from one template. They assert local presence and fast arrival for
their named city — including Beer Sheva, Ashkelon and Haifa — from a single string substitution, with
no per-city coverage data, no address, no geo and no technician roster.

That is: (a) a ranking liability, because near-duplicate pages compete with each other and dilute the
silo; and (b) a **claims** liability, because each page tells a specific city it gets fast local
service with nothing behind it. See `docs/business-facts.md` §3.6.

The fix is depth per city, authored once and stored in data — not more cities, and not synonym
spinning. Real per-city substance means things like: which boiler types dominate that area's housing
stock, typical access constraints (walk-up vs. roof, older buildings), local landmarks a technician
would actually reference, and genuinely city-specific FAQs. If none of that can be written truthfully
for a city, that city does not deserve a page.

## Hebrew grammar for city pages

- **`ב` prefix, always:** `תיקון דודים בתל אביב`. Never `תיקון דודים תל אביב`.
- Some names need an elided or definite form. Encode the correct prefixed form in
  `lib/site-config.ts` beside the name — never patch it at the call site, because the same string
  feeds the title, the H1, the meta description and the JSON-LD.
- Title formula: `תיקון דודים ב<עיר>` (the layout template appends the brand — do not append it
  yourself; see `seo-metadata`).

## `areaServed` and the schema reality

The manifest's `areaServed` ships as `{"@type":"AdministrativeArea","name":"שירות בכל הארץ"}` — a
marketing phrase occupying a field consumers read as a place name. There is no such administrative
area.

If it is ever restructured, the honest forms are a list of real administrative areas, or a `GeoCircle`
around a real base — both of which require coverage data nobody has supplied yet.

On the location pages, the correct node is a **`Service` scoped by `areaServed` to that city**, joined
to the single `#business` node by `provider.@id`. **Never emit a per-city `LocalBusiness`** — that
fabricates 18 branches that do not exist. See `schema-structured-data`.

## Google עסק שלי checklist

Outside the repo, but this is where the wins are:

- [ ] Profile claimed and verified
- [ ] **Service-area business** (no storefront) — hides the address, which matches reality
- [ ] Category: plumber / water-heater repair, matching the `Plumber` schema type
- [ ] NAP byte-identical to `site.config.json`
- [ ] Hours identical to the manifest
- [ ] Services list mirroring the 6 service pages
- [ ] Review generation process agreed with the owner
- [ ] Once live, add the profile URL to the manifest's `sameAs` so it ships in the JSON-LD

## Auditing local visibility

```bash
# NAP hardcoded anywhere it shouldn't be
grep -rn '055-6601006\|972556601006' app components | grep -v site-config

# city name handling
grep -rn 'locations' lib/site-config.ts
```

Then check: does every city page have a unique H1, a unique description, and at least one paragraph
that could not be produced by substituting a different city name into another page? If not, it is a
doorway page regardless of what the sitemap says.
