---
name: seo-metadata
description: Per-route metadata for hambabait — the Hebrew title and description formulas, the layout template rule that keeps the brand suffix from doubling (a defect that once shipped on 24 of 33 pages and must not regress), self-referencing percent-escaped trailing-slash canonicals now at 32/32 parity with the sitemap, the 404 and /תודה/ that deliberately carry no canonical, OG/Twitter, the googleSiteVerification field that is still wired to no verification block, and deriving sitemap.ts and robots.ts from the data arrays instead of a hand-maintained list. Use when writing generateMetadata for a route, fixing duplicate or doubled titles, or auditing on-page SEO. Triggers: "set the metadata", "titles and descriptions", "canonical", "double brand suffix", "sitemap", "one H1", "404 metadata".
---

# Per-route SEO metadata

## The title template rule — the live bug

`app/layout.tsx` defines:

```ts
title: {
  default: `${siteConfig.name} – מומחים לתיקון דודים בכל הארץ`,
  template: `%s | ${siteConfig.name}`,   // appends " | חם בבית"
}
```

**Because the template already appends the brand, a page's own `title` must never append it again.**

Both dynamic routes currently do:

- `app/services/[service]/page.tsx` → `title: \`${card.name} | ${siteConfig.name}\``
- `app/locations/[city]/page.tsx` → same shape

which ships `<title>תיקון דוד שמש | חם בבית | חם בבית</title>` on all 6 service pages and all 18
location pages — **24 of 33 pages** — and leaks into `og:title` and `twitter:title` too.

**Fix:** drop the ` | ${siteConfig.name}` suffix from both `generateMetadata` calls. Use
`title: { absolute: "…" }` only when a page must escape the template entirely.

`app/אודות/page.tsx` has the same visual repetition from a different cause — `title: "אודות חם בבית"`
plus the template yields `אודות חם בבית | חם בבית`. It should be `title: "אודות"`.

## Title formulas

| Page type | Formula                                   | Renders as                             |
| --------- | ----------------------------------------- | -------------------------------------- |
| Home      | _(no page metadata — inherits `default`)_ | חם בבית – מומחים לתיקון דודים בכל הארץ |
| Service   | `<שם השירות>`                             | תיקון דוד שמש \| חם בבית               |
| Location  | `תיקון דודים ב<עיר>`                      | תיקון דודים בתל אביב \| חם בבית        |
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
  `docs/business-facts.md` §3. Service descriptions are re-emitted as JSON-LD `Service.description`,
  so an unsourced claim in a description becomes an unsourced claim in structured data.
- Current state is healthy: 32 distinct descriptions across 33 pages. The only duplicate pair is the
  homepage and the 404, both inheriting the layout `description`.

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
  `sitemap.xml` `<loc>`. Keep that equality; it is the whole point of `encodeURI` in `sitemap.ts`.

### The 404 defect

`app/not-found.tsx` exports **no** `metadata`, so it inherits the layout's `canonical: "/"` and the
default title. The built `out/404.html` therefore says it is the homepage. Next does add
`<meta name="robots" content="noindex">`, which caps the damage, but a noindex page canonicalizing to
an indexable one is a contradictory signal.

**Fix:** give `not-found.tsx` its own `metadata` — a 404 title and **no** canonical.

## Sitemap and robots

`app/sitemap.ts` derives everything from the data arrays — 8 static paths + `services` + `locations`
= 32 URLs. Never hand-maintain a list; add a service or city to `lib/site-config.ts` and the sitemap
follows.

Two invariants:

1. **Trailing slash on every `loc`**, matching `trailingSlash: true`. A slashless entry sends crawlers
   through a redirect hop.
2. **`encodeURI` on every `loc`.** The protocol requires escaped URLs and the host matches the escaped
   key.

`app/robots.ts` emits `User-Agent: *` / `Allow: /` plus the sitemap pointer. Nothing is disallowed —
correct for a 32-page marketing site.

## OpenGraph, Twitter, icons

- OG is configured **once** in the root layout (`type: website`, `locale: he_IL`, `siteName`, and
  `ogImageMeta(manifest.images)`). Next derives per-page `og:title`/`og:description` and auto-emits
  the `twitter:card summary_large_image` set. Do not re-declare OG per route unless the image differs.
- Fixing the doubled title fixes `og:title` and `twitter:title` at the same time.
- **There is no favicon of any kind.** No `app/icon.*`, no `favicon.ico`, no `icons` in metadata,
  nothing in `public/`. Adding one is a real gap, not a nicety.
- `brand.themeColor` exists in the manifest but no `<meta name="theme-color">` is emitted.

## Search Console

`analytics.googleSiteVerification` is `null` in the manifest **and nothing in `app/layout.tsx` reads
it** — there is no `verification` block in the metadata object. Setting that manifest field today
would silently do nothing. Wire the `verification.google` metadata key at the same time you set the
value, or verify by DNS instead.

## Heading discipline

One `<h1>` per page, matched to search intent. Everything else `<h2>`/`<h3>`, no skipped levels. The
`<h1>` should carry the primary term for the page type — service name on a service page,
`תיקון דודים ב<עיר>` on a location page.

## Checklist before calling a metadata change done

- [ ] Rendered `<title>` contains the brand exactly **once**
- [ ] Description is unique, 140–160 chars, and adds no unsourced claim
- [ ] Canonical is self-referencing, trailing-slashed, and matches the sitemap `<loc>` byte for byte
- [ ] Exactly one `<h1>`
- [ ] `npm run build`, then grep `out/` to confirm — the source is not the artifact
