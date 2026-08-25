---
name: content-brief
description: The brief every hambabait page must have before a word of Hebrew is written — intent and cluster, the cannibalisation guard sentence naming what the page does and does not own, required sections including the 40–60 word answer block, the must-not-contain claims list, exact internal link targets, and the title/description formulas that must not append the brand. Use before deepening a service or city page or writing a new guide. Triggers: "content brief", "what should this page cover", "brief the copywriter", "outline this page", "before we write".
---

# Content brief — the gate before writing

A page without a brief gets written twice. Write the brief, get it agreed, then hand it to
`hebrew-copywriter`.

**The brief is where a bad claim is cheapest to stop.** Once copy exists, softening it feels like
losing work; in a brief it is one line.

## Before you write the brief

1. Read `docs/keyword-map.md` — the intent may already be owned.
2. Read `docs/content-standards.md` — the page-type bar.
3. Read `docs/business-facts.md` — what may not be claimed.
4. Read the two nearest sibling pages. The brief must say how this page differs from them.

## The template

```markdown
# Brief — <route>

**Intent:** <one sentence — what the reader is trying to do>
**Cluster:** symptom | comparison | definition | service | location | seasonal
**Primary query:** …
**Supporting queries:** …
**Owns:** <the queries this page is the single owner of>
**Does NOT own:** <the adjacent queries a sibling owns — the cannibalisation guard>

## Reader state

Where they are when they land. What they already know. What they are worried about.
For most pages here: no hot water right now, mildly stressed, on a phone.

## Required sections

1. **Answer block** — question-form H2, then 40–60 self-contained words
2. …
   (For a service page, per content-standards §3: what the fault is → symptoms the reader
   recognises → what the technician does on site → repair vs replace → FAQs → links out)

## Must contain

- [ ] one table or ordered list — name which, and what it compares
- [ ] N FAQs as question-form H2s, answer-first
- [ ] internal links: <exact routes, and the reason for each>
- [ ] ≥2 paragraphs impossible to write about a sibling (location pages)

## Must NOT contain

- [ ] warranty terms, price, response time, licence, insurance, rating, review, years
- [ ] any claim the body does not support
- [ ] anything a find-and-replace could regenerate from a sibling
- [ ] the existing unsourced claims (see below)

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

The site currently claims **none** of these. That restraint is deliberate and it is the site's most
valuable asset.

### Do not propagate the three that already leaked

| Claim            | Already at                                                            |
| ---------------- | --------------------------------------------------------------------- |
| The warranty     | ~15 surfaces, incl. the manifest `shortPitch` → JSON-LD `description` |
| Same-day arrival | `lib/content.ts:84`, `:186-187`, and all 18 city pages                |
| "כשעה עד שעתיים" | `lib/content.ts:167` — the only hard number on the site               |

A brief that rewrites a page containing one of these should say **soften it**, explicitly. Rewriting is
the opportunity; a brief that stays silent lets the claim survive another generation.

## The cannibalisation guard

Every brief needs an **Owns / Does NOT own** pair. One sentence, but it is the reason the page will
not fight a sibling.

Examples:

- `/services/thermostat/` — _Owns_ תרמוסטט לדוד, החלפת תרמוסטט. _Does not own_ אלמנט שרוף → that is
  `/services/heating-element/`. Cross-link on the shared symptom (water not heating) and say which
  fault each page covers.
- `/services/leak-repair/` — _Owns_ נזילה בדוד, דוד מטפטף. _Does not own_ החלפת דוד → that is
  `/services/replacement/`. Boundary: repairable fitting or connection vs. a failed tank.
- `/locations/bat-yam/` — _Owns_ תיקון דודים בבת ים. _Does not own_ the service-level queries; it links
  to them.

## The answer block is mandatory

Question-form H2, then **40–60 self-contained words** that answer it without needing the rest of the
page. Count them.

This is the block AI Overviews, ChatGPT and Perplexity lift. "Roughly right" does not work — an answer
that needs the following paragraph to make sense gets skipped entirely.

Specify the exact question in the brief. Do not leave the copywriter to invent it.

## Location-page briefs need real material

Do not brief a city page without naming **what is specifically true about that city**. Legitimate:
housing stock and boiler mix, roof access in low-rise vs high-rise, shared solar arrays on apartment
blocks, coastal corrosion and anode wear (Bat Yam, Ashdod, Netanya, Ashkelon, Haifa).

Not acceptable: synonym spinning, population figures, neighbourhood lists, distance padding, or any
claim of a local branch, local technician or per-city response time.

**If you cannot fill this section truthfully, do not write the brief.** Report that the city may not
warrant a page. Removal is a legitimate and preferred outcome over padding — see
`docs/content-standards.md` §3.

## Where the brief lives

`docs/briefs/<route>.md`. Keep it after the page ships — the next person to edit that page needs to
know what it was for, and what it deliberately does not own.

## Handoff

Brief → `hebrew-copywriter` writes into `lib/content.ts` (never JSX) → `editorial-reviewer` checks it
against `docs/content-standards.md` §7 → build gate. Do not skip the review step; it is the only thing
between a draft and production.
