# Optimization backlog — חם בבית

> Every item below was **verified against this repo and a fresh `out/`**. Each has evidence, impact,
> effort and an acceptance test. Anything unverified is marked **[needs confirmation]** rather than
> asserted.
>
> **Re-baselined 2026-08-31**, after the consent, accessibility, manifest-sync, CSP and QA-gate work
> landed. Re-verify before working an item.

Effort: **S** ≤1h · **M** a few hours · **L** a day or more.

---

## Verified state of the built output — 2026-08-31

```
gate: lint ✓  typecheck ✓  format:check ✓  build ✓  qa:gate ✓ (28 passed, 0 failed)

find out -name index.html                                    → 47   (45 indexable + 404 + /תודה/)
HTML files total (incl. out/404.html)                        → 48   (3,962,868 bytes)
grep -rl 'application/ld+json' out --include=index.html      → 45   (100% of indexable)
grep -rl 'rel="canonical"'     out --include=index.html      → 45   (exactly one each)
grep -o '<loc>' out/sitemap.xml                              → 45   (45 unique)
<title>: 47 total, 47 unique, 0 doubled brand
<meta description>: 47 total, 47 unique
<h1>: exactly 1 on every page
banned schema props (aggregateRating|reviewCount|ratingValue|foundingDate|warrantyPromise) → none
banned RTL utilities (pl-|pr-|ml-|mr-|left-|right-|text-left|text-right)                    → none
SearchAction / potentialAction                                                              → none
data-cta identifiers                                         → 27   (492 occurrences)
<img> tags                                                   →  0
llms.txt coverage vs sitemap                                 → 45/45
shared First Load JS 87.5 kB · out/_next/static 1.1 MB · largest chunk 53,531 B gzip
```

The only two pages without JSON-LD are `out/404/index.html` and `out/תודה/index.html` — **both
correct by design.**

**Technical SEO, schema, content depth, consent and accessibility truthfulness are all done.** What
remains is the internal link mesh, two static-route answer blocks, images, and a set of owner
actions that no amount of repo work can close.

---

## ✅ Closed in the first compile — do not re-report these

| Was                                                 | Now                                                                                                                          |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| P0-1 · Privacy policy contradicted the data flow    | **Fixed.** `/מדיניות-פרטיות/` names Web3Forms, Google (Tag Manager / Analytics) and WhatsApp/Meta, and discloses cookie use. |
| P1-1 · Doubled brand suffix on 24 of 33 pages       | **Fixed.** Zero occurrences in `out/`; `qa:gate` asserts it.                                                                 |
| P1-2 · 404 canonicalized to the homepage            | **Fixed.** `app/not-found.tsx` sets its own metadata with `alternates: {}`.                                                  |
| P1-3 · 18 location pages emitted no structured data | **Fixed.** Each emits `Service` with an `areaServed` City override and the `provider.@id` join.                              |
| P1-4 · `BreadcrumbList` never emitted               | **Fixed.** `breadcrumbJsonLd` fires from `components/layout/PageHeader.tsx` on 44 of 45 pages.                               |
| P2-1 · CI ran only `npm run build`                  | **Fixed.** `.github/workflows/ci.yml` runs lint → typecheck → format:check → build.                                          |
| P2-2 · GitHub Actions deployed to a dead origin     | **Fixed.** `deploy.yml` retired 2026-08-17; `ci.yml` is the only workflow. `public/CNAME` and `public/.htaccess` are gone.   |
| P4-3 · No service → location cross-links            | **Fixed.** Service pages link all 18 cities, and cities link 2–4 neighbours.                                                 |
| P5 · `framer-motion` dead dependency                | **Fixed.** Absent from `package.json`.                                                                                       |
| P5 · No favicon                                     | **Fixed.** `app/icon.svg` ships.                                                                                             |
| P5 · No `theme-color`                               | **Fixed.** `viewport.themeColor` reads `manifest.brand.themeColor`.                                                          |
| —                                                   | **New:** `/תודה/` destination-URL conversion route, `public/_headers` static-asset caching, `public/llms.txt`.               |

