---
name: geo-personalization
description: What personalization a static export on Cloudflare Pages can and cannot safely do for hambabait — why server-side and middleware personalization are impossible under output "export", why IP-based city swapping is cloaking-adjacent, invisible to crawlers that see only the default, and redundant against 18 real indexed city pages, why a city or availability string rendered from an IP lookup is a coverage claim the roster does not support, the geolocation permission prompt that is hostile to a visitor with water on the floor, and the additive-after-paint envelope that is the only sanctioned approach. Use when anyone proposes dynamic content by location, a nearest-branch widget, or "detect the user's city". Triggers: "personalization", "geolocation", "detect city", "dynamic content by location", "nearest city", "IP lookup", "show local content", "geotargeting".
---

# Geo-personalization — hambabait

## The fact that settles most proposals

> **This is a static export (`output: "export"`) on Cloudflare Pages. There is no server, no
> middleware, no API route, and no request-time rendering.** All 47 built pages are flat HTML files,
> byte-identical for every visitor on Earth.

Say this first, before evaluating any proposal. It rules out server-side personalization entirely,
and it is the fact most proposals quietly assume away.

| Approach                               | Available?              | Verdict                                                                                                                                    |
| -------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Server render per visitor              | ❌ forbidden by export  | Impossible without abandoning static export                                                                                                |
| Next middleware / API route            | ❌ forbidden by export  | Impossible                                                                                                                                 |
| Cloudflare Pages Function / Worker     | 🟡 technically possible | **Owner + Sys Admin decision.** Changes the deploy shape and adds an origin to reason about. Not in this repo. Never add one unilaterally. |
| `navigator.geolocation`                | 🟡 with a prompt        | **Rejected.** A permission dialog in front of someone with water on the floor is hostile, and most deny it.                                |
| Third-party IP-geolocation API         | 🟡 yes                  | Costs a request, adds a processor to `/מדיניות-פרטיות/`, buys city-level accuracy we barely need. Very high bar.                           |
| **Client-side, additive, after paint** | ✅ yes                  | **The only sanctioned approach.** See the envelope.                                                                                        |

## Why aggressive geo-swapping is dangerous here, not merely hard

1. **The crawler sees the default.** Googlebot crawls from a fixed location. An H1 that says
   `תיקון דודים בתל אביב` only for Tel Aviv IPs is indexed as the generic version — the
   personalization earns nothing in search.
2. **Divergence between crawler and user main content is cloaking-adjacent.** Even well-intentioned,
   it is the pattern the guidelines exist to catch.
3. **We already solved this properly.** There are **18 real city pages**, each carrying its own answer
   block, city-specific paragraphs, FAQs and nearby-city links, plus its own canonical, area-scoped
   `Service` + `FAQPage` + `BreadcrumbList` schema. Personalization would be a worse, unindexable
   version of an asset that already works.
4. **It fights the honesty rules.** `טכנאי באזור שלך` rendered from an IP lookup is a **coverage
   claim**, and coverage is `⬜ authored SEO surface, not verified coverage` in
   `docs/entity-profile.md`.
5. **It costs CLS on a site whose LCP is text.** There are **zero images in the built output**, so the
   current LCP is the fastest thing a page can have. Anything injected after paint is a pure downside
   against that baseline unless its space is reserved.

## The sanctioned envelope

All of these, or it does not ship:

- [ ] **Additive only.** May _add_ a suggestion; may never _replace_ main content.
- [ ] **Never touches** `<h1>`, `<title>`, meta description, canonical, JSON-LD, breadcrumbs or nav.
- [ ] **After paint**, in a client component, with **reserved space** so CLS stays 0.
- [ ] **Degrades to nothing** — no signal, no JS, or blocked storage leaves the page complete.
- [ ] **No new blocking request** on the critical path.
- [ ] **No new third-party processor** unless `/מדיניות-פרטיות/` is updated in the same change.
- [ ] **Asserts no business fact** — no coverage, arrival time, availability or presence claim.
- [ ] **Dismissible**, dismissal remembered in `localStorage` (the `ConsentBanner` pattern —
      wrapped in `try/catch`, because private mode and blocked storage both throw).
