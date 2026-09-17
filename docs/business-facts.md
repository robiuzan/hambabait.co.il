# Business facts — חם בבית (hambabait.co.il)

> The single register of what this business has actually told us versus what the site asserts.
> **Rule: nothing moves from ⬜ Unconfirmed to ✅ Confirmed without a source outside this repo.**
> Authoring copy is not a source. The roster manifest is only a source for identity fields the
> business supplied — see the warning in §0.

Last audited: **2026-09-17.** (§0 partly closed — the laundered warranty claim is out of the JSON-LD
and the assumptions array now has a home in the repo. §3.7 added. §4.1 and §4.2 closed.)

---

## 0. The laundering trap — read this first

`Israeli services sites/roster/sites/hambabait.json` carries a `_needsConfirmation` array. It flagged
**six** values during the Phase 4 rebuild; **three were confirmed by the owner on 2026-09-17** — the
phone routing, the email address and the opening hours — and a fourth, the pricing approach, was
**reversed**: the owner rejected the no-price-list policy and approved published price ranges (§1a).

**Two remain assumptions** in the roster: `foundedYear`, and that all content is freshly authored.

**Separately, and not in the roster array:** the price _figures_ are owner-confirmed (§1a), but the
_scope_ wording beside each — what the price includes — is **not**. See §1a.

`site.config.json` still does not contain that array, and **that is now deliberate**: the file is
`import`ed by `lib/site-config.ts`, so webpack bundles it whole into the client JS (verified — the
Web3Forms key and `shortPitch` both appear in `out/_next/static` chunks). Shipping internal project
notes to every visitor is not an option.

**The trap is closed from the other side instead.** `ops/sync-manifest.ps1` writes the array to
[manifest-assumptions.md](manifest-assumptions.md) on every sync and prints it loudly, so the
assumptions stay visible to humans and invisible to users. Read that file before calling any NAP
value confirmed.

### ✅ Closed 2026-08-31 — the laundered warranty claim

`shortPitch` used to end `…עם אחריות על העבודה`, and `@ishub/site-kit` uses `shortPitch` verbatim as
the JSON-LD `description` — so the warranty claim _looked_ manifest-sourced while no warranty term,
duration or document existed anywhere.

The roster had already been softened on 2026-08-25. **Nothing carried it across**, and the old text
kept shipping for six days. That gap is why `ops/sync-manifest.ps1` now exists. The homepage
`description` now reads `…אבחון מדויק, עבודה מקצועית והצעת מחיר ברורה לפני שמתחילים.`

> **Verify, do not assume:** `grep -rl "אבחון מהיר, עבודה מקצועית ומחיר הוגן" out` must return
> nothing. Note that a plain grep for `אחריות על העבודה` still matches **one** page — the homepage
> FAQ answer at §3.1, which is the _deliberately softened_ wording, not this defect.

---

## 1. ✅ Confirmed — identity and configuration

These are settled in the sense that they are deliberate, single-sourced configuration. Where the
hub manifest flags them for confirmation, the Status column says so.

