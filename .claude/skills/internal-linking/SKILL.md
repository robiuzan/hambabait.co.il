---
name: internal-linking
description: Build the link mesh on hambabait — a header that reaches all 6 services and the areas index in one hop, a footer that stops orphaning location pages, service↔location cross-links that do not exist today, contextual in-copy links, breadcrumbs matched to BreadcrumbList, and a zero-orphan check across all 32 URLs. Use when wiring related links, fixing orphans, or auditing navigation. Triggers: "internal linking", "orphan pages", "navigation", "related links", "footer links", "breadcrumbs", "link mesh".
---

# Internal linking

32 indexable URLs: 1 home + 7 Hebrew static + 6 services + 18 locations. The job is making every one
reachable, and making the two silos reinforce each other instead of sitting side by side.

## Reachability rules

1. **Every page within 2 clicks of the homepage.** 3 is the absolute ceiling.
2. **Zero orphans.** A page reachable only from the sitemap is not reachable.
3. **The 18 location pages are the risk.** They are the largest set and the least linked — a header
   cannot hold 18 cities, so they depend on the areas index and the footer.

## The intended mesh

```
Home
 ├─ שירותים (index) ──── 6 service pages
 │                          └─ links to: related services, areas index, contact
 ├─ איזורי-שירות (index) ─ 18 location pages
 │                          └─ links to: the 6 services, areas index, contact
 ├─ מחירון · אודות · צור-קשר
 └─ מדיניות-פרטיות · הצהרת-נגישות  (footer only — correct)
```

The two index pages carry the load. `/שירותים/` must link **all 6** services; `/איזורי-שירות/` must
link **all 18** cities. If either index paginates or truncates, the silo below it loses its only
reliable path.

## Header

Reach the two indexes and the primary conversion routes in one hop. Do not attempt 18 cities in a nav
— it bloats every page's HTML and dilutes link equity across the whole site.

Acceptable: services as a short dropdown (6 fits), areas as a single link to the index, plus
מחירון / אודות / צור-קשר and the call/WhatsApp CTAs.

## Footer

The footer is the orphan insurance policy. It ships on all 32 pages, so what goes there is a
site-wide decision:

- All 6 services (small, cheap, high value).
- The two indexes.
- The legal pages — footer-only is correct for `/מדיניות-פרטיות/` and `/הצהרת-נגישות/`.
- **Not** all 18 cities. That is 18 links × 32 pages = 576 site-wide links, which flattens the
  hierarchy and tells search engines nothing about relative importance. Link the areas index instead
  and let it do its job.

If a location page's only inbound link is the areas index, that is acceptable — provided the index
genuinely lists all 18 and is itself linked from the header and footer.

## Cross-links — one direction exists, the other does not

**Location → service already works.** `app/locations/[city]/page.tsx:65-77` renders all 6
`serviceCards` as links under a `שירותי תיקון דודים ב<עיר>` heading. Every city page reaches every
service in one hop. Do not "add" this; it is there.

**Service → location does not exist.** That is the real gap. A service page currently links no city
and not even the areas index, so the 18-page silo gets no equity flowing back into it from the
strongest pages on the site.

What to add on a **service** page:

- a short line placing the service nationwide — "השירות זמין בכל הארץ — כולל תל אביב, ירושלים,
  חיפה…" — linking a handful of cities;
- a link to `/איזורי-שירות/`.

Keep the per-page city selection stable and meaningful (largest, or a fixed editorial set) — not
random, and not all 18 on every service page.

While you are there: the location page's service links are generic (`תיקון דוד שמש`). Phrasing them
for the city (`תיקון דוד שמש בתל אביב`) is a cheap relevance win, but it must come from the content
model, not from string concatenation at the call site — see `hebrew-rtl` on the ב+city rule.

## Anchors

- **Descriptive, Hebrew, varied.** `תיקון דוד שמש`, not `לחצו כאן` and not the bare URL.
- Vary the phrasing across pages. 18 identical `תיקון דודים` anchors pointing at the same target is a
  footprint.
- The anchor should read naturally in the sentence. If it only makes sense as a link, rewrite it.
- No `title` attribute stuffing. No hidden links.

## Contextual in-copy links

The highest-value links sit inside body copy, not in nav furniture. When a service page explains a
symptom that maps to another service (a leaking tank that turns into a replacement; a thermostat
fault mistaken for an element fault), link it inline.

Copy lives in `lib/content.ts`, so contextual links belong in the content model — not typed into JSX
at the call site.

## Breadcrumbs

`components/layout/PageHeader.tsx` already renders a visible `<nav aria-label="פירורי לחם">` trail,
and every nested route already passes it a fully-formed crumb array.

**The matching `BreadcrumbList` JSON-LD is not emitted** — `breadcrumbJsonLd` is exported by the kit
and imported by nothing. Wiring it is the cheapest structured-data win available. The rule when you
do: **the markup trail must match the visible trail item for item.** See `schema-structured-data`.

## Trailing slashes

`trailingSlash: true`, so every URL the site serves ends in `/` and a slashless URL 308-redirects.

Source `href`s in this repo are written **without** the trailing slash — e.g.
`href={`/services/${s.slug}`}` and `{ label: "אזורי שירות", href: "/איזורי-שירות" }` — and Next
normalizes them at render, so the built HTML ships `href="/services/solar/"`. Verified in `out/`.

That means the current code is fine, but it relies on the framework. If a raw `<a href>` is ever
hand-written instead of `next/link`, **it gets no normalization** — write the slash yourself there.

Hebrew hrefs ship as raw UTF-8 (`href="/אודות/"`) and browsers encode on navigation. Correct — do not
escape them by hand. Only the sitemap and canonicals are escaped.

## Orphan audit

```bash
npm run build

# every URL the sitemap claims
grep -o '<loc>[^<]*</loc>' out/sitemap.xml | sed 's/<[^>]*>//g' \
  | sed 's|https://hambabait.co.il||' > /tmp/urls.txt

# for each, is it linked from any other page?
while read -r u; do
  [ -z "$u" ] && continue
  n=$(grep -rl "href=\"$u\"" out --include=index.html | wc -l)
  [ "$n" -eq 0 ] && echo "ORPHAN: $u"
done < /tmp/urls.txt
```

Note the Hebrew URLs come out of the sitemap **escaped** while hrefs in the HTML are raw UTF-8 — so
compare the decoded form for those, or the check will report false orphans.

## Checklist

- [ ] All 6 services linked from the header or footer
- [ ] All 18 cities linked from `/איזורי-שירות/`
- [ ] Every location page links all 6 services
- [ ] Every service page links the areas index and a few cities
- [ ] Legal pages footer-linked
- [ ] Zero orphans
- [ ] Every internal href ends in `/`
- [ ] Anchors descriptive and varied
