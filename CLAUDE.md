# CLAUDE.md — חם בבית (hambabait.co.il) project rulebook

> The operating manual for any AI agent (and human) working in this repo. Project rules here
> **override** global defaults. When this file and the code disagree, fix the code. When this file and
> `Israeli services sites/roster/sites/hambabait.json` disagree about a business fact, **the roster wins**.

---

## 1. Business context

- **Business:** חם בבית (Cham BaBait) — water-heater (**דוד**) repair and service. Solar (דוד שמש),
  electric (דוד חשמל), thermostat, heating element, leak repair, full replacement.
- **Phone (click-to-call):** `055-6601006` · WhatsApp same number · `info@hambabait.co.il`.
- **Hours:** ראשון–חמישי 08:00–18:00, שישי 08:00–14:00. Saturday closed (absent = closed).
- **Service area:** שירות בכל הארץ. **6 service pages, 18 location pages**, 8 static paths — 32 indexable URLs.
- **Audience:** private homeowners with a broken or leaking boiler, usually mid-fault and in a hurry.
- **Conversion goals, in order:** (1) phone call, (2) WhatsApp, (3) lead form. Every page keeps a
  call/WhatsApp action within reach; the mobile CTA bar is sticky.
- **No physical address.** The manifest carries no `address` and no `geo`, so the JSON-LD ships
  without a `PostalAddress`. That is coherent for a mobile trade, but it means the business has **no
  verifiable location signal at all** — do not invent one to "fix" a schema warning.

> ⚠️ **This site's honesty record is its most valuable asset — do not spend it.** There is no
> "X years of experience" claim, no review, no rating, no job count, no licence, no insurance and no
> certification anywhere in the repo. `foundedYear` is `null` and the copy was deliberately kept
> qualitative (`lib/content.ts:1-8`, `:132`). That omission is intentional and it currently holds.
> Separately, a large set of **service-quality claims is asserted but unsourced** — the warranty
> (~15 surfaces), same-day arrival, "1–2 hours" repair duration, technician experience. See
> [docs/business-facts.md](docs/business-facts.md). **Never present an unconfirmed value as fact.**

---

## 2. Golden rules

1. **Never fabricate a business fact.** Years in business, prices, warranty terms, licences,
   insurance, ratings, reviews, certifications, response times, customer names. If it is not in the
   roster manifest, `lib/site-config.ts` or `lib/content.ts`, mark it `// 🔶 confirm` and add a row to
   [docs/business-facts.md](docs/business-facts.md). Fabricated reviews or ratings are a Google policy
   violation, not merely a style problem.
2. **"Manifest-sourced" is not "client-confirmed."** `roster/sites/hambabait.json:60-67` carries a
   `_needsConfirmation` array flagging the phone routing, the email, the hours and the pricing
   approach as **assumptions**. The repo's own `site.config.json` **drops that array**, which makes
   those values look settled when they are not. Read the hub manifest before calling anything sourced.
3. **Never edit `site.config.json` directly.** It is synced downstream from
   `Israeli services sites/roster/sites/hambabait.json`. Edit the roster, then sync. The file says so
   in its own `_comment`.
4. **Pushing to `main` does not update production.** Production is **Cloudflare Pages**.
   `.github/workflows/ci.yml` runs the build gate only — it deploys nothing, so a green run means
   the gate passed and nothing more. See §10 for the real deploy path.
5. **A GTM snippet in the HTML proves nothing.** Whenever a container id changes, assert
   `https://www.googletagmanager.com/gtm.js?id=<ID>` returns **200**. Two fabricated ids
   (`GTM-5K3WQN8W`, `GTM-KW8VTDZR`) cost the IL fleet 18 days of zero analytics across every site.
   The current id `GTM-KWGGH438` is the first one actually verified.
6. **Business facts come from `lib/site-config.ts`, never hardcoded in components.** Import
   `siteConfig`, `services`, `locations`, `telHref`, `whatsappHref()`.
7. **No page ships under the content bar in [docs/content-standards.md](docs/content-standards.md).**
   A location or service page a find-and-replace could regenerate is a doorway page, and 18 of the 32
   URLs are currently one template.
8. **The two legal pages are code, not decoration.** `/מדיניות-פרטיות/` now names its real processors
   — Web3Forms, Google (Tag Manager / Analytics) and WhatsApp/Meta — and discloses cookie use. Keep it
   true: any new data flow must land there in the same change. **But disclosure is not consent** — GTM
   still loads unconditionally with no Consent Mode default and the lead form has no consent
   affordance. `/הצהרת-נגישות/` still asserts ת״י 5568 + WCAG 2.0 AA conformance with no audit, no
   statement date and no named accessibility coordinator. Do not deepen either claim; fix the gap or
   narrow the wording.