---

## ✅ Closed 2026-08-25 — the content build-out

| Was                                                 | Now                                                                                                                                                                                                                                                                                                                                                     |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 18 city pages failed the doorway test               | **Fixed.** `cityContent` in `lib/content.ts` gives each city an answer block, ≥2 city-specific paragraphs, 1–2 FAQs and nearby-city links. Research basis in [city-briefs.md](city-briefs.md).                                                                                                                                                          |
| Service pages shared one identical `triggers` array | **Fixed.** `serviceDepth` gives each of the 6 an answer block, a distinct symptom→cause table, on-site steps, repair-vs-replace and 3 FAQs. ~35 unique blocks each.                                                                                                                                                                                     |
| The informational cluster was unserved              | **Fixed.** `/מדריכים/` + 12 guides across the symptom, comparison, definition and seasonal clusters, with `Article` + `FAQPage` + `BreadcrumbList`.                                                                                                                                                                                                     |
| No per-service or per-city `FAQPage`                | **Fixed.** 37 pages emit `FAQPage`.                                                                                                                                                                                                                                                                                                                     |
| `googleSiteVerification` wired to nothing           | **Fixed in the repo only.** `verification` block in `app/layout.tsx`, guarded on presence, so the `null` roster value correctly emits nothing. The **method** is DNS TXT as a Domain property, so the field stays `null` — but the record itself was never added (checked 2026-09-06), so **GSC ownership is an open owner action**, tracked at `S2-2`. |
| `llms.txt` omitted the 18 city URLs                 | **Fixed.** Coverage is now 45/45 against the sitemap.                                                                                                                                                                                                                                                                                                   |
| Service pages linked `locations.slice(0, 8)`        | **Fixed.** All 18 linked; cities 9–18 are no longer cut off from the service silo.                                                                                                                                                                                                                                                                      |
| No city→city links anywhere                         | **Fixed.** Each city links 2–4 nearby cities; 50 links across the 18.                                                                                                                                                                                                                                                                                   |
| No dates or authorship anywhere                     | **Partly fixed.** Guides carry `datePublished`/`dateModified` and a visible "עודכן" line, attributed to the business. Service and city pages remain undated, which is fine for commercial pages.                                                                                                                                                        |
| Warranty asserted on 32 built pages                 | **Softened to 1.** Hero, ServicesGrid, FinalCta, `/אודות/`, `/שירותים/`, the city template, the differentiator, the process step, the trust stat and the FAQ were all reframed onto the verifiable half — the terms are stated before work starts. Same-day arrival and the "כשעה עד שעתיים" duration are gone entirely.                                |

---

## ✅ Closed 2026-09-03 — sitemap honesty

| Was                                                    | Now                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 33 of 45 sitemap URLs carried a build-time `lastmod`   | **Fixed.** `app/sitemap.ts` emits `<lastmod>` only for the 12 guides, which have real `updated` dates; the other 33 carry none, which the protocol allows. The 33 previously shared `new Date()` down to the millisecond, claiming they all changed on every deploy — and an untrustworthy `lastmod` gets discounted **site-wide**, including on the guides where the date is true. |
| Nothing gated `lastmod`, and nothing read `robots.txt` | **Fixed.** Three new `qa:gate` assertions: `<lastmod>` count is exactly 12, every value is date-only (`T00:00:00.000Z`, so a wall-clock build stamp fails even if the count fits), and `out/robots.txt` carries the exact `Sitemap:` line. Gate is now **28 assertions**.                                                                                                           |

> The sitemap itself needed no other change. 45 `<loc>`, percent-escaped Hebrew, trailing slashes,
> byte-identical to the 45 canonicals, `/תודה/` and the 404 out — all verified live. **No
> `<changefreq>` and no `<priority>`: Google ignores both. Do not add them.**

---

## ✅ Closed 2026-08-31 — consent, truthfulness, tooling

