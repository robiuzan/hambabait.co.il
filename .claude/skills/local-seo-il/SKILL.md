---
name: local-seo-il
description: Israeli local-SEO doctrine for חם בבית — NAP byte-identical across site, schema and Google עסק שלי, and the six unconfirmed roster assumptions in docs/manifest-assumptions.md that gate publishing any of it externally; the 6-service × 18-location matrix and its expansion cap; Hebrew ב+city grammar; the no-address/no-geo reality of a mobile trade and the areaServed field that names a place that does not exist; GBP as the top lever; and the doorway-page policy the 18 city pages now clear on content but must keep clearing. Use when populating locations or services for local ranking, or auditing local visibility. Triggers: "local SEO", "NAP", "city pages", "Google עסק שלי", "doorway pages", "areaServed", "add a city", "why don't the city pages rank".
---

# Local SEO — Israel

## The honest starting position

hambabait has **no address, no geo, no GBP profile and no reviews**. `schema.sameAs` is `[]`. For a
local business, that is close to the weakest possible position — and no amount of on-page work
substitutes for it.

So be clear about leverage. In rough order of impact:

1. **A Google עסק שלי (Business Profile) listing** — service-area business type. This is the single
   biggest lever and it lives outside the repo.
2. **Real reviews on that profile.** Never on the site as fabricated markup.
3. **NAP consistency** everywhere the business appears.
4. **Genuinely distinct city pages.** No longer the weakest part of the site — but the thing most
   easily undone by a careless addition.
5. Everything else.

If asked "why don't the city pages rank", the answer usually starts at 1, not 4. The on-page work is
now done; the entity work is not.

## NAP — byte-identical, one source

| Field | Value                              | Source                               |
| ----- | ---------------------------------- | ------------------------------------ |
| Name  | חם בבית                            | `site.config.json` → `brandName`     |
| Phone | 055-6601006 / +972556601006        | `contact.phoneDisplay` / `phoneE164` |
| Email | info@hambabait.co.il               | `contact.email`                      |
| Hours | Su–Th 08:00–18:00, Fri 08:00–14:00 | `schema.openingHours`                |
| Area  | שירות בכל הארץ                     | `schema.areaServed`                  |

Rules:

- **Never hardcode any of these in a component.** Import from `lib/site-config.ts`.
- **Never edit `site.config.json` directly.** It is synced from the roster by `ops/sync-manifest.ps1`
  (`-DryRun` then `-Confirm`). Edit the roster, then sync — and remember that editing the roster alone
  changes nothing public until the sync lands in the repo's copy.
- The same strings must appear on the site, in the JSON-LD, and on the GBP listing. A different format
  (`055 660 1006` vs `055-6601006`) is a different NAP to a matcher.
- Hours are duplicated: machine-readable in the manifest (`schema.openingHours`), hand-typed Hebrew in
  `lib/site-config.ts` (`hours.weekday` / `hours.friday`). Change one, change both.

### Four of these five are assumptions — check before publishing anything external

The sync **deliberately strips** the roster's `_needsConfirmation` array, because `site.config.json` is
imported by `lib/site-config.ts` and therefore **bundled into the client JavaScript** — internal notes
must not ship to visitors. The assumptions are preserved instead in
**`docs/manifest-assumptions.md`**, which the sync generates. Six items are outstanding, and four of
them are NAP:

- the **phone** is the shared fleet lead line — routing unconfirmed;
- the **email** is assumed (it fixes a typo on the previous live site);
- the **opening hours** are authored, not supplied;
- the **pricing approach** (indicative only, no price table) is unconfirmed;
- plus: the site was rebuilt from scratch rather than migrated, and `foundedYear` is `null`.

> **Manifest-sourced is not client-confirmed.** Reading `site.config.json` alone shows a clean, complete
> NAP and invites exactly the wrong conclusion. Read `docs/manifest-assumptions.md` before printing any
> of it on a Business Profile, a directory citation or anything else off-site. See
> `docs/business-facts.md` §0.

## The matrix and its cap

6 services × 18 locations. The site publishes the two axes as **6 + 18 = 24 pages**, not 108
intersections. That restraint is correct and deliberate.

**Do not generate service×city intersection pages.** 108 near-identical pages for a business with no
address and no per-city presence is the textbook doorway pattern, and it puts the whole domain at risk
rather than just the new pages.

**Do not add a 19th city** until all 18 clear the doorway bar in `docs/content-standards.md`. Breadth
before depth is how this silo became thin in the first place.

