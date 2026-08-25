---
name: content-refresh
description: Keeping hambabait's content current and its freshness signals honest — the site has no dates, no authorship and no dateModified anywhere, so nothing signals recency to readers or answer engines; covers where dates may legitimately be introduced, the rule that a date must reflect a real substantive edit, decay detection from Search Console, the seasonal winter cycle for boiler demand, and re-verifying claims on every touch. Use when auditing stale content, adding dates, or planning a refresh cycle. Triggers: "content refresh", "dateModified", "freshness", "is this page stale", "update the guides", "seasonal content", "last updated".
---

# Content refresh — hambabait

## The current state

**The site has no dates and no authorship anywhere.** No `datePublished`, no `dateModified`, no
author, no "עודכן ב…" line on any page. `foundedYear` is `null`. The accessibility statement has no
statement date, which is itself a defect.

`app/sitemap.ts` sets `lastModified: new Date()` — **build time, identical on all 32 entries**. That
is not a freshness signal; it is a timestamp that says every page changed every build, which is the
same as saying nothing.

For answer engines this matters more than it used to. An assistant weighing whether to cite a page
looks for recency and authorship, and this site currently offers neither.

## The honesty rule

> **A date must reflect a real, substantive edit.**

Never bump a date for a typo fix, a formatting change, or to look fresh. Fake freshness is a claim
like any other, and it is one readers can catch.

If a page has not meaningfully changed in a year, the honest options are: genuinely improve it, or
leave the date alone. "Refreshing" the date without refreshing the content is the thing to avoid.

## Where dates belong

- **Knowledge hub guides — yes.** `Article` carries `datePublished` and `dateModified`, and a visible
  "עודכן ב…" line. This is the natural home for freshness signals and the reason the hub is the right
  place to build authorship.
- **Service and location pages — optional.** These are commercial pages describing an ongoing service.
  A date is not expected and adds little.
- **`/הצהרת-נגישות/` — required.** An accessibility statement without a date is incomplete, and
  Israeli practice expects both a date and a named accessibility coordinator. Currently it has
  neither.
- **`/מדיניות-פרטיות/` — recommended.** A "last updated" line is standard for a policy.

Format Israeli: `dd/mm/yyyy`. Wrap Latin/numeric strings in `dir="ltr"` with the `.ltr` helper where
they sit inside Hebrew text.

## Authorship

The site has no named author or reviewer, and `docs/business-facts.md` §3.5 records that there is **no
evidence any technician exists**. So:

- **Never invent an author.** No fabricated technician name, no fake credential, no "נבדק על ידי
  מומחה" byline.
- The honest default is attribution to the **business** — `חם בבית` as the `Article.author` — which is
  true and still gives answer engines something to attach.
- A named human author is a real E-E-A-T upgrade, but it requires a real person the owner confirms.
  That is an owner action: `🔶 confirm` + a row in `docs/business-facts.md`.

## Decay detection

Signals that a page needs work, in rough order of usefulness:

1. **Impressions holding, clicks falling** — the SERP changed around it, or the title/description no
   longer matches intent.
2. **Position drifting down over 8+ weeks** — real decay, not noise.
3. **Queries arriving that the page does not answer** — the page has drifted from its intent, or a new
   sub-intent deserves its own page. Check `docs/keyword-map.md` before splitting.
4. **Two of our URLs alternating on one query** — cannibalisation, not decay. Different fix.

Read these per page type, not in aggregate. And remember the **four-week rule**: do not diagnose decay
from data younger than a month.

## The seasonal cycle

Boiler failure is **strongly seasonal** — demand spikes in winter, when a cold shower is
unmissable and a solar system underperforms.

So the refresh calendar has an obvious shape:

- **Autumn (Sep–Oct)** — the highest-value window. Pre-winter checks, "prepare the דוד for winter",
  the symptom guides. Refresh and promote before demand arrives, not during.
- **Winter** — leave content alone and watch performance. Do not rewrite a page mid-peak.
- **Spring/Summer** — structural work, deepening, new guides, the slow build.

Seasonal content is safe content: it is technical, needs no business fact, and recurs annually.

## Re-verify claims on every touch

A refresh is a claims checkpoint. Whenever you touch a page:

- Re-read `docs/business-facts.md`.
- Grep for the three claims that already leaked — the warranty (~15 surfaces), same-day arrival, the
  "כשעה עד שעתיים" duration.
- **Soften what you can.** Rewriting a page containing an unsourced claim is the opportunity to remove
  it; a refresh that leaves it untouched has wasted the visit.
- Check no _new_ claim crept in.

## Keeping the docs true — the meta-refresh

The repo's own documentation decays faster than its content, and stale docs are more dangerous than
stale pages because agents act on them.

This has already bitten: `docs/optimization-backlog.md` described defects as open that had already
shipped fixes, and several agent and skill descriptions advertised the same fixed defects.

So on any substantial change, re-verify:

- `docs/optimization-backlog.md` against the repo **and** a fresh `out/`
- `docs/schema-graph.md` §1 — the "what ships today" table
- `docs/business-facts.md` — especially §4, the legal-page section
- `CLAUDE.md` §2, §4, §8
- Agent and skill `description:` frontmatter that cites a specific defect

Use `/baseline` for this. **A doc that describes a fixed defect as current is a bug**, and it costs
every future session a wrong assumption.

## Verification

```bash
npm run build
grep -rEo '"date(Published|Modified)"' out --include=index.html | sort | uniq -c
```

Dates in the markup must match the dates rendered on the page. A `dateModified` the reader cannot see
is exactly the kind of unverifiable signal this site does not need.
