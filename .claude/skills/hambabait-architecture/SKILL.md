---
name: hambabait-architecture
description: Start-here orientation for hambabait.co.il — the roster → site.config.json → lib/site-config.ts → lib/content.ts → routes data flow and the ops/sync-manifest.ps1 script that now carries it, the file map, static-export constraints (no headers(), redirects, middleware or API routes), the Hebrew dynamic-route and percent-encoding trap, the eight npm scripts including qa:gate, and the deploy truth (Cloudflare Pages, not the green GitHub Actions run). Use at the start of any task in this repo, or when unsure where content, routes, metadata or business facts come from. Triggers: "where does X live", "how is this site built", "orient me", "architecture", "why is this not working in production", "why didn't my change go live".
---

# hambabait.co.il architecture

חם בבית — nationwide water-heater (דוד) repair. Hebrew RTL, Next.js 14 App Router, static export.
Read this before editing anything; it prevents the four mistakes this repo invites.

## The one-paragraph version

A JSON manifest in the fleet roster is the source of truth for identity. `ops/sync-manifest.ps1`
copies it into `site.config.json`, which `lib/site-config.ts` reads, validates and re-exports as
typed values. All Hebrew copy lives in `lib/content.ts` and `lib/guides.ts`. Routes compose those
into pages. `next build` emits static HTML into `out/` — **47 HTML pages, 45 of them indexable.**
Production is **Cloudflare Pages**, uploaded from a workstation — **not** the GitHub Actions run that
goes green on every push.

## Data flow — memorize this

```
Israeli services sites/roster/sites/hambabait.json    ← EDIT HERE for NAP/brand/schema/analytics
        │                                                also holds _needsConfirmation
        │  ops/sync-manifest.ps1 -Domain hambabait.co.il -DryRun | -Confirm
        ▼
site.config.json            (SiteManifest)            ← never edit directly
        │                                                $schema and _needsConfirmation stripped
        ▼
lib/site-config.ts    manifest · siteConfig · services[6] · locations[18] · telHref · whatsappHref
        │             assertManifest() runs at module load
        ├── lib/content.ts    serviceCards · serviceDepth[6] · cityContent[18] · differentiators
        │                     processSteps · trustStats · pricingApproach · faqs · navItems
        ├── lib/guides.ts     the 12 knowledge-hub guides, as typed blocks
        ▼
app/**/page.tsx   →   components/**
```

**Identity and NAP go up the chain to the roster. Wording goes in `lib/content.ts` / `lib/guides.ts`.
Layout goes in components.** Copy is never typed directly into JSX.

### The sync script — new, and it changes the old advice

There **is** a roster→repo sync script now: `ops/sync-manifest.ps1` (JSON work delegated to
`ops/sync-manifest.mjs`, because Windows PowerShell 5.1's `ConvertTo-Json` escapes every non-ASCII
character and would turn the Hebrew manifests into `\uXXXX` soup). It does a field-level diff and
follows the same guarded contract as the deploy script: `-DryRun` previews, `-Confirm` executes.

Two keys are stripped on the way in:

- **`$schema`** — a roster-authoring aid whose relative path does not resolve in a repo.
- **`_needsConfirmation`** — `site.config.json` is imported by `lib/site-config.ts`, so webpack
  bundles the **whole file** into the client JS. Shipping the assumptions array would publish
  internal project notes to every visitor. It is written to `docs/manifest-assumptions.md` instead.
  **Anything you add to the manifest is published to every visitor.**

Older docs say "there is no roster→repo sync script". That was true and is now false. What has **not**
changed is why it mattered: on 2026-08-25 a softened `shortPitch` was written into the roster and the
old text kept shipping as the live homepage JSON-LD `description`, because nothing carried it across.
A roster edit still changes nothing public until it reaches `site.config.json` and is rebuilt.

`lib/site-config.ts` casts the manifest through `unknown`, so the JSON is still not structurally
checked against `SiteManifest` by the compiler — but **`assertManifest()` now runs at module load**,
so a malformed `site.config.json` fails the build instead of failing at runtime in a visitor's
browser.

## File map

```
app/
  layout.tsx        metadata + title template, fonts, Consent Mode default, GTM, skip link,
                    <html lang="he" dir="rtl">, <main id="main" tabindex="-1">
  page.tsx          homepage — Plumber + WebSite + FAQPage JSON-LD
  sitemap.ts        45 URLs, every loc through encodeURI
  robots.ts         Allow: / + the fleet AI-crawler allow list + sitemap pointer
  not-found.tsx     404 — declares its own metadata and NO canonical
  icon.svg          favicon
  services/[service]/   6 pages   — Service + FAQPage + BreadcrumbList
  locations/[city]/     18 pages  — area-scoped Service + FAQPage + BreadcrumbList
  מדריכים/              hub index — BreadcrumbList
  מדריכים/[slug]/       12 guides — Article + FAQPage + BreadcrumbList
  שירותים/ איזורי-שירות/ מחירון/ אודות/ צור-קשר/ מדיניות-פרטיות/ הצהרת-נגישות/
  תודה/             noindex conversion destination — deliberately NOT in the sitemap
components/ui/         Button Container Section SectionHeading Reveal
components/layout/     Header Footer PageHeader MobileCtaBar ConsentBanner
components/marketing/  Hero TrustBar ServicesGrid WhyUs Process PricingTeaser
                       ServiceAreas Faq FinalCta GuideBody GuideDiagram
components/forms/      LeadForm
lib/                   site-config.ts · content.ts · guides.ts · consent.ts · utils.ts (cn)
scripts/               qa-gate.mjs — 25 assertions over out/
public/                _headers (immutable caching + report-only CSP) · llms.txt
docs/                  the acceptance bars every agent cites
```

