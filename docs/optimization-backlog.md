# Optimization backlog — חם בבית

> Every item below was **verified against this repo and a fresh `out/`**. Each has evidence, impact,
> effort and an acceptance test. Anything unverified is marked **[needs confirmation]** rather than
> asserted.
>
> **Re-baselined 2026-08-25**, then updated the same day after the content build-out landed.
> Re-verify before working an item.

Effort: **S** ≤1h · **M** a few hours · **L** a day or more.

---

## Verified state of the built output — 2026-08-25 (post content build-out)

```
find out -name index.html                                    → 47   (45 indexable + 404 + /תודה/)
grep -rl 'application/ld+json' out --include=index.html      → 45
grep -rl 'rel="canonical"' out --include=index.html          → 45
grep -o '<loc>' out/sitemap.xml                              → 45
<title> tags: 47 total, 47 unique, 0 doubled brand
<meta description>: 47 total, 47 unique
<h1>: exactly 1 on every page
banned schema props (aggregateRating|review|ratingValue|reviewCount|foundingDate|warrantyPromise) → none
banned RTL utilities (pl-|pr-|ml-|mr-|left-|right-|text-left|text-right) → none
```

The only two pages without JSON-LD are `out/404/index.html` and `out/תודה/index.html` — **both
correct by design.**

**Technical SEO, schema and content depth are all done.** What remains is consent, accessibility
truthfulness, images, and the off-site work that lives outside this repo.

---

## ✅ Closed since the last compile — do not re-report these

| Was                                                 | Now                                                                                                                          |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| P0-1 · Privacy policy contradicted the data flow    | **Fixed.** `/מדיניות-פרטיות/` names Web3Forms, Google (Tag Manager / Analytics) and WhatsApp/Meta, and discloses cookie use. |
| P1-1 · Doubled brand suffix on 24 of 33 pages       | **Fixed.** Zero occurrences in `out/`.                                                                                       |
| P1-2 · 404 canonicalized to the homepage            | **Fixed.** `app/not-found.tsx` sets its own metadata with `alternates: {}`.                                                  |
| P1-3 · 18 location pages emitted no structured data | **Fixed.** Each emits `Service` with an `areaServed` City override and the `provider.@id` join.                              |
| P1-4 · `BreadcrumbList` never emitted               | **Fixed.** `breadcrumbJsonLd` fires from `components/layout/PageHeader.tsx`, so every nested route ships it.                 |
| P2-1 · CI ran only `npm run build`                  | **Fixed.** `.github/workflows/ci.yml` runs lint → typecheck → format:check → build.                                          |
| P2-2 · GitHub Actions deployed to a dead origin     | **Fixed.** `deploy.yml` retired 2026-08-17; `ci.yml` is the only workflow. `public/CNAME` and `public/.htaccess` are gone.   |
| P4-3 · No service → location cross-links            | **Fixed.** Service pages link all 18 cities, and cities link 2–4 neighbours.                                                 |
| P5 · `framer-motion` dead dependency                | **Fixed.** Absent from `package.json`.                                                                                       |
| P5 · No favicon                                     | **Fixed.** `app/icon.svg` ships.                                                                                             |
| P5 · No `theme-color`                               | **Fixed.** `viewport.themeColor` reads `manifest.brand.themeColor`.                                                          |
| —                                                   | **New:** `/תודה/` destination-URL conversion route, `public/_headers` static-asset caching, `public/llms.txt`.               |

---

## P0 — correctness and compliance

### P0-1 · No consent gate on analytics · M

**Evidence:** `app/layout.tsx` builds `gtmHeadSnippet(manifest.analytics?.gtmId)` and injects it into
`<head>` unconditionally. A grep for `consent|denied|gtag\(` across `app/`, `components/` and `lib/`
returns nothing but the privacy page's prose.

**Impact:** analytics run on first paint before the visitor is asked. The privacy policy now discloses
the processors truthfully — but disclosure is not a gate.

**Fix:** Consent Mode v2 defaults (`denied`) emitted **above** the container in `<head>`, plus a
banner. Half the work is container-side and belongs to the owner. See the `consent-mode` skill.

**Accept:** no analytics cookie set before a choice is made; the default snippet precedes `gtm.js` in
`out/index.html`.

---

### P0-2 · Accessibility statement asserts conformance with no audit · M

**Evidence:** `app/הצהרת-נגישות/page.tsx:25` claims work per ת״י 5568 and WCAG 2.0 AA. A grep for
`עודכן|תאריך|רכז נגישות` over that file returns **0** — no statement date and no named accessibility
coordinator, both of which Israeli practice expects. No audit exists.

