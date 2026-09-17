# Content standards — חם בבית

> The bar every page must clear before it ships. Cited by `hebrew-copywriter`, `new-city`,
> `new-service`, `new-article`, `seo-auditor` and the build gate.
>
> **Re-baselined 2026-08-31.**

---

## 0. The one test

> **Could a find-and-replace regenerate this page from another page on this site?**

If yes, it is a doorway page. That is the whole standard; everything below is how to pass it.

**Current state: all 45 indexable pages clear it.** The 18 location pages did not, for months, and
fixing that was the site's largest content debt. `cityContent` in `lib/content.ts` now gives each
city an answer block, at least two paragraphs that could not be written about another city, one or
two city-specific FAQs and 2–4 nearby-city links (50 links across the 18, none with fewer than two).
The 6 service pages each carry an answer block, their own symptom→cause table, on-site steps, a
repair-vs-replace section and three FAQs. The 12 guides are covered in §3.

**This is a standing test, not a gate that was passed in August.** Re-run it on every page you touch,
and on every page you add. A site can fail it again one careless template away.

### The templated-question defect — how templating actually shows up

Worth reading before you trust your own page. In 2026-08 the city pages passed the test on the
strength of their bodies, and **nine of the eighteen still opened with the same question**:
`מה מאפיין דודים ב<עיר>?` — ashdod, holon, ramat-gan, rehovot, herzliya, kfar-saba, modiin, raanana,
ashkelon. The answer _bodies_ were genuinely city-specific. Only the question was a find-and-replace.

Three things make that worse than it sounds:

1. The question is a **question-form H2**. It is the most prominent line of the block and the string
   an answer engine matches on, so nine pages competed on one identical query shape.
2. It is invisible when reviewing a page. You read one city, the question fits, you move on. The
   defect only exists in the aggregate, and only a cross-page diff shows it.
3. A generic question **licenses a generic answer**. A body written to answer
   `מה מאפיין דודים ב…?` will drift back toward the template on the next edit, because the heading
   is not asking for anything specific.

Each now asks something only that city's answer resolves —
`כמה מערכות שמש עומדות על גג משותף בחולון?`,
`מה מתקלקל בדוד בכפר סבא אם הקורוזיה אינה הגורם?`,
`האם השמש החזקה באשקלון מספיקה לחמם את הדוד?`.

**The generalisation: apply §0 to every repeated element separately, not to the page as a whole.**
Headings, questions, table column labels, FAQ prompts, alt text, meta descriptions. A page can pass
the test on its body and fail it on its furniture, and the furniture is what gets indexed as a
heading.

The standing check, cheap enough to run on every content edit:

```bash
# duplicate answer-block questions across the content layer — must return nothing
grep -ho 'question: "[^"]*"' lib/content.ts lib/guides.ts | sort | uniq -d

# and the softer signal: the same phrase opening many blocks
grep -ho 'question: "[^"]*"' lib/content.ts | sed 's/ב[^ ]*?"$//' | sort | uniq -c | sort -rn | head
```

Currently: 37 answer blocks, **0 duplicate questions, 0 duplicate bodies**.

---

## 1. The claims bar comes first

Before depth, accuracy. **Read [business-facts.md](business-facts.md) before writing.**

Never write, without a source outside the repo:

- years in business, job counts, customer counts
- warranty terms, duration or scope
- response times or arrival guarantees
- licences, insurance, certifications
- ratings, reviews, testimonials
- technician credentials or headcount

**Prices are the one item that moved.** Since 2026-09-17 the owner publishes eight price ranges, and
"no call-out fee, no surcharge for tile roofs, difficult access or urgency" is confirmed alongside
them — that is the source, and it is [business-facts.md](business-facts.md) §1a. A figure that
appears in §1a is writable; a figure that does not is invented. Israeli Consumer Protection Law
**§17א** means every figure shown to a reader is **כולל מע״מ** — never republish one ex-VAT.