| Was                                                              | What actually fixed it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P0-1 · No consent gate on analytics**                          | **Fixed.** Consent Mode v2 shipped. `lib/consent.ts` emits a denied-by-default snippet as the first `<script>` in `<head>`, guaranteed to precede the GTM loader in `<body>` by document order; `components/layout/ConsentBanner.tsx` renders the choice, placed second in `<body>` so it is reachable in a few tab stops rather than ~100. `qa:gate` asserts the ordering.                                                                                                                                                                          |
| **P0-2 · Accessibility statement asserts conformance, no audit** | **Fixed.** `/הצהרת-נגישות/` no longer claims ת״י 5568 or WCAG conformance. It states that no external audit was performed, lists what was checked internally, lists the known limitations (no real screen-reader testing, no external audit, not every colour pair checked), gives a contact route and carries a statement date.                                                                                                                                                                                                                     |
| **P1-1 · Unsourced claims — the last carrier is the manifest**   | **Fixed at the source.** The roster manifest was edited and synced. `shortPitch` no longer ends `…עם אחריות על העבודה`, so the JSON-LD `description` on the homepage is the softened text. `grep -rl "אחריות על העבודה" out --include=index.html` now returns one file — a _different_, deliberately-softened homepage FAQ answer, not the schema.                                                                                                                                                                                                   |
| **P1-3 · No consent affordance on the lead form**                | **Partly fixed.** The disclosure notice now renders **above** the submit button and is wired to it with `aria-describedby`, so a screen-reader user hears it before submitting rather than after. A **required checkbox was deliberately not added** — see P3 below; it is an owner decision, not an oversight.                                                                                                                                                                                                                                      |
| **P2 · `WebSite` node on the homepage**                          | **Fixed.** Assembled inline in `app/page.tsx` with `publisher` joined to the `Plumber` node by `@id`. Deliberately no `SearchAction`. The JSON-LD graph is now **complete**.                                                                                                                                                                                                                                                                                                                                                                         |
| **P2 · Inline SVG diagrams**                                     | **Shipped.** 4 diagrams on 4 of the 12 guides — `role="img"`, Hebrew `<title>`, real `<text>`, `@theme` tokens, keyboard-reachable scroll frame. Zero network requests, so the text LCP is untouched.                                                                                                                                                                                                                                                                                                                                                |
| **P2 · Deepen `rehovot`, `raanana`, `kfar-saba`**                | **Fixed.** Each gained a genuinely distinct third paragraph — institutional/fixed-tenancy in Rehovot, tree shading in Kfar Saba, the storage-tank-vs-instantaneous contrast in Ra'anana — each marked `// 🔶 confirm` on the half that is reasoned rather than sourced, and written conditionally rather than as a proportion claim.                                                                                                                                                                                                                 |
| **P3 · `founded` has a booby-trapped numeric fallback**          | **Fixed.** `lib/site-config.ts` now reads `founded: manifest.foundedYear ?? null`, with a comment explaining why `0` was a trap.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **P3 · Hardcoded copyright year**                                | **Fixed.** `components/layout/Footer.tsx` reads `new Date().getFullYear()` once at module scope. In a static export that bakes the build-year into the HTML — deterministic, no hydration mismatch, and any rebuild corrects it.                                                                                                                                                                                                                                                                                                                     |
| **P3 · Stale comment: `tailwind.config.ts`**                     | **Fixed.** `app/layout.tsx` now says the font variables are consumed by the `@theme` block in `app/globals.css`.                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **P3 · `out.prev/` and `site.config.json.bak` untracked**        | **Fixed.** `.gitignore` covers `/out.prev/` and `*.bak`, with a comment explaining what a careless `git add -A` would otherwise commit.                                                                                                                                                                                                                                                                                                                                                                                                              |
| **P3 · Manifest is not structurally validated**                  | **Fixed.** `lib/site-config.ts` runs `assertManifest()` at module load and every route imports that module, so a malformed `site.config.json` fails `npm run build` instead of failing at runtime in a visitor's browser. It checks only the fields the code actually dereferences; the legitimately-nullable ones are deliberately excluded.                                                                                                                                                                                                        |
| **"There is no roster→repo sync script"**                        | **No longer true.** `ops/sync-manifest.ps1` + `ops/sync-manifest.mjs` now exist in the hub project: field-level diff, `-DryRun` / `-Confirm` contract, strips `$schema` and `_needsConfirmation`, and writes the assumptions to [manifest-assumptions.md](manifest-assumptions.md) instead of shipping them. Any doc still asserting the old state is wrong.                                                                                                                                                                                         |
| **No output assertions in the release gate**                     | **New.** `scripts/qa-gate.mjs` + `npm run qa:gate` — 28 assertions over `out/`, currently 28 passed / 0 failed. Now the fifth command of the release gate.                                                                                                                                                                                                                                                                                                                                                                                           |
| **No CSP**                                                       | **Partly closed.** A **report-only** CSP ships in `public/_headers` — see P2 below for why enforcement is a separate decision and why hashes are impossible here.                                                                                                                                                                                                                                                                                                                                                                                    |
| **Contrast and keyboard defects**                                | **Fixed.** WhatsApp buttons moved off white-on-`#25D366` (1.98:1) to `text-primary` (5.14:1); `FinalCta` body dropped its `/90` opacity (4.23 → 4.83:1); `LeadForm` borders and placeholders moved `gray-300`/`gray-400` → `gray-500`; focus rings at full strength; `<main>` got `tabindex="-1"` so the skip link actually moves focus; 22 horizontally-scrollable containers became keyboard-reachable; the 6 service tables got `sr-only` captions; the mobile menu panel scrolls, and Escape or the `lg` breakpoint clears the body scroll lock. |