**Fix:** run the real audit first (`perf-a11y-auditor`), fix what it finds, then rewrite the statement
to say what was tested, when, by whom, and the known limitations.

**Accept:** every claim on the page traces to something actually verified; date and contact present.

---

## ✅ Closed 2026-08-25 — the content build-out

| Was                                                 | Now                                                                                                                                                                                                                                                                                                                      |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 18 city pages failed the doorway test               | **Fixed.** `cityContent` in `lib/content.ts` gives each city an answer block, 2 city-specific paragraphs, 1–2 FAQs and nearby-city links. Measured 15–17 unique text blocks per city vs the union of the other 17. Research basis in [city-briefs.md](city-briefs.md).                                                   |
| Service pages shared one identical `triggers` array | **Fixed.** `serviceDepth` gives each of the 6 an answer block, a distinct symptom→cause table, on-site steps, repair-vs-replace and 3 FAQs. ~35 unique blocks each.                                                                                                                                                      |
| The informational cluster was unserved              | **Fixed.** `/מדריכים/` + 12 guides across symptom, comparison, definition and seasonal clusters, with `Article` + `FAQPage` + `BreadcrumbList`.                                                                                                                                                                          |
| No per-service or per-city `FAQPage`                | **Fixed.** 25 pages emit `FAQPage`.                                                                                                                                                                                                                                                                                      |
| `googleSiteVerification` wired to nothing           | **Fixed.** `verification` block in `app/layout.tsx`, guarded on presence.                                                                                                                                                                                                                                                |
| `llms.txt` omitted the 18 city URLs                 | **Fixed.** All cities and all 12 guides now listed.                                                                                                                                                                                                                                                                      |
| Service pages linked `locations.slice(0, 8)`        | **Fixed.** All 18 linked; cities 9–18 are no longer cut off from the service silo.                                                                                                                                                                                                                                       |
| No city→city links anywhere                         | **Fixed.** Each city links 2–4 nearby cities.                                                                                                                                                                                                                                                                            |
| No dates or authorship anywhere                     | **Partly fixed.** Guides carry `datePublished`/`dateModified` and a visible "עודכן" line, attributed to the business. Service and city pages remain undated, which is fine for commercial pages.                                                                                                                         |
| `founded` fell back to `0`                          | **Fixed.** Stays `null`.                                                                                                                                                                                                                                                                                                 |
| `out.prev/` and `*.bak` untracked                   | **Fixed.** Both gitignored.                                                                                                                                                                                                                                                                                              |
| Stale `tailwind.config.ts` comment                  | **Fixed.**                                                                                                                                                                                                                                                                                                               |
| Warranty asserted on 32 built pages                 | **Softened to 1.** Hero, ServicesGrid, FinalCta, `/אודות/`, `/שירותים/`, the city template, the differentiator, the process step, the trust stat and the FAQ were all reframed onto the verifiable half — the terms are stated before work starts. Same-day arrival and the "כשעה עד שעתיים" duration are gone entirely. |

---

## P1 — what is left

### P1-1 · Unsourced claims — the last carrier is the manifest · M

**Evidence:** the sitewide warranty claim was softened everywhere in the repo, but
`site.config.json` `shortPitch` still ends `…עם אחריות על העבודה`, and `@ishub/site-kit` uses
`shortPitch` verbatim as the JSON-LD `description`. So the claim still ships as structured data on
the homepage.

**Fix:** this is **a roster edit plus a sync, not a repo change.** Edit
`Israeli services sites/roster/sites/hambabait.json`, then sync. Never edit `site.config.json`
directly.

**Accept:** `grep -rl "אחריות על העבודה" out --include=index.html` returns nothing.

---

### P1-2 · The site ships zero images · M

**Evidence:** `public/` contains only `_headers` and `llms.txt`. No hero, no logo, no service
imagery, no local `og.jpg` — OG points at an external host via the manifest.

**Impact:** no visual E-E-A-T, nothing for `ImageObject`, and every social/chat preview depends on a
third party.

**Caution:** the current LCP is **text**, which is close to optimal — a hero image can only make it
worse. Budget for it explicitly. Use the kit's `SiteImage` (still unused); never hand-roll an `<img>`.
**Never** stock photography of technicians or work: `business-facts.md` §3.5 records there is no
evidence any technician exists, so a stock photo is a staffing claim rendered as an image.

See [media-assets.md](media-assets.md).

