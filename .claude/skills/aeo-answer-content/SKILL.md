---
name: aeo-answer-content
description: Answer-engine and LLM-citability layer for hambabait — the answer block that already ships on 36 of 45 indexable pages and the nine that still lack one, question-form H2s with a self-contained extractable answer first, definition and comparison blocks for דוד שמש vs דוד חשמל, symptom-to-cause tables, the hand-maintained llms.txt at full sitemap coverage, entity clarity with an empty sameAs and no address, and the freshness/authorship signals that exist on the guides and nowhere else. Use when optimizing a page to be quoted by AI Overviews, ChatGPT or Perplexity. Triggers: "AEO", "GEO", "AI Overviews", "llms.txt", "will an LLM cite this", "answer block", "AI crawlers", "featured snippet".
---

# Answer-engine optimization

Classic SEO asks whether a page ranks. AEO asks whether a machine can **find the answer, lift it
cleanly, and attribute it to this business**. The two overlap but fail differently.

## Where the site actually stands

The extractability work is largely done; the entity work is not.

**Built:**

- **36 of the 45 indexable pages carry an answer block** — 6 services (`serviceDepth[].answer`),
  18 cities (`cityContent[].answer`) and 12 guides (`Guide.answer`), all `{ question, body }` in the
  content layer. Zero duplicate questions, zero duplicate bodies.
- **Editorial content exists.** `/מדריכים/` ships 12 guides across symptom, comparison, definition and
  seasonal clusters — the explanatory shape answer engines quote.
- **Structured data is complete.** All 45 indexable pages emit JSON-LD; only the 404 and `/תודה/` are
  bare, both correctly. `FAQPage` on 37, `BreadcrumbList` on 44, `Article` on the 12 guides,
  `WebSite` on the homepage.
- **`public/llms.txt` exists** at 45/45 sitemap coverage.
- **Dates and authorship exist on the guides** — real `datePublished`/`dateModified`, attributed to the
  business.

**Still weak:**

- **Entity.** No address, no geo, `sameAs` is `[]`, no Google Business Profile, no reviews. An answer
  engine has almost nothing to bind "חם בבית" to as a real-world entity, and no corroborating source
  anywhere else on the web. **This is now the binding constraint, not extractability.**
- **Nine indexable pages carry no answer block** — the nine static routes. `/מחירון/`, `/שירותים/` and
  `/איזורי-שירות/` would each benefit from one and are a deliberate open item (they need a content
  brief and a decision about which component renders it). The two legal pages and `/צור-קשר/` do not
  need one.
- **Dates and authorship outside the hub.** Service and location pages carry neither, which is a
  defensible choice for commercial pages — see `content-refresh`.

Fix order from here: entity clarity → the three missing answer blocks → depth on what exists.

## The answer block — the core pattern

For any question a customer actually asks, the page should contain:

```
## למה הדוד שמש לא מתחמם?          ← H2 in the user's question form
<a short, self-contained direct answer, first paragraph, no preamble>
<then the detail, causes, what to check, when to call>
```

Rules that make the difference:

- **The answer comes first.** No "בחברת חם בבית אנחנו מאמינים…" throat-clearing before the substance.
  A model lifts the first paragraph after the heading.
- **Self-contained.** It must make sense with zero surrounding context — no "כפי שציינו למעלה".
- **The H2 is the question verbatim**, phrased the way a person types or speaks it.
- One question per H2. Do not bundle three questions under one heading.

### On length

The 36 shipped bodies run **32–47 words** (mean 38.8, median 39): 22 under 40, 14 in the 40–60 band,
none over 60.

An earlier version of this skill imposed a hard 40–60 word floor. That floor was **deliberately
widened** — the shipped bodies are self-contained, they answer their question completely, and
rewriting sound Hebrew to clear a self-imposed number is churn with fabrication risk attached: padding
an answer is exactly how an unsourced claim gets in.

> **The bar is self-contained and extractable. Roughly 30–60 words is guidance, not a gate.**

Over 60 words starts to be too long to quote whole; that is the end worth watching.

## Formats that get lifted

**Definition blocks** — for the entity terms this business owns:
`דוד שמש`, `דוד חשמל`, `דוד משולב`, `תרמוסטט`, `אלמנט חימום`, `אנודה`.
One tight paragraph each, starting with "X הוא…". The `definition` cluster in the hub is their home —
`what-is-anode`, `how-thermostat-works`, `how-solar-boiler-works` already cover three.

**Comparison blocks** — `דוד שמש` vs `דוד חשמל`, repair vs replacement. Use a real `<table>` with a
header row and a `<caption>`. Tables are lifted far more reliably than prose comparisons, and they
render as featured snippets. Both comparisons have a guide (`solar-vs-electric`, `repair-or-replace`);
the `GuideBlock` table kind is fixed at two columns.