9. **Never edit generated or vendored output** — `node_modules/`, `vendor/`, `.next/`, `out/`,
   `out.prev/`.
10. **Tailwind v4 is CSS-first here.** There is no `tailwind.config.ts` and there must not be. Tokens
    live in `@theme` in `app/globals.css`.

---

## 3. Stack

Next.js **14.2** App Router (installed 14.2.35) · React **18.3** · TypeScript **5.9** strict
(**`noUncheckedIndexedAccess` is on**) · Tailwind **v4** (CSS-first `@theme` in `app/globals.css` —
there is **no** `tailwind.config.ts`) · `lucide-react` · `clsx` + `tailwind-merge` via `cn()` ·
`@ishub/site-kit` (vendored tarball). Flat layout (no `src/`), path alias `@/* -> ./*`.

**`next.config.mjs` — the constraints that shape everything:**

```js
output: "export",          // static HTML into out/
trailingSlash: true,       // every URL ends in /
images: { unoptimized: true },
transpilePackages: ["@ishub/site-kit"],   // load-bearing: the kit ships raw TS, no dist
```

**Static export forbids** `headers()`, `redirects()`, `rewrites()`, middleware, API routes, and ISR.
There is **no `public/_headers` and no `public/_redirects`** in this repo. Response headers on the
live site come from the Cloudflare zone, which is Sys Admin territory — not from anything here.

**`@ishub/site-kit` exports actually used:** root (`ogImageMeta`, `telHref`, `whatsappHref`,
`type SiteManifest`), `/analytics` (`gtmHeadSnippet`, `gtmNoScriptSrc`, `trackEvent`), `/seo`
(`localBusinessJsonLd`, `serviceJsonLd`, `faqJsonLd`, `jsonLdScript`). Shipped but **unused**:
`/components` (`SiteImage`), `/media`, `/contact`, `/types`. The kit's own README is stale about
its contents — do not trust its status table.

---

## 4. Layout

```
app/
  layout.tsx              # metadata, fonts, GTM, <html lang="he" dir="rtl">
  page.tsx                # homepage — Plumber + FAQPage JSON-LD
  sitemap.ts robots.ts    # /sitemap.xml, /robots.txt
  not-found.tsx           # 404
  icon.svg                # favicon
  services/[service]/     # 6 pages — Service + BreadcrumbList JSON-LD
  locations/[city]/       # 18 pages — area-scoped Service + BreadcrumbList
  מדריכים/                # knowledge hub index
  מדריכים/[slug]/         # 12 guides — Article + FAQPage + BreadcrumbList
  שירותים/ איזורי-שירות/ מחירון/ אודות/ צור-קשר/
  מדיניות-פרטיות/ הצהרת-נגישות/
  תודה/                   # noindex conversion destination — NOT in the sitemap
components/
  ui/          Button Container Section SectionHeading Reveal
  layout/      Header Footer PageHeader MobileCtaBar
  marketing/   Hero TrustBar ServicesGrid WhyUs Process PricingTeaser
               ServiceAreas Faq FinalCta
  forms/       LeadForm
lib/
  site-config.ts   # ⭐ NAP, services[6], locations[18], telHref, whatsappHref
  content.ts       # ⭐ Hebrew copy: serviceDepth[6], cityContent[18], faqs, nav
  guides.ts        # ⭐ the 12 knowledge-hub guides, as typed blocks
  utils.ts         # cn()
site.config.json   # SiteManifest — SYNCED FROM THE ROSTER, do not edit here
docs/              # the acceptance bars every agent cites
```

Place by responsibility: reusable presentation primitive → `ui/`; page section → `marketing/`;
structural chrome → `layout/`. `hooks/` holds only a `.gitkeep` — there are no custom hooks.

---

## 5. Data flow & source of truth

```
Israeli services sites/roster/sites/hambabait.json   ← EDIT HERE for NAP/brand/schema/analytics
        │  (ops sync)                                   ← also holds _needsConfirmation
        ▼
site.config.json  (SiteManifest)                     ← never edit directly; drops _needsConfirmation
        │
        ▼
lib/site-config.ts   manifest · siteConfig · services · locations · telHref · whatsappHref
        │
        ├── lib/content.ts     serviceCards · differentiators · processSteps · trustStats
        │                      pricingApproach · pricingNote · faqs · navItems
        ▼
app/**/page.tsx  →  components/**
```

Rule of thumb: **identity and NAP go up the chain to the roster; wording goes in `lib/content.ts`;
layout goes in components.** Copy never gets typed directly into JSX.