---

## P0 — nothing open

No correctness or compliance defect is open in this repo. The two former P0s closed above.

The nearest thing to a P0 now lives **outside** the repo, in the GTM container — see P1-1. It cannot
be fixed by code and it is silently costing measurement right now.

---

## P1 — what is left

### P1-1 · ✅ CLOSED 2026-09-06 — and the original diagnosis was wrong

**What this item used to say:** that `GTM-KWGGH438` carried literal per-value `data-cta` triggers, that
the header-call three-way split had "silently zeroed" two thirds of a real metric, and that
header-attributed calls would appear to fall.

**What was actually true.** Inspected in the GTM console on 2026-09-06: the container held exactly
**two tags** — `GA4 — Per-site config` (a Google Tag on `Init — Known Hostname`, a month old) and
nothing else. **There were never any CTA triggers or tags at all.** No `data-cta` value had ever been
tracked, so the split zeroed nothing, no metric declined, and there is no historical number to
compare against. The "container is behind the repo" framing was inferred from the repo and never
checked against the console — the same failure mode as the GSC verification claim.

**Resolved by** one generic tag rather than 27 literal triggers, which is what the original fix should
have proposed:

- Variable `cta - data-cta` (Custom JavaScript) walking `closest('[data-cta]')` from `{{Click Element}}`
- Trigger `Click - any data-cta` — All Elements, `Click Element` matches CSS selector `[data-cta], [data-cta] *`
- Tag `GA4 - cta_click` sending `cta_id` to `{{GA4 Measurement ID}}`

Verified in GTM Preview against the live site: the tag fired and sent hits to **`G-RLE7LGPPX3`**.
Because the value is read from the attribute rather than matched literally, a future rename cannot
silently zero this metric — which is the actual lesson.

**Baseline note:** CTA history starts 2026-09-06. There is no earlier data to compare against.

**Remaining:** none for CTAs. See **P1-2**, which the same inspection made much larger.

---

### P1-2 · 🔴 The entire `lead_submit` family fires into nothing · owner action · S

**Upgraded 2026-09-06.** This was filed as "the honeypot event has no tag". The GTM console shows it
is far bigger: the container has **no tag consuming any `lead_submit*` event**. The site pushes four
events that nobody receives.

