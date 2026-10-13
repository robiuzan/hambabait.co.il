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
- **Service area:** שירות בכל הארץ. **6 service pages, 18 location pages, 12 knowledge-hub guides**,
  9 static paths — **45 indexable URLs** (47 built files, incl. the 404 and `/תודה/`).
  Verified 2026-08-31 — see [docs/README.md](docs/README.md) §0 for the commands.
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
   A location or service page a find-and-replace could regenerate is a doorway page. All 18 city
   pages cleared that bar in the 2026-08-25 build-out — **keep them there.**
8. **The two legal pages are code, not decoration.** `/מדיניות-פרטיות/` names its real processors —
   Web3Forms, Google (Tag Manager / Analytics) and WhatsApp/Meta, plus the live-kit's status-switch
   read from imgquarry.com and its browser-storage values (§13) — and discloses cookie use. Keep it
   true: any new data flow must land there in the same change. Consent Mode v2 now ships
   denied-by-default **above** the container (`lib/consent.ts`, `components/layout/ConsentBanner.tsx`)
   — never move the default below the loader, and note the container-side half is the owner's. **The
   lead form still has no consent affordance.** `/הצהרת-נגישות/` was rewritten to state only what was
   actually checked, with a date and a contact; **do not re-add a conformance claim without a real
   external audit.** See [docs/eeat-and-trust.md](docs/eeat-and-trust.md).
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
`public/_headers` exists and is honoured **by Cloudflare Pages only** — it sets immutable caching for
`/_next/static/*` and **no security header at all**. HSTS, `X-Frame-Options` and `Permissions-Policy`
come from the **Cloudflare zone**, which is Sys Admin territory. Do not duplicate a zone header into
`_headers`; verify live responses instead. There is no `public/_redirects`.

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
  layout/      Header Footer PageHeader MobileCtaBar ConsentBanner
  marketing/   Hero TrustBar ServicesGrid WhyUs Process PricingTeaser
               ServiceAreas Faq FinalCta GuideBody GuideDiagram
  forms/       LeadForm
  live/        Live.tsx — the fleet live-kit surfaces (§13)
lib/
  site-config.ts   # ⭐ NAP, services[6], locations[18], telHref, whatsappHref
  content.ts       # ⭐ Hebrew copy: serviceDepth[6], cityContent[18], faqs, nav
  guides.ts        # ⭐ the 12 knowledge-hub guides, as typed blocks
  consent.ts       # Consent Mode v2 default snippet — must run BEFORE the container
  utils.ts         # cn()
  live/            # fleet live-kit copies — byte-locked, never edit (§13)
scripts/
  qa-gate.mjs      # 28 assertions over out/ — `npm run qa:gate`, the 5th build-gate step
  live/            # fleet live-kit gates (prebuild/postbuild, the weekly reminder) — locked
content/live/      # ⭐ _campaigns.mjs + _updates.mjs (the live registers) + the synced calendar
live.config.mjs    # ⭐ calm / no-card pages, this site's claim stems, pageOfSource (§13)
site.config.json   # SiteManifest — SYNCED FROM THE ROSTER via ops/sync-manifest.ps1
docs/              # the acceptance bars every agent cites — START AT docs/README.md
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

