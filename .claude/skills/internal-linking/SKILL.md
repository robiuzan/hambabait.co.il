---
name: internal-linking
description: Build the link mesh on hambabait — a header that reaches the three silo indexes but zero of the 6 service pages in one hop (a deferred owner decision), a footer that links all 6 services and all 18 locations on every page as the site's orphan insurance, the now-symmetric service↔location mesh, city→city nearby links, the 12 guides that each have an in-degree of exactly 1, breadcrumbs matched to BreadcrumbList on 44 of 45 pages, and a zero-orphan check across all 45 URLs. Use when wiring related links, fixing orphans, or auditing navigation. Triggers: "internal linking", "orphan pages", "navigation", "related links", "footer links", "breadcrumbs", "link mesh".
---

# Internal linking

45 indexable URLs: 9 static (home, `/שירותים/`, `/איזורי-שירות/`, `/מדריכים/`, `/מחירון/`, `/אודות/`,
`/צור-קשר/`, `/מדיניות-פרטיות/`, `/הצהרת-נגישות/`) + 6 services + 18 locations + 12 guides. The job is
making every one reachable, and making the three silos reinforce each other instead of sitting side by
side.

## Reachability rules

1. **Every page within 2 clicks of the homepage.** 3 is the absolute ceiling.
2. **Zero orphans.** A page reachable only from the sitemap is not reachable.
3. **Watch in-degree, not just presence.** A page with exactly one inbound link is not an orphan, but
   it is one edit away from becoming one — and it tells search engines nothing about its importance.

## The mesh as it actually is

```
Home
 ├─ שירותים (index) ──── 6 service pages ──┐
 │                                          ├─ each links: 5 sibling services, all 18 cities,
 │                                          │  the areas index, contact
 ├─ איזורי-שירות (index) ─ 18 location pages ┘
 │                          └─ links: the 6 services, 2–4 nearby cities, contact
 ├─ מדריכים (index) ────── 12 guides
 │                          └─ links: its relatedServices, back to the index
 ├─ מחירון · אודות · צור-קשר
 └─ מדיניות-פרטיות · הצהרת-נגישות  (footer only — correct)
```

The three index pages carry the load. `/שירותים/` links all 6 services; `/איזורי-שירות/` links all 18
cities; `/מדריכים/` links all 12 guides, grouped by cluster. If any index paginates or truncates, the
silo below it loses a reliable path.

## Header — what it actually reaches

`navItems` in `lib/content.ts` holds six entries: `השירותים שלנו` → `/שירותים`, `אזורי שירות` →
`/איזורי-שירות`, `מדריכים` → `/מדריכים`, `מחירון`, `אודות`, `צור קשר`.

> **The header reaches 0 of the 6 service pages in one hop.** Only the `/שירותים/` index is in the nav.

A services submenu (6 items fits comfortably) was **considered and deliberately deferred** — it is a
navigation-design decision the owner should make, not one to take unilaterally in a linking pass. Say
that when the gap comes up; do not describe it as an oversight, and do not quietly add the dropdown.

The obligation it would have covered is met elsewhere: the **footer links all 6 services on every
page**, so no service page depends on the header for reachability.

Do not attempt 18 cities in the nav — it bloats every page's HTML and dilutes link equity site-wide.

## Footer — the orphan insurance policy

`components/layout/Footer.tsx` ships on all 47 built pages and links:

- **all 6 services** (`services.map`),
- **all 18 locations** (`locations.map`),
- the three silo indexes (`/שירותים/`, `/איזורי-שירות/`, `/מדריכים/`) plus `/מחירון/`, `/אודות/` and
  `/צור-קשר/`,
- the two legal pages — footer-only is correct for `/מדיניות-פרטיות/` and `/הצהרת-נגישות/`.

An earlier version of this skill argued **against** putting all 18 cities in the footer, on the grounds
that 18 links × every page flattens the hierarchy. That argument is real and worth remembering — but it
lost to the stronger one: with no header path to the service pages and a location silo that is the
site's weakest surface, site-wide footer coverage is the orphan insurance the site actually relies on.
Keep it. If a future header redesign lands, the trade is worth revisiting, not before.

**The footer links the guides hub, not the individual guides.** See below.

## Cross-links — both directions now exist

**Location → service works.** `app/locations/[city]/page.tsx` renders all 6 `serviceCards` as links
under a `שירותי תיקון דודים ב<עיר>` heading. Every city page reaches every service in one hop.

**Service → location works too, and it is complete.** `app/services/[service]/page.tsx` maps
`locations` in full plus a link to `/איזורי-שירות/`.

> **History worth keeping:** that block shipped as `locations.slice(0, 8)`, which left cities 9–18
> (bnei-brak through ashkelon) with no inbound link from any service page at all — silently, because
> the page looked complete. The sibling-services block had the same defect as `.slice(0, 4)`, dropping
> one service per page. Both are fixed. **A `.slice()` on a link list is the pattern to distrust**: it
> is invisible in review and invisible in the rendered page.

**City → city exists.** Each `cityContent` entry carries a `nearby: LocationSlug[]` array — 2–4 entries
per city, 50 links in total, none below 2. Nothing linked city to city before this. When adding or
removing a city, update its neighbours' arrays too.

## The guides' in-degree problem

**Every one of the 12 guides has an in-degree of exactly 1.** `/מדריכים/` is the only page on the site
that links an individual guide; the footer links the hub, not its children. Verified against `out/`.

