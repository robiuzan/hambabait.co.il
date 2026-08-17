---
name: aeo-answer-content
description: Answer-engine and LLM-citability layer for hambabait — question-form H2s with a 40–60 word extractable answer first, definition and comparison blocks for דוד שמש vs דוד חשמל, symptom-to-cause tables, llms.txt, entity clarity with an empty sameAs and no address, and the freshness/authorship signals the site currently has none of. Use when optimizing a page to be quoted by AI Overviews, ChatGPT or Perplexity. Triggers: "AEO", "GEO", "AI Overviews", "llms.txt", "will an LLM cite this", "answer block", "AI crawlers", "featured snippet".
---

# Answer-engine optimization

Classic SEO asks whether a page ranks. AEO asks whether a machine can **find the answer, lift it
cleanly, and attribute it to this business**. The two overlap but fail differently.

## Why this site is hard to cite today

Be honest about the starting position:

- **Weak entity.** No address, no geo, `sameAs` is empty, no Google Business Profile, no reviews.
  An answer engine has almost nothing to bind "חם בבית" to as a real-world entity, and no corroborating
  source anywhere else on the web.
- **No authorship or dates.** No author, no reviewer, no `datePublished`/`dateModified` on anything.
  Freshness and authority signals are absent, not weak.
- **No editorial content.** There are 6 service pages, 18 near-identical location pages and 7 static
  pages. There is no knowledge hub, so there is nothing shaped like the explanatory content answer
  engines quote.
- **Thin extractability.** Copy is marketing-voiced continuous prose. Very little is in the
  question → short-answer form a model can lift.

The fix order is: extractable answers on existing pages → entity clarity → editorial depth.

## The answer block — the core pattern

For any question a customer actually asks, the page should contain:

```
## למה הדוד שמש לא מתחמם?          ← H2 in the user's question form
<40–60 word direct answer, first paragraph, no preamble>
<then the detail, causes, what to check, when to call>
```

Rules that make the difference:

- **The answer comes first.** No "בחברת חם בבית אנחנו מאמינים…" throat-clearing before the substance.
  A model lifts the first paragraph after the heading.
- **40–60 words.** Long enough to be complete, short enough to quote whole.
- **Self-contained.** It must make sense with zero surrounding context — no "כפי שציינו למעלה".
- **The H2 is the question verbatim**, phrased the way a person types or speaks it.
- One question per H2. Do not bundle three questions under one heading.

## Formats that get lifted

**Definition blocks** — for the entity terms this business owns:
`דוד שמש`, `דוד חשמל`, `דוד משולב`, `תרמוסטט`, `אלמנט חימום`, `אנודה`.
One tight paragraph each, starting with "X הוא…".

**Comparison blocks** — `דוד שמש` vs `דוד חשמל`, repair vs replacement. Use a real `<table>` with a
header row. Tables are lifted far more reliably than prose comparisons, and they render as featured
snippets.

**Symptom → likely cause tables** — the highest-value asset this site could build. "אין מים חמים
בכלל", "מים פושרים", "נזילה מהדוד", "הדוד מפיל את החשמל" → probable cause → which service page.
It is genuinely useful, it is naturally citable, and it doubles as an internal-linking layer.

**Numbered procedures** — "מה לבדוק לפני שקוראים לטכנאי" as an ordered list. Steps get lifted as
how-to answers.

**FAQ blocks** — with matching `FAQPage` JSON-LD, and only where the FAQs are visible on that page.

## The claims constraint — read this before writing

An answer block is a _factual assertion_ in the most quotable form available. That makes it the worst
possible place for an unsourced claim.

**Do not write answer blocks that assert:** warranty terms, response times, same-day arrival, repair
duration, prices, technician credentials, years in business. All of those are currently unsourced —
see `docs/business-facts.md` §3.

**Do write answer blocks about the domain**: how a solar boiler works, why an element fails, what an
anode does, what a thermostat fault looks like, when repair beats replacement. Technical knowledge is
citable, verifiable and safe. That is the material this site should compete on.

A model that quotes a fabricated warranty term attaches it to the brand permanently. Domain
expertise is the only safe citation surface here.

## Entity clarity

For an answer engine to attribute anything, the entity must be unambiguous:

- **Name consistently.** "חם בבית" everywhere, in the same form. `alternateName: "Cham BaBait"` is
  already in the JSON-LD.
- **`sameAs` is empty and that is the biggest gap.** The moment a Google Business Profile or any
  social profile exists, add its URL to the manifest so it ships in the JSON-LD. That single link is
  what binds the site to a corroborated entity.
- **Structured data is the machine-readable summary.** Today only 7 of 33 pages emit any. The 18
  location pages emit none, and `BreadcrumbList` is never emitted despite the crumb data existing.
  Fixing that is AEO work as much as SEO work — see `schema-structured-data`.
- Keep NAP byte-identical across site, schema and any future profile.

## llms.txt

There is none. Adding `public/llms.txt` is cheap: a short Markdown map of what the site covers and
where the canonical pages are.

```
# חם בבית — תיקון דודים

תיקון והחלפת דודים בכל הארץ: דוד שמש, דוד חשמל, תרמוסטט, אלמנט, נזילות.

## שירותים
- /services/solar/ — תיקון דוד שמש
...
## אזורי שירות
- /איזורי-שירות/ — 18 ערים
```

Treat it as a courtesy map, not a ranking lever, and keep it truthful — it is subject to exactly the
same claims rules as the pages.

## Crawler access

Check what actually reaches the site rather than assuming:

- `app/robots.ts` emits `Allow: /` with nothing disallowed — no AI crawler is blocked at the robots
  layer.
- The site now sits behind **Cloudflare**, whose zone-level bot and AI-crawler controls can block
  major AI user-agents regardless of `robots.txt`. Those are zone settings and **the owner's to
  change** — document the toggle, never assume it was flipped.

```bash
curl -s -A "GPTBot" -o /dev/null -w '%{http_code}\n' https://hambabait.co.il/
curl -s -A "PerplexityBot" -o /dev/null -w '%{http_code}\n' https://hambabait.co.il/
```

A 403 there means the zone is blocking, not the site.

## Freshness and authorship

Nothing on the site carries a date or an author. For citability, the additions that matter are a
`dateModified` on substantive pages and a named person standing behind technical content. Both need
owner input — do not invent an author, and do not stamp a `dateModified` that no edit corresponds to.

## Checklist

- [ ] Every substantive page has ≥1 question-form H2 with a 40–60 word answer first
- [ ] Answers are self-contained and quote cleanly
- [ ] Comparisons are real tables
- [ ] No unsourced claim inside any answer block
- [ ] FAQ blocks match visible content and carry `FAQPage`
- [ ] NAP consistent; `sameAs` updated the moment a profile exists
