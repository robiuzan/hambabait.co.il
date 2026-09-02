---
name: content-refresh
description: Keeping hambabait's content current and its freshness signals honest — the 12 guides are the only pages carrying dates and authorship (and the only sitemap entries with a real lastModified), the accessibility statement now carries a statement date, everything else carries none by choice; covers where dates may legitimately be introduced, the rule that a date must reflect a real substantive edit, decay detection from Search Console, the seasonal winter cycle for boiler demand, re-verifying the three softened claims on every touch, and the meta-refresh that keeps the repo's own docs true. Use when auditing stale content, adding dates, or planning a refresh cycle. Triggers: "content refresh", "dateModified", "freshness", "is this page stale", "update the guides", "seasonal content", "last updated".
---

# Content refresh — hambabait

## The current state

Freshness signals exist on exactly one silo.

**Where dates and authorship exist:**

- **The 12 guides.** Each `Guide` carries `published` and `updated` (ISO), the route renders a visible
  `עודכן ב־<dd/mm/yyyy>` inside a `<time dateTime>` with `dir="ltr"`, and the `Article` node emits
  `datePublished`/`dateModified` matching it. `author` and `publisher` are the **business**, joined by
  `@id` to the homepage `Plumber` node.
- **`/הצהרת-נגישות/`** carries a `STATEMENT_DATE`. The page also no longer asserts conformance with
  ת״י 5568 or WCAG — it states what was actually checked internally, what was not, and that no external
  audit exists. **Do not re-add a conformance claim without a real audit to point at.**

**Where they do not:**

- Service pages, location pages and the static routes carry no date and no author. For commercial
  pages describing an ongoing service that is defensible — a date is not expected and adds little.
- `/מדיניות-פרטיות/` has no "last updated" line. A policy conventionally carries one; that remains a
  cheap, honest addition.
- `foundedYear` is `null` in the manifest and must stay `null` until the owner confirms a year.

**The sitemap is half-honest about this.** `app/sitemap.ts` sets `lastModified: new Date(g.updated)` for
the 12 guide entries — a real date — and `lastModified: now` (build time) for the other 33. Build time
says every page changed every build, which is the same as saying nothing. That is a known limitation,
not something to "fix" by inventing per-page dates.

For answer engines this matters. An assistant weighing whether to cite a page looks for recency and
authorship; the guides offer both, and nothing else on the site does.

## The honesty rule

> **A date must reflect a real, substantive edit.**

Never bump a date for a typo fix, a formatting change, or to look fresh. Fake freshness is a claim like
any other, and it is one readers can catch — the guides render `updated` **visibly**, so a bumped date
with unchanged text is visible fabrication, not a metadata detail.

If a page has not meaningfully changed in a year, the honest options are: genuinely improve it, or leave
the date alone.

## Where dates belong

- **Knowledge hub guides — yes, and they have them.** Set `updated` when the body actually changes.
  Leave `published` alone forever.
- **Service and location pages — optional.** Commercial pages describing an ongoing service. If dates
  are ever added, they need the same discipline and the same visible rendering.
- **`/הצהרת-נגישות/` — required, and present.** Bump `STATEMENT_DATE` whenever the accessibility work
  behind the statement changes, and update the "what was checked" and "known limitations" lists in the
  same edit. A date that moves while the lists do not is exactly the fake freshness above. Still
  missing: a **named accessibility coordinator**, which Israeli practice expects — owner input.
- **`/מדיניות-פרטיות/` — recommended, still absent.** Standard for a policy, and it must move whenever a
  data flow changes.

Format Israeli: `dd/mm/yyyy`. Wrap Latin/numeric strings in `dir="ltr"` with the `.ltr` helper where they
sit inside Hebrew text.

## Authorship

The site has no named author or reviewer, and `docs/business-facts.md` §3.5 records that there is **no
evidence any specific technician exists**. So:

- **Never invent an author.** No fabricated technician name, no fake credential, no "נבדק על ידי מומחה"
  byline.
- The honest default — already in place on the guides — is attribution to the **business**, `חם בבית` as
  `Article.author`. True, and still gives answer engines something to attach.
- A named human author is a real E-E-A-T upgrade, but it requires a real person the owner confirms. That
  is an owner action: `🔶 confirm` + a row in `docs/business-facts.md`.

## Decay detection

Signals that a page needs work, in rough order of usefulness:

1. **Impressions holding, clicks falling** — the SERP changed around it, or the title/description no
   longer matches intent.
2. **Position drifting down over 8+ weeks** — real decay, not noise.
3. **Queries arriving that the page does not answer** — the page has drifted from its intent, or a new
   sub-intent deserves its own page. Check `docs/keyword-map.md` before splitting, and check whether the
   answer belongs in a guide rather than a new commercial page.
4. **Two of our URLs alternating on one query** — cannibalisation, not decay. Different fix. With a
   knowledge hub in play, guide-vs-service is now the most likely pairing.

Read these per page type — home, service, location, guide — not in aggregate. And remember the
**four-week rule**: do not diagnose decay from data younger than a month. The guide silo is new and has
no baseline yet; its first four weeks _are_ the baseline.

## The seasonal cycle

Boiler failure is **strongly seasonal** — demand spikes in winter, when a cold shower is unmissable and
a solar system underperforms.

So the refresh calendar has an obvious shape:

- **Autumn (Sep–Oct)** — the highest-value window. `winter-boiler-check` and `why-boilers-fail-in-winter`
  are the two `seasonal`-cluster guides written for exactly this; refresh and promote them, plus the
  symptom guides, **before** demand arrives rather than during it.
- **Winter** — leave content alone and watch performance. Do not rewrite a page mid-peak.
- **Spring/Summer** — structural work, deepening, new guides, the slow build.

Seasonal content is safe content: it is technical, needs no business fact, and recurs annually. An
annual `updated` bump on a seasonal guide is legitimate **only if the body genuinely changed**.

## Re-verify claims on every touch

A refresh is a claims checkpoint. Whenever you touch a page:

- Re-read `docs/business-facts.md` and `docs/manifest-assumptions.md`.
- **Check the three softened claims have not crept back.** Each is now a single, deliberately weakened
  sentence carrying a `// 🔶 confirm` comment:

  | Claim            | Where it stands now                                                                                                                                                                                     |
  | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | The warranty     | one homepage FAQ answer saying the terms are stated before work begins. Softened from ~15 surfaces. The roster `shortPitch` was softened and synced, so it no longer reaches the JSON-LD `description`. |
  | Same-day arrival | reframed to "we will tell you the realistic timing" — no arrival promise, on the homepage or on any city page                                                                                           |
  | "כשעה עד שעתיים" | replaced by the shape of the visit; there is no hard duration number on the site                                                                                                                        |

  **Do not deepen any of them** until the owner supplies real terms. A rewrite that restores the
  stronger phrasing is a regression, not an improvement.

- Check no _new_ claim crept in. `npm run qa:gate` catches the schema shapes (`aggregateRating`,
  `reviewCount`, `ratingValue`, `foundingDate`, `warrantyPromise`, priced `Offer`) but not a sentence of
  Hebrew. Read the copy.

## Keeping the docs true — the meta-refresh

The repo's own documentation decays faster than its content, and stale docs are more dangerous than
stale pages because agents act on them.

This has already bitten repeatedly: `docs/optimization-backlog.md` described defects as open that had
already shipped fixes; several agent and skill descriptions advertised the same fixed defects; and the
long-standing "there is no roster→repo sync script" line survived the arrival of `ops/sync-manifest.ps1`.

So on any substantial change, re-verify:

- `docs/optimization-backlog.md` against the repo **and** a fresh `out/`
- `docs/schema-graph.md` §1 — the "what ships today" table
- `docs/business-facts.md` — especially §4, the legal-page section
- `docs/manifest-assumptions.md` — the six roster values still unconfirmed
- `CLAUDE.md` §2, §4, §5, §8
- Agent and skill `description:` frontmatter that cites a specific defect

Use `/baseline` for this. **A doc that describes a fixed defect as current is a bug**, and it costs every
future session a wrong assumption. The inverse is equally bad: deleting the reasoning behind a fix
because the fact changed. Update the fact; keep the "why".

## Verification

```bash
npm run build
grep -rEo '"date(Published|Modified)"' out --include=index.html | sort | uniq -c   # expect 12 pages
grep -o '<lastmod>[^<]*</lastmod>' out/sitemap.xml | sort | uniq -c                # 12 real + 33 build-time
```

Dates in the markup must match the dates rendered on the page. A `dateModified` the reader cannot see is
exactly the kind of unverifiable signal this site does not need.
