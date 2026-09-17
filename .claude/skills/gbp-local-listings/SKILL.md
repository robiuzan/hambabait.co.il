---
name: gbp-local-listings
description: Google עסק שלי and citation mechanics for חם בבית as a service-area business with no storefront — the exact NAP string and why the outstanding roster assumptions in docs/manifest-assumptions.md must be settled before anything is published, service-area setup that hides a non-existent address, categories and services mirroring the 6 service pages, photo and post cadence, Israeli directory citations, and adding the verified profile URL to the manifest sameAs so it becomes an on-site entity signal. Use when setting up or auditing the profile or any external listing. Triggers: "Google Business Profile", "עסק שלי", "GBP", "citations", "directory listing", "NAP consistency", "service area business".
---

# Google עסק שלי and citations — חם בבית

## Why this is the highest-leverage work available

The site has **no Business Profile, no reviews, an empty `sameAs`, no address and no geo.** For a
local business that is close to the weakest possible off-site position, and **no amount of on-page
work substitutes for it.**

When someone asks why the 18 city pages do not rank, the honest answer starts here — not with the
copy.

## ⛔ Stop: settle the six assumptions first

`Israeli services sites/roster/sites/hambabait.json` carries a `_needsConfirmation` array. The sync
(`ops/sync-manifest.ps1`) **strips it from `site.config.json` deliberately** — that file is bundled
whole into the client JS, so internal project notes would ship to every visitor — and writes it to
**`docs/manifest-assumptions.md`** instead. Read that file; it is the current list, regenerated on
every sync.

Pricing came **off** that list on 2026-09-17, when the owner approved published ranges. The rest of
the snapshot (read the generated file for the live list):

| Field / topic      | Value                                      | Status                                          |
| ------------------ | ------------------------------------------ | ----------------------------------------------- |
| Phone              | 055-6601006 · +972556601006                | ⬜ **shared fleet lead line** — confirm routing |
| Email              | info@hambabait.co.il                       | ⬜ assumed (fixes a live typo); not proven live |
| Hours              | ראשון–חמישי 08:00–18:00 · שישי 08:00–14:00 | ⬜ authored, not client-confirmed               |
| Pricing            | VAT-inclusive ranges on `/מחירון/`         | ✅ owner-confirmed 2026-09-17 (§1a)             |
| Founded year       | `null`                                     | ⬜ unknown — **no year fabricated**             |
| Content provenance | all copy freshly authored in the rebuild   | ⬜ recorded, not a business claim               |

Two more that are **not** on that list but gate a listing just as hard, tracked in
`docs/entity-profile.md`:

| Field | Value          | Status                                                                 |
| ----- | -------------- | ---------------------------------------------------------------------- |
| Name  | חם בבית        | ✅ confirmed                                                           |
| Area  | שירות בכל הארץ | ⬜ authored SEO surface, **not verified coverage** (§ open question 9) |

**Publishing an unconfirmed NAP and then correcting it is worse than waiting.** A citation corpus
built on the wrong phone number has to be re-edited directory by directory, and the inconsistency
period actively hurts rankings.

So: get owner confirmation, _then_ publish. This is a blocking dependency, not a caveat.

## NAP discipline

Byte-identical across the site, the schema and every listing. `055 660 1006`, `055-6601006` and
`+972-55-660-1006` are **three different NAPs** to a matcher.

Pick one display form, record it in `docs/entity-profile.md`, and never vary it.

Watch for drift: the hours exist **twice** in the repo — machine-readable in the manifest
(`openingHours`), hand-typed Hebrew in `lib/site-config.ts` (`siteConfig.hours`, marked
"authored — confirm with client"). Check both, and remember a manifest edit only reaches
`site.config.json` through the sync.

## Profile setup — matching reality

- [ ] Claimed and verified **by the owner** (postcard, phone or email — not something an agent can do)
- [ ] **Service-area business.** This hides the address, which is correct: there is no address. Do not
      enter a home address and then hide it unless the owner explicitly chooses to.
- [ ] Service areas reflecting **actual** coverage. If "כל הארץ" is not literally true, do not enter
      it — the site's marketing phrase is not evidence of coverage.