The site still makes **no** claim about years, reviews, licences or credentials. That restraint is
deliberate and it is the site's most valuable asset. Do not spend it.

Several claims **are** already unsourced — chiefly the warranty. The sitewide assertion was softened
down to a single defensible sentence (warranty terms are given with the quote, before work begins),
and the manifest `shortPitch` was fixed at the roster so the claim no longer reaches the JSON-LD.
Same-day arrival and the "כשעה עד שעתיים" duration are gone entirely. **Do not propagate any of them
back into new copy.** Rewriting a page containing one is an opportunity to soften it, never to
restate it.

Note also that **"manifest-sourced" is not "client-confirmed."** The roster carries a
`_needsConfirmation` array — phone routing, email, hours — that `site.config.json` strips. Those
values look settled and are not. See [manifest-assumptions.md](manifest-assumptions.md) before
treating any of them as fact in copy. **Pricing is no longer on that list**: it was retired on
2026-09-17 when the owner confirmed the ranges in [business-facts.md](business-facts.md) §1a.

Unsourced claim you cannot avoid? Placeholder + `// 🔶 confirm` + a row in `business-facts.md`, in the
same change. The content layer already carries a handful of these on reasoned-but-unsourced city
material; follow that pattern rather than inventing a new one.

---

## 2. Voice

The reader usually has **no hot water right now**, is mildly stressed, and is on a phone.

- Second person plural (אתם/אתן). Warm, plain, competent.
- **Lead with what happens next**, not with brand adjectives.
- Short sentences. No exclamation marks. No superlatives.
- Hebrew throughout; גרש `׳` and גרשיים `״` in abbreviations; en-dash in ranges.
- `ב` + city, always: `תיקון דודים בתל אביב`.
- Copy lives in `lib/content.ts` and `lib/guides.ts`, never typed into JSX.

---

## 3. Per-page-type bar

### The answer block — what it is, and what it is not

Every service page, city page and guide opens with one: the page's question as a heading, then a
self-contained answer immediately below it. Since 2026-09-17 `/מחירון/` carries one too.

**Self-contained is the requirement. Word count is guidance, not a gate.** The block must answer its
own question without the reader needing the next paragraph — an answer that depends on what follows
gets skipped entirely by the thing lifting it. That is the property to check.

Measured across the 36 blocks at the 2026-08-31 baseline: **32 to 47 words**, mean 38.8, median 39.
Twenty-two sat below 40 and fourteen in the 40–60 band. The 37th — `/מחירון/`'s, added 2026-09-17 —
is 41 words. They are self-contained and they work.

An earlier version of this document set a hard 40–60 floor, and the honest read is that it was a
self-imposed number rather than a property of good answers. Rewriting sound Hebrew to clear it would
have been churn with a real fabrication risk attached — padding an answer that is already complete
means adding material, and on this site added material is where invented claims come from. **Treat
roughly 30–60 words as the working range**, and if a block is much shorter than that, the likely
problem is that it is not actually self-contained. Fix that, not the word count.

### Service page (6 exist)

Must contain, in roughly this order:

1. **The answer block** — the page's question, answered.
2. **What the fault is** — what actually fails, in plain Hebrew.
3. **Symptoms the reader recognises**, as a real symptom→cause `<table>`. Each of the six has its own;
   they were once a single shared `triggers` array, which is exactly the §0 failure. Every table
   carries an `sr-only` `<caption>` and sits in a keyboard-reachable scroll container.
4. **What the technician does on site** — diagnosis, the part, the test.
5. **Repair vs. replace** — when the honest answer is a new boiler. This builds more trust than any
   badge and is safe to write, because it is technical judgement rather than a promise.
6. **3–5 FAQs** in question-form H2s, answer first.
7. **Links out** — the areas index, cities, genuinely related services (link on overlapping symptoms,
   not "here are the other five"), and **the guide that owns the diagnostic side of this fault**.

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
  anode wear and tank life. **Only where it applies** — see [topical-map.md](topical-map.md) §3. A
  differentiator that does not discriminate is not a differentiator.
