---
name: keyword-research-il
description: Hebrew keyword research method for חם בבית — the ב+city grammar rule that propagates to four places, כתיב מלא/חסר spelling variance and the דוד/דודים plural, intent classing across the symptom, comparison, definition, seasonal and commercial clusters, mapping every intent to exactly one of the 45 existing URLs across four silos, the guide-vs-service cannibalisation boundary the knowledge hub introduced, and the honesty rule that no volume or difficulty number may be quoted because no keyword tool is wired into this repo. Use when deciding what a page should target or whether a query already has a home. Triggers: "keyword research", "what should this page rank for", "search volume", "long tail", "query variants", "is this keyword taken".
---

# Hebrew keyword research — חם בבית

## The honesty rule, first

**No keyword tool is wired into this repo.** There is no Ahrefs, no Semrush, no Keyword Planner export,
no volume data of any kind.

So: **never quote a search volume, a difficulty score or a traffic estimate as fact.** If you cite a
number, name the source and your confidence. A ranked qualitative judgement you can defend is worth more
than a fabricated metric that gets planned against for six months.

What you _can_ do honestly: read the SERP, read autocomplete and People-Also-Ask, read competitor
headings, and reason from intent. That is enough to make good decisions here.

## The one rule that outranks everything

> **One intent, one URL.**

Before targeting any query, find out whether a page already owns it. If one does, the answer is
**deepen that page**, not build a sibling. Two pages chasing one query cannibalise each other and
neither ranks.

The site is now **45 URLs across four silos**: 9 static, 6 services, 18 locations, 12 guides. The
informational cluster is no longer unserved, which changes the default answer to "is this taken?" from
"no" to "probably".

Fixed assignments — see `docs/keyword-map.md` §2, and do not relitigate them:

| Query                | Owner                                          |
| -------------------- | ---------------------------------------------- |
| תיקון דודים          | `/` — never build a `/services/` page for this |
| תיקון דודים ב\<עיר\> | `/locations/<slug>/`                           |
| תיקון דוד שמש        | `/services/solar/`                             |
| תיקון דוד חשמל       | `/services/electric/`                          |
| החלפת דוד            | `/services/replacement/`                       |
| נזילה בדוד           | `/services/leak-repair/`                       |
| מחיר תיקון דוד       | `/מחירון/`                                     |

## ב + city — grammar as a ranking surface

**`תיקון דודים בתל אביב`**, never `תיקון דודים תל אביב`.

This is mechanical, not stylistic. The city string feeds the **title, the H1, the meta description and
the JSON-LD** — four places — so a wrong prefix form propagates to all four.

Any city needing a non-default prefix form gets that form stored in `lib/site-config.ts` beside the
name. **Never** patch it with a conditional at the call site.

## Hebrew variance you must account for

| Variance          | Example                                    | How to handle                                         |
| ----------------- | ------------------------------------------ | ----------------------------------------------------- |
| כתיב מלא / חסר    | דוד / דווד · תרמוסטט / טרמוסטט             | record variants; **do not** build a page per spelling |
| Singular / plural | דוד / דודים · "תיקון דוד" vs "תיקון דודים" | same intent — one page                                |
| Adjective vs noun | דוד חשמלי / דוד חשמל                       | same intent — `/services/electric/`                   |
| Latin intrusion   | boiler · thermostat                        | rare in this vertical; do not target                  |
| Definite article  | הדוד לא מתחמם / דוד לא מתחמם               | same intent                                           |

Spelling variants belong **in the body copy naturally**, if at all — never as a spun page, never as a
keyword list stuffed into a paragraph.

## Intent classing

Classify every query before assigning it. The class determines the page type.

- **Commercial / transactional** — תיקון דוד שמש, החלפת דוד. Reader wants someone to come. → service page.
- **Commercial + local** — תיקון דודים ב\<עיר\>. Reader wants someone who will come to _their_ city.
  → location page.
- **Commercial research** — מחיר תיקון דוד. Reader is price-checking. → `/מחירון/`, served with _how
  pricing works_, **never** an invented figure — and note the pricing approach itself is one of the six
  unconfirmed roster assumptions in `docs/manifest-assumptions.md`.
- **Problem-aware** — נזילה בדוד, אין מים חמים. Reader knows the symptom, not the cause. → the **guide**
  if they want to understand it, the **service page** if it maps cleanly to one fault and they want it
  fixed. See the boundary below.
- **Informational** — למה הדוד לא מתחמם, מה זה אנודה, דוד שמש או חשמל. → the knowledge hub.
- **Navigational** — אזורי שירות. → the relevant index.

## The informational cluster is served — check before writing

The hub shipped with 12 guides, so this is now a coverage map to check against, not an open goal:

| Cluster        | Guides                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------ |
| **Symptom**    | `no-hot-water` · `lukewarm-water` · `tripping-breaker` · `leaking-boiler` · `noisy-boiler` |
| **Comparison** | `solar-vs-electric` · `repair-or-replace`                                                  |
| **Definition** | `what-is-anode` · `how-thermostat-works` · `how-solar-boiler-works`                        |
| **Seasonal**   | `winter-boiler-check` · `why-boilers-fail-in-winter`                                       |

**These are technical topics, which is exactly why they are safe** — they need no warranty, price,
timing or credential. On a site whose trust ledger is thin, this is still where marginal effort should
go. But the first question about a symptom or definition query is now "which of the 12 already owns
this?", and the honest answer is often "deepen `lukewarm-water`", not "write a thirteenth".

Every informational page must link to the commercial page that resolves the problem — `Guide.relatedServices`
is non-optional for that reason. A symptom guide with no route to a service page is a dead end.

## The guide ↔ service boundary — the live cannibalisation risk

Adding the hub created the one genuinely new way for this site to compete with itself. State the split
explicitly in every keyword decision:

- **A guide answers.** "למה הדוד מפיל את הפחת" — the reader wants to understand what is happening.
- **A service page sells.** "תיקון דוד חשמל" — the reader wants someone to come.

Same fault, different intent, different URL. Where both exist, cross-link them and make each page say
what it covers. If you cannot state which side of the line a proposed page is on, it does not get built.

Watch Search Console for a guide and a service page alternating on one query; that is the symptom, and
the fix is a decision about which one owns the intent, not a copy tweak.

## Expansion caps

- **No service × city intersection pages.** 6 × 18 = 108 near-identical URLs is the textbook doorway
  pattern and risks the whole domain.
- **No 19th city** until all 18 clear the doorway bar in `docs/content-standards.md`. They now carry
  distinct answer blocks, profiles, FAQs and nearby links — verify against the entries rather than
  assuming either that they are thin or that they are finished.
- **No second page for an owned intent.** Deepen instead.
- **No thirteenth guide for a question one of the twelve already answers.** Same rule, new silo.

## Watch these adjacencies

- `thermostat` ↔ `heating-element` — a suspected thermostat fault is often an element fault. Keep the
  symptom framing distinct and cross-link. `ServiceDepth.related` carries the shared-symptom reason.
- `leak-repair` ↔ `replacement` — a leaking tank often becomes a replacement. Make the boundary explicit:
  repairable fitting/connection vs. failed tank.
- `no-hot-water` (guide) ↔ `lukewarm-water` (guide) — total failure vs partial heating. Different
  diagnostics; if the copy blurs them, they will compete.

## Output

For any research task, deliver: the query, its class, the URL that owns it (or "unserved"), the variants
you found, and — if unserved — which cluster it belongs to and what page type would serve it.

Record decisions in `docs/keyword-map.md` and `docs/topical-map.md`. A keyword decision that lives only
in a chat log gets remade differently next month.
