# Optimization backlog — חם בבית

> Every item below was **verified against this repo, the built `out/`, or the live site**. Each has
> evidence, impact, effort and an acceptance test. Anything unverified is marked
> **[needs confirmation]** rather than asserted.
>
> Compiled 2026-08-16. Re-verify before working an item — several are one commit from being fixed.

Effort: **S** ≤1h · **M** a few hours · **L** a day or more.

---

## P0 — correctness and compliance

### P0-1 · Privacy policy contradicts the actual data flow · M

**Evidence:** `app/מדיניות-פרטיות/page.tsx:33-36` states details are not transferred to third
parties. In fact `components/forms/LeadForm.tsx:19-21,70-82` POSTs name/phone/service/message to
`api.web3forms.com`; `LeadForm.tsx:27-38,88-92` hands the same fields to Meta via a `wa.me` URL on
failure; and `app/layout.tsx:44-46,59-70` loads GTM on first paint. The page names no processor, no
cookies, no retention period. A grep for `GTM|Google|Web3|cookie|עוגי|צד שלישי` over that file
returns nothing.

**Impact:** factual error on a legal page, with GDPR/Israeli privacy exposure. The most serious item
in this backlog.

**Fix:** disclose the processors (Web3Forms, Google/GTM, WhatsApp/Meta), state a retention period,
and add a consent affordance at the point of collection linking the policy.

**Accept:** the policy names every processor the code actually uses; a link to it sits beside the form
submit.

---

### P0-2 · No consent gate on analytics · M

**Evidence:** `app/layout.tsx:70` injects the GTM loader unconditionally. No banner, no Consent Mode
default, no consent state anywhere in `app/`, `components/` or `lib/`.

**Impact:** compounds P0-1 — undisclosed _and_ ungated tracking.

**Fix:** Consent Mode v2 defaults (denied until granted). Touches the GTM container as much as the
site.

**Accept:** no analytics cookie set before consent; container respects the default.

---

### P0-3 · Accessibility statement asserts conformance with no audit · M

**Evidence:** `app/הצהרת-נגישות/page.tsx:22-23` claims work per ת״י 5568 and WCAG 2.0 AA, with a
four-bullet list at `:26-31`. No audit exists, no statement date, no named accessibility coordinator
(Israeli practice expects both), and no evidence any bullet was tested.

**Fix:** fix the real defects first (P1-4), then rewrite the statement to say what was done, when, by
whom, and what the known limitations are.

**Accept:** every claim on the page traces to something actually verified; date and contact present.

---

## P1 — SEO defects shipping today

### P1-1 · Doubled brand suffix on 24 of 33 pages · S

**Evidence:** `app/layout.tsx:31-34` defines `template: "%s | חם בבית"`. Both dynamic routes then
append the brand themselves — `app/services/[service]/page.tsx:37` and
`app/locations/[city]/page.tsx:27`. Ships as
`<title>תיקון דוד שמש | חם בבית | חם בבית</title>` (`out/services/solar/index.html`). Also present in
`out.prev/`, so it has been shipping across builds. Leaks into `og:title` and `twitter:title`.

Separately `app/אודות/page.tsx:12` sets `title: "אודות חם בבית"` → `אודות חם בבית | חם בבית`.

**Impact:** wasted title pixels on 24 pages, degraded SERP appearance, brand dilution. Highest
effort-to-value ratio in this document.

**Fix:** drop `| ${siteConfig.name}` from both `generateMetadata` calls; change `/אודות/` to
`title: "אודות"`.

**Accept:** `grep -l 'חם בבית | חם בבית' $(find out -name index.html)` returns nothing.

---

### P1-2 · The 404 canonicalizes to the homepage · S

**Evidence:** `app/not-found.tsx` exports no `metadata`, so it inherits `alternates: { canonical: "/" }`
from `app/layout.tsx:30`. `out/404.html` and `out/404/index.html` both emit the homepage title and
`<link rel="canonical" href="https://hambabait.co.il/"/>`. Next does add `noindex`, capping the damage.

**Impact:** a noindex page canonicalizing to an indexable one is a contradictory signal.

**Fix:** give `not-found.tsx` its own `metadata` — a 404 title and **no** canonical.

**Accept:** `out/404.html` has a distinct title and no canonical to `/`.

---

### P1-3 · 18 location pages emit no structured data at all · M

**Evidence:** `app/locations/[city]/page.tsx` imports nothing from `@ishub/site-kit/seo`.
`grep -rl 'application/ld+json' out` lists no `locations/` file. 7 of 33 pages emit any JSON-LD.

**Impact:** 56% of indexable URLs and the entire local-SEO silo ship bare.

**Fix:** a `Service` node scoped by `areaServed` to the city, joined via `provider.@id`. **Never** a
per-city `LocalBusiness` — see [schema-graph.md](schema-graph.md).

**Accept:** all 18 location pages emit a valid `Service`; `@id` join intact.

---

### P1-4 · `BreadcrumbList` never emitted, though the data exists · S