## The doorway problem — where it now stands

The 18 location pages used to render from one template: a fixed subtitle and two fixed paragraphs with
the city name substituted. That was (a) a ranking liability, because near-duplicates compete and dilute
the silo, and (b) a **claims** liability, because each page told a specific city it got fast local
service with nothing behind it.

That is fixed at the content layer. `lib/content.ts` carries a `cityContent: Record<LocationSlug, CityContent>`
with an entry for every city: a distinct question-form `answer` block, **≥2 `profile` paragraphs that
could not be written about another city**, city-specific `faqs`, and a `nearby` array of 2–4 sibling
cities. No duplicate question, no duplicate body across the 18. The same-day-arrival language that used
to appear on all 18 was softened out.

The `Record` is **total**, not `Partial` — a new `LocationSlug` with no content entry is a typecheck
failure, which is what stops the template era returning by accident.

So the doctrine is unchanged, but the failure mode has moved: the risk is no longer "18 identical
pages", it is **a 19th written to a lower standard than the 18**. Real per-city substance means which
boiler types dominate that area's housing stock, typical access constraints (walk-up vs. roof, older
buildings), climate and water effects on the failure mode, and genuinely city-specific FAQs. If none of
that can be written truthfully for a city, that city does not deserve a page.

## Hebrew grammar for city pages

- **`ב` prefix, always:** `תיקון דודים בתל אביב`. Never `תיקון דודים תל אביב`.
- Some names need an elided or definite form. Encode the correct prefixed form in `lib/site-config.ts`
  beside the name — never patch it at the call site, because the same string feeds the title, the H1,
  the meta description and the JSON-LD.
- Title formula: `תיקון דודים ב<עיר>` — the layout template appends the brand, so **do not append it
  yourself**. `npm run qa:gate` fails the output if the brand doubles. See `seo-metadata`.

## `areaServed` and the schema reality

The manifest's `schema.areaServed: "שירות בכל הארץ"` ships as
`{"@type":"AdministrativeArea","name":"שירות בכל הארץ"}` — a marketing phrase occupying a field
consumers read as a place name. **There is no such administrative area.** Verified in the emitted
homepage JSON-LD.

If it is ever restructured, the honest forms are a list of real administrative areas, or a `GeoCircle`
around a real base — both of which require coverage data nobody has supplied yet. Do not invent either
to clear a validator warning.

On the location pages, the emitted node is a **`Service` scoped by `areaServed` to that city**, joined
to the single `#business` node by `provider.@id`, plus a `BreadcrumbList`. All 18 carry both.
**Never emit a per-city `LocalBusiness`** — that fabricates 18 branches that do not exist. See
`schema-structured-data`.

## Google עסק שלי checklist

Outside the repo, but this is where the wins are:

- [ ] **Settle the four NAP assumptions first** (`docs/manifest-assumptions.md`) — a profile published on
      an unconfirmed phone or hours is a NAP inconsistency you then have to un-publish
- [ ] Profile claimed and verified
- [ ] **Service-area business** (no storefront) — hides the address, which matches reality
- [ ] Category: plumber / water-heater repair, matching the `Plumber` schema type
- [ ] NAP byte-identical to `site.config.json`
- [ ] Hours identical to the manifest
- [ ] Services list mirroring the 6 service pages
- [ ] Review generation process agreed with the owner — see `review-acquisition`
- [ ] Once live, add the profile URL to the **roster's** `schema.sameAs`, sync, rebuild, and confirm it
      reaches the JSON-LD in `out/`

That last step closes the site's biggest entity gap: `sameAs` is `[]` today, so nothing corroborates
"חם בבית" as a real-world entity anywhere on the web.

## Auditing local visibility

```bash
# NAP hardcoded anywhere it shouldn't be
grep -rn '055-6601006\|972556601006' app components | grep -v site-config

# city name handling
grep -rn 'locations' lib/site-config.ts

# every service and city entry carries an answer block (24 = 6 + 18; the +2 are the
# two interface declarations, so subtract them)
grep -c 'answer: {' lib/content.ts      # 26
```

Then check: does every city page have a unique H1, a unique description, and at least two paragraphs
that could not be produced by substituting a different city name into another page? `npm run qa:gate`
asserts unique titles and unique meta descriptions across all 45 pages; **it cannot judge whether a
paragraph is genuinely city-specific.** That read is still human work.