| Fact               | Value                                                                      | Source                       | Status                                                                                                                                |
| ------------------ | -------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Brand (Hebrew)     | חם בבית                                                                    | `site.config.json:5`         | ✅                                                                                                                                    |
| Brand (English)    | Cham BaBait                                                                | `site.config.json:6`         | ✅ (JSON-LD `alternateName` only)                                                                                                     |
| Legal name         | חם בבית                                                                    | `site.config.json:7`         | ⬜ no registered entity confirmed                                                                                                     |
| Domain / URL       | hambabait.co.il · https://hambabait.co.il                                  | `site.config.json:3-4`       | ✅                                                                                                                                    |
| Locale / dir       | he-IL · rtl                                                                | `site.config.json:8-9`       | ✅                                                                                                                                    |
| Phone (display)    | 055-6601006                                                                | `site.config.json:14`        | ✅ **owner-confirmed 2026-09-17** — routing verified. Was `⬜ **shared fleet line** — `phoneOverride: false`, routing unconfirmed     |
| Phone (E.164)      | +972556601006                                                              | `site.config.json:15`        | ⬜ same                                                                                                                               |
| WhatsApp           | +972556601006                                                              | `site.config.json:16`        | ⬜ same number as the phone line                                                                                                      |
| Email              | info@hambabait.co.il                                                       | `site.config.json:17`        | ✅ **owner-confirmed 2026-09-17**. Was `⬜ **assumed** — fixes a live `chambait.co.il` typo; mailbox not proven provisioned           |
| Hours              | ראשון–חמישי 08:00–18:00 · שישי 08:00–14:00                                 | `site.config.json:33-52`     | ✅ **owner-confirmed 2026-09-17**. Was `⬜ **authored** — `lib/site-config.ts:40` says "confirm with client", yet it ships as JSON-LD |
| Schema type        | `Plumber`                                                                  | `site.config.json:30`        | ✅                                                                                                                                    |
| Price range        | `₪₪`                                                                       | `site.config.json:31`        | ✅ now defensible from §1a (₪250–₪5,900 published). Previously: ⬜ no source for the banding                                          |
| Area served        | שירות בכל הארץ                                                             | `site.config.json:32`        | ⬜ authored SEO surface, not verified coverage                                                                                        |
| `sameAs`           | _(empty)_                                                                  | `site.config.json:53`        | ✅ no profile is claimed                                                                                                              |
| GTM container      | GTM-KWGGH438                                                               | `site.config.json:56`        | ✅ verified HTTP 200                                                                                                                  |
| GA4 measurement id | `null`                                                                     | `site.config.json` analytics | ✅ correctly null — synced from the roster                                                                                            |
| Search Console     | `null`                                                                     | `site.config.json:57`        | ⬜ ownership unverified                                                                                                               |
| Founded year       | `null`                                                                     | `site.config.json:10`        | ✅ correctly null — never give it a numeric fallback                                                                                  |
| Services           | 6 — solar, electric, thermostat, leak-repair, replacement, heating-element | `lib/site-config.ts:60-67`   | ✅                                                                                                                                    |
| Locations          | 18 cities                                                                  | `lib/site-config.ts:75-94`   | ✅ as a page inventory                                                                                                                |
| Lead delivery      | Web3Forms key `37b27cbc-…`                                                 | `site.config.json:18`        | ✅ public-by-design key; delivery inbox unverifiable from repo                                                                        |

### ✅ Closed: `founded` no longer has a numeric fallback

`lib/site-config.ts` used to read `founded: manifest.foundedYear ?? 0`. Because `foundedYear` is
`null`, `siteConfig.founded` silently equalled **0** — so any future copy doing
`2026 - siteConfig.founded` would have rendered **"2026 שנות ניסיון"**, fabricating the one claim
this site has never made.

It now reads `?? null` and carries a comment saying why. **Never reintroduce a numeric fallback for
a null business fact** — that is the whole failure mode.

The manifest is also now validated at module load by `assertManifest()`, so a malformed
`site.config.json` fails `npm run build` instead of failing at runtime in a visitor's browser.

---

## 1a. ✅ Confirmed — published prices (added 2026-09-17)

**Owner-approved 2026-09-17. These are real business facts and the site now publishes them.**

Ranges live in `lib/content.ts` → `priceRanges`, render via `components/marketing/PriceTable.tsx`,
and are repeated in the `/מחירון/` answer block and meta description.

| Service                  | Published range (כולל מע״מ) |
| ------------------------ | --------------------------- |
| תיקון דוד שמש            | ₪250–₪850                   |
| תיקון דוד חשמל           | ₪250–₪850                   |
| החלפת תרמוסטט            | ₪250–₪500                   |
| החלפת אלמנט חימום        | ₪300–₪800                   |
| תיקון נזילות בדוד        | ₪300–₪880                   |
| החלפת דוד חשמל           | ₪1,300–₪3,300               |
| החלפת מיכל של דוד שמש    | ₪1,700–₪3,500               |
| החלפת מערכת סולארית מלאה | ₪2,475–₪5,900               |

**Provenance.** Figures were derived from Israeli market research — מידרג real-jobs aggregations
dated June–July 2025 (customer-reported prices actually paid, the strongest evidence class found),
המקצוענים, דפי זהב, B144 and five trade price lists — then **approved by the owner**, who chose
ranges over a fixed list and over starting-from pricing. They were **not** invented, and they were
**not** published until the owner approved them.

**⚠️ VAT is a legal constraint, not a preference.** Israeli Consumer Protection Law **§17א** requires
the price displayed to a consumer to be the **total** price, including מע״מ and every mandatory
charge. The owner's internal quoting is ex-VAT; the **displayed** figures above are VAT-inclusive,
which is what the law requires. **Never re-publish these ex-VAT**, and never add a mandatory charge
that is not inside the range.

**🔶 The `scope` column is NOT owner-confirmed.** The owner approved the **figures**. The wording
beside each row — "כולל החלק והעבודה", "התקנה מלאה ופינוי הדוד הישן" — was written from the same
market research and states what each price **includes**. That is a commercial commitment of the same
weight as the number, and nobody has confirmed it. The four inclusion claims carry `// 🔶 confirm`
markers in `lib/content.ts`. **Owner question: does the quoted price include the part, the labour,
full installation and removal of the old unit?** Until answered, do not deepen or repeat these
claims anywhere else.

