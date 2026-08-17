---
name: hambabait-architecture
description: Start-here orientation for hambabait.co.il — the roster → site.config.json → lib/site-config.ts → lib/content.ts → routes data flow, the file map, static-export constraints (no headers, redirects, middleware or API routes), the Hebrew dynamic-route and percent-encoding trap, the seven npm scripts, and the deploy truth (Cloudflare Pages, not the green GitHub Actions run). Use at the start of any task in this repo, or when unsure where content, routes, metadata or business facts come from. Triggers: "where does X live", "how is this site built", "orient me", "architecture", "why is this not working in production", "why didn't my change go live".
---

# hambabait.co.il architecture

חם בבית — nationwide water-heater (דוד) repair. Hebrew RTL, Next.js 14 App Router, static export.
Read this before editing anything; it prevents the four mistakes this repo invites.

## The one-paragraph version

A JSON manifest in the fleet roster is the source of truth for identity. It syncs into
`site.config.json`, which `lib/site-config.ts` reads and re-exports as typed values. All Hebrew copy
lives in `lib/content.ts`. Routes compose those two into pages. `next build` emits static HTML into
`out/`. Production is **Cloudflare Pages**, uploaded from a workstation — **not** the GitHub Actions
run that goes green on every push.

## Data flow — memorize this

```
Israeli services sites/roster/sites/hambabait.json    ← EDIT HERE for NAP/brand/schema/analytics
        │  (ops sync)                                    also holds _needsConfirmation
        ▼
site.config.json            (SiteManifest)            ← never edit directly
        │                                                drops _needsConfirmation — see docs/business-facts.md §0
        ▼
lib/site-config.ts    manifest · siteConfig · services[6] · locations[18] · telHref · whatsappHref
        │
        ├── lib/content.ts    serviceCards · differentiators · processSteps · trustStats
        │                     pricingApproach · pricingNote · faqs · navItems
        ▼
app/**/page.tsx   →   components/**
```

**Identity and NAP go up the chain to the roster. Wording goes in `lib/content.ts`. Layout goes in
components.** Copy is never typed directly into JSX.

`lib/site-config.ts:20` casts the manifest through `unknown`, so the JSON is **not** validated
against `SiteManifest` at compile time. A malformed manifest fails at runtime.

## File map

```
app/
  layout.tsx        metadata + title template, fonts, GTM, <html lang="he" dir="rtl">
  page.tsx          homepage — Plumber + FAQPage JSON-LD (no exported metadata; inherits layout)
  sitemap.ts        32 URLs, every loc through encodeURI
  robots.ts         Allow: / + sitemap pointer
  not-found.tsx     404 — exports NO metadata (a live defect, see below)
  services/[service]/   6 pages — Service JSON-LD
  locations/[city]/     18 pages — no JSON-LD at all today
  שירותים/ איזורי-שירות/ מחירון/ אודות/ צור-קשר/ מדיניות-פרטיות/ הצהרת-נגישות/
components/ui/         Button Container Section SectionHeading Reveal
components/layout/     Header Footer PageHeader MobileCtaBar
components/marketing/  Hero TrustBar ServicesGrid WhyUs Process PricingTeaser
                       ServiceAreas Faq FinalCta
components/forms/      LeadForm
lib/                   site-config.ts · content.ts · utils.ts (cn)
docs/                  the acceptance bars every agent cites
```

`hooks/` contains only a `.gitkeep`. There are no custom hooks.

## Static-export constraints

`next.config.mjs` sets `output: "export"`, `trailingSlash: true`, `images.unoptimized: true`, and
`transpilePackages: ["@ishub/site-kit"]`.

**Unavailable:** `headers()`, `redirects()`, `rewrites()`, middleware, Route Handlers/API routes, ISR,
`next/image` optimization, server actions.

`transpilePackages` is **load-bearing** — the vendored kit ships raw `.ts`/`.tsx` with no `dist`.
Removing it breaks the build, not just the types.

## The Hebrew-route trap

Seven routes are Hebrew directories (`app/מחירון/`, `app/צור-קשר/`, …). Three rules follow:

1. `app/sitemap.ts` runs every `loc` through `encodeURI`. The sitemap protocol requires escaped URLs,
   **and** the host matches the escaped asset key — a raw-UTF-8 path 404s.
2. Next percent-escapes canonicals automatically, so `<loc>` and `<link rel="canonical">` come out
   byte-identical. Keep them that way.
3. In-page `href`s ship as raw UTF-8 (`href="/אודות/"`) and browsers encode on navigation. That is
   fine — do not "fix" it into escaped hrefs.

Every URL ends in `/`. A slashless URL redirects, costing a hop.

## Where things actually come from

| Looking for                           | Read                                         |
| ------------------------------------- | -------------------------------------------- |
| Phone, WhatsApp, email, hours, area   | `lib/site-config.ts` (never hardcode)        |
| Any Hebrew sentence on the site       | `lib/content.ts`                             |
| Service list / slugs                  | `lib/site-config.ts:60-67`                   |
| City list / slugs                     | `lib/site-config.ts:75-94`                   |
| Title template, GTM, fonts, OG        | `app/layout.tsx`                             |
| Per-route title/description/canonical | that route's `generateMetadata` / `metadata` |
| JSON-LD builders                      | `@ishub/site-kit/seo`                        |
| Whether a claim is allowed            | `docs/business-facts.md`                     |

## Commands — all seven that exist

`dev` · `build` · `start` · `lint` · `format` · `format:check` · `typecheck`

There is **no** test script, **no** `image:optimize`, and **no** deploy script in this repo. If a doc
mentions `npm run image:optimize`, it is describing a different site in the fleet.

## Deploy truth — the thing that wastes the most time

**Production is Cloudflare Pages (project `hambabait`), direct upload via wrangler from the hub's
`ops/deploy-site.ps1`. Pushing to `main` publishes to the GitHub Pages origin, which no longer serves
the apex.** The Actions run still goes green. A green checkmark is not evidence.

Verify with headers: the live apex returns `Server: cloudflare` + `CF-RAY`. See the
`deploy-hambabait` skill.

`public/.htaccess` is dead on both hosts. `public/CNAME` is the GitHub Pages custom-domain mechanism
and is vestigial here. There is no `public/_headers` or `public/_redirects`.

## Known defects you will trip over

- **Doubled brand in titles on 24 of 33 pages.** Both dynamic routes append `| חם בבית` to a title
  that the layout template then appends to again.
- **404 canonicalizes to the homepage.** `not-found.tsx` exports no metadata, so it inherits
  `canonical: "/"`.
- **The 18 location pages emit no structured data at all**, and `breadcrumbJsonLd` is never imported
  even though every nested route already builds a crumb trail for `PageHeader`.
- **CI runs only `npm run build`** — lint, typecheck and format:check never execute in CI.
- **`framer-motion` is a dead dependency.** `Reveal.tsx` hand-rolls the effect with
  `IntersectionObserver`.
- **`app/layout.tsx:12` references `tailwind.config.ts`, which does not exist.** Tailwind v4 is
  CSS-first; tokens are in `@theme` in `app/globals.css`.

Full, prioritised list: `docs/optimization-backlog.md`.