**Evidence:** `components/forms/LeadForm.tsx` pushes `lead_submit` (:183, on confirmed delivery),
`lead_submit_failed` (:159 `reason: "no_key"`, :192 `reason: "delivery"`) and `lead_submit_blocked`
(:127, honeypot). Container inspection 2026-09-06: two tags total, neither listening for a custom
event. Nothing reaches GA4.

**Impact — the most serious measurement gap on the site.** The lead form is conversion goal number
three and **it has never been measured once**. `page_view` on `/תודה/` is collected by the config
tag's enhanced measurement, so a rough proxy exists, but no conversion is defined and the proxy counts
arrivals rather than confirmed sends. A `reason: "delivery"` or `"no_key"` spike means leads are being
**dropped on the floor** and nobody would learn of it.

**Fix (container-side — one trigger, one tag):**

- Data Layer Variables `DLV - form` and `DLV - reason`
- Trigger: **Custom Event**, event name `^lead_submit(_failed|_blocked)?` + end anchor, **use regex matching**
- Tag: **GA4 Event**, Event Name `{{Event}}`, parameters `form` and `reason`, id `{{GA4 Measurement ID}}`

**Then mark `lead_submit` — and only it — as a key event in GA4.** Not `cta_click`, not the
`*-form-submit` clicks (those are attempts, not sends), and **not** a `/תודה/` pageview conversion: the
old double-count warning becomes real the moment both are marked.

**Accept:** a real form submission produces `lead_submit` in GA4 DebugView, and exactly one key event
per lead.

---

### P1-3 · The guides have an in-degree of 1 · M

**Evidence:** measured against `out/` — each of the 12 guides at `/מדריכים/<slug>/` is linked from
exactly **one** page, the `/מדריכים/` index. No service page and no city page links a guide. A grep
over `app/`, `components/` and `lib/` finds guide URLs only in `app/sitemap.ts`, the hub index and the
guide route itself.

**Impact:** the hub is crawlable (header nav, footer, `llms.txt`) but it pushes authority into the
commercial silo and receives none back. [topical-map.md](topical-map.md) §5 states the rule — "depth
flows both ways" — and it is currently satisfied in one direction only. Every new guide inherits the
defect on day one.

**Fix:** content-layer work. A `relatedGuides` link on each service page (the guide that owns the
diagnostic side of that fault), and a link from each service page to the definition guide for the
part it replaces. Zero claims risk.

**Accept:** every guide has an in-degree ≥ 2, at least one of which is a commercial page.

---

### P1-4 · Eight static routes carry no answer block · 🟡 one of three closed · M

**Evidence:** 37 answer blocks ship (25 in `lib/content.ts` — 6 services + 18 cities + `/מחירון/` —
and 12 in `lib/guides.ts`), against 45 indexable URLs. The eight without one are all static: the
homepage, the three indexes, `/אודות/`, `/צור-קשר/` and the two legal pages.

**Impact:** two of those eight field a real question a reader arrives with and currently answer it
nowhere extractable: `/שירותים/` and `/איזורי-שירות/`.

✅ **`/מחירון/` closed 2026-09-17.** It gained `pricingAnswer` — "כמה עולה תיקון דוד?", 41 words —
once the owner approved published ranges, so the page now answers the question it is named for, with
real figures. Source: [business-facts.md](business-facts.md) §1a.

**The remaining two are deferred, not missed.** They need a content brief and a decision about which
component renders the block — neither index uses the service/city/guide rendering path. The two legal
pages and `/צור-קשר/` do not need one; the homepage already carries a six-question `FAQPage`.

**Accept:** two new answer blocks, each self-contained, each with a question only that page's answer
resolves, and no figure that does not trace to [business-facts.md](business-facts.md) §1a.

---

### P1-5 · The header reaches 0 of 6 service pages in one hop · owner decision · M

**Evidence:** `navItems` in `lib/content.ts` lists `/שירותים/`, `/איזורי-שירות/`, `/מדריכים/`,
`/מחירון/`, `/אודות/`, `/צור-קשר/`. The six service pages are reachable only through the
`/שירותים/` index — always two clicks.

