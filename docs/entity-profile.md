# Entity profile — חם בבית

> The canonical identity of this business as it should appear **everywhere** — site, schema, Google
> עסק שלי, and every directory. One source of truth for NAP, `sameAs` and the E-E-A-T asset ledger.
>
> Cited by `gbp-offsite-strategist`, `gbp-local-listings`, `local-seo-il`, `eeat-trust-auditor`.
> Compiled 2026-08-25.

---

## 0. ⛔ Blocking status — read before publishing anything externally

`Israeli services sites/roster/sites/hambabait.json` carries a **`_needsConfirmation`** array flagging
the phone routing, the email, the hours and the pricing approach as **assumptions**. The repo's synced
`site.config.json` **drops that array**, which makes those values look settled when they are not.

> **Do not publish a Business Profile or a single citation until these are confirmed by the owner.**
> A citation corpus built on a wrong phone number must be unwound directory by directory, and the
> inconsistency period actively hurts. Waiting is cheaper than correcting.

---

## 1. Canonical NAP

**Use these exact strings. Byte-identical, everywhere.** `055 660 1006`, `055-6601006` and
`+972-55-660-1006` are three different NAPs to a matcher.

| Field           | Canonical value                                       | Confirmed                                          |
| --------------- | ----------------------------------------------------- | -------------------------------------------------- |
| Name (he)       | `חם בבית`                                             | ✅                                                 |
| Name (en)       | `Cham BaBait`                                         | ✅ JSON-LD `alternateName` only                    |
| Phone (display) | `055-6601006`                                         | ⬜ **shared fleet line**, `phoneOverride: false`   |
| Phone (E.164)   | `+972556601006`                                       | ⬜ same                                            |
| WhatsApp        | `+972556601006`                                       | ⬜ same number as the phone line                   |
| Email           | `info@hambabait.co.il`                                | ⬜ assumed; mailbox not proven provisioned         |
| URL             | `https://hambabait.co.il`                             | ✅                                                 |
| Hours           | ראשון–חמישי 08:00–18:00 · שישי 08:00–14:00 · שבת סגור | ⬜ authored, not client-confirmed                  |
| Area served     | `שירות בכל הארץ`                                      | ⬜ authored SEO surface, **not verified coverage** |
| Address         | **none — by design**                                  | ✅ mobile trade, no storefront                     |
| Geo             | **none**                                              | ✅ follows from no address                         |
| Schema type     | `Plumber`                                             | ✅                                                 |
| Price range     | `₪₪`                                                  | ⬜ no source for the banding                       |
| Founded         | `null`                                                | ✅ correctly null                                  |

**Drift warning:** the hours exist **twice** in the repo — machine-readable in the manifest, hand-typed
Hebrew in `lib/site-config.ts`. Check both when auditing.

---

## 2. `sameAs` — currently empty

`site.config.json` `sameAs` is `[]`, so the kit's `prune()` drops it entirely. **The site claims no
profile anywhere on the internet.**

`siteConfig.social` holds three empty strings (`facebook`, `instagram`, `googleBusiness`). Those are
**placeholders, not evidence a profile exists.** Never report them as profiles.

### Build order

| Priority | Target                                        | Status         |
| -------- | --------------------------------------------- | -------------- |
| 1        | Google Business Profile (service-area)        | ❌ not created |
| 2        | Any real, maintained business social profile  | ❌ none known  |
| 3        | Directory listings with stable canonical URLs | ❌ none known  |

**Only list profiles that exist and are controlled by the business.** A `sameAs` pointing at an
abandoned or unclaimed page is worse than an empty array.

When a profile is verified: add the URL to the **roster manifest**, then sync. **Never edit
`site.config.json` directly.**

> One verified GBP URL in `sameAs` is the single strongest entity signal available to this site — worth
> more than any amount of copy tuning.

---

## 3. Google עסק שלי — target configuration

| Setting          | Value                        | Why                                                                                                |
| ---------------- | ---------------------------- | -------------------------------------------------------------------------------------------------- |
| Business type    | **Service-area business**    | hides address; there is no address                                                                 |
| Service areas    | actual coverage              | **not** "כל הארץ" unless literally true                                                            |
| Primary category | matching `Plumber`           | schema parity                                                                                      |
| Services         | the 6 service pages, exactly | תיקון דוד שמש · תיקון דוד חשמל · החלפת תרמוסטט · תיקון נזילות בדוד · החלפת דוד · החלפת אלמנט חימום |
| Hours            | identical to the manifest    | NAP parity                                                                                         |
| Description      | consistent with the site     | ⚠️ **do not copy the manifest `shortPitch`** — it ends with an unsourced warranty claim            |
| Photos           | real work only               | **never stock** — see §5                                                                           |

---

## 4. Citations ledger

Every citation carries the **identical NAP string** from §1. Quality over count: ten accurate
citations beat sixty inconsistent ones, and an inconsistent corpus is a net negative.

| Directory                    | URL | Submitted | Live | NAP verified | Notes |
| ---------------------------- | --- | --------- | ---- | ------------ | ----- |
| _(none yet — blocked on §0)_ |     |           |      |              |       |

Verify each directory is live and accepts a service-area business **with a fetch**, not from memory,
before submitting.

---

## 5. E-E-A-T asset ledger

What this business can currently prove about itself. **This table is deliberately mostly empty, and
that is an honest state — not a gap to fill with invention.**

| Asset                         | Status                                                | Notes                                       |
| ----------------------------- | ----------------------------------------------------- | ------------------------------------------- |
| Years in business             | ❌ none claimed                                       | `foundedYear: null`. Correct.               |
| Licence / registration        | ❌ none claimed                                       | no registered entity confirmed              |
| Insurance                     | ❌ none claimed                                       |                                             |
| Certifications                | ❌ none claimed                                       |                                             |
| Named technicians             | ❌ **no evidence any technician exists**              | `business-facts.md` §3.5                    |
| Reviews / ratings             | ❌ zero, anywhere                                     | no `Review`/`AggregateRating` may ship      |
| Google Business Profile       | ❌ not created                                        | highest-leverage gap                        |
| Case studies / photos of work | ❌ none                                               | site ships zero images                      |
| Author / reviewer byline      | ❌ none                                               | no dates or authorship anywhere on the site |
| Warranty terms                | ⚠️ **asserted on ~15 surfaces with no term anywhere** | already reaches JSON-LD via `shortPitch`    |
| Same-day arrival              | ⚠️ asserted, unsourced                                | hedged, but on all 18 city pages            |
| "כשעה עד שעתיים"              | ⚠️ asserted, unsourced                                | the only hard number on the site            |

**The top block is the site's most valuable asset.** It claims nothing it cannot prove. The bottom
block is the debt. See `docs/business-facts.md`.

---

## 6. Owner questionnaire

Answers unlock real E-E-A-T. **Unanswered items stay softened in copy — never asserted.**

1. What is the actual warranty term and scope? (Currently claimed sitewide with no term.)
2. How many years has the business operated?
3. Is there a registered legal entity? Name and number?
4. Is the business insured? Licensed?
5. How many technicians, and what are their qualifications?
6. Is `055-6601006` routed to this business, and who answers it?
7. Is `info@hambabait.co.il` provisioned and monitored?
8. Are the published hours correct? Is there genuinely any out-of-hours cover?
9. Is "שירות בכל הארץ" literally true, or is coverage narrower?
10. Is same-day arrival a real commitment or an aspiration?
11. Are there real customers who would leave a review?
12. Are there photos of real completed work?

Route every answer to `docs/business-facts.md` with a source. Route every non-answer to a softening.