That is not an orphan — the hub is in the header and the footer, so every guide is 2 clicks from home
— but it is the thinnest reachability on the site, and it wastes the guides' best property: they are
the only pages that can link into the commercial silo without making a business claim.

The fix is editorial and belongs in the content model, not in JSX:

- **service → guide.** A service page explaining a symptom should link the guide that explains it in
  depth (`/services/thermostat/` → `how-thermostat-works`; `/services/leak-repair/` → `leaking-boiler`).
- **city → guide.** A `cityContent` entry whose profile turns on a seasonal fault should link the
  seasonal guide (Jerusalem → `why-boilers-fail-in-winter`).

Guides already link **out** correctly: `Guide.relatedServices` is non-optional and the route renders it,
so no guide is a dead end.

## Anchors

- **Descriptive, Hebrew, varied.** `תיקון דוד שמש`, not `לחצו כאן` and not the bare URL.
- Vary the phrasing across pages. 18 identical `תיקון דודים` anchors pointing at the same target is a
  footprint.
- The anchor should read naturally in the sentence. If it only makes sense as a link, rewrite it.
- No `title` attribute stuffing. No hidden links.

## Contextual in-copy links

The highest-value links sit inside body copy, not in nav furniture. When a service page explains a
symptom that maps to another service (a leaking tank that turns into a replacement; a thermostat fault
mistaken for an element fault), link it inline.

`ServiceDepth.related` is typed for exactly this: `{ slug, reason }`, where `reason` must be a **shared
symptom**, never "here are the others". Copy lives in `lib/content.ts` and `lib/guides.ts`, so
contextual links belong in the content model — not typed into JSX at the call site.

## Breadcrumbs

`components/layout/PageHeader.tsx` renders a visible `<nav aria-label="פירורי לחם">` trail **and**
emits the matching `BreadcrumbList` JSON-LD via `breadcrumbJsonLd`. Measured: `BreadcrumbList` on **44**
of 45 indexable pages — everything except the homepage, which correctly has no trail, plus the 404 and
`/תודה/` which are bare by design.

The rule when touching either: **the markup trail must match the visible trail item for item.** See
`schema-structured-data`.

## Trailing slashes

`trailingSlash: true`, so every URL the site serves ends in `/` and a slashless URL redirects.

Source `href`s in this repo are written **without** the trailing slash — e.g.
`href={`/services/${s.slug}`}` and `{ label: "אזורי שירות", href: "/איזורי-שירות" }` — and Next
normalizes them at render, so the built HTML ships `href="/services/solar/"`. Verified in `out/`.

That means the current code is fine, but it relies on the framework. If a raw `<a href>` is ever
hand-written instead of `next/link`, **it gets no normalization** — write the slash yourself there.

Hebrew hrefs ship as raw UTF-8 (`href="/אודות/"`) and browsers encode on navigation. Correct — do not
escape them by hand. Only the sitemap and canonicals are escaped.

## Orphan and in-degree audit

```bash
npm run build

# The live surfaces (CLAUDE.md §13) are sitewide chrome: the announcement bar and the seasonal
# card sit on every page, hidden until their season, so a page they link to would count every
# built page as an inbound link (the guide a card points at reads 47, not 1). Count over a copy
# with both regions stripped.
rm -rf /tmp/out-nolive && mkdir -p /tmp/out-nolive
(cd out && find . -name index.html -print0 | while IFS= read -r -d '' f; do
  mkdir -p "/tmp/out-nolive/$(dirname "$f")"
  perl -0777 -pe 's/<div class="live-topbar".*?<\/div><\/div>//gs; s/<div class="live-dialogs".*?<\/dialog><\/div>//gs' "$f" > "/tmp/out-nolive/$f"
done)

# every URL the sitemap claims (45)
grep -o '<loc>[^<]*</loc>' out/sitemap.xml | sed 's/<[^>]*>//g' \
  | sed 's|https://hambabait.co.il||' > /tmp/urls.txt

# in-degree of each, counted across every built page but itself
while read -r u; do
  [ -z "$u" ] && continue
  d=$(printf '%b' "$(printf '%s' "$u" | sed 's/%/\\x/g')")   # decode: hrefs are raw UTF-8
  n=$(grep -rl "href=\"$d\"" /tmp/out-nolive --include=index.html | wc -l)
  [ "$n" -le 1 ] && echo "in-degree $n: $u"
done < /tmp/urls.txt
```

Note the Hebrew URLs come out of the sitemap **escaped** while hrefs in the HTML are raw UTF-8 — compare
the decoded form, or the check reports false orphans. Expect the 12 guide URLs to report in-degree 1
until the service→guide and city→guide links land; anything else at ≤1 is a regression.

## Checklist

- [ ] All 6 services linked from the footer (the header reaches only the index — known and deferred)
- [ ] All 18 cities linked from `/איזורי-שירות/` and the footer
- [ ] All 12 guides linked from `/מדריכים/`
- [ ] Every location page links all 6 services and ≥2 nearby cities
- [ ] Every service page links all 18 cities and the areas index — **no `.slice()` on a link list**
- [ ] Every guide links ≥1 service via `relatedServices`
- [ ] Legal pages footer-linked
- [ ] Zero orphans; nothing newly at in-degree 1
- [ ] Every internal href resolves with a trailing slash
- [ ] Anchors descriptive and varied
