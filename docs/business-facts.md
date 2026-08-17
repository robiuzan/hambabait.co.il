# Business facts — חם בבית (hambabait.co.il)

> The single register of what this business has actually told us versus what the site asserts.
> **Rule: nothing moves from ⬜ Unconfirmed to ✅ Confirmed without a source outside this repo.**
> Authoring copy is not a source. The roster manifest is only a source for identity fields the
> business supplied — see the warning in §0.

Last audited: 2026-08-16.

---

## 0. The laundering trap — read this first

`Israeli services sites/roster/sites/hambabait.json:60-67` carries a `_needsConfirmation` array that
flags the phone routing, the email address, the opening hours and the pricing approach as
**assumptions made during the Phase 4 rebuild**, not as facts from the business.

The repo's own `site.config.json` **does not contain that array.** Anyone reading only the repo
manifest sees a clean, complete NAP and reasonably concludes it is confirmed. It is not.

Worse, one unsourced claim is already laundered into structured data: `site.config.json:12`
`shortPitch` ends `…עם אחריות על העבודה`, and `@ishub/site-kit` uses `shortPitch` verbatim as the
JSON-LD `description` (`node_modules/@ishub/site-kit/src/seo/index.ts:101`). The warranty claim
therefore _looks_ manifest-sourced while no warranty term, duration or document exists anywhere.

**Always read the hub manifest, not the repo copy, before calling a NAP value confirmed.**

---

## 1. ✅ Confirmed — identity and configuration

These are settled in the sense that they are deliberate, single-sourced configuration. Where the
hub manifest flags them for confirmation, the Status column says so.

| Fact               | Value                                                                      | Source                     | Status                                                                                        |
| ------------------ | -------------------------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------- |
| Brand (Hebrew)     | חם בבית                                                                    | `site.config.json:5`       | ✅                                                                                            |
| Brand (English)    | Cham BaBait                                                                | `site.config.json:6`       | ✅ (JSON-LD `alternateName` only)                                                             |
| Legal name         | חם בבית                                                                    | `site.config.json:7`       | ⬜ no registered entity confirmed                                                             |
| Domain / URL       | hambabait.co.il · https://hambabait.co.il                                  | `site.config.json:3-4`     | ✅                                                                                            |
| Locale / dir       | he-IL · rtl                                                                | `site.config.json:8-9`     | ✅                                                                                            |
| Phone (display)    | 055-6601006                                                                | `site.config.json:14`      | ⬜ **shared fleet line** — `phoneOverride: false`, routing unconfirmed                        |
| Phone (E.164)      | +972556601006                                                              | `site.config.json:15`      | ⬜ same                                                                                       |
| WhatsApp           | +972556601006                                                              | `site.config.json:16`      | ⬜ same number as the phone line                                                              |
| Email              | info@hambabait.co.il                                                       | `site.config.json:17`      | ⬜ **assumed** — fixes a live `chambait.co.il` typo; mailbox not proven provisioned           |
| Hours              | ראשון–חמישי 08:00–18:00 · שישי 08:00–14:00                                 | `site.config.json:33-52`   | ⬜ **authored** — `lib/site-config.ts:40` says "confirm with client", yet it ships as JSON-LD |
| Schema type        | `Plumber`                                                                  | `site.config.json:30`      | ✅                                                                                            |
| Price range        | `₪₪`                                                                       | `site.config.json:31`      | ⬜ no source for the banding                                                                  |
| Area served        | שירות בכל הארץ                                                             | `site.config.json:32`      | ⬜ authored SEO surface, not verified coverage                                                |
| `sameAs`           | _(empty)_                                                                  | `site.config.json:53`      | ✅ no profile is claimed                                                                      |
| GTM container      | GTM-KWGGH438                                                               | `site.config.json:56`      | ✅ verified HTTP 200                                                                          |
| GA4 measurement id | _(none)_                                                                   | absent from repo manifest  | ✅ correctly absent                                                                           |
| Search Console     | `null`                                                                     | `site.config.json:57`      | ⬜ ownership unverified                                                                       |
| Founded year       | `null`                                                                     | `site.config.json:10`      | ✅ correctly null — **see hazard below**                                                      |
| Services           | 6 — solar, electric, thermostat, leak-repair, replacement, heating-element | `lib/site-config.ts:60-67` | ✅                                                                                            |
| Locations          | 18 cities                                                                  | `lib/site-config.ts:75-94` | ✅ as a page inventory                                                                        |
| Lead delivery      | Web3Forms key `37b27cbc-…`                                                 | `site.config.json:18`      | ✅ public-by-design key; delivery inbox unverifiable from repo                                |

### Hazard: `founded` has a numeric fallback

`lib/site-config.ts:28` reads `founded: manifest.foundedYear ?? 0`. Because `foundedYear` is `null`,
`siteConfig.founded` silently equals **0**. Nothing references it today, but any future copy doing
`{siteConfig.founded}` renders `0`, and `2026 - siteConfig.founded` renders **"2026 שנות ניסיון"**.
The null must not carry a numeric fallback. Fix the default, don't work around it.

---

## 2. ✅ Confirmed — what the site correctly does NOT claim

This section exists so nobody "helpfully" adds these back. Verified absent across `app/`,
`components/`, `lib/` and the built `out/`:

- **No years-in-business claim.** Zero matches for שנות ניסיון / שנים-in-business phrasing.
- **No reviews, ratings, testimonials, star counts or job counts.** No `aggregateRating`, no `review`
  node in the shipped JSON-LD.
- **No licence, insurance, certification, ח.פ. or עוסק מורשה number.**
- **No 24/7 or round-the-clock claim.**
- **No numeric price anywhere.** The business deliberately publishes no price table
  (`app/מחירון/page.tsx:24-27`, `lib/content.ts:144-161`).

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

### 3.4 Free call-out ambiguity

"ללא התחייבות" appears at `Hero.tsx:67`, `FinalCta.tsx:15`, `app/services/[service]/page.tsx:116`,
`app/צור-קשר/page.tsx:20`, beside "ביקור, אבחון והצעה שקופה". The site **never states whether the
diagnostic visit itself is chargeable** (`lib/content.ts:144-157` and `app/מחירון/page.tsx:24-27`
both dodge it). A reader can reasonably infer a free call-out.

**Owner question:** is the call-out free, credited against the repair, or charged?

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

---

## 4. ⬜ Unconfirmed — legal pages that contradict the code

### 4.1 Privacy policy is factually wrong about data flow

`app/מדיניות-פרטיות/page.tsx:33-36` states details are not transferred to third parties. In fact:

- every lead POSTs name/phone/service/message to **`api.web3forms.com`** (`LeadForm.tsx:19-21,70-82`);
- every failed lead is handed to **Meta** via a `wa.me` URL carrying the same fields
  (`LeadForm.tsx:27-38,88-92`);
- **GTM loads on first paint with no consent gate** (`app/layout.tsx:44-46,59-70`).

The policy mentions no cookies, no Google/GTM/GA4, no Web3Forms, no WhatsApp, no retention period.
This is a factual gap on a legal page, not a wording preference.

### 4.2 Accessibility statement asserts conformance with no audit

`app/הצהרת-נגישות/page.tsx:22-23` claims conformance work per **ת״י 5568** and **WCAG 2.0 AA**, with a
four-bullet "what was made accessible" list (`:26-31`). There is no audit, no statement date and no
named accessibility coordinator (Israeli practice expects both), and no evidence any bullet was
tested. See the `responsive-accessibility` skill before touching this page.

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