**Symptom → likely cause tables** — the highest-value asset on the site, and it exists: `SymptomRow`
in `lib/content.ts` gives each of the 6 service pages its own symptom table, and the symptom-cluster
guides carry more. Extend those rather than inventing a parallel structure.

**Numbered procedures** — "מה לבדוק לפני שקוראים לטכנאי" as an ordered list. Steps get lifted as
how-to answers. In the hub that is `{ kind: "list", ordered: true }`.

**FAQ blocks** — with matching `FAQPage` JSON-LD, and only where the FAQs are visible on that page.

## The claims constraint — read this before writing

An answer block is a _factual assertion_ in the most quotable form available. That makes it the worst
possible place for an unsourced claim.

**Do not write answer blocks that assert:** warranty terms, response times, same-day arrival, repair
duration, prices, technician credentials, years in business. All of those are currently unsourced —
see `docs/business-facts.md` §3.

This applies with particular force to any future `/מחירון/` answer block: **it must not state a price
or a pricing approach.** The pricing approach is one of the six unconfirmed roster assumptions
recorded in `docs/manifest-assumptions.md`.

**Do write answer blocks about the domain**: how a solar boiler works, why an element fails, what an
anode does, what a thermostat fault looks like, when repair beats replacement, what a city's housing
stock means for the job. Technical knowledge is citable, verifiable and safe. That is the material
this site competes on.

A model that quotes a fabricated warranty term attaches it to the brand permanently. Domain expertise
is the only safe citation surface here.

## Entity clarity — now the biggest gap

For an answer engine to attribute anything, the entity must be unambiguous:

- **Name consistently.** "חם בבית" everywhere, in the same form. `alternateName: "Cham BaBait"` is
  already in the JSON-LD.
- **`sameAs` is `[]` and that is the single biggest remaining gap.** The moment a Google Business
  Profile or any social profile exists, add its URL to the **roster** manifest and sync it, so it ships
  in the JSON-LD. That one link is what binds the site to a corroborated entity. See `gbp-local-listings`.
- **Structured data is the machine-readable summary, and it is complete** — 45/45 indexable pages. The
  remaining schema work is depth, not coverage. See `schema-structured-data`.
- Keep NAP byte-identical across site, schema and any future profile.

## llms.txt

`public/llms.txt` exists (copied to `out/llms.txt` by the export) and covers **all 45 sitemap URLs**,
grouped: ראשי · שירותים · אזורי שירות · מדריכים (sub-grouped by cluster) · דפים נוספים. URLs are written
raw UTF-8 there while the sitemap percent-escapes them — compare after `decodeURI` when auditing, or
every Hebrew route reads as missing.

**It is hand-maintained.** Nothing derives it from the data arrays, so a new route that does not get a
line added drops coverage silently. That is the failure mode to check for, not absence of the file.

Treat it as a courtesy map, not a ranking lever, and keep it truthful — it is subject to exactly the
same claims rules as the pages.

## Crawler access

Check what actually reaches the site rather than assuming:

- `app/robots.ts` emits `Allow: /` for `*` **plus an explicit allow block for 11 named AI crawlers** —
  the fleet-wide list (OAI-SearchBot, ChatGPT-User, Claude-User, Claude-SearchBot, PerplexityBot,
  Perplexity-User, GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot). `User-agent: *`
  already permits them, so the block is **declarative, not enforcing**: it makes the stance visible and
  survives a platform default changing underneath.
- The site sits behind **Cloudflare**, whose zone-level bot and AI-crawler controls can **prepend a
  managed block that overrides everything in `robots.ts`** — it did exactly that across this fleet
  until 2026-08. Those are zone settings and **the owner's to change**; document the toggle, never
  assume it was flipped.

```bash
curl -sS -H 'Cache-Control: no-cache' "https://hambabait.co.il/robots.txt?cb=$RANDOM"
curl -s -A "GPTBot" -o /dev/null -w '%{http_code}\n' https://hambabait.co.il/
curl -s -A "PerplexityBot" -o /dev/null -w '%{http_code}\n' https://hambabait.co.il/
```

A 403 there means the zone is blocking, not the site.

## Freshness and authorship

The 12 guides carry a visible `עודכן ב־<dd/mm/yyyy>` line, a matching `dateModified`, and
`author`/`publisher` pointing at the business. The guides are also the only sitemap entries whose
`lastModified` is a real date rather than build time.

Everything else on the site carries neither, by choice. If dates are extended to other page types,
they must reflect a real substantive edit — and **never invent an author**. See `content-refresh`.

## Checklist

- [ ] The page has ≥1 question-form H2 with a self-contained answer first
- [ ] The answer quotes cleanly with zero surrounding context; roughly 30–60 words
- [ ] Comparisons are real tables with a caption
- [ ] No unsourced claim inside any answer block — and no price or pricing approach on `/מחירון/`
- [ ] FAQ blocks match visible content and carry `FAQPage`
- [ ] Any new route has a line in `public/llms.txt`
- [ ] NAP consistent; `sameAs` updated in the roster the moment a profile exists