**Rules for changing any figure**

1. A price change needs **fresh owner sign-off**, recorded here with a date. Market drift is not
   sign-off.
2. Update `priceRanges` **and** `pricingAnswer` **and** the `/מחירון/` meta description together —
   the figures are repeated in all three and a partial edit ships a contradiction.
3. **No priced `Offer` in structured data.** `qa:gate` asserts this and the assertion stays until
   someone decides deliberately otherwise; a range is easy to express wrongly in schema and can
   surface directly in search results.
4. Do not price a service the owner has not priced.

---

## 2. ✅ Confirmed — what the site correctly does NOT claim

This section exists so nobody "helpfully" adds these back. Verified absent across `app/`,
`components/`, `lib/` and the built `out/`:

- **No years-in-business claim.** Zero matches for שנות ניסיון / שנים-in-business phrasing.
- **No reviews, ratings, testimonials, star counts or job counts.** No `aggregateRating`, no `review`
  node in the shipped JSON-LD.
- **No licence, insurance, certification, ח.פ. or עוסק מורשה number.**
- **No 24/7 or round-the-clock claim.**
- ~~**No numeric price anywhere.**~~ **No longer true as of 2026-09-17** — the owner rejected the
  no-price-list policy and approved published VAT-inclusive ranges. Moved to **§1a**. What still
  holds: no price appears in **structured data**, and `qa:gate` asserts "no priced Offer node".

`lib/content.ts:1-8` and `:132` record this as a deliberate policy. **Adding any of the above without
a source is a Google policy violation, not a style choice.**

---

## 3. ⬜ Unconfirmed — claims the site actively makes

Ranked by risk. Every row is copy that ships today with no source.

### 3.1 Warranty — highest exposure, ~15 surfaces

The site promises a warranty on labour **and parts** across marketing, service, location and about
pages, and launders it into JSON-LD via `shortPitch`. No term, duration, scope or document exists.

| Where                                                            | Quote                                                                 |
| ---------------------------------------------------------------- | --------------------------------------------------------------------- |
| `lib/content.ts:91-92`                                           | "אחריות על העבודה" / "כל תיקון וכל חלק שאנחנו מחליפים מגובים באחריות" |
| `lib/content.ts:136`                                             | trust stat "אחריות" / "על כל עבודה"                                   |
| `lib/content.ts:170-171`                                         | FAQ "כן. אנחנו נותנים אחריות על העבודה ועל החלקים…"                   |
| `components/marketing/Hero.tsx:7,29-30`                          | bullet + subhead                                                      |
| `components/marketing/FinalCta.tsx:15-16`, `ServicesGrid.tsx:31` | CTA copy                                                              |
| `app/אודות/page.tsx:19,44-45`, `app/שירותים/page.tsx:10,18`      | body + meta                                                           |
| `app/locations/[city]/page.tsx:28,40,58-59`                      | ×18 pages, incl. meta description                                     |
| `site.config.json:12`                                            | → **JSON-LD `description`**                                           |

**Owner question:** is there a written warranty? What term, and does it cover parts as well as labour?
**Until answered:** the FAQ's hedge ("תנאי האחריות המדויקים תקבלו יחד עם הצעת המחיר") is the only
defensible framing. Do not promote the warranty into schema (`warrantyPromise`) under any circumstance.

### 3.2 Speed and availability