---

### P1-3 · No consent affordance on the lead form · S

**Evidence:** `LeadForm.tsx` renders a passive disclosure paragraph linking the policy, but there is
no checkbox and no gate.

**Note:** this is a **conversion-affecting** change — an extra required interaction before submit.
Worth doing, but the owner should know it is a trade, not a free win.

---

## P2 — depth that would pay next

| Item                                         | Why                                                                                                                                                                | Effort |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| **Deepen `rehovot`, `raanana`, `kfar-saba`** | the three weakest city entries; all lean on the same low-rise/private-roof pattern and differ mainly in coastal distance. See [city-briefs.md](city-briefs.md) §6. | M      |
| **`WebSite` node on the homepage**           | the only node in [schema-graph.md](schema-graph.md) still unbuilt                                                                                                  | S      |
| **More guides**                              | the hub's 12 cover the main clusters; symptom long-tail is far from exhausted                                                                                      | L      |
| **Inline SVG diagrams**                      | the one honest visual asset class — see [media-assets.md](media-assets.md) §5                                                                                      | M      |
| **Author byline**                            | a real named person would be a genuine E-E-A-T upgrade. **Owner action** — never invent one                                                                        | —      |

## P3 — robustness

| Item                                                 | Evidence                                                                                                                                                                                                                                         | Effort |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| **`founded` has a booby-trapped numeric fallback**   | `lib/site-config.ts:28` — `founded: manifest.foundedYear ?? 0`. `foundedYear` is `null`, so `siteConfig.founded === 0`. Referenced nowhere today, but any future `2026 - siteConfig.founded` renders **"2026 שנות ניסיון"**. Let it stay `null`. | S      |
| **Hardcoded copyright year**                         | `components/layout/Footer.tsx:7` — `const year = 2026;`. Now carries a comment explaining the deterministic-build reason, but it is still silently wrong from 2027-01-01.                                                                        | S      |
| **Stale comment: `tailwind.config.ts`**              | `app/layout.tsx:12` says the font variables are "consumed by `tailwind.config.ts`". That file does not exist and must not — Tailwind v4 is CSS-first and tokens live in `@theme` at `app/globals.css`. Last survivor of the P2-3 comment sweep.  | S      |
| **`out.prev/` and `site.config.json.bak` untracked** | `.gitignore` covers `/out/` only. A careless `git add -A` commits a duplicate site export.                                                                                                                                                       | S      |
| **Manifest is not structurally validated**           | `lib/site-config.ts:20` casts through `unknown`, so `site.config.json` is not checked against `SiteManifest` at compile time. A malformed manifest fails at runtime, not at build.                                                               | M      |
| **No consent affordance on the lead form**           | `LeadForm.tsx` renders a passive disclosure paragraph linking the policy, but no checkbox and no gate.                                                                                                                                           | S      |

---

## Not defects — do not "fix" these

- **The Web3Forms access key in `site.config.json`.** Public by design for client-side forms; moving it
  to `NEXT_PUBLIC_*` changes nothing. It _is_ spammable, but that is not a leak.
- **`images.unoptimized: true`.** Mandatory under `output: "export"`.
- **Hebrew hrefs shipping as raw UTF-8.** Correct — only sitemap `<loc>` and canonicals are escaped.
- **`/תודה/` and the 404 emitting no JSON-LD and no canonical.** Deliberate.
- **`/תודה/` excluded from the sitemap.** Deliberate — it is a `noindex` conversion destination.
- **The URL-encoding/NFC tolerance in the dynamic-route matchers.** Inherited from the fleet template
  and unnecessary for English slugs, but harmless.
- **The WhatsApp fallback panel.** It no longer auto-opens; it renders as an explicit user choice after
  a delivery failure. That is the defensible design.

---

## Needs confirmation

- **[needs confirmation]** Which mailbox Web3Forms has registered against the access key. Lives in the
  Web3Forms dashboard only — a lead can "succeed" and reach nobody.
- **[needs confirmation]** Whether GTM-KWGGH438's internal RegEx Table routes `hambabait.co.il` to a
  live GA4 property. Checkable only in the GTM/GA4 consoles.
- **[needs confirmation]** Whether the container counts **both** the `lead_submit` dataLayer event and
  the `/תודה/` pageview as conversions. If so, every lead is double-counted.
- **[needs confirmation]** The roster's `_needsConfirmation` items — phone routing, email, hours,
  pricing approach. These block any Business Profile or citation work (see `gbp-local-listings`).
