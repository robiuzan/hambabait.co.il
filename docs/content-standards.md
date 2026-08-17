# Content standards — חם בבית

> The bar every page must clear before it ships. Cited by `hebrew-copywriter`, `new-city`,
> `new-service`, `seo-auditor` and the build gate.

---

## 0. The one test

> **Could a find-and-replace regenerate this page from another page on this site?**

If yes, it is a doorway page. That is the whole standard; everything below is how to pass it.

**Current state: all 18 location pages fail this test.** `app/locations/[city]/page.tsx` renders one
template — a fixed subtitle and two fixed paragraphs with the city name substituted, then the same
list of 6 services. There is no per-city content map. Fixing that is the site's largest content debt.

---

## 1. The claims bar comes first

Before depth, accuracy. **Read [business-facts.md](business-facts.md) before writing.**

Never write, without a source outside the repo:

- years in business, job counts, customer counts
- prices, or any implication about what the call-out costs
- warranty terms, duration or scope
- response times or arrival guarantees
- licences, insurance, certifications
- ratings, reviews, testimonials
- technician credentials or headcount

The site currently makes **no** claim about years, reviews, licences or prices. That restraint is
deliberate and it is the site's most valuable asset. Do not spend it.

Several claims **are** already unsourced — the warranty (~15 surfaces), same-day arrival, the
"כשעה עד שעתיים" duration. **Do not propagate them into new copy.** Rewriting a page containing one is
an opportunity to soften it.

Unsourced claim you cannot avoid? Placeholder + `// 🔶 confirm` + a row in `business-facts.md`, in the
same change.

---

## 2. Voice

The reader usually has **no hot water right now**, is mildly stressed, and is on a phone.

- Second person plural (אתם/אתן). Warm, plain, competent.
- **Lead with what happens next**, not with brand adjectives.
- Short sentences. No exclamation marks. No superlatives.
- Hebrew throughout; גרש `׳` and גרשיים `״` in abbreviations; en-dash in ranges.
- `ב` + city, always: `תיקון דודים בתל אביב`.
- Copy lives in `lib/content.ts`, never typed into JSX.

---

## 3. Per-page-type bar

### Service page (6 exist)

Must contain, in roughly this order:

1. **What the fault is** — what actually fails, in plain Hebrew.
2. **Symptoms the reader recognises** — no hot water, lukewarm, leak, tripping the breaker.
3. **What the technician does on site** — diagnosis, the part, the test.
4. **Repair vs. replace** — when the honest answer is a new boiler. This builds more trust than any
   badge and is safe to write, because it is technical judgement rather than a promise.
5. **3–5 FAQs** in question-form H2s with a 40–60 word answer first.
6. **Links out** — the areas index, a few cities, and genuinely related services (link on overlapping
   symptoms, not "here are the other five").

Minimum ~500 Hebrew words of substantive body copy. Length is not the goal; covering the question is.

**The description does triple duty** — card copy, meta description, **and JSON-LD
`Service.description`**. An unsourced claim there becomes an unsourced claim in structured data.

### Location page (18 exist)

Everything a service page needs, plus **at least two paragraphs that could not be written about any
other city**. Legitimate, checkable material:

- **housing stock and boiler mix** — where solar dominates vs. electric/pressure systems, older
  buildings vs. new construction
- **access realities** — roof access in low-rise vs. high-rise, buildings without lifts, shared solar
  arrays on apartment blocks
- **coastal corrosion** — Bat Yam, Ashdod, Netanya, Ashkelon, Haifa: a real technical point about
  anode wear and tank life
- **city-specific FAQs**

Not acceptable: synonym spinning, population figures, neighbourhood lists, distance-from-Tel-Aviv
padding, or any claim of a local branch, local technician or per-city response time.

**If nothing truthful and specific can be written for a city, that city should not have a page.**
Removal is a legitimate, preferred outcome over padding.

### Static pages

`/אודות/` carries the trust burden without fabricating — what the business does, how it works, what
the reader can expect. `/מחירון/` explains the quote-after-diagnosis approach honestly and **must not
introduce a number**. The two legal pages have their own problems (see §6).

---

## 4. Structure

- **One `<h1>`** matched to search intent; `<h2>`/`<h3>` below with no skipped levels.
- **Question-form H2s** wherever a section answers a question.
- **Answer first**: 40–60 self-contained words immediately after the heading, then detail.
- **Tables for comparisons.** Real `<table>` markup — it is lifted far more reliably than prose.
- **Ordered lists for procedures.**
- Paragraphs of 2–4 sentences. Walls of text lose phone readers.

---

## 5. Conversion furniture

Every page: a call action reachable without scrolling on mobile, the sticky mobile CTA bar, and a
closing CTA. Phone and WhatsApp as real links from `lib/site-config.ts` — never hardcoded, never
JS-only.

One CTA per section maximum. Over-CTA'd pages read as advertorial and convert worse.

---

## 6. Legal pages — currently below standard

- **`/מדיניות-פרטיות/`** states details are not passed to third parties, while every lead transits
  `api.web3forms.com`, failed leads go to Meta via `wa.me`, and GTM loads with no consent gate. It
  names no processor, no cookies and no retention period. **This is a factual error, not a wording
  preference.**
- **`/הצהרת-נגישות/`** asserts ת״י 5568 and WCAG 2.0 AA conformance with no audit, no statement date
  and no named accessibility coordinator.

**Do not deepen either claim.** Fix the underlying gap, or narrow the wording to what is true.

---

## 7. Pre-ship checklist

- [ ] Passes the find-and-replace test in §0
- [ ] Every factual claim sourced, or marked `🔶` with a row in `business-facts.md`
- [ ] No existing unsourced claim propagated
- [ ] One `<h1>`, no skipped levels
- [ ] At least one question-form H2 with a 40–60 word answer first
- [ ] Comparisons as tables
- [ ] Title does not append the brand (the layout template already does)
- [ ] Description unique, 140–160 chars, no claim the body does not make
- [ ] Links to the areas index and related pages
- [ ] Copy in `lib/content.ts`, not JSX
- [ ] `ב` prefix on every city name
