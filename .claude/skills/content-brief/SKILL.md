---
name: content-brief
description: The brief every hambabait page must have before a word of Hebrew is written — intent and cluster across the four page types (service, location, guide, static), the cannibalisation guard sentence naming what the page does and does not own, required sections including the self-contained answer block, the must-not-contain claims list, exact internal link targets, and the title/description formulas that must not append the brand. Use before deepening a service or city page, writing a new guide, or filling one of the eight static routes that still has no answer block. Triggers: "content brief", "what should this page cover", "brief the copywriter", "outline this page", "before we write".
---

# Content brief — the gate before writing

A page without a brief gets written twice. Write the brief, get it agreed, then hand it to
`hebrew-copywriter`.

**The brief is where a bad claim is cheapest to stop.** Once copy exists, softening it feels like
losing work; in a brief it is one line.

## Before you write the brief

1. Read `docs/keyword-map.md` — the intent may already be owned. There are now **four** silos competing
   for one, not two: 6 services, 18 locations, 12 guides, 9 static.
2. Read `docs/content-standards.md` — the page-type bar.
3. Read `docs/business-facts.md` — what may not be claimed.
4. Read `docs/manifest-assumptions.md` — the six roster values flagged `_needsConfirmation`, which the
   repo's `site.config.json` drops. Manifest-sourced is not client-confirmed.
5. Read the two nearest sibling pages. The brief must say how this page differs from them.

## Where the content model puts the output

The brief names a page; the copy lands in a **typed structure**, never in JSX:

| Page type | Structure                                | Shape                                                                         |
| --------- | ---------------------------------------- | ----------------------------------------------------------------------------- |
| service   | `serviceDepth[slug]` (`lib/content.ts`)  | `answer` · `symptoms[]` · `onSite[]` · `repairVsReplace` · `faqs` · `related` |
| location  | `cityContent[slug]` (`lib/content.ts`)   | `answer` · `profile[]` · `faqs` · `nearby`                                    |
| guide     | a `Guide` object (`lib/guides.ts`)       | `answer` · `blocks[]` · `faqs` · `relatedServices` · `published`/`updated`    |
| static    | page-specific exports (`lib/content.ts`) | varies — and **none of the 9 carries an answer block today**                  |

`serviceDepth` and `cityContent` are **total `Record`s**, so a brief for a new slug implies a typecheck
failure until the copy exists. Say so in the brief; it is not optional work.

## The template

```markdown
# Brief — <route>

**Intent:** <one sentence — what the reader is trying to do>
**Cluster:** symptom | comparison | definition | seasonal | service | location
**Page type:** service | location | guide | static → <the exact typed structure it lands in>
**Primary query:** …
**Supporting queries:** …
**Owns:** <the queries this page is the single owner of>
**Does NOT own:** <the adjacent queries a sibling owns — the cannibalisation guard>

## Reader state

Where they are when they land. What they already know. What they are worried about.
For most commercial pages here: no hot water right now, mildly stressed, on a phone.
For a guide: not yet ready to call — reading to find out whether they need to.

## Required sections

1. **Answer block** — question-form H2, then a self-contained answer (~30–60 words)
2. …
   (For a service page, per content-standards §3: what the fault is → symptoms the reader
   recognises → what the technician does on site → repair vs replace → FAQs → links out)

## Must contain

- [ ] one table or ordered list — name which, and what it compares
- [ ] N FAQs, answer-first
- [ ] internal links: <exact routes, and the reason for each>
- [ ] ≥2 paragraphs impossible to write about a sibling (location pages)
- [ ] a line in public/llms.txt (new routes only — it is hand-maintained)

## Must NOT contain

- [ ] warranty terms, price, response time, licence, insurance, rating, review, years
- [ ] any claim the body does not support
- [ ] anything a find-and-replace could regenerate from a sibling
- [ ] a re-hardening of a claim that was deliberately softened (see below)

## Title / description

Title (pre-template, brand NOT appended): …
Description (140–160 chars, unique, no claim the body doesn't make): …

## Open questions

🔶 <anything needing owner confirmation> → row added to docs/business-facts.md
```

## The must-not-contain list is not boilerplate

Copy it into every brief and mean it. Never brief a page to claim:

years in business · job or customer counts · prices or any implication of cost · warranty terms,
duration or scope · response times or arrival guarantees · licences, insurance, certifications ·
ratings, reviews, testimonials · technician credentials or headcount

The site claims **none** of these. That restraint is deliberate and it is the site's most valuable
asset. `npm run qa:gate` fails the build output if `aggregateRating`, `reviewCount`, `ratingValue`,
`foundingDate` or `warrantyPromise` reaches the markup — but the gate only catches the schema shape, not
a sentence of Hebrew. The brief is the real control.

### Three claims that were softened — do not re-harden them