> **Syncing the roster into the repo — use the script.** As of 2026-08-31 `ops/` carries
> `sync-manifest.ps1` (with `sync-manifest.mjs` doing the JSON work). Run it after **every** roster
> edit:
>
> ```powershell
> powershell -File "c:/Users/robiu/antigravity/Projects/Israeli services sites/ops/sync-manifest.ps1" -Domain hambabait.co.il -DryRun
> powershell -File "c:/Users/robiu/antigravity/Projects/Israeli services sites/ops/sync-manifest.ps1" -Domain hambabait.co.il -Confirm
> ```
>
> It prints a field-level diff, follows the `-DryRun`/`-Confirm` contract, and exits 1 on drift so
> it is CI-friendly. Node does the JSON work because Windows PowerShell 5.1's `ConvertTo-Json`
> escapes every non-ASCII character to `\uXXXX`, which would wreck the Hebrew manifest.
>
> ⚠️ **Why it had to exist.** Until then nothing carried a roster edit into a site repo, and
> `deploy-site.ps1` reads the repo's copy as-is — so a roster edit changed nothing public,
> silently. Verified 2026-08-25, when a softened `shortPitch` was edited in the roster and the old
> warranty text kept shipping as the JSON-LD `description` for six days.
>
> **Two keys are stripped on the way in.** `$schema` (a roster-authoring aid) and
> `_needsConfirmation` — because `site.config.json` is `import`ed by `lib/site-config.ts`, so
> webpack bundles the **whole file into the client JS**. Shipping the assumptions array would
> publish internal project notes to every visitor. The script writes them to
> [docs/manifest-assumptions.md](docs/manifest-assumptions.md) instead and prints them on every
> run, so they stay visible to humans and invisible to users.

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
- **The sitemap emits `<lastmod>` on the 12 guides and nowhere else.** They are the only pages with
  a real editorial date (`guides[].updated`). Until 2026-09-03 the other 33 carried `new Date()` —
  a build timestamp identical to the millisecond, claiming all 33 changed on every deploy. An
  untrustworthy `lastmod` gets discounted site-wide, so the false date was costing the guides their
  true one. **Do not restore it, and do not invent per-page dates to fill the gap.** Also **never
  add `<changefreq>` or `<priority>`** — Google ignores both. All three are gated.
- **JSON-LD** is built with `@ishub/site-kit/seo` — `localBusinessJsonLd`, `serviceJsonLd`,
  `faqJsonLd`, `breadcrumbJsonLd`, `jsonLdScript`. Target graph:
  [docs/schema-graph.md](docs/schema-graph.md). **All 45 indexable pages emit JSON-LD** — only the
  404 and `/תודה/` are bare, both correctly. `breadcrumbJsonLd` fires from `PageHeader`, so every
  nested route ships a `BreadcrumbList` matching its visible trail. `FAQPage` ships on 37 pages and
  `Article` on the 12 guides. **The one node still unbuilt is `WebSite` on the homepage.**
- **`Review`/`AggregateRating` ship only when genuinely sourced** — today that means never. Same for
  `Offer` with a price: the business deliberately publishes no price table, so any figure is invented.
- **Images:** `images.unoptimized` is on and there is **no** `assets/` pipeline and **no**
  `image:optimize` script in this repo. Ship optimized WebP into `public/` by hand. Every meaningful
  image needs a Hebrew `alt`; decorative gets `alt=""`. `app/icon.svg` ships as the favicon and four
  inline SVG diagrams ship in `components/marketing/GuideDiagram.tsx`, but **the site ships zero
  photographs** — `public/` holds only `_headers` and `llms.txt`. Prefer the kit's `SiteImage`
  (currently unused) over a hand-rolled `<img>`: it makes `alt` structurally required and always emits
  width/height. Note the current LCP is **text**, so any hero image can only make it worse — budget for
  that explicitly. **Never** ship stock photography of technicians or work; that is a staffing claim
  rendered as an image.
- **Raster assets do not live in this repo.** The OG card is `hambabait/og.jpg` in the fleet **Media
  Studio** catalog (1200×630, 39,026 B, sha256 on file), served from `imgquarry.com` and reaching the
  manifest through `ops/sync-media.ps1`. The key is **immutable** — a new picture is an overwrite at
  the same key, same aspect ratio, never narrower — and Hebrew `altHe` is enforced at publish because
  this domain is `dir="rtl"`. Prompts for generated imagery are written by the `image-art-director`
  agent into `Media Studio/prompts/hambabait/` and are approved by the **owner**, never by an agent.
  See [docs/media-assets.md](docs/media-assets.md) §1a.

---

## 9. Build gate

```
npm run lint && npm run typecheck && npm run format:check && npm run build && npm run qa:gate
```

All **five** must pass before any deploy. `.github/workflows/ci.yml` runs **all five** on every push
to `main` and on every PR (`qa:gate` added 2026-09-06; before that CI stopped at `build` and the gate
was honoured only by a human remembering to run it locally). Since 2026-10-11 `build` also runs the
live-kit gates through npm's `prebuild` / `postbuild` hooks (§13) — so a live register without the
owner's `approved` stamp fails `npm run build` in CI and in `ops/deploy-site.ps1` alike.

