---
name: gbp-local-listings
description: Google עסק שלי and citation mechanics for חם בבית as a service-area business with no storefront — the exact NAP string and why the roster's _needsConfirmation array must be settled before anything is published, service-area setup that hides a non-existent address, categories and services mirroring the 6 service pages, photo and post cadence, Israeli directory citations, and adding the verified profile URL to the manifest sameAs so it becomes an on-site entity signal. Use when setting up or auditing the profile or any external listing. Triggers: "Google Business Profile", "עסק שלי", "GBP", "citations", "directory listing", "NAP consistency", "service area business".
---

# Google עסק שלי and citations — חם בבית

## Why this is the highest-leverage work available

The site has **no Business Profile, no reviews, an empty `sameAs`, no address and no geo.** For a
local business that is close to the weakest possible off-site position, and **no amount of on-page
work substitutes for it.**

When someone asks why the 18 city pages do not rank, the honest answer starts here — not with the
copy.

## ⛔ Stop: settle `_needsConfirmation` first

`Israeli services sites/roster/sites/hambabait.json` carries a `_needsConfirmation` array flagging the
**phone routing, the email, the hours and the pricing approach as assumptions**. The repo's synced
`site.config.json` **drops that array**, which makes those values look settled when they are not.

| Field | Value                                      | Confirmed?                                       |
| ----- | ------------------------------------------ | ------------------------------------------------ |
| Name  | חם בבית                                    | ✅                                               |
| Phone | 055-6601006 · +972556601006                | ⬜ **shared fleet line**, `phoneOverride: false` |
| Email | info@hambabait.co.il                       | ⬜ assumed; mailbox not proven provisioned       |
| Hours | ראשון–חמישי 08:00–18:00 · שישי 08:00–14:00 | ⬜ authored, not client-confirmed                |
| Area  | שירות בכל הארץ                             | ⬜ authored SEO surface, not verified coverage   |

**Publishing an unconfirmed NAP and then correcting it is worse than waiting.** A citation corpus
built on the wrong phone number has to be re-edited directory by directory, and the inconsistency
period actively hurts rankings.

So: get owner confirmation, _then_ publish. This is a blocking dependency, not a caveat.

## NAP discipline

Byte-identical across the site, the schema and every listing. `055 660 1006`, `055-6601006` and
`+972-55-660-1006` are **three different NAPs** to a matcher.

Pick one display form, record it in `docs/entity-profile.md`, and never vary it.

Watch for drift: the hours exist **twice** in the repo — machine-readable in the manifest, hand-typed
Hebrew in `lib/site-config.ts`. Check both.

## Profile setup — matching reality

- [ ] Claimed and verified **by the owner** (postcard, phone or email — not something an agent can do)
- [ ] **Service-area business.** This hides the address, which is correct: there is no address. Do not
      enter a home address and then hide it unless the owner explicitly chooses to.
- [ ] Service areas reflecting **actual** coverage. If "כל הארץ" is not literally true, do not enter
      it — the site's marketing phrase is not evidence of coverage.
- [ ] Primary category matching the `Plumber` schema type on the business node
- [ ] Services mirroring the 6 service pages exactly: תיקון דוד שמש · תיקון דוד חשמל · החלפת תרמוסטט ·
      תיקון נזילות בדוד · החלפת דוד · החלפת אלמנט חימום
- [ ] Hours identical to the manifest
- [ ] Description consistent with the site's positioning — and carrying **no claim the site does not
      make**. The manifest `shortPitch` ends with an unsourced warranty claim; do not copy that across
- [ ] Real photos of real work. **Never stock** — see the fabrication rule below
- [ ] Profile URL added to the **roster manifest** `sameAs`, then synced

That last step converts an off-site asset into an on-site entity signal. One verified profile URL in
`sameAs` is worth more than any amount of copy tuning — and `sameAs` is empty today, so the kit's
`prune()` drops it and the site claims no profile anywhere on the internet.

> **Never edit `site.config.json` directly.** Edit the roster, then sync. The file says so in its own
> `_comment`.

## Photos — the fabrication rule applies here too

Real photos of real work only. **Never** stock imagery of a technician, a van, a team or a
certificate. `docs/business-facts.md` §3.5 records that the site has no evidence any technician
exists; a stock photo of one is a staffing claim rendered as an image, and it is harder to audit than
text.

If no real photos exist, that is an owner action. Document the request; do not fill the gap.

## Posts and Q&A

Posts: genuinely useful, seasonal where it helps (pre-winter boiler checks), linking to the relevant
service or guide page. Not filler, not daily.

Q&A: seed the questions real customers actually ask, and answer them the way the site does — honestly,
without a price or a timing promise. This surface is public and quotable; treat it as site copy.

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
prefer letting the profile carry them. `docs/schema-graph.md` §6 makes this a hard gate.

## Auditing an existing setup

```bash
# what the site claims about itself
grep -n 'sameAs' site.config.json
grep -rn 'social' lib/site-config.ts
```

`siteConfig.social` currently holds three **empty strings** (facebook, instagram, googleBusiness).
Those are placeholders — not evidence a profile exists. Do not report them as profiles.

Then compare, field by field: profile NAP vs manifest NAP vs rendered site NAP vs JSON-LD. Any
mismatch is a finding. Report byte-level differences, not "roughly matches".