**Impact:** the site's highest-commercial-intent pages are the furthest from the nav. A reader
arriving for `תיקון דוד שמש` has to pass through an index first.

**Status: considered and deliberately deferred.** A services submenu is a navigation-design decision
with real trade-offs on a mobile-first site whose reader is mid-fault and on a phone, and it belongs
to the owner rather than to an engineering pass. **The orphan-insurance obligation is met
regardless** — the footer links all 6 services and all 18 cities on every page, so nothing is
orphaned and nothing is uncrawlable. This is a discoverability trade, not a defect.

**Accept (if taken):** a service reachable in one hop from any page, without regressing the mobile
menu's keyboard behaviour or its scroll handling.

---

### P1-6 · The site ships zero raster images · M

**Evidence:** `grep -rl '<img' out --include=index.html` → **0**, across all `*.html`. `public/`
contains only `_headers` and `llms.txt`. No hero, no logo, no local `og.jpg` — OG points at an
external host (`imgquarry.com`) via the manifest.

**Partly mitigated:** 4 inline SVG diagrams now ship on 4 of the 12 guides. That is the one honest
visual asset class on this site — they illustrate technical reality, which needs no business fact —
and they cost nothing at runtime because they are inline.

**Impact of what remains:** no visual E-E-A-T beyond the diagrams, nothing for `ImageObject`, and
every social/chat preview depends on a third party.

**Caution:** the current LCP is **text**, which is close to optimal — a hero image can only make it
worse. Budget for it explicitly. Use the kit's `SiteImage` (still unused); never hand-roll an `<img>`.
**Never** stock photography of technicians or work: `business-facts.md` §3.5 records there is no
evidence any technician exists, so a stock photo is a staffing claim rendered as an image.

See [media-assets.md](media-assets.md).

---

### P1-7 · On a phone the service pages are wider than the screen · owner-approved, separate change · S

**Found 2026-10-12** during the fleet live-kit port, and **live in production before it** (the live
site carried no live-kit when measured). **Owner decision 2026-10-12** (the fleet wording sign-off
page): fix it, in a separate change — not in the live-kit port.

**Evidence:** headless Chrome, phone emulation at 390×844, against `https://hambabait.co.il`,
2026-10-12: `/services/solar/`, `/services/electric/` and `/services/thermostat/` lay out **496px**
wide (`document.documentElement.scrollWidth` 496 against a `clientWidth` of 390) and open scrolled
106px sideways. `/locations/tel-aviv/` and `/` measure 390. Hiding elements one at a time isolates
the symptom→cause table: `table.min-w-[30rem]` (480px) sits in a `div.overflow-x-auto` meant to
scroll it, but that wrapper's parent is the grid item `div.lg:col-span-2`, whose default
`min-width: auto` grows to the table's 480px instead of letting the wrapper scroll — 16px of page
padding + 480 = 496.

**Impact:** the highest-intent pages on the site open scrolled sideways on a phone — the logo and
the start of the text are cut off, and the sticky call bar is out of view.

**Accept:** at 360 and 390px every service page measures `scrollWidth === clientWidth`, its table
scrolls inside its own frame, and the sticky call bar is in view on load.

---

### P1-8 · On a Hebrew-address page every link click is a full reload that logs errors · owner-approved, separate change · M

**Found 2026-10-12** during the fleet live-kit port, and **live in production before it.** **Owner
decision 2026-10-12** (the fleet wording sign-off page): fix it separately — the sign-off suggested
upgrading Next; choose the fix in that change.

**Evidence:** Chrome console on `https://hambabait.co.il/צור-קשר/`, 2026-10-12 — one error for each
link Next prefetches, the homepage included:

```
Failed to fetch RSC payload for https://hambabait.co.il/%D7%A9%D7%99%D7%A8%D7%95%D7%AA%D7%99%D7%9D/.
Falling back to browser navigation. TypeError: Failed to execute 'fetch' on 'Window': Failed to
read the 'headers' property from 'RequestInit': String contains non ISO-8859-1 code point.
```