- [ ] Primary category matching the `Plumber` schema type on the business node
- [ ] Services mirroring the 6 service pages exactly: תיקון דוד שמש · תיקון דוד חשמל · החלפת תרמוסטט ·
      תיקון נזילות בדוד · החלפת דוד · החלפת אלמנט חימום
- [ ] Hours identical to the manifest — **once the hours are confirmed**
- [ ] Description consistent with the site's positioning, carrying **no claim the site does not make**
- [ ] Real photos of real work. **Never stock** — see the fabrication rule below
- [ ] Profile URL added to the **roster manifest** `sameAs`, then synced

On the description: `shortPitch` used to end with an unsourced warranty claim and this page used to
warn against copying it across. **That phrase was softened at the roster and synced**, so the current
`shortPitch` is safe to mirror. The rule that produced the warning still stands — re-read the live
value before copying it anywhere, because the roster is a publishing surface and a claim added there
reaches the homepage JSON-LD on the next build.

That last checklist step converts an off-site asset into an on-site entity signal. One verified
profile URL in `sameAs` is worth more than any amount of copy tuning — and `sameAs` is `[]` today, so
the kit's `prune()` drops it and the site claims no profile anywhere on the internet.

> **Never edit `site.config.json` directly.** Edit the roster, then run
> `ops/sync-manifest.ps1 -Domain hambabait.co.il -DryRun`, then `-Confirm`, then rebuild. A roster
> edit alone changes nothing public.

## Photos — the fabrication rule applies here too

Real photos of real work only. **Never** stock imagery of a technician, a van, a team or a
certificate. `docs/business-facts.md` §3.5 records that the site has no evidence any technician
exists; a stock photo of one is a staffing claim rendered as an image, and it is harder to audit than
text.

The site itself currently ships **zero photographs** — the only image asset is `app/icon.svg`. That
consistency is worth keeping: a profile full of stock photos beside a site with none is its own kind
of tell.

If no real photos exist, that is an owner action. Document the request; do not fill the gap.

## Posts and Q&A

Posts: genuinely useful, seasonal where it helps (pre-winter boiler checks), linking to the relevant
service page or knowledge-hub guide — there are 12 guides at `/מדריכים/<slug>/` and they are the
natural post targets. Not filler, not daily.

Q&A: seed the questions real customers actually ask, and answer them the way the site does — honestly,
without a timing promise. On price, **link to `/מחירון/` rather than typing a figure into Google**: an
off-site copy of a range has nothing keeping it in step with `priceRanges`, and a stale price on a
public profile is the version a customer will hold you to. This surface is quotable; treat it as site
copy.

## Citations

Rank Israeli directories by whether a real person would use them, not by any authority metric.
**Verify each is live and accepts a service-area business before recommending it** — check with a
fetch, never from memory.

Every citation carries the **identical NAP string**. Track them with a status column in
`docs/entity-profile.md` so nobody re-submits or loses one.

**Quality over count.** Ten accurate citations beat sixty inconsistent ones, and an inconsistent
corpus is a net negative — the whole mechanism is corroboration, and contradiction is the opposite.

## Reviews

Covered by the `review-acquisition` skill. The one rule that belongs here: **no `Review` or
`AggregateRating` markup on the site**, ever, until real attributable reviews exist — and even then,
prefer letting the profile carry them. `docs/schema-graph.md` §6 makes this a hard gate, and
`npm run qa:gate` fails the build on `aggregateRating`, `reviewCount` or `ratingValue` appearing
anywhere in `out/`.

## Auditing an existing setup

```bash
# what the site claims about itself
grep -n 'sameAs' site.config.json          # currently []
grep -n 'social' -A 5 lib/site-config.ts   # currently three empty strings

# which values are still assumptions
cat docs/manifest-assumptions.md
```

`siteConfig.social` holds three **empty strings** (facebook, instagram, googleBusiness). Those are
placeholders — not evidence a profile exists. Do not report them as profiles.

Then compare, field by field: profile NAP vs roster manifest vs `site.config.json` vs rendered site
NAP vs JSON-LD. Any mismatch is a finding. Report byte-level differences, not "roughly matches".