- **city-specific FAQs**
- **2–4 nearby-city links**, and only to cities a reader would plausibly consider neighbours

Not acceptable: synonym spinning, population figures, neighbourhood lists, distance-from-Tel-Aviv
padding, or any claim of a local branch, local technician or per-city response time.

Where a city's material is reasoned rather than sourced — a tenancy pattern, a reputation, a housing
mix nobody has published a figure for — it gets a `// 🔶 confirm` comment stating exactly which half
is verifiable, and it is written conditionally rather than as a proportion claim. Several entries
already do this; copy that pattern.

**If nothing truthful and specific can be written for a city, that city should not have a page.**
Removal is a legitimate, preferred outcome over padding.

### Knowledge-hub guide (`/מדריכים/<slug>/` — 12 exist)

The informational silo. **These pages are technical, which is what makes them safe** — they need no
warranty, price, timing or credential, so they carry none of the claims risk the commercial pages do.
That is precisely why they are the right place to spend content effort on this site.

Must contain, in roughly this order:

1. **The answer block** — the title's question as a heading, then a self-contained answer. This is
   the block answer engines lift; an answer that depends on the next paragraph gets skipped entirely.
2. **The mechanism** — what is actually happening inside the boiler, in plain Hebrew.
3. **A table or an ordered list.** Symptom → likely cause, a comparison, or a numbered procedure. Real
   `<table>` markup, never prose pretending to be a table.
4. **What to check safely, and what not to touch.** Be explicit about the electrical and scalding
   risks; do not write a guide that gets someone hurt.
5. **When to call someone** — routing to the service page that fixes this fault.
6. **2–4 FAQs** as question-form H2s, answer-first.

Also required:

- **Author and date.** `Article` with `datePublished` and `dateModified`, and a visible "עודכן ב…"
  line. The guides are the only pages on the site carrying dates or authorship; service and city
  pages remain undated, which is fine for commercial pages. **Never invent an author** — attribution
  is to `חם בבית` unless the owner confirms a real named person. A date moves only when the content
  actually changed.
- **A route to a commercial page.** A guide that does not link the service page resolving the problem
  is a dead end.
- **Links from the relevant service and city pages back in.** Depth flows both ways — and this half
  is **currently not built**: every one of the 12 guides has an in-degree of exactly 1, the
  `/מדריכים/` index. Any new guide inherits that on day one, so wire the inbound links in the same
  change rather than deferring them.
- **The `llms.txt` entry.** `public/llms.txt` is hand-maintained and currently at 45/45 coverage
  against the sitemap. A new URL that does not land there breaks that parity silently.

An illustration is optional and, when used, is an **inline SVG diagram** — four of the twelve carry
one. Never a photograph of a technician or a job: that is a staffing claim rendered as an image.

Minimum ~700 Hebrew words. Comparison guides may be shorter if the table carries the weight.

⚠️ **No prices in a guide, comparisons included.** The published ranges live on `/מחירון/` and
nowhere else, so a guide can never drift out of sync with them and an owner re-pricing touches one
page. Compare on qualitative axes — running cost _relative_ to the alternative, weather dependence,
maintenance, lifespan.

### Static pages

`/אודות/` carries the trust burden without fabricating — what the business does, how it works, what
the reader can expect. `/מחירון/` publishes the eight owner-approved ranges and explains what moves a
job inside its range. The bar it must clear: **every figure traces to
[business-facts.md](business-facts.md) §1a**, every figure is **כולל מע״מ** as §17א requires, and no
service the owner has not priced gets a number. A figure that is not in §1a is still invented — the
policy changed, the fabrication rule did not. Re-pricing edits `priceRanges`, `pricingAnswer` and the
page's meta description in one change, or the page contradicts itself.