| Claim                        | Where                                                                            | Note                                                                                                                              |
| ---------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Same-day arrival             | `lib/content.ts:84`, `:186-187`; `app/locations/[city]/page.tsx:57-58`           | hedged ("משתדלים", "לרוב") but repeated on all 18 city pages                                                                      |
| Out-of-hours urgent response | `lib/site-config.ts:44` "מענה מהיר לתקלות דחופות" → `app/צור-קשר/page.tsx:76-78` | rendered directly beneath the published 08:00–18:00 hours, implying cover that the hours contradict. **No manifest counterpart.** |
| Generic speed                | `Hero.tsx:7,23,26`; `lib/content.ts:83,135`                                      | brand-level positioning                                                                                                           |
| Callback promise             | `LeadForm.tsx:105`; `Hero.tsx:67`; `app/צור-קשר/page.tsx:89`                     | "נחזור אליכם בהקדם" — no stated window                                                                                            |

**Owner question:** what is the real dispatch reality, and is there any after-hours cover at all?

### 3.3 The only hard number on the site

`lib/content.ts:167` — "רוב תיקוני הדודים … מתבצעים במקום ונמשכים **כשעה עד שעתיים**."

Everything else was deliberately kept qualitative; this one quantitative claim slipped through. It is
the single highest-risk sentence for a consumer complaint. **Owner question:** is 1–2 hours accurate
for element/thermostat/leak work?

### 3.4 ✅ Free call-out — RESOLVED 2026-09-17

Previously the site never stated whether the diagnostic visit was chargeable, and a reader could
reasonably infer a free call-out that nobody had confirmed.

**Owner confirmed 2026-09-17: there is no call-out fee, and no surcharge for tile roofs, difficult
access or urgent calls.** This is now stated explicitly rather than left to inference — in
`pricingNote`, in the "בלי דמי ביקור, בלי תוספות" card, and in the `/מחירון/` answer block.

It is also a genuine differentiator worth protecting: the market research behind §1a found a
call-out fee of **₪150–₪350** itemised by nearly every competitor, plus tile-roof surcharges of
₪150–₪500 and difficult-access surcharges of ₪500–₪800. **If this ever stops being true, the copy
must change in the same commit.**

### 3.5 Capability and staffing

| Claim                                       | Where                                                                                                                            |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| "מומחים" / specialist status                | `site.config.json:11` tagline → site title + meta description; `Hero.tsx:23`; `lib/content.ts:87-88`; `app/אודות/page.tsx:37-39` |
| Experienced/skilled technicians             | `lib/content.ts:95-96`; `app/אודות/page.tsx:21,42-43,49`                                                                         |
| All boiler types (שמש · חשמל · משולב · לחץ) | `lib/content.ts:30,134,190-191`; `Hero.tsx:7,29-30`; `app/locations/[city]/page.tsx:51-52`                                       |
| Per-service capability copy ×6              | `lib/content.ts:27-62` → also service meta descriptions **and JSON-LD `Service.description`**                                    |

Nothing in the repo establishes that any technician exists, is employed, or is trained.

### 3.6 Per-city local presence

All 18 city pages assert fast local arrival for their named city
(`app/locations/[city]/page.tsx:40,57-58`), including Beer Sheva, Ashkelon and Haifa, from a single
template. The only backing is the nationwide `areaServed` string. There is no per-city coverage data,
no technician roster, no address and no geo. **This is the doorway-page exposure** — see
[content-standards.md](content-standards.md).

### 3.7 🔶 Per-city characterisations — added 2026-08-31

Three city profiles were deepened on 2026-08-31 (`rehovot`, `raanana`, `kfar-saba`) to get them off
the shared low-rise/private-roof pattern they all leaned on. Each was given a genuinely
distinguishing second dimension.

**None of these is a claim about the business** — they are characterisations of the _city_, and the
technical consequence drawn from each is verifiable general physics. But the city characterisation
itself is reasoned rather than sourced, so it is logged here.

| Claim                                                                                                                                      | Where                              | Tier                                                                                                                 | Question for the owner / researcher                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| רחובות as a city of research and teaching institutions (מכון ויצמן, the Faculty of Agriculture) where some residents rent for a fixed term | `lib/content.ts` rehovot profile   | 🔶 the institutions are ✅ verifiable; the fixed-term-tenancy pattern around them is reasoned, not sourced           | Is there a citable source for a rental-heavy segment? If not, keep it qualitative — **no proportion is claimed today and none may be added** |
| כפר סבא as a green city with mature trees between low buildings                                                                            | `lib/content.ts` kfar-saba profile | 🔶 widely described but unsourced here. The shading physics that follows is ✅ and is written conditionally          | Confirm against a citable municipal or press source, or soften to "עץ בוגר שגדל לצד בניין נמוך" with no city attribute                       |
| רעננה as a city with a large business park and a broad community of residents who arrived from abroad                                      | `lib/content.ts` raanana profile   | 🔶 widely described but unsourced here. The storage-tank vs instantaneous-heater contrast that follows is ✅ general | Confirm or drop the demographic framing. **The technical paragraph survives without it**                                                     |

