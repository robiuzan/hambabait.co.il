# E-E-A-T and trust — חם בבית

> How this business earns Experience, Expertise, Authoritativeness and Trust **without inventing
> any of it**. [business-facts.md](business-facts.md) is the ledger of what is true; this file is the
> policy for what may be said, what would make more sayable, and in what order.
>
> Cited by `eeat-trust-auditor`, `hebrew-copywriter`, `editorial-reviewer`, `gbp-offsite-strategist`.
> Compiled 2026-08-31.

---

## 0. The doctrine

> **On this site, E-E-A-T is an evidence problem, not a copy problem.**

Almost every conventional E-E-A-T recommendation — add author bios, show your certifications, display
review stars, publish case studies — assumes the underlying asset exists and merely needs surfacing.
Here, most of them **do not exist**. So the recommendation "add an author bio" is not a content task;
it is a request to fabricate a person.

This site's most valuable asset is what it has never claimed: no years-in-business, no job count, no
rating, no licence, no insurance, no certification, no customer name. `foundedYear` is `null` and the
copy is deliberately qualitative. **That restraint is worth more than any badge we could add, because
it is the only thing that makes the claims we _do_ make credible.**

### The claim lifecycle — every claim goes through this, no exceptions

```
proposed  →  is it in the roster manifest, lib/site-config.ts or lib/content.ts?
             │
             ├─ yes → is the roster's _needsConfirmation array silent on it?
             │        ├─ yes → ✅ ships
             │        └─ no  → ⬜ assumption. Ships only if already shipping; never deepened.
             │
             └─ no  → 🔶 mark it in the code, add a row to business-facts.md,
                      soften the wording to the verifiable half, and route the
                      confirmation question to the owner.
```

**"Manifest-sourced" is not "client-confirmed."** The roster flags the phone routing, the email, the
hours and the pricing approach as assumptions; `site.config.json` drops that array, which is what
makes those values look settled when they are not. **The array is no longer merely dropped:**
`ops/sync-manifest.ps1` strips it and writes it out to [manifest-assumptions.md](manifest-assumptions.md),
because the manifest is bundled into the client JS and internal caveats must not ship to visitors.
Read that file, or the hub manifest, before calling anything sourced.

---

## 1. The four pillars — what we have, what is blocked, what unlocks it

### Experience — "we have actually done this"

| Asset                 | State                                             | Unlock                             |
| --------------------- | ------------------------------------------------- | ---------------------------------- |
| Years in business     | ❌ none claimed — `foundedYear: null`             | Owner supplies a founding year     |
| Job / customer counts | ❌ none claimed                                   | Owner supplies a defensible figure |
| Photos of real work   | ❌ none — site ships **zero** raster images       | Owner supplies photos + permission |
| Case studies          | ❌ none                                           | §3                                 |
| Technician experience | ❌ **no evidence any specific technician exists** | Owner                              |

> **The hardest rule on this page:** never ship stock photography of technicians or work. A stock
> photo of a smiling person in overalls is a staffing claim rendered as an image, and it is a lie in
> exactly the same way a sentence would be. See [media-assets.md](media-assets.md).

### Expertise — "we understand this subject"

**This is the pillar we can build freely, and the only one.** Technical knowledge needs no warranty,
no price, no arrival time and no credential to be demonstrated — it either reads as expert or it does
not.

| Asset                              | State                                                     |
| ---------------------------------- | --------------------------------------------------------- |
| 12 guides across 4 clusters        | ✅ shipped, with `Article` + `FAQPage` + `BreadcrumbList` |
| Symptom → cause tables per service | ✅ all 6 service pages                                    |
| City-specific technical material   | ✅ 18 cities (housing stock, roof access, coastal wear)   |
| Inline SVG technical diagrams      | ✅ shipped — the one honest visual asset class            |
| Repair-vs-replace guidance         | ✅ on every service page                                  |

> **Spend effort here first.** It is the only pillar where more work directly produces more asset,
> with no owner dependency and no claims risk.

### Authoritativeness — "others recognise us"

| Asset                   | State                              | Unlock                                      |
| ----------------------- | ---------------------------------- | ------------------------------------------- |
| Google Business Profile | ❌ none                            | **Owner** — blocked on `_needsConfirmation` |
| `sameAs`                | ❌ empty → pruned from the JSON-LD | One verified profile URL fixes it           |
| Directory citations     | ❌ none                            | Blocked behind the same confirmation        |
| Named author            | ❌ business-attributed only        | **Owner** — a real person, or nothing       |
| Press / mentions        | ❌ none                            | —                                           |

**This pillar is almost entirely owner-gated.** No amount of on-site work substitutes. Say so plainly
rather than proposing on-site work as a workaround.

### Trust — "we will not hurt you"

| Asset                      | State                                                                                                                                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Privacy policy             | ✅ names Web3Forms, Google (Tag Manager / Analytics) and WhatsApp/Meta; discloses cookies                                                                              |
| Consent Mode v2            | ✅ shipped — denied by default, above the container, and the ordering is gate-asserted                                                                                 |
| Consent affordance on form | 🟡 notice above the submit button, wired by `aria-describedby`. **No checkbox** — an owner trade, not an oversight                                                     |
| Accessibility statement    | ✅ states only what was actually checked, with a date and a contact — and is now slightly **behind** the work (it still says not every colour pair was checked; §S3-6) |
| Reviews / ratings          | ❌ zero, and **no markup claiming any** ✅ — now asserted by `npm run qa:gate`                                                                                         |
| Warranty                   | ✅ **out of structured data.** The softened `shortPitch` was synced through `ops/sync-manifest.ps1`; the JSON-LD `description` no longer carries the claim             |
| Prices                     | ❌ none published — deliberate                                                                                                                                         |

