---
name: seo-metadata
description: Per-route metadata for hambabait — the Hebrew title and description formulas, the layout template rule that keeps the brand suffix from doubling (a defect that once shipped on 24 of 33 pages, is fixed, and is now gated by qa:gate), self-referencing percent-escaped trailing-slash canonicals at 45/45 byte-identical parity with the sitemap, the 404 and /תודה/ that deliberately carry no canonical, OG/Twitter and the icon.svg favicon, the googleSiteVerification field that is wired but correctly unset because DNS TXT is the chosen method — though that record was never added, so GSC ownership is still unverified, and deriving sitemap.ts and robots.ts from the data arrays instead of a hand-maintained list. Use when writing generateMetadata for a route, fixing duplicate or doubled titles, or auditing on-page SEO. Triggers: "set the metadata", "titles and descriptions", "canonical", "double brand suffix", "sitemap", "one H1", "404 metadata".
---

# Per-route SEO metadata

## The title template rule

`app/layout.tsx` defines:

```ts
title: {
  default: `${siteConfig.name} – מומחים לתיקון דודים בכל הארץ`,
  template: `%s | ${siteConfig.name}`,   // appends " | חם בבית"
}
```

**Because the template already appends the brand, a page's own `title` must never append it again.**

### History — why this rule is stated so bluntly

Both dynamic routes once did append it, shipping
`<title>תיקון דוד שמש | חם בבית | חם בבית</title>` on all 6 service pages and all 18 location pages —
**24 of the 33 pages that existed at the time** — and leaking the doubling into `og:title` and
`twitter:title` as well. `app/אודות/page.tsx` had the same visual repetition from a different cause
(`title: "אודות חם בבית"` plus the template).

Both are fixed. **`npm run qa:gate` now asserts "no doubled brand suffix in `<title>`" across every
built page**, so the regression fails the gate rather than shipping. Use `title: { absolute: "…" }`
only when a page must escape the template entirely.

## Title formulas

| Page type | Formula                                   | Renders as                             |
| --------- | ----------------------------------------- | -------------------------------------- |
| Home      | _(no page metadata — inherits `default`)_ | חם בבית – מומחים לתיקון דודים בכל הארץ |
| Service   | `<שם השירות>`                             | תיקון דוד שמש \| חם בבית               |
| Location  | `תיקון דודים ב<עיר>`                      | תיקון דודים בתל אביב \| חם בבית        |
| Guide     | the guide's own heading                   | \<כותרת המדריך\> \| חם בבית            |
| Static    | the page's own noun                       | מחירון \| חם בבית                      |

Keep the rendered title under ~60 characters **including** the appended brand. Hebrew is compact;
the suffix costs 10.

**The ב+city grammar rule:** Hebrew prefixes the city, it does not follow it. `תיקון דודים בתל אביב`,
never `תיקון דודים תל אביב`. Cities beginning with a definite article take `ב` + elision. If a city
name in `lib/site-config.ts` needs a non-default prefix form, it belongs in the data, not in a
string template at the call site.

## Descriptions

- 140–160 characters, Hebrew, unique per route.
- Lead with the service and the place; close with the action.
- **Never introduce a claim the page body does not make** — and never one from
  `docs/business-facts.md` §3 or `docs/manifest-assumptions.md`. Service descriptions are re-emitted
  as JSON-LD `Service.description`, so an unsourced claim in a description becomes an unsourced claim
  in structured data.
- `qa:gate` asserts **unique `<title>` and unique meta description across all built pages**, so a
  copy-paste duplicate now fails the gate instead of quietly diluting two pages.

## Canonicals

Every route sets its own, self-referencing, **with a trailing slash**:

```ts
alternates: {
  canonical: "/מחירון/";
} // static Hebrew route
alternates: {
  canonical: `/services/${slug}/`;
} // dynamic
```

- The root layout sets `canonical: "/"`. Every other route **must** override it — a root canonical
  with no per-page overrides makes every page claim to be the homepage.
- `metadataBase` in `app/layout.tsx` resolves these to absolute URLs.
- Next percent-escapes the Hebrew ones at build, producing
  `https://hambabait.co.il/%D7%9E%D7%97%D7%99%D7%A8%D7%95%D7%9F/` — **byte-identical** to the matching
  `sitemap.xml` `<loc>`. That is the whole point of `encodeURI` in `sitemap.ts`.

**Current state: 45 canonicals across 45 indexable pages, one per page, and 45 sitemap `<loc>`
entries, all unique and all matching byte for byte.** `qa:gate` asserts canonical coverage, the
`<loc>` count, byte-identical parity in both directions, and the absence of duplicate `<loc>`s.

### The two pages that deliberately carry none

