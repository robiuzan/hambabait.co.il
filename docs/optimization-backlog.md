# Optimization backlog — חם בבית

> Every item below was **verified against this repo and a fresh `out/`**. Each has evidence, impact,
> effort and an acceptance test. Anything unverified is marked **[needs confirmation]** rather than
> asserted.
>
> **Re-baselined 2026-08-25** (previous compile: 2026-08-16). Track A shipped in the interim and
> closed most of the P0–P2 block. Re-verify before working an item — run `/baseline`.

Effort: **S** ≤1h · **M** a few hours · **L** a day or more.

---

## Verified state of the built output — 2026-08-25

```
find out -name index.html                                    → 34   (32 indexable + 404 + /תודה/)
grep -rl 'application/ld+json' out --include=index.html      → 32
grep -rl 'rel="canonical"' out --include=index.html          → 32
grep -o '<loc>' out/sitemap.xml                              → 32
grep -rl 'חם בבית | חם בבית' out --include=index.html        → 0
grep -rEo '"(aggregateRating|review|ratingValue|reviewCount|foundingDate|warrantyPromise)"' out → (empty)
```

The only two pages without JSON-LD are `out/404/index.html` and `out/תודה/index.html` — **both
correct by design.** Sitemap, canonical and JSON-LD coverage are in full parity.

**The technical SEO layer is in good shape. The remaining work is content, trust and off-site.**

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
| P4-3 · No service → location cross-links            | **Fixed, partially** — see P2-3 below for what remains.                                                                      |
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

## P1 — content debt · the site's largest remaining gap

### P1-1 · All 18 location pages fail the doorway test · L

**Evidence:** `app/locations/[city]/page.tsx` is one template. The only variable is `loc.name`,
substituted into the H1, subtitle, two body paragraphs, one H2 and the form heading. The 6-service
list, the form and `FinalCta` are byte-identical across all 18. `lib/site-config.ts:76-95` is a flat
`{slug, name}` array — **there is no per-city content map anywhere in the repo.**

The meta description is likewise one string with the city interpolated, identical on all 18.

**Impact:** near-duplicate pages compete with each other and get filtered from the index; and each tells
a specific city it gets fast local service with no address, geo or coverage data behind it.

**Fix:** a typed `cityContent` map in `lib/content.ts` keyed by `LocationSlug`, filled from
`docs/city-briefs.md`. See the `city-research` and `new-city` skills.

**Accept:** every city page has ≥2 paragraphs that could not be written about another city. If a city
has nothing truthful and specific, **removing it is the preferred outcome over padding.**

---

### P1-2 · Service pages are thin and share one hardcoded symptom list · M

**Evidence:** `app/services/[service]/page.tsx:44-49` defines a module-level `triggers` array of 4
items rendered **identically on all 6 service pages**. The only genuinely per-service copy in the repo
is one ~45-word paragraph each in `serviceMeta` (`lib/content.ts:20-57`).

`lib/content.ts` holds roughly **685 words for the entire 33-page site.**

`docs/content-standards.md` §3 sets the bar at ~500 substantive Hebrew words per service page, covering
fault → symptoms → what happens on site → repair vs replace → 3–5 FAQs.

**Fix:** per-service symptom data and FAQs in `lib/content.ts`; delete the shared `triggers` array;
emit `FAQPage` per service page.

**Accept:** no two service pages share a symptom list; each clears the §3 bar.

---

### P1-3 · The entire informational keyword cluster is unserved · L

**Evidence:** there is no articles route. `app/` contains no `מדריכים/` or equivalent. Queries like
"למה הדוד לא מתחמם", "דוד שמש או דוד חשמל", "מה זה אנודה" have no home on this site.

**Impact:** `docs/keyword-map.md` §7 names this the biggest keyword gap. It is also the safest content
to build — these topics are technical and need **no business fact**, so they carry none of the claims
risk that warranty, timing and price content carries.

**Fix:** stand up `/מדריכים/[slug]/` with a typed block model, `Article` + `FAQPage` +
`BreadcrumbList`, author and date. See the `new-article` skill.

---

### P1-4 · Unsourced claims across ~15 surfaces, one already in schema · M

**Evidence:** `docs/business-facts.md` §3. The warranty is asserted sitewide with no term anywhere;
`site.config.json:12` `shortPitch` ends with it and the kit uses `shortPitch` as the JSON-LD
`description` — so **it already ships as structured data.**

Also: same-day arrival (`lib/content.ts:84`, `:186-187`, all 18 city pages), the "כשעה עד שעתיים"
duration (`lib/content.ts:167` — the only hard number on the site), and the free-call-out ambiguity.

**Fix:** get owner answers; until then soften the copy. **Never promote any of it into schema.**
Fixing the `shortPitch` means editing the roster manifest, not the code.

---

## P2 — structure and reach

### P2-1 · `googleSiteVerification` is still wired to nothing · S

**Evidence:** the manifest carries the field. `app/layout.tsx` exports `metadata` with `metadataBase`,
`alternates`, `title`, `description` and `openGraph` — and **no `verification` block**. Setting the
value in the roster today silently does nothing.

**Fix:** add `verification: manifest.analytics?.googleSiteVerification ? { google: … } : undefined`.

**Accept:** `grep -o 'google-site-verification[^>]*' out/index.html` returns the tag.

---

### P2-2 · `llms.txt` omits all 18 city URLs · S

**Evidence:** `public/llms.txt` lists the 6 service URLs, 3 info URLs and the areas index described as
"18 ערים" — but **not one city URL individually.** An answer engine reading the file cannot reach the
location silo from it.

**Fix:** list all 18 city URLs and, once built, every hub guide.

---

### P2-3 · Service pages link only the first 8 cities · S

**Evidence:** `app/services/[service]/page.tsx:164-189` renders `locations.slice(0, 8)`. Cities 9–18 —
bnei-brak, ramat-gan, rehovot, herzliya, kfar-saba, modiin, bat-yam, raanana, ashkelon — receive **no
inbound link from any service page.** Their only inbound links are the footer, the homepage
`ServiceAreas` and the areas index.

**Impact:** the service↔location mesh is bidirectional but asymmetric, and the asymmetry follows array
order rather than anything meaningful.

**Fix:** link all 18, or select by relevance rather than by `slice`. Also consider nearby-city links,
which do not exist at all today.

---

### P2-4 · The site ships zero images · M

**Evidence:** `public/` contains only `_headers` and `llms.txt`. No hero, no logo, no service imagery,
no local `og.jpg` — OG points at an external host via the manifest.

**Impact:** no visual E-E-A-T, nothing for `ImageObject`, and a social/chat preview dependent on a third
party.

**Caution:** the current LCP is **text**, which is close to optimal. Adding a hero image can only make
LCP worse — it may still be worth it, but budget for it explicitly. Use the kit's `SiteImage` (which
ships unused today); never hand-roll an `<img>`. **Never** stock photography of technicians or work —
that is a staffing claim rendered as an image, and §3.5 records there is no evidence any technician
exists.

---

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