A click on an internal link from that page then loads a whole new document instead of navigating in
place. What fails is the **current** page's address, not the target's: a click from `/צור-קשר/` to
`/`, and from `/מחירון/` to `/services/solar/`, reloads the page, while a click from `/` to
`/services/solar/`, and from there to `/services/electric/`, navigates in place with no error (all
four checked on the live site, 2026-10-12). Next.js is 14.2.35 here.

**Impact:** no page is unreachable — the fallback is an ordinary page load — but every click from a
Hebrew-address page pays a full reload, and the console fills with errors that hide real ones.

**Accept:** on `/צור-קשר/` and on a guide under `/מדריכים/`, zero `Failed to fetch RSC payload`
errors after load, and an internal link click keeps the same document.

---

## P2 — depth that would pay next

| Item                               | Why                                                                                                                                                                                                                                                                                                                                   | Effort |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| **Symptom long-tail guides**       | the hub's 12 cover the main clusters; pressure, smell, discoloured water, timer faults and winter solar underperformance are unserved. Largest remaining topical gap, zero claims risk.                                                                                                                                               | L      |
| **Three more definition guides**   | אלמנט חימום · ווסת · ברז ביטחון. Cheap, entity-building, and each has a service page waiting to link it — which also closes half of P1-3.                                                                                                                                                                                             | M      |
| **Diagrams on the other 8 guides** | 4 of 12 carry one. The pattern is established and costs nothing at runtime.                                                                                                                                                                                                                                                           | M      |
| **Redirect `www` to the apex**     | `www.hambabait.co.il` returns **200, not a 301**, serving a byte-identical copy of all 45 pages; `hambabait.pages.dev` does the same. Canonical tags carry the whole load today. Fix is a Cloudflare **Redirect Rule** (`www.hambabait.co.il/*` → `https://hambabait.co.il/$1`, 301, preserve query). **Owner action** — zone change. | S      |
| **Enforce the CSP**                | `public/_headers` ships it **report-only** on purpose: there is no report endpoint, so violations surface in DevTools only and someone has to look. Watch real traffic first — the shared fleet container can gain a tag any time.                                                                                                    | M      |
| **Author byline**                  | a real named person would be a genuine E-E-A-T upgrade. **Owner action** — never invent one.                                                                                                                                                                                                                                          | —      |

### On the CSP: hashes are impossible here, and that is settled

A hash-based `script-src` **cannot** work on this site, and any doc claiming it is "the only workable
path" is wrong. Next.js App Router serialises the React Flight payload into bare inline `<script>`
tags — the current `out/` carries **169 distinct such bodies across 48 HTML files**, and their content
changes on every build. CSP ignores `'unsafe-inline'` the moment **any** hash or nonce is present, so
listing the two id-bearing snippets (`consent-default`, `gtm-init`) would block all 169 and render
every page blank. A nonce is not available either: `output: "export"` has no server to mint one per
request.

What shipped instead banks the protections that are real and free: `base-uri 'none'`,
`object-src 'none'`, `frame-ancestors 'none'`, `form-action 'self'`, and tight
`connect-src`/`frame-src`/`img-src`/`font-src` allowlists — with `'unsafe-inline'` on `script-src`
and **no** `'unsafe-eval'`. If a container change starts throwing eval violations, the honest fix is
to change the tag, not to widen the policy.

## P3 — robustness and deliberate non-actions

| Item                                           | Evidence / status                                                                                                                                                                                                                                                                                                                                       | Effort |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| **Required consent checkbox on the lead form** | **Deliberately not done — owner decision.** The notice now precedes the submit button with `aria-describedby`, which is the accessibility half. A required checkbox is an extra mandatory interaction before submit on a form whose reader is mid-fault: a real conversion cost against a real compliance gain. Record it, do not ship it unilaterally. | S      |
| **Manifest `url` has no trailing slash**       | `site.config.json` `url` is `https://hambabait.co.il` while the homepage canonical is `https://hambabait.co.il/`. Both resolve; they are not byte-identical. Fix at the roster, then sync.                                                                                                                                                              | S      |
| **`Article` and `WebSite` assembled inline**   | The kit exports no `articleJsonLd` and no `websiteJsonLd`, so both nodes are built in their routes. Correct for now; a proper builder belongs upstream in `@ishub/site-kit`, not in a local fork.                                                                                                                                                       | M      |