**Eight of the 45 indexable pages carry no answer block**, and all eight are static: the homepage,
the three indexes, `/אודות/`, `/צור-קשר/` and the two legal pages. `/מחירון/` gained one on
2026-09-17, once there were prices to state. Two of the eight would genuinely benefit from one —
`/שירותים/` and `/איזורי-שירות/`, each of which fields a real question a reader arrives with. That
work is **open and deferred**: it needs a content brief and a decision about which component renders
the block. The two legal pages and `/צור-קשר/` do not need one, and the homepage already carries a
six-question `FAQPage`.

---

## 4. Structure

- **One `<h1>`** matched to search intent; `<h2>`/`<h3>` below with no skipped levels. `qa:gate`
  asserts exactly one `<h1>` per built page.
- **Question-form H2s** wherever a section answers a question — and a question specific enough that
  only this page's answer resolves it. See §0.
- **Answer first**: a self-contained answer immediately after the heading, then detail.
- **Tables for comparisons.** Real `<table>` markup — it is lifted far more reliably than prose. Give
  every table an `sr-only` `<caption>`, and make its scroll container keyboard-reachable.
- **Ordered lists for procedures.**
- Paragraphs of 2–4 sentences. Walls of text lose phone readers.

---

## 5. Conversion furniture

Every page: a call action reachable without scrolling on mobile, the sticky mobile CTA bar, and a
closing CTA. Phone and WhatsApp as real links from `lib/site-config.ts` — never hardcoded, never
JS-only.

Every CTA carries a `data-cta` attribute, and **the value must be unique to its placement**. One
identifier covering three different header elements collapsed three placements into one
undifferentiated count for months; see [measurement.md](measurement.md) §2 for what that cost and for
the container update it now requires.

One CTA per section maximum. Over-CTA'd pages read as advertorial and convert worse.

---

## 6. Legal pages

- **`/מדיניות-פרטיות/` — ✅ meets the bar.** It names Web3Forms, Google (Tag Manager / Analytics) and
  WhatsApp/Meta, discloses cookie use, and describes the consent choice the banner now offers.
  Retention is stated qualitatively ("as long as needed to handle the enquiry and follow up
  reasonably") rather than as a fixed period — acceptable, and the honest form until the owner sets
  one. **Keep it true:** any new data flow must land there in the same change.
- **`/הצהרת-נגישות/` — ✅ meets the bar.** It no longer asserts conformance with ת״י 5568 or WCAG. It
  states plainly that no external audit was performed, lists what was actually checked internally,
  lists the known limitations (no real screen-reader testing, no external audit, not every colour
  pair checked), gives a contact route and carries a statement date.

**Do not deepen either claim.** The accessibility statement in particular is now valuable precisely
because it is narrow: it is the difference between a page that describes reality and a page that
asserts a standard nobody tested against. Re-adding a conformance claim requires a real audit to
point at, and the statement date moves only when the accessibility state actually changes and is
re-verified.

---

## 7. Pre-ship checklist

- [ ] Passes the find-and-replace test in §0 — **body and furniture separately**
- [ ] Answer-block question is specific enough that only this page's answer resolves it
- [ ] No duplicate `question` string anywhere in `lib/content.ts` or `lib/guides.ts`
- [ ] Every factual claim sourced, or marked `🔶` with a row in `business-facts.md`
- [ ] No existing unsourced claim propagated
- [ ] One `<h1>`, no skipped levels
- [ ] At least one question-form H2 with a self-contained answer first
- [ ] Comparisons as tables, with an `sr-only` caption and a keyboard-reachable scroll container
- [ ] Title does not append the brand (the layout template already does)
- [ ] Description unique, 140–160 chars, no claim the body does not make
- [ ] Links to the areas index and related pages — **and inbound links wired, not deferred**
- [ ] New URL added to `app/sitemap.ts` and `public/llms.txt`
- [ ] Every CTA has a `data-cta` unique to its placement
- [ ] Copy in `lib/content.ts` / `lib/guides.ts`, not JSX
- [ ] `ב` prefix on every city name
- [ ] `npm run lint && npm run typecheck && npm run format:check && npm run build && npm run qa:gate`