`out/404/index.html` and `out/תודה/index.html` — 47 built HTML pages, 45 indexable, these two bare.

`app/not-found.tsx` declares its own metadata with `alternates: {}`. Without it the route inherited
the layout's `canonical: "/"`, so the 404 shipped a canonical claiming to **be** the homepage while
also carrying `noindex` — a contradictory pair of signals. It does not declare `robots` as well;
Next already emits `noindex` for not-found, and declaring it only duplicates the tag.

`/תודה/` is a noindex conversion destination and is deliberately absent from the sitemap. Both are
listed in `NOINDEX_ROUTES` in `scripts/qa-gate.mjs`, which also asserts they are still **present** —
otherwise a rename would let the count pass by accident while the route silently rejoined the
indexable set.

## Sitemap and robots

`app/sitemap.ts` derives everything from the data arrays — 9 static paths + `services` (6) +
`locations` (18) + `guides` (12) = **45 URLs**. Never hand-maintain a list; add a service, city or
guide to its array and the sitemap follows.

Three invariants:

1. **Trailing slash on every `loc`**, matching `trailingSlash: true`. A slashless entry sends crawlers
   through a redirect hop.
2. **`encodeURI` on every `loc`.** The protocol requires escaped URLs and the host matches the escaped
   key. Guides inherit this through their Hebrew parent segment.

3. **`lastModified` only where a real date exists.** The 12 guides emit `<lastmod>` from their own
   `updated` field; the other 33 URLs emit **none**, which the protocol allows. They carried
   `new Date()` until 2026-09-03 — a build timestamp, identical to the millisecond, claiming 33 pages
   changed on every deploy. An untrustworthy `lastmod` gets discounted site-wide, so the false date
   was costing the guides their true one. Do not restore it and do not invent per-page dates to fill
   the gap. `qa:gate` asserts the count is exactly 12 and every value is date-only.

`app/robots.ts` emits `User-agent: *` / `Allow: /`, an explicit **AI-crawler allow list** (retrieval
bots and training bots, fleet-wide policy), and the sitemap pointer. Nothing is disallowed. The
AI-crawler block is **declarative, not enforcing** — `*` already permits them; it exists so the stance
is visible. ⚠️ Cloudflare can prepend a managed block at the edge that overrides all of it, and did
exactly that across this fleet until 2026-08. Verify the live `robots.txt`, never infer it from the
source.

## OpenGraph, Twitter, icons

- OG is configured **once** in the root layout (`type: website`, `locale: he_IL`, `siteName`, and
  `ogImageMeta(manifest.images)`). Next derives per-page `og:title`/`og:description` and auto-emits
  the `twitter:card summary_large_image` set. Do not re-declare OG per route unless the image differs.
- The OG image points at an **external media host** (`imgquarry.com`), which is also why that host is
  a `preconnect` hint and not in the CSP `img-src` — crawlers fetch it, the browser does not.
- **`app/icon.svg` ships as the favicon.** Next picks it up by convention; no `icons` metadata block
  is needed.
- **`brand.themeColor` is emitted** via `export const viewport: Viewport = { themeColor: … }` in the
  layout. Note it belongs in `viewport`, not `metadata` — Next 14 warns if you put it back.

## Search Console

`app/layout.tsx` now spreads a `verification: { google: … }` block **only when**
`manifest.analytics.googleSiteVerification` is set, and emits nothing otherwise — an empty
verification meta is worse than none. The field existed for months with no block to consume it, so
setting it in the roster silently did nothing; that is fixed.

**The value stays unset on purpose** — but ⚠️ **ownership is not verified.** The DNS TXT record was
never added (checked 2026-09-06: only `v=spf1` is present), so `S2-2` is an open owner action. The
chosen method remains **DNS TXT on the
Cloudflare zone**, as a Domain property — which covers the apex, `www` (currently 200, not a
redirect) and `hambabait.pages.dev` in one property. So the roster field is deliberately `null` and
the block deliberately emits nothing; this is **not** an open action. See the `search-console-ops`
skill for the record shape and the submission rules.

## Heading discipline

One `<h1>` per page, matched to search intent. Everything else `<h2>`/`<h3>`, no skipped levels. The
`<h1>` should carry the primary term for the page type — service name on a service page,
`תיקון דודים ב<עיר>` on a location page. `qa:gate` asserts exactly one `<h1>` per built page.

## Checklist before calling a metadata change done

- [ ] Rendered `<title>` contains the brand exactly **once**
- [ ] Title and description are unique across the site, and the description adds no unsourced claim
- [ ] Canonical is self-referencing, trailing-slashed, and matches the sitemap `<loc>` byte for byte
- [ ] Exactly one `<h1>`
- [ ] `npm run build && npm run qa:gate` — the source is not the artifact, and the gate reads `out/`