> ⚠️ **`ci.yml` had never executed once before 2026-09-06.** It lived only on
> `seo/phase-1-environment` while its `push` trigger was scoped to `main`, where the file did not
> exist — so GitHub never registered the workflow (`gh run list --workflow ci.yml` returned a 404 on
> the default branch) and no PR was ever opened to fire the `pull_request` trigger. The 18 commits of
> overhaul work reached production with **zero** CI verification. Fixed by merging the branch to
> `main`. If you branch this repo again, remember a trigger only fires where the file lives.

`npm run qa:gate` (`scripts/qa-gate.mjs`, added 2026-08-31) is the fifth: **28 assertions against
`out/`** — page and indexable counts, JSON-LD / canonical / sitemap parity byte-for-byte, no
doubled brand suffix, unique titles and descriptions, exactly one H1, exactly 12 sitemap
`<lastmod>` values and every one of them date-only, the `robots.txt` sitemap pointer, no banned
schema property (`aggregateRating` · `reviewCount` · `ratingValue` · `foundingDate` ·
`warrantyPromise`), no priced `Offer`, no `SearchAction`/`potentialAction`, the `WebSite` node
present, the Consent Mode default preceding the GTM container, and no physical-direction Tailwind
utility in the built HTML.

Its thresholds are named constants at the top of the file — update them when the route count
legitimately changes, rather than deleting the assertion.

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
| Output QA gate   | `npm run qa:gate`      |
| Weekly reminder  | `npm run live:remind`  |

Those are **all eleven scripts that exist** (`dev`, `build`, `start`, `lint`, `format`,
`format:check`, `typecheck`, `qa:gate`, plus the live-kit's `prebuild`, `postbuild` and
`live:remind` — §13). There is no image script and no deploy script in this repo — deploys run
from the hub's `ops/`.

---

## 12. Scope guardrails

- Implement real UI, sections, or content only when asked. Don't opportunistically redesign.
- Don't add a 19th location until all 18 pass the doorway test in
  [docs/content-standards.md](docs/content-standards.md).
- Don't add dependencies without a reason that survives "can the platform already do this?"
  (`framer-motion` once shipped as a declared-but-unimported dependency and was removed —
  `Reveal.tsx` hand-rolls the same effect with `IntersectionObserver` for no bytes. Don't bring it
  back.)
- Don't put PII in `dataLayer`.
- `out.prev/` and `site.config.json.bak` are untracked debris. `.gitignore` now covers `/out.prev/`
  and `*.bak`, but still look before you `git add -A` in this repo.
- Cloudflare zone settings (headers, cache rules, AI crawler policy) are **the owner's to change**.
  Document the exact toggle; never assume it was done.

---

## 13. Live surfaces — the announcement bar, the seasonal card, the updates strip