- [ ] **Measured** with its own `data-cta` — and note that a new value is **inert until someone adds
      the trigger in `GTM-KWGGH438`**, which is a shared fleet container and therefore an owner
      action. Do not ship it and call it measured.

Note the client-component budget: there are **five** today (`Header`, `Faq`, `LeadForm`, `Reveal`,
`ConsentBanner`). A sixth needs to justify itself against `docs/performance-guidelines.md` §4.

> **The fleet live-kit is not personalization, and it is sanctioned — owner decision 2026-10-11**
> (CLAUDE.md §13). The announcement bar, the seasonal card (a popup, overriding the site's
> no-popup rule) and the homepage updates strip pick a pre-written line by **date** (the Israeli
> calendar) and by the fleet status switch — never by the visitor's location, identity or
> behaviour beyond a page-view count. How it sits against the envelope: additive; never touches the
> H1, title, meta, canonical, JSON-LD or nav; decided **before** first paint by an inline head
> script, so no space is reserved and CLS stays 0 (no client component — `public/assets/live.js`
> is plain deferred JS); degrades to the evergreen line on desktop and nothing on a phone with
> JavaScript off; the one network read (`imgquarry.com/status/fleet.json`) is after paint, 1.5 s at
> most, and is disclosed on `/מדיניות-פרטיות/`; the gate `scripts/live/check-live-register.mjs`
> rejects every business-fact claim (warranty, speed, availability, coverage, staffing — this
> site's stems are in `live.config.mjs`); the card's dismissal is remembered in `localStorage`;
> every link carries its own `data-cta`. It shows no "open now" and no countdown.

### Passes

| Pattern                              | Note                                                                                                                                                                                                                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **"Nearest city" suggestion strip**  | A dismissible link to the closest of the 18 city pages. Additive, points at a real indexed URL, asserts nothing. The best available option. Note the city pages already cross-link `nearby` cities in the HTML, which is the crawlable version of the same idea. |
| **Service prefilled from the route** | Already shipped — `LeadForm` takes `defaultService` (and `ctaPlacement`). Deterministic, in the HTML, zero risk.                                                                                                                                                 |
| **Remembering a dismissal**          | Already done correctly by `ConsentBanner` (`localStorage` key `hb-consent`, in `try/catch`).                                                                                                                                                                     |
| **Returning-visitor CTA emphasis**   | Purely visual; no content change.                                                                                                                                                                                                                                |

### Fails

| Pattern                                     | Fails on                                                                                                                                 |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Swapping the city name in the H1 by IP      | Cloaking-adjacent · invisible to crawlers · CLS                                                                                          |
| `טכנאי זמין עכשיו ב<עיר>`                   | Fabricated coverage **and** availability                                                                                                 |
| Live "open now / closed now" from the clock | The hours are one of the six `⬜` items in `docs/manifest-assumptions.md` — rendering them as live status presents an assumption as fact |
| Countdown timers / fake urgency             | Fabricated scarcity                                                                                                                      |
| Auto-redirect to a city page by IP          | Breaks the back button, crawling, and canonicals                                                                                         |

## If someone insists on real geo data

Route it to the owner, with the cost stated: a Cloudflare Pages Function or Worker can read
`request.cf` / `CF-IPCountry` at the edge. That is a **hosting change**, not a repo change — it adds
a runtime to a site that currently has none, changes the deploy path in
`ops/deploy-site.ps1`, and puts a new failure mode in front of every page. It also does not remove
any of the five objections above; it only makes the swap technically cleaner.

**Country-level is all that is reliable anyway**, and every visitor is already in Israel.

## Related

`docs/mobile-ux-and-personalization.md` (the full decision record) · `conversion-cro` ·
`performance-web-vitals` · `local-seo-il` (why the 18 city pages are the right answer instead).