> **On the warranty, precisely — because a careless grep will re-open this.** The phrase
> `אחריות על העבודה` still appears **once** in `out/`, in a **different** homepage FAQ answer that
> was deliberately softened to say the terms are stated before work begins. That is a separate,
> pre-existing item judged on its own merits; it is **not** the structured-data claim and it is not a
> regression. The right test is "does the JSON-LD `description` carry an unsourced warranty", not
> "does the string appear".

**The accessibility statement is the model for how this site handles a claim it cannot support.** It
says what was tested, when, by whom, and what is explicitly _not_ covered. It reads as more
trustworthy than a conformance badge would, because it is checkable. Apply that pattern everywhere.

---

## 2. Author bios — the honest options

There is no named author anywhere on this site, and no evidence any specific technician exists.
Guides are attributed to the business (`author: { "@id": ".../#business" }`), which is legitimate.

| Option                                    | Verdict                                                           |
| ----------------------------------------- | ----------------------------------------------------------------- |
| Invent a technician persona               | ❌ **Never.** A fabricated credential, and trivially disprovable. |
| Generic "צוות חם בבית" byline             | 🟡 Permitted but near-worthless — it adds no entity, just words.  |
| Business attribution (current)            | ✅ Correct and honest for now.                                    |
| **A real named owner or lead technician** | ✅ **The genuine upgrade.** Owner action.                         |

A real bio, when it becomes possible, needs: a real name, a real role, what they actually do, how
long they have actually done it, and — ideally — a `sameAs` link to a profile that resolves. A bio
with none of those is decoration.

---

## 3. Case studies and before/after galleries

High value for this trade — a photo of a corroded anode next to a clean one explains more than three
paragraphs. **Gated entirely on the owner supplying real material.**

The rules, when material arrives:

1. **Real jobs only.** No stock, no reconstruction, no "representative" image.
2. **Written permission** from the homeowner before any photo of their property ships.
3. **No identifying detail** — no house numbers, no plates, no faces, no names without consent.
4. **Strip EXIF.** Phone photos carry GPS coordinates; publishing them is publishing a customer's
   home address.
5. **The caption may describe only what the photo shows.** "אלמנט עם אבנית לאחר כשנתיים" is a
   description; "תיקון תוך שעה" is a claim and needs a source.
6. **Byte budget applies** — see [performance-guidelines.md](performance-guidelines.md). A gallery is
   the single easiest way to destroy this site's currently-excellent LCP.
7. **No `Review` markup on a case study.** A case study is not a review.

---

## 4. Reviews

**Zero reviews exist, anywhere.** The site correctly ships no `Review` and no `AggregateRating`.

> **Hard gate: review markup ships only when real, attributable reviews exist on a platform that can
> be checked.** Fabricated reviews are a Google policy violation with manual-action consequences, not
> a style problem.

Prohibited without exception: incentivising reviews, gating (asking happy customers only), filtering,
drafting on a customer's behalf, seeding. The `review-acquisition` skill owns the legitimate flow —
in short: ask on WhatsApp, on the number the business already runs on, at the moment the hot water
works again, and respond to every review that arrives.

---

## 5. Security and trust badges

Most "trust badges" are decoration and several are actively misleading.

| Badge                              | Verdict                                                               |
| ---------------------------------- | --------------------------------------------------------------------- |
| "SSL secured" / padlock graphic    | ❌ Meaningless — HTTPS is universal and the browser already shows it. |
| Invented certification seals       | ❌ **Never.**                                                         |
| "מורשה"/"מבוטח" without a document | ❌ A licence claim. Needs a real licence number and issuer.           |
| Payment-provider logos             | ❌ Not applicable — the site takes no payment.                        |
| A real, verifiable association     | ✅ Ships **with** a link that resolves, and a `sameAs` entry.         |

**The honest substitute, and it converts better anyway:** state the process. What happens when you
call, what gets diagnosed on site, that the terms are stated before work begins. Those are checkable
against the site's own copy and require no badge.

---

## 6. The gate before any copy ships

Run by `editorial-reviewer`; this is the trust half of the checklist.

- [ ] Every factual claim traces to the roster, `lib/site-config.ts`, `lib/content.ts` — or carries
      a 🔶 and a [business-facts.md](business-facts.md) row.
- [ ] No years, job counts, prices, warranty terms, response times, licences, insurance,
      certifications, ratings, reviews, or technician credentials appear without a source.
- [ ] No claim was _deepened_ — a softened claim stays softened. Rewriting a page that contains a
      legacy unsourced claim is an opportunity to soften it further, never to restore it.
- [ ] No image asserts something the copy is not allowed to assert.
- [ ] Any new data flow is reflected in `/מדיניות-פרטיות/` **in the same change**.
- [ ] `npm run qa:gate` is green. Among its 28 assertions: no `aggregateRating`, `reviewCount`,
      `ratingValue`, `foundingDate` or `warrantyPromise` anywhere in `out/`, and no priced `Offer`.
      **The claims bar is now machine-checked** — but only for those exact property names. A
      fabricated sentence in Hebrew prose passes the gate cleanly, so the reading job above is still
      the real one.