`lib/site-config.ts:20` casts the manifest through `unknown`, so `site.config.json` is **not**
structurally validated against `SiteManifest` at compile time. A malformed manifest fails at runtime,
not at build.

> ⚠️ **There is no roster→repo sync script.** `ops/` holds `bump-site-kit`, `deploy-site`,
> `make-og-card`, `sync-media`, `validate-manifests` and `webdav-deploy` — **none of them syncs the
> roster into `site.config.json`**, and `deploy-site.ps1` reads the repo's copy as-is. So editing the
> roster alone changes nothing public: the value must also reach `site.config.json` before the next
> build, or the deploy ships the old one. Verified 2026-08-25, when a softened `shortPitch` was
> edited in the roster and the old text kept shipping as the JSON-LD `description`.

---

## 6. RTL & localization — NON-NEGOTIABLE

- `<html lang="he" dir="rtl">` is set in `app/layout.tsx`. Do not remove it.
- Israeli formats: phone `0XX-XXX-XXXX`, currency `₪`, dates `dd/mm/yyyy`.
- **Logical Tailwind utilities ONLY** for horizontal spacing/positioning: `ps-*`/`pe-*`, `ms-*`/`me-*`,
  `start-*`/`end-*`, `text-start`/`text-end`, `space-x-reverse`.
  **BANNED:** `pl-* pr-* ml-* mr-* left-* right-* text-left text-right`. The only exception is a
  genuinely direction-agnostic case, which must carry an explanatory comment.
- Let `dir="rtl"` mirror flex/grid — don't force `flex-row-reverse` except to wrap an LTR island.
- Latin/LTR snippets inside Hebrew (phone, email, URL, price) get `dir="ltr"` and the `.ltr` helper
  from `app/globals.css` (`direction: ltr; unicode-bidi: isolate`).
- Hebrew punctuation: use גרש `׳` and גרשיים `״`, not straight quotes, in Hebrew abbreviations.
- Keep user-facing strings Hebrew. Don't mix languages mid-sentence.
- **The Hebrew-slug route trap:** seven routes are Hebrew directories. `app/sitemap.ts` runs every
  `loc` through `encodeURI` because the sitemap protocol requires escaped URLs _and_ the host matches
  the escaped key. Canonicals are percent-escaped by Next automatically, so the two are byte-identical.
  Never hand-write a raw-UTF-8 Hebrew URL into a sitemap, canonical or redirect.

See the `hebrew-rtl` skill for the full rule set.

---

## 7. Code style

- **TypeScript strict.** No `any` (use `unknown` + narrowing). No non-null `!` to silence the
  compiler — handle the null case. `noUncheckedIndexedAccess` means indexed reads are
  `T | undefined`; narrow them. This bites hardest in the two dynamic routes.
- **RSC by default.** Add `"use client"` only for state, effects, or browser APIs. Keep client
  components small and leaf-level. Currently client: `Header`, `Faq`, `LeadForm`, `Reveal`.
- Imports use the `@/*` alias. No `../../..` chains.
- Compose conditional classes with `cn()` from `@/lib/utils`.
- Tailwind utilities only, **mobile-first**. Use the `@theme` tokens (`primary`, `secondary`,
  `accent`, `font-heading`, `font-sans`) — **never hardcode brand hex in components**. Note
  `--color-accent` is the darkened `#16833e` chosen to pass WCAG AA; the bright brand `#61ce70` lives
  at `--color-accent-400` for highlights on dark backgrounds. Do not swap them.
- Components PascalCase; hooks `useXxx.ts`; utilities camelCase.

---

## 8. SEO, schema, images

- **One `<h1>` per page**, matched to search intent. Everything else `<h2>`/`<h3>`, no skipped levels.
- **Titles:** the root `template` in `app/layout.tsx` already appends `| חם בבית`. A page's own
  `title` must therefore **never append the brand again**. This once shipped `… | חם בבית | חם בבית`
  on **24 of 33 pages**; it is fixed, and the build gate asserts it stays fixed. See the
  `seo-metadata` skill.
- **Canonicals:** self-referencing, trailing slash, percent-escaped so they are byte-identical to the
  `sitemap.xml` `<loc>`. `app/sitemap.ts` uses `encodeURI` for exactly this reason.