`hooks/` contains only a `.gitkeep`. There are no custom hooks.

**Five client components**, and that is the whole interactive budget: `Header`, `Faq`, `LeadForm`,
`Reveal`, `ConsentBanner`. Everything else renders to static HTML. A sixth needs to justify itself
against `docs/performance-guidelines.md`.

## Static-export constraints

`next.config.mjs` sets `output: "export"`, `trailingSlash: true`, `images.unoptimized: true`, and
`transpilePackages: ["@ishub/site-kit"]`.

**Unavailable:** `headers()`, `redirects()`, `rewrites()`, middleware, Route Handlers/API routes, ISR,
`next/image` optimization, server actions.

Response headers therefore come from two places only: `public/_headers` (honoured by Cloudflare Pages
at the project level) and zone rules (the owner's). See `web-security-headers`.

`transpilePackages` is **load-bearing** — the vendored kit ships raw `.ts`/`.tsx` with no `dist`.
Removing it breaks the build, not just the types.

## The Hebrew-route trap

Seven routes are Hebrew directories (`app/מחירון/`, `app/צור-קשר/`, …), plus the Hebrew parent segment
on all 13 knowledge-hub URLs. Three rules follow:

1. `app/sitemap.ts` runs every `loc` through `encodeURI`. The sitemap protocol requires escaped URLs,
   **and** the host matches the escaped asset key — a raw-UTF-8 path 404s.
2. Next percent-escapes canonicals automatically, so `<loc>` and `<link rel="canonical">` come out
   byte-identical. `qa:gate` asserts that parity across all 45.
3. In-page `href`s ship as raw UTF-8 (`href="/אודות/"`) and browsers encode on navigation. That is
   fine — do not "fix" it into escaped hrefs.

Every URL ends in `/`. A slashless URL redirects, costing a hop.

## Where things actually come from

| Looking for                             | Read                                         |
| --------------------------------------- | -------------------------------------------- |
| Phone, WhatsApp, email, hours, area     | `lib/site-config.ts` (never hardcode)        |
| Any Hebrew sentence on a page           | `lib/content.ts`                             |
| Any Hebrew sentence in a guide          | `lib/guides.ts`                              |
| Service list / slugs, city list / slugs | `lib/site-config.ts`                         |
| Title template, GTM, consent, fonts, OG | `app/layout.tsx`                             |
| Consent Mode snippet + storage key      | `lib/consent.ts`                             |
| Per-route title/description/canonical   | that route's `generateMetadata` / `metadata` |
| JSON-LD builders                        | `@ishub/site-kit/seo`                        |
| Which manifest values are assumptions   | `docs/manifest-assumptions.md`               |
| Whether a claim is allowed              | `docs/business-facts.md`                     |

## Commands — all eight that exist

`dev` · `build` · `start` · `lint` · `format` · `format:check` · `typecheck` · **`qa:gate`**

`qa:gate` runs `scripts/qa-gate.mjs` against `out/`: 25 assertions covering route and sitemap counts,
JSON-LD and canonical coverage, unique non-doubled titles, one H1 per page, byte-identical
canonical↔sitemap parity, the banned schema properties, the `WebSite` node, Consent-Mode ordering,
and banned physical-direction Tailwind utilities in the built HTML. It reads `out/`, so **`build`
must run first.**

There is still **no** test script, **no** `image:optimize`, and **no** deploy script in this repo. If
a doc mentions `npm run image:optimize`, it is describing a different site in the fleet.

## Deploy truth — the thing that wastes the most time

**Production is Cloudflare Pages (project `hambabait`), direct upload via wrangler from the hub's
`ops/deploy-site.ps1`. Nothing in this repo deploys.** `.github/workflows/ci.yml` runs the build gate
on every push and PR — a green run means the gate passed and nothing more.

Until 2026-08-17 a second workflow published every push to the **dead GitHub Pages origin**, going
green while changing nothing public. It was removed along with `public/CNAME` and `public/.htaccess`.
That is history worth keeping: a green checkmark has never been evidence here.

Verify with headers: the live apex returns `Server: cloudflare` + `CF-RAY`. See the
`deploy-hambabait` skill.

## Known defects and open decisions you will trip over

- **The header reaches 0 of the 6 service pages in one hop.** Only the `/שירותים/` index is in the
  nav. A services submenu was considered and **deliberately deferred** as a design decision for the
  owner. The footer links all 6 services and all 18 cities on every page, so nothing is orphaned.
- **The mobile menu does not trap focus** — by design. It is a disclosure, not a dialog: the panel
  sits in flow after the toggle, Escape closes it and returns focus, and the panel is its own scroll
  container. Do not describe it as a focus trap and do not add one without re-reading the comment in
  `Header.tsx`.
- **9 of the 45 indexable URLs carry no answer block** — the 9 static routes. Adding one to
  `/מחירון/`, `/שירותים/` and `/איזורי-שירות/` is worthwhile and is deferred pending a content brief.
  Any `/מחירון/` answer block **must not state a price or a pricing approach** — the pricing approach
  is an unconfirmed roster assumption.
- **The GTM container is behind the repo.** The `data-cta` inventory changed and grew; until someone
  updates the triggers in `GTM-KWGGH438`, the new values record nothing. Owner action.
- **`.env.example` is stale** — it still describes a deleted `public/lead.php` flow.
- **`out.prev/` and `site.config.json.bak` are untracked debris** that `.gitignore` does not cover.
  Never `git add -A` in this repo without looking.

Full, prioritised list: `docs/optimization-backlog.md`.