Fleet live-kit (owner decision 2026-10-11; canonical in `../3locksmiths.co.il/fleet/live-kit/`,
see its README). Every page carries a thin announcement bar above the sticky header (not sticky —
it scrolls away, so the header's `h-16` maths hold once the page is scrolled; at the very top of a
phone page a visible line pushes the open mobile panel 35px past the fold, which at 400% zoom
hides the panel's own call button — the sticky bar's stays) whose line is chosen **before first paint**
by the Israeli calendar — memorial days and fasts silence it, Shabbat and chag silence the seasonal
lines — and by the fleet status switch (`https://imgquarry.com/status/fleet.json`: quiet / reduced /
off; unreadable = fail closed). One seasonal card (a native `<dialog>`, the pilot's rules: 2nd page
or 20 s + scroll, never from search, once per 14 days, never on calm or no-card pages, never over
the open mobile menu or the **unanswered consent banner** — both carry `data-live-block`, and because the banner mounts
only after hydration (later than the card's 4 s timer on a slow phone — review 2026-10-12),
`app/layout.tsx` also sets `data-live-block` on `<html>` before first paint while the question is
unanswered and `ConsentBanner` lifts it on a choice; on a phone
a bottom sheet that stops above the sticky call bar). The homepage shows an updates strip after the
trust bar; it hides itself 45 days after the newest item.

- **Edit here:** `content/live/_campaigns.mjs` (lines, windows, the card) and
  `content/live/_updates.mjs` — wording only from sentences the site already shows, each quoted in
  `source` (the gate checks the quote is still in its file, and through `pageOfSource` that a tip
  links to the page carrying it); nothing ⬜/🔶 from `docs/business-facts.md`, no price, warranty,
  speed, availability, coverage or staffing word. Calm / no-card pages and this site's own ⛔
  claim stems: `live.config.mjs`. The 404 page answers every unknown URL, so no path can name it:
  `app/not-found.tsx` marks itself calm with `<div data-live-calm-page hidden />` (no seasonal
  line, no card — kit README step 5a). Both registers need the owner's
  `approved: "YYYY-MM-DD — who, how"`, or the build fails (`LIVE_DRAFT=1 npm run build` previews a
  draft locally only).
- **Never edit:** `lib/live/**`, `scripts/live/**`, `public/assets/live.js`,
  `content/live/_calendar*.json`, `live-kit.lock.json` — byte-locked kit copies;
  `scripts/live/check-live-copy.mjs` fails the build if they change. Fix the kit upstream and
  re-sync (`node fleet/live-kit/sync.mjs ../hambabait.co.il` from 3locksmiths.co.il).
- **The wiring:** `components/live/Live.tsx` (server components only — no sixth client component);
  `<LiveHead/>` first in `<head>` (before `consent-default`; it pushes nothing to `dataLayer`, and
  `live.js` is deferred, so `qa:gate`'s consent-before-GTM order holds), then
  `<script id="live-consent-block">` (the before-paint consent mark above); `<LiveTopBar/>` directly
  before `<Header/>`; `<LiveDialogs/>` last in `<body>`; `<LiveUpdates/>` after `<TrustBar/>`;
  `suppressHydrationWarning` on `<html>`; the `--live-*` colours and the 992–1023px override (this
  site's mobile layout runs to 1023px: the bar closes there on evergreen days, calm pages and the
  self-marked 404, and the card stops above the sticky call bar) at the end of `app/globals.css`; `imgquarry.com` in the CSP
  `connect-src`; the disclosure on `/מדיניות-פרטיות/`.
- **Gates:** `prebuild` = check-live-copy → check-live-register → check-live-schedule;
  `postbuild` = check-live-out (the built pages must carry exactly what the registers say). The
  `internal-linking` skill's in-degree audit strips the bar and the card as chrome (they sit on
  every page, so a page they link to would read every page as an inbound link). `remind.yml` runs
  `scripts/live/check-reminders.mjs` every Sunday and goes red without the `NTFY_TOPIC` secret; it
  pushes only when this site needs something (the fleet-wide switch mode, quiet days and calendar
  horizon are pushed once, by the 3locksmiths reminder).
- **The bar's and the card's links are plain `<a>`** (the markup is printed verbatim), so a click
  on them is a full page load, not a client-side navigation — by design.
- **Popups:** `docs/mobile-ux-and-personalization.md` §3, `docs/ux-cro-security.md` §2.2,
  `.claude/agents/cro-ux-auditor.md` and the `geo-personalization` skill banned them; each now
  records the owner's 2026-10-11 exception for this one card.
- **Owner sign-off 2026-10-12** (the fleet wording sign-off page; the record is
  `docs/business-facts.md` §1b): ✅ the wording of both registers, approved fingerprint
  `4e7ea9e801c4` (their `approved:` stamps); ✅ the wartime line ״פועלים בכפוף להנחיות פיקוד העורף״
  is confirmed for this business; the card may open **at all hours**, not only within the
  published hours (fleet decision — the calendar still keeps it off on Shabbat, chag, memorial days
  and fasts); **one shared GTM trigger** for the whole fleet; the updates strip ships as is — no
  new item, so it ships hidden (its one item, 25/08/2026, is past 45 days).
- **Before the first deploy** (the kit README's order): ✅ approve the wording and the wartime line
  (2026-10-12); ✅ commit the kit upstream and re-sync (kit `cf3a5460aa8b`); ⬜ add the three
  origins to the status switch's CORS list; ⬜ widen the one shared trigger
  `CE - popup events (3locksmiths)` so its hostname condition matches every fleet site;
  ⬜ `gh secret set NTFY_TOPIC -R robiuzan/hambabait.co.il`; ⬜ deploy.
- **Found during the port, not caused by it** — both live in production before the kit: the
  service pages are wider than a phone screen, and every link click on a Hebrew-address page is a
  full reload that logs `Failed to fetch RSC payload` (a Next 14 bug). The owner approved fixing
  both **separately, later** (2026-10-12): `docs/optimization-backlog.md` P1-7 and P1-8. **P1-7
  is fixed in the repo** (2026-10-12): `grid-cols-1` on the service-page grid.
