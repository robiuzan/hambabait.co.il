---
name: city-research
description: How to source genuinely city-specific, checkable material for hambabait's 18 location pages so they stop being one template with the name substituted — the four legitimate material types (housing stock and boiler mix, roof and access realities, coastal corrosion and anode wear, city-specific FAQs), the banned padding patterns, the rule that a city with nothing truthful to say should lose its page rather than gain filler, and the source column every claim must survive. Use before writing or deepening any location page. Triggers: "research this city", "city-specific content", "what can we say about <city>", "doorway pages", "city briefs", "is this city page thin".
---

# City research — the material that lifts 18 pages off the doorway line

## The problem this solves

All 18 location pages render from one template: a fixed subtitle and two fixed paragraphs with
`loc.name` substituted, then the same list of 6 services. `lib/site-config.ts` holds
`locations` as a flat `{slug, name}` array — **there is no per-city content map anywhere in the repo.**

Two distinct risks, and both are real:

- **Ranking** — near-duplicate pages compete with each other, dilute the silo, and can be filtered out
  of the index entirely.
- **Claims** — each page currently tells a specific city it gets fast local service, backed by no
  address, no geo and no coverage data. See `docs/business-facts.md` §3.6.

## The bar

> **≥2 paragraphs per city that could not be written about any other city.**

Test it the hard way: swap the city name for another city's. If the paragraph still reads as true, it
is not city-specific and it does not count.

## The four legitimate material types

### 1. Housing stock and boiler mix

Where solar dominates versus electric or pressure systems. Older building stock versus new
construction. Apartment blocks with shared solar arrays versus private roofs.

This is **technical and checkable**, and it genuinely changes what a repair visit involves. It is the
richest of the four.

### 2. Roof and access realities

Low-rise with private roof access versus high-rise with a shared array. Buildings without lifts.
Whether a collector is reachable at all. Access determines what a technician can actually do on site,
so it is substantive rather than decorative.

### 3. Coastal corrosion and anode wear

Genuinely city-specific, genuinely technical: salt air accelerates anode consumption and shortens tank
life. Applies to **Bat Yam, Ashdod, Netanya, Ashkelon, Haifa** — and _not_ to Jerusalem, Modiin, Beer
Sheva or Kfar Saba, which is exactly what makes it discriminating.

Do not apply it to an inland city to fill space. That would be false, and it would also make the
coastal pages less distinctive.

### 4. City-specific FAQs

A question a resident of that city would actually ask, with an answer that is specific to it. Usually
downstream of the first three — shared solar arrays, roof access, corrosion.

## Banned — these are padding, and some are also claims

| Pattern                                        | Why it fails                                         |
| ---------------------------------------------- | ---------------------------------------------------- |
| Synonym spinning                               | the find-and-replace test catches it instantly       |
| Population figures                             | irrelevant to a boiler repair, and pure filler       |
| Neighbourhood lists                            | keyword stuffing with extra steps                    |
| Distance-from-Tel-Aviv padding                 | irrelevant, and implies a response time              |
| "Our local branch in \<city\>"                 | **false** — there is no branch anywhere              |
| "Our technician in \<city\>"                   | **false** — no evidence any technician exists (§3.5) |
| "We arrive in \<city\> within N minutes/hours" | **unsourced** response-time claim                    |
| Weather or tourism colour                      | not why the reader is on the page                    |

The last three are not merely thin — they are fabricated business facts, which is the more serious
failure.

## The removal option

**If nothing truthful and specific can be written for a city, that city should not have a page.**

Removal is a legitimate and _preferred_ outcome over padding. Say so plainly rather than reaching for
filler. `docs/content-standards.md` §3 makes this explicit.

Removing a location is data-driven: drop the entry from the `locations` array in
`lib/site-config.ts` and the route, the areas index, the link mesh and the sitemap all follow. Note
that the URL then 404s — flag it so a redirect can be considered at the zone level, since a static
export cannot issue one.

## Sourcing discipline

Every claim needs a **source column** in `docs/city-briefs.md`:

| City    | Claim                                   | Type      | Source                                                   | Status |
| ------- | --------------------------------------- | --------- | -------------------------------------------------------- | ------ |
| bat-yam | Coastal salt air accelerates anode wear | technical | general corrosion principle, coastal location verifiable | ✅     |
| …       |                                         |           |                                                          |        |

Three tiers, and label which you are using:

- **✅ Verifiable general fact** — coastal geography, the physics of anode corrosion, typical Israeli
  building patterns. Safe.
- **🔶 Plausible but unverified** — a specific claim about a city's boiler mix that you reasoned to
  rather than confirmed. Mark it, add a row to `docs/business-facts.md`, and prefer softer phrasing.
- **❌ Business fact** — anything about _our_ presence, staff, speed or coverage in that city. Never
  write it.

Reason from geography and building type, both of which are checkable. **Do not invent statistics.**
"רוב הבניינים ב\<עיר\> מצוידים ב…" needs a source or it needs softening to a qualitative statement
that is defensibly true.

## Where the output goes

`docs/city-briefs.md` — the research, per city, with sources.

Then a typed `cityContent` map in `lib/content.ts` keyed by `LocationSlug`. **Copy lives in the
content layer, never typed into JSX**, and the route reads from it. That way all 18 cities stay
consistent in structure while differing in substance.

## The 18

tel-aviv · jerusalem · haifa · rishon-lezion · petah-tikva · netanya · ashdod · beer-sheva · holon ·
bnei-brak · ramat-gan · rehovot · herzliya · kfar-saba · modiin · bat-yam · raanana · ashkelon

Coastal (corrosion material available): haifa · netanya · ashdod · bat-yam · ashkelon — and
tel-aviv, herzliya and rishon-lezion have coastline too, so judge by actual exposure rather than
reaching.

Do **not** add a 19th until all 18 clear the bar.

## Grammar

`ב` + city everywhere: `תיקון דודים בבת ים`. The city string feeds the title, H1, meta description
and JSON-LD, so a wrong form propagates to four places. Any non-default prefix form is stored in
`lib/site-config.ts` beside the name — never conditionally at the call site.