---

## Not defects — do not "fix" these

- **The mobile menu does not trap focus, and should not.** It is a **disclosure**, not a dialog: the
  panel sits in-flow directly after its toggle, so the natural Tab order already walks into it and
  back out. Escape closes it and returns focus to the toggle, the panel is its own scroll container,
  and the `lg` breakpoint clears the body scroll lock. Adding a focus trap would make a
  non-modal disclosure behave like a modal. **Any doc claiming this menu traps focus is wrong.**
- **The answer blocks run 32–47 words, not a hard 40–60.** The band was deliberately widened. The
  requirement is that the block be **self-contained and extractable**; word count is guidance.
  Rewriting sound Hebrew to clear a self-imposed floor is churn with a fabrication risk attached —
  padding a complete answer means adding material, and added material is where invented claims come
  from. See [content-standards.md](content-standards.md) §3.
- **The Web3Forms access key in `site.config.json`.** Public by design for client-side forms; moving it
  to `NEXT_PUBLIC_*` changes nothing. It _is_ spammable, but that is not a leak. Note the manifest is
  bundled into the **client JS** — verified: the key and `shortPitch` appear in `out/_next/static`
  chunks — which is exactly why `_needsConfirmation` is stripped on sync rather than shipped.
- **`images.unoptimized: true`.** Mandatory under `output: "export"`.
- **Hebrew hrefs shipping as raw UTF-8.** Correct — only sitemap `<loc>` and canonicals are escaped.
- **`/תודה/` and the 404 emitting no JSON-LD and no canonical.** Deliberate.
- **`/תודה/` excluded from the sitemap.** Deliberate — it is a `noindex` conversion destination.
- **The `WebSite` node carrying no `SearchAction`.** Deliberate — there is no site search, so an
  action would be a false capability claim pointing at a dead URL. `qa:gate` asserts its absence.
- **The URL-encoding/NFC tolerance in the dynamic-route matchers.** Inherited from the fleet template
  and unnecessary for English slugs, but harmless.
- **The WhatsApp fallback panel.** It no longer auto-opens; it renders as an explicit user choice after
  a delivery failure. That is the defensible design.
- **The CSP being report-only with `'unsafe-inline'`.** See P2 — this is the ceiling, not a shortcut.

---

## Needs confirmation

- **[needs confirmation]** Which mailbox Web3Forms has registered against the access key. Lives in the
  Web3Forms dashboard only — a lead can "succeed" and reach nobody.
- ✅ **Confirmed 2026-09-06 (owner, GTM console + Preview).** `hambabait.co.il` is listed in the
  container's hostname routing variable and resolves to GA4 property **`G-RLE7LGPPX3`**; hits were
  observed arriving. The manifest `ga4MeasurementId` stays `null` on purpose — routing is
  container-side.
- **[needs confirmation]** Whether the container counts **both** the `lead_submit` dataLayer event and
  the `/תודה/` pageview as conversions. If so, every lead is double-counted.
- **[needs confirmation]** Whether exactly one `Content-Security-Policy-Report-Only` header comes back
  from the live apex after the next deploy. Two policies do not merge — both apply, and the browser
  enforces the intersection. The zone-level headers on record are HSTS, X-Frame-Options and
  Permissions-Policy; CSP is not among them, but that list has not been re-checked.
- **[needs confirmation]** The roster's `_needsConfirmation` items — phone routing, email, hours.
  These block any Business Profile or citation work (see `gbp-local-listings`). Tracked in
  [manifest-assumptions.md](manifest-assumptions.md). **Pricing left this list on 2026-09-17**, when
  the owner approved the published ranges — see [business-facts.md](business-facts.md) §1a.