- **JSON-LD** is built with `@ishub/site-kit/seo` — `localBusinessJsonLd`, `serviceJsonLd`,
  `faqJsonLd`, `breadcrumbJsonLd`, `jsonLdScript`. Target graph:
  [docs/schema-graph.md](docs/schema-graph.md). **All 32 indexable pages now emit JSON-LD** — only the
  404 and `/תודה/` are bare, both correctly. `breadcrumbJsonLd` fires from `PageHeader`, so every
  nested route ships a `BreadcrumbList` matching its visible trail. The remaining schema work is
  depth, not coverage: per-service and per-city `FAQPage`, and `Article` for the knowledge hub.
- **`Review`/`AggregateRating` ship only when genuinely sourced** — today that means never. Same for
  `Offer` with a price: the business deliberately publishes no price table, so any figure is invented.
- **Images:** `images.unoptimized` is on and there is **no** `assets/` pipeline and **no**
  `image:optimize` script in this repo. Ship optimized WebP into `public/` by hand. Every meaningful
  image needs a Hebrew `alt`; decorative gets `alt=""`. `app/icon.svg` ships as the favicon, but
  **the site otherwise contains zero images** — `public/` holds only `_headers` and `llms.txt`, and OG
  points at an external host. Prefer the kit's `SiteImage` (currently unused) over a hand-rolled
  `<img>`: it makes `alt` structurally required and always emits width/height. Note the current LCP is
  **text**, so any hero image can only make it worse — budget for that explicitly. **Never** ship stock
  photography of technicians or work; that is a staffing claim rendered as an image.

---

## 9. Build gate

```
npm run lint && npm run typecheck && npm run format:check && npm run build
```

All four must pass before any deploy. `.github/workflows/ci.yml` runs the same four on every push
and PR (since 2026-08-17 — before that, CI ran only `build` and a formatting or type error shipped
silently). The `qa-build-gate` skill adds the output assertions on `out/` (route count, unique
titles, one H1, canonical presence, JSON-LD presence, sitemap parity).

---

## 10. Deploy — read this before shipping

**Production is Cloudflare Pages (project `hambabait`), direct upload via wrangler. Pushing to
`main` deploys to a dead origin.**

Verified from live response headers (`Server: cloudflare`, `CF-RAY`, `cf-cache-status: DYNAMIC`) and
from the fleet roster (`roster.json` → `hosting.target: "cloudflare-pages"`,
`pagesProject: "hambabait"`). `https://hambabait.pages.dev/` serves the same site.

```powershell
powershell -File "c:/Users/robiu/antigravity/Projects/Israeli services sites/ops/deploy-site.ps1" -Domain hambabait.co.il -DryRun
powershell -File "c:/Users/robiu/antigravity/Projects/Israeli services sites/ops/deploy-site.ps1" -Domain hambabait.co.il -Confirm
```

The script does the drift check, busts the two staleness traps (npm caches `file:` tarballs; Next
caches under `.next/`), gates the output, preserves `out.prev/` for rollback, and logs the deploy.
**Deploying is a production mutation — always ask first.** See the `deploy-hambabait` skill.

**History worth knowing:** until 2026-08-17 this repo carried a `deploy.yml` that published to the
dead **GitHub Pages** origin on every push to `main`, going green while changing nothing public —
plus a vestigial `public/CNAME` and `public/.htaccess` from two previous hosts. All three were
removed once the roster's 2026-08-09 rollback deadline had passed. If a checklist or an older doc
tells you "the workflow still fires", it predates that cleanup. The GitHub Pages origin itself
still exists at the host and simply no longer receives deploys.

---

## 11. Commands

| Task             | Command                |
| ---------------- | ---------------------- |
| Dev server       | `npm run dev`          |
| Production build | `npm run build`        |
| Lint             | `npm run lint`         |
| Type-check       | `npm run typecheck`    |
| Format           | `npm run format`       |
| Format check     | `npm run format:check` |

Those are **all seven scripts that exist** (`dev`, `build`, `start`, `lint`, `format`,
`format:check`, `typecheck`). There is no test script, no image script and no deploy script in this
repo — deploys run from the hub's `ops/`.

---

## 12. Scope guardrails

- Implement real UI, sections, or content only when asked. Don't opportunistically redesign.
- Don't add a 19th location until all 18 pass the doorway test in
  [docs/content-standards.md](docs/content-standards.md).
- Don't add dependencies without a reason that survives "can the platform already do this?"
  (`framer-motion` is already declared and imported by nothing — `Reveal.tsx` hand-rolls the same
  effect with `IntersectionObserver`.)
- Don't put PII in `dataLayer`.
- `out.prev/` and `site.config.json.bak` are untracked debris that `.gitignore` does not cover. Never
  `git add -A` in this repo without looking.
- Cloudflare zone settings (headers, cache rules, AI crawler policy) are **the owner's to change**.
  Document the exact toggle; never assume it was done.
