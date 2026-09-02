---
name: city-research
description: How to source genuinely city-specific, checkable material for hambabait's 18 location pages — the four legitimate material types (housing stock and boiler mix, roof and access realities, coastal corrosion and anode wear, city-specific FAQs), the banned padding patterns, the rule that a city with nothing truthful to say should lose its page rather than gain filler, and the source tiers every claim must survive. The cityContent map already carries an answer block, ≥2 profile paragraphs, FAQs and nearby links for all 18, so this is now about deepening an entry or researching a genuine 19th. Use before writing or deepening any location page. Triggers: "research this city", "city-specific content", "what can we say about <city>", "doorway pages", "city briefs", "is this city page thin".
---

# City research — the material that keeps 18 pages off the doorway line

## Where the silo actually stands

The templated era is over. `lib/content.ts` carries a `cityContent: Record<LocationSlug, CityContent>`
map with an entry for **every one of the 18 cities**:

```ts
export interface CityContent {
  answer: { question: string; body: string }; // question-form H2 + a self-contained answer
  profile: string[]; // ≥2 paragraphs impossible to write about another city
  faqs: Faq[];
  nearby: LocationSlug[]; // city→city links; none existed anywhere before this
}
```

Measured in the current build: 18 answer blocks (bodies 32–47 words, no duplicate question, no
duplicate body), 18 `nearby` arrays holding 2–4 entries each (50 city→city links total, none below 2),
and area-scoped `Service` + `BreadcrumbList` JSON-LD on all 18 pages.

So the job is no longer "introduce per-city content". It is **deepen an entry that is thinner than its
siblings, or research a genuine 19th** — and the bar and the sourcing discipline below are what made
the first 18 defensible. They have not relaxed.

## Two risks that never go away

- **Ranking** — near-duplicate pages compete with each other, dilute the silo, and can be filtered out
  of the index entirely. Depth is what prevents that, and depth decays if a new entry is written to a
  lower standard than the existing ones.
- **Claims** — a location page telling a specific city it gets fast local service is backed by no
  address, no geo and no coverage data. See `docs/business-facts.md` §3.6.

## The bar

> **≥2 paragraphs per city that could not be written about any other city.**

Test it the hard way: swap the city name for another city's. If the paragraph still reads as true, it
is not city-specific and it does not count. That is what `CityContent.profile` is typed for, and it is
the check to run on an existing entry before deciding it is fine.

The `answer` block is held to the same standard: `"מה משנה בתיקון דודים ב<עיר>?"` must have an answer
that is genuinely about that city, not the generic one with a name substituted.

## The four legitimate material types

The 18 shipped entries were built from four discriminators, recorded in the header comment above
`cityContent`: coastal vs inland, altitude and climate, water hardness, and building-stock age.

### 1. Housing stock and boiler mix

Where solar dominates versus electric or pressure systems. Older building stock versus new
construction. Apartment blocks with shared solar arrays versus private roofs.

This is **technical and checkable**, and it genuinely changes what a repair visit involves. It is the
richest of the four. Tel Aviv's low-rise-with-private-roof versus tower-with-electric split is the
worked example in the data.

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

A question a resident of that city would actually ask, with an answer specific to it. Usually
downstream of the first three — shared solar arrays, roof access, corrosion, a Jerusalem winter that
shifts the whole load onto the electric element.

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
| "N% of buildings in \<city\> have…"            | **no source in this repo** for any such proportion   |
| Weather or tourism colour                      | not why the reader is on the page                    |

The claims rows are not merely thin — they are fabricated business facts, which is the more serious
failure. Proportions in the shipped entries stay **qualitative on purpose** for exactly this reason.

## The removal option

**If nothing truthful and specific can be written for a city, that city should not have a page.**

Removal is a legitimate and _preferred_ outcome over padding. Say so plainly rather than reaching for
filler. `docs/content-standards.md` §3 makes this explicit.

Removing a location is data-driven: drop the entry from the `locations` array in `lib/site-config.ts`
and from `cityContent` (the map is a total `Record<LocationSlug, …>`, so the two must move together or
the build fails), and the route, the areas index, the link mesh and the sitemap all follow. Then:

- prune the removed slug from every other city's `nearby` array;
- delete its line from `public/llms.txt`, which is hand-maintained;
- flag that the URL now 404s so a redirect can be considered **at the zone level** — a static export
  cannot issue one.

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

Then into the `cityContent` entry in `lib/content.ts`, keyed by `LocationSlug`. **Copy lives in the
content layer, never typed into JSX**, and `app/locations/[city]/page.tsx` reads from it. That is what
keeps all 18 consistent in structure while differing in substance.

`cityContent` is a **total** `Record`, not a `Partial` — a new `LocationSlug` with no entry is a
type error, not a silent fallback. That is deliberate: it makes shipping an empty city page impossible.

## The 18

tel-aviv · jerusalem · haifa · rishon-lezion · petah-tikva · netanya · ashdod · beer-sheva · holon ·
bnei-brak · ramat-gan · rehovot · herzliya · kfar-saba · modiin · bat-yam · raanana · ashkelon

Coastal (corrosion material available): haifa · netanya · ashdod · bat-yam · ashkelon — and
tel-aviv, herzliya and rishon-lezion have coastline too, so judge by actual exposure rather than
reaching.

Do **not** add a 19th until all 18 clear the bar, and check that against the current entries rather
than assuming — the entries exist, which is not the same as all of them being equally strong.

## Grammar

`ב` + city everywhere: `תיקון דודים בבת ים`. The city string feeds the title, H1, meta description
and JSON-LD, so a wrong form propagates to four places. Any non-default prefix form is stored in
`lib/site-config.ts` beside the name — never conditionally at the call site.