**Evidence:** `breadcrumbJsonLd` is exported at
`node_modules/@ishub/site-kit/src/seo/index.ts:152` and imported nowhere. Every nested route already
passes a full crumb array — `app/services/[service]/page.tsx:68-72`,
`app/locations/[city]/page.tsx:41-45`, plus all 7 Hebrew static pages — and
`components/layout/PageHeader.tsx:22-39` renders it as visible `<nav aria-label="פירורי לחם">`.

**Impact:** 31 nested routes with visible breadcrumbs and no markup. Cheapest structured-data win.

**Fix:** wire `breadcrumbJsonLd` through `PageHeader` (or per route). Markup must match the visible
trail item for item.

**Accept:** all 31 nested routes emit a `BreadcrumbList` matching their rendered crumbs.

---

## P2 — pipeline and build integrity

### P2-1 · CI runs only `npm run build` · S

**Evidence:** `.github/workflows/deploy.yml:30` is the only npm script invoked. No lint, no typecheck,
no format:check.

**Impact:** type errors, lint errors and formatting drift ship silently. `app/layout.tsx` has already
failed `format:check` in the working tree — verified via `npx prettier --check app/layout.tsx`.

**Fix:** add the three commands to the workflow (as a check job, given the deploy itself is now
vestigial — see P2-2).

**Accept:** a PR with a type error fails CI.

---

### P2-2 · The GitHub Actions deploy publishes to a dead origin · S (decision, not code)

**Evidence:** the live apex returns `Server: cloudflare` + `CF-RAY` + `cf-cache-status: DYNAMIC`;
`hambabait.pages.dev` serves the same site; `roster.json` records
`hosting: { target: "cloudflare-pages", pagesProject: "hambabait" }`. Meanwhile
`.github/workflows/deploy.yml` still runs on every push to `main` and publishes to GitHub Pages.

The fleet migration note set a cleanup deadline of **2026-08-09**; today is 2026-08-16 and the
workflow plus `public/CNAME` are still armed.

**Impact:** a green CI run is not evidence of a production change. This is precisely the failure mode
the fleet deploy script exists to prevent.

**Fix:** owner decision — retire the workflow (or convert it to build-only CI, which also solves
P2-1) and retire `public/CNAME`. **Do not silently delete**; the GH Pages origin is nominally a
rollback target.

**Accept:** exactly one deploy path is armed, and it is the one that serves the apex.

---

### P2-3 · Stale comments pointing at things that do not exist · S

All verified:

| Location                              | Claim                                                                 | Reality                                                                                                                                                  |
| ------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/layout.tsx:12`                   | fonts "consumed by `tailwind.config.ts`"                              | that file does not exist; Tailwind v4 tokens live in `@theme` at `app/globals.css:59-61`. This is the only surviving reference to the deleted v3 config. |
| `next.config.mjs:6-7`                 | "deploy target is the cPanel (websquadinc) docroot, served by Apache" | wrong twice over — the site went to GitHub Pages in July and Cloudflare Pages in August. No cPanel ever served it.                                       |
| `public/.htaccess:1-2`                | "served by Apache on cPanel"                                          | dead on both hosts; the file is copied into the export and served as a static file.                                                                      |
| `.env.example:11-12`                  | lead routing via `public/lead.php`, `LEAD_EMAIL_TO`                   | `lead.php` was deleted in `af4ee1b`; `LEAD_EMAIL_TO` is read by no code.                                                                                 |
| `components/forms/LeadForm.tsx:15-16` | `NEXT_PUBLIC_WEB3FORMS_KEY` is an "override" for local dev            | it is a **fallback** — `siteConfig.formAccessKey ?? env` means the manifest always wins. Setting it locally does nothing.                                |

**Impact:** each one has already cost someone a wrong assumption.

---

## P3 — robustness

### P3-1 · Empty-string access key silently drops every lead · S

**Evidence:** `lib/site-config.ts:37` uses `?? null`; `LeadForm.tsx:21` uses
`siteConfig.formAccessKey ?? process.env… ?? ""`. Both are _nullish_ coalescing, so `""` passes
through untouched. `LeadForm.tsx:58` then treats it as unprovisioned and, in production, drops
straight to the WhatsApp popup.

**Fix:** guard on emptiness, not just null; fail loudly in dev.

---

### P3-2 · The WhatsApp fallback is silent · S

**Evidence:** `LeadForm.tsx:88-92` opens WhatsApp on any delivery failure without telling the user the
form failed.

**Fix:** surface the failure and present WhatsApp as an explicit choice.

---

### P3-3 · `founded` has a booby-trapped numeric fallback · S

**Evidence:** `lib/site-config.ts:28` — `founded: manifest.foundedYear ?? 0`. `foundedYear` is `null`,
so `siteConfig.founded === 0`. Referenced nowhere today, but any future `{siteConfig.founded}` renders
`0` and `2026 - siteConfig.founded` renders **"2026 שנות ניסיון"**.

**Fix:** let it stay `null`; remove the numeric default.

---

### P3-4 · Hardcoded copyright year · S

**Evidence:** `components/layout/Footer.tsx:7` — `const year = 2026;`. Correct today; silently wrong
from 2027-01-01 unless someone edits and rebuilds.

---

## P4 — content debt

### P4-1 · All 18 location pages fail the doorway test · L

**Evidence:** `app/locations/[city]/page.tsx:38-60` is one template with the city name substituted.
`lib/site-config.ts:75-94` is a flat `{slug, name}` array — **there is no per-city content map**.

**Impact:** near-duplicate pages compete with each other; and each page tells a specific city it gets
fast local service with no address, geo or coverage data behind it.

**Fix:** introduce a `cityContent` map in `lib/content.ts` and author genuinely city-specific
material. See [content-standards.md](content-standards.md) and the `new-city` skill.

**Accept:** every city page has ≥2 paragraphs that could not be written about another city.

---

### P4-2 · Unsourced claims across ~15 surfaces, one already in schema · M

**Evidence:** see [business-facts.md](business-facts.md) §3. The warranty is asserted sitewide with no
term anywhere; `site.config.json:12` `shortPitch` ends with it and the kit uses `shortPitch` as the
JSON-LD `description` (`seo/index.ts:101`) — so it already ships as structured data.

Also: same-day arrival, the "כשעה עד שעתיים" duration (`lib/content.ts:167` — the only hard number on
the site), and the free-call-out ambiguity.

**Fix:** get owner answers; until then soften the copy. Never promote any of it into schema.

---

### P4-3 · No service → location cross-links · S

**Evidence:** location pages link all 6 services (`app/locations/[city]/page.tsx:65-77`), but service
pages link no city and not even the areas index. One-directional mesh.

---

## P5 — hygiene

| Item                                                 | Evidence                                                                                                                                                                                                                                                                                                                 | Effort |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| **`framer-motion` is a dead dependency**             | declared `package.json:18`, imported by nothing; `Reveal.tsx` hand-rolls the effect with `IntersectionObserver`. ~2 MB.                                                                                                                                                                                                  | S      |
| **No favicon of any kind**                           | `public/` holds only `.htaccess` and `CNAME`; no `app/icon.*`; no `icons` in metadata; `out/index.html` has no `<link rel="icon">`.                                                                                                                                                                                      | S      |
| **No `theme-color`**                                 | `brand.themeColor` exists in the manifest; no meta tag is emitted.                                                                                                                                                                                                                                                       | S      |
| **`googleSiteVerification` is wired to nothing**     | the manifest field exists but `app/layout.tsx` has no `verification` block — setting it would silently do nothing.                                                                                                                                                                                                       | S      |
| **`out.prev/` and `site.config.json.bak` untracked** | `.gitignore:12` covers `/out/` only. A careless `git add -A` commits a duplicate site export.                                                                                                                                                                                                                            | S      |
| **`vendor/*.tgz` not marked binary**                 | `.gitattributes:2` sets `* text=auto eol=lf`; `.tgz` is not exempted. Git's auto-detection saves it in practice, but the sha512 is pinned in `package-lock.json` — normalization would break `npm ci`.                                                                                                                   | S      |
| **Node 20 action-runtime deprecation**               | `gh run view --log` shows the warning once per node20 action. **Note:** it is about the _actions'_ JS runtime (`checkout@v4`, `setup-node@v4`, `upload-pages-artifact@v3`, `deploy-pages@v4`), **not** `node-version: 20` at `deploy.yml:26`. Bumping `node-version` will not silence it; only newer action majors will. | S      |

---

## Not defects — do not "fix" these

- **The Web3Forms access key in `site.config.json`.** Public by design for client-side forms; moving
  it to `NEXT_PUBLIC_*` changes nothing. It _is_ spammable, but that is not a leak.
- **`images.unoptimized: true`.** Mandatory under `output: "export"`.
- **Hebrew hrefs shipping as raw UTF-8.** Correct — only sitemap `<loc>` and canonicals are escaped.
- **The URL-encoding/NFC tolerance in the dynamic-route matchers.** Inherited from the fleet template
  and unnecessary for English slugs, but harmless.
- **`out/.htaccess` and `out/CNAME` returning 200.** Inert static files.

---

## Needs confirmation

- **[needs confirmation]** Whether the GitHub Pages origin is still intact as a rollback target —
  a direct probe of `185.199.108.153` with a `Host:` header returned nothing.
- **[needs confirmation]** Whether `npm run lint`, `npm run typecheck` and `npm run build` currently
  pass end-to-end; only `prettier --check app/layout.tsx` was actually run.
- **[needs confirmation]** Which mailbox Web3Forms has registered against the access key. That lives
  in the Web3Forms dashboard only.
- **[needs confirmation]** Whether GTM-KWGGH438's internal RegEx Table actually routes
  `hambabait.co.il` to a live GA4 property — checkable only in the GTM/GA4 consoles.