> **The test each one passed before shipping:** swap the city name for another city's — if the
> paragraph still reads as true, it is not city-specific and it does not count. And none of the
> three says anything about _our_ presence, speed or coverage in that city, which is the line
> §3.6 exists to guard.

---

## 4. Legal pages

### 4.1 ✅ Privacy policy — fixed 2026-08-25

**Previously a factual error; now resolved.** `app/מדיניות-פרטיות/page.tsx` names the real processors:

- **Web3Forms** — lead delivery by email (`:57-58`)
- **Google (Tag Manager / Analytics)** — measurement, and that it may set cookies (`:61-62`)
- **WhatsApp (Meta)** — both the direct contact route and the lead-form hand-off (`:65-67`)
- a cookies section explaining browser-level blocking (`:83-87`)

Its header comment records the page as a factual description of the site's actual data flow. **Keep it
that way: any new data flow must land here in the same change.**

### 4.1a ⬜ Still open — disclosure is not consent

The policy now _discloses_, but nothing _gates_:

- **GTM loads on first paint with no Consent Mode default.** A grep for `consent|denied|gtag\(` across
  `app/`, `components/` and `lib/` returns nothing but the policy's own prose.
- **The lead form has no consent affordance** — a passive disclosure paragraph under the submit button
  links the policy, but there is no checkbox and no gate.
- **No stated retention period** anywhere.

See the `consent-mode` skill. Roughly half the fix is container-side and belongs to the owner.

### 4.2 ✅ Accessibility statement — rewritten honestly 2026-08-25

**Previously** it claimed conformance work per **ת״י 5568** and **WCAG 2.0 AA** with no audit, no
statement date and no contact, and listed "alt text for meaningful images" on a site that ships **no
images at all**.

**Now** it states what was actually verified against the built output — one H1 per page and correct
heading order, the skip link and `<main>` landmark, keyboard navigation in the mobile menu including
Escape returning focus to the toggle, `aria-current` in the nav, `<label for>` on every form field,
full RTL with `dir="ltr"` isolation for phone and email, and the primary colour's contrast on white
(`#16833e`, 4.83:1).

It also names the **known limitations** in plain Hebrew: no external audit, no real screen-reader
testing (NVDA / JAWS / VoiceOver), not every colour pair checked, and components that may have been
missed. A statement date is rendered and lives in a `STATEMENT_DATE` constant.

> **Do not re-add a conformance claim without a real audit to point at.** The page is now defensible
> precisely because it claims less than it used to.

⬜ **Still open:** Israeli practice also expects a **named accessibility coordinator**. The page gives
the business phone and email instead, which are real. Naming a person is an owner decision — never
invent one.

---

## 5. Drift traps

- **Hours are duplicated.** Machine-readable in `site.config.json:33-52` (→ JSON-LD); human-readable
  Hebrew hand-typed at `lib/site-config.ts:42-43` (→ footer, contact page). They agree today. Editing
  one does not update the other.
- **Copyright year is hardcoded.** `components/layout/Footer.tsx:7` — `const year = 2026;`. Correct
  now; silently wrong from 2027-01-01 unless someone edits and rebuilds.
- **`areaServed` is not a real place.** It ships as
  `{"@type":"AdministrativeArea","name":"שירות בכל הארץ"}` — a marketing phrase in a field consumers
  read as a place name.
- **Two manifests in one directory.** `site.config.json` is modified in the working tree and an
  untracked `site.config.json.bak` sits beside it.
- **Stale roster note.** `roster.json:140` still names `GTM-KW8VTDZR` as the container. That id was
  itself a dead 404. `roster.json:9` and the shipped HTML both carry `GTM-KWGGH438` — trust those.

---

## 6. How to use this file

1. Writing copy? Check §3 first. If your sentence would add a new factual claim, it goes to §3 with a
   🔶 marker in the code, not into the page.
2. Wiring schema? Check §1 and §3. Anything in §3 is **barred from structured data**.
3. Got an answer from the owner? Move the row up, record the date and who confirmed it, and delete the
   🔶 marker in the code in the same change.