| Claim            | Then                                                                | Now                                                                                                                                                                            |
| ---------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The warranty     | asserted on ~15 surfaces, incl. the manifest `shortPitch` → JSON-LD | **1 surface**: a homepage FAQ saying the terms are stated before work begins. The `shortPitch` was softened in the roster and synced, so it no longer reaches structured data. |
| Same-day arrival | `differentiators`, the homepage FAQ, and all 18 city pages          | reframed to "we will tell you the realistic timing", with no arrival promise                                                                                                   |
| "כשעה עד שעתיים" | the only hard number on the site                                    | replaced by the shape of the visit, no duration                                                                                                                                |

Each softened site carries a `// 🔶 confirm` comment pointing at `docs/business-facts.md`. **A brief
that touches one of those pages must not walk it back**, and a brief that adds a new surface for any of
them is wrong on its face. The one remaining warranty sentence is deliberately the weakest true version;
do not deepen it until the owner supplies real terms.

## The cannibalisation guard

Every brief needs an **Owns / Does NOT own** pair. One sentence, but it is the reason the page will not
fight a sibling. With a knowledge hub in play this now matters in two directions, not one.

Examples:

- `/services/thermostat/` — _Owns_ תרמוסטט לדוד, החלפת תרמוסטט (commercial intent). _Does not own_ אלמנט
  שרוף → `/services/heating-element/`, nor "how does a thermostat work" → `/מדריכים/how-thermostat-works/`.
  Cross-link on the shared symptom and say which fault each page covers.
- `/services/leak-repair/` — _Owns_ נזילה בדוד, דוד מטפטף. _Does not own_ החלפת דוד → `/services/replacement/`,
  nor the diagnostic walk-through → `/מדריכים/leaking-boiler/`. Boundary: repairable fitting or
  connection vs. a failed tank.
- `/locations/bat-yam/` — _Owns_ תיקון דודים בבת ים. _Does not own_ the service-level queries; it links to them.
- `/מדריכים/repair-or-replace/` — _Owns_ the decision question. _Does not own_ "החלפת דוד" as a job → that
  is `/services/replacement/`, which the guide links.

**Guide vs service is the live cannibalisation risk on this site.** A guide answers; a service page
sells. If a brief cannot state which side of that line the page is on, it is not ready.

## The answer block

Question-form H2, then a **self-contained** answer that stands without the rest of the page. Specify the
exact question in the brief — do not leave the copywriter to invent it.

This is the block AI Overviews, ChatGPT and Perplexity lift. An answer that needs the following
paragraph to make sense gets skipped entirely.

On length: the 36 shipped blocks run **32–47 words** (median 39). An earlier hard 40–60 floor was
deliberately widened — self-contained and extractable is the bar; **~30–60 words is guidance, not a
gate**. Padding to clear a number is how an unsourced claim gets in. See `aeo-answer-content`.

**36 of the 45 indexable pages carry an answer block** — all 6 services, all 18 cities, all 12 guides.
The 9 without are the static routes. Briefs for `/מחירון/`, `/שירותים/` and `/איזורי-שירות/` are
worthwhile open work; the two legal pages and `/צור-קשר/` do not need one.

> ⚠️ **A `/מחירון/` answer block must not state a price or a pricing approach.** The pricing approach is
> one of the six unconfirmed roster assumptions in `docs/manifest-assumptions.md`. Brief it as "how the
> price is arrived at is explained on site before work begins" — never as a method presented as settled.

## Location-page briefs need real material

Do not brief a city page without naming **what is specifically true about that city**. Legitimate:
housing stock and boiler mix, roof access in low-rise vs high-rise, shared solar arrays on apartment
blocks, coastal corrosion and anode wear (Bat Yam, Ashdod, Netanya, Ashkelon, Haifa), altitude and
winter load (Jerusalem), water hardness (the south).

Not acceptable: synonym spinning, population figures, neighbourhood lists, distance padding, invented
proportions ("N% of buildings in X"), or any claim of a local branch, local technician or per-city
response time.

All 18 cities already have this material; a brief that deepens one must say **what is missing from the
current entry**, not restate it. **If you cannot fill this section truthfully for a new city, do not
write the brief** — report that the city may not warrant a page. Removal is a legitimate and preferred
outcome over padding (`docs/content-standards.md` §3).

## Where the brief lives

`docs/briefs/<route>.md`. Keep it after the page ships — the next person to edit that page needs to know
what it was for, and what it deliberately does not own.

## Handoff

Brief → `hebrew-copywriter` writes into `lib/content.ts` or `lib/guides.ts` (never JSX) →
`editorial-reviewer` checks it against `docs/content-standards.md` §7 → the five-command gate
(`lint`, `typecheck`, `format:check`, `build`, `qa:gate`). Do not skip the review step; it is the only
thing between a draft and production.
