---
name: tracking-analytics
description: GTM, GA4 and conversion events for hambabait on the shared Israeli fleet container GTM-KWGGH438 — head placement via the site-kit helpers, hostname-based GA4 routing inside the container, the 28-value data-cta inventory, tracked since 2026-09-17 by one attribute-reading GA4 tag so a new value needs no container change, the lead_submit family including lead_submit_blocked, Consent Mode v2 which has shipped, Search Console ownership which is verified by DNS TXT as of 2026-09-16, and the mandatory gtm.js 200-check whenever a container id changes. Use when turning on analytics or when conversions are not being recorded. Triggers: "set up GTM", "GA4", "track calls", "conversion tracking not firing", "Search Console", "container id", "dataLayer".
---

# Tracking & analytics

## The hard rule

**A GTM snippet in the page proves nothing. Whenever a container id changes, assert that
`https://www.googletagmanager.com/gtm.js?id=<ID>` returns HTTP 200.**

```bash
curl -s -o /dev/null -w '%{http_code}\n' "https://www.googletagmanager.com/gtm.js?id=GTM-KWGGH438"
```

This is a hard rule because the fleet broke it twice. `GTM-5K3WQN8W` was set as a placeholder and
was never a real container — `gtm.js` returned 404, byte-identical to the 404 for a made-up id. It
was then replaced fleet-wide by a blanket find/replace with `GTM-KW8VTDZR`, which **was also a 404**.
Result: **zero analytics across every IL site for 18 days**, with the snippet present in the HTML the
whole time.

`GTM-KWGGH438` is the first id actually verified (HTTP 200). It is what ships today and what the live
HTML serves.

## How it is wired

`site.config.json` → `analytics.gtmId` → `lib/site-config.ts` → `app/layout.tsx`, via
`gtmHeadSnippet()` and `gtmNoScriptSrc()` from `@ishub/site-kit/analytics`.

The helpers validate against `/^GTM-[A-Z0-9]+$/i` and return `null` on a miss, so both the inline
loader and the `<noscript>` iframe render **nothing** when the id is absent or malformed. The loader
is inert by construction — which is good, and also why a wrong-but-well-formed id fails silently.

Load order in `app/layout.tsx` is the mechanism, not a detail:

```
<head>  <script id="consent-default">   ← Consent Mode v2 defaults, everything denied
<body>  <noscript><iframe … ns.html>
        <script id="gtm-init">          ← the container loader
```

**Never hand-write a GTM snippet into a page**, and never move `gtm-init` above `consent-default`.
`npm run qa:gate` asserts that ordering on every built page.

## GA4 — one container, many properties

The IL fleet deliberately uses **one shared GTM container** with **one GA4 property per site**,
resolved _inside_ the container by a RegEx Table variable on `{{Page Hostname}}`. This is the
opposite of the USA fleet's per-site containers. Do not "fix" it by creating a hambabait container.

Consequences:

- Measurement ids live in each manifest's `analytics.ga4MeasurementId`. hambabait's repo manifest
  carries the field as `null` (`site.config.json:49`), identical to the hub copy — the id is resolved
  container-side, so `null` is correct and must not be "fixed".
- ✅ **Confirmed 2026-09-06 by GTM Preview against the live site (owner).** The hostname routing
  resolves to GA4 property **`G-RLE7LGPPX3`**. `GA4 — Per-site config` fired once and the
  `GA4 - cta_click` tag sent its hits to that id, so the container→GA4 chain is proven end to end.
  Record the id here only — it does **not** go in the manifest, where `null` remains correct.
- Preview also confirmed **Consent Default fires as event 1**, ahead of Initialization and Container
  Loaded — the same ordering `qa:gate` asserts statically in the built HTML, now verified at runtime.
- Keep the rule anyway: the snippet firing is **not** evidence that GA4 is receiving traffic — that is why the above was verified rather than assumed. Re-verify in
  GA4 Realtime before reporting analytics as working.
- The container is **shared across the fleet**. Any change to it affects other sites, which makes
  container edits an owner decision rather than an agent action.

## ⚠️ The container is currently behind the repo

Three `data-cta` values changed meaning and four new ones appeared in the last content pass. The
container's click triggers match these strings, so **until someone updates `GTM-KWGGH438`, the new
values record nothing.** That is an owner action and it should be raised whenever tracking is
discussed.

What changed:

| Value                                                                                 | Status                                                                                                |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `header-call`                                                                         | **narrowed** — was reused for three different elements on every page; now the desktop bar button only |
| `header-call-icon`                                                                    | **new** — the compact icon link                                                                       |
| `mobile-menu-call`                                                                    | **new** — the call action inside the mobile panel                                                     |
| `hero-form-submit` `contact-form-submit` `service-form-submit` `location-form-submit` | **new** — one per `LeadForm` placement                                                                |

A trigger still matching the old catch-all `header-call` now counts a third of what it used to and
reports it as a decline. Say so before anyone reads the drop as a conversion regression.

## The event inventory

### `lead_submit`

Fired from `components/forms/LeadForm.tsx` via `trackEvent("lead_submit", { form: "lead" })`, gated
behind a **confirmed** Web3Forms success response. That gate is correct: the event means a lead was
actually delivered, not that a button was clicked. Preserve it.

### `lead_submit_failed`

Two reasons: `no_key` (the access key is missing or empty) and `delivery` (Web3Forms rejected or the
fetch failed). Useful precisely because both fall back to WhatsApp, so a silent delivery outage would
otherwise look like normal WhatsApp traffic.

### `lead_submit_blocked`

Fires when the browser-side honeypot catches a submission (`reason: "honeypot"`). **Inert until
someone adds a tag and trigger in `GTM-KWGGH438`** — another owner action. Do not report honeypot
volume as measured until that exists.

`trackEvent` pushes to `window.dataLayer` and is a safe no-op when GTM is absent.

### `data-cta` placements — 28 values in the built output

Every call, WhatsApp and form CTA carries a `data-cta` attribute naming its placement. Click tracking
is configured in the container against that attribute, which is why:

- **any new CTA must carry a `data-cta`**, or it is invisible to analytics;
- names are **placement-based** (`hero-`, `header-`, `finalcta-`, `sticky-`, `footer-`), never
  appearance-based (`green-button`), because a redesign must not break the tag config;
- when a value's meaning changes, that is a **container migration**, not a rename.

The 28 values present in `out/`:

```
contact-call, contact-email, contact-form-submit, contact-form-whatsapp, contact-whatsapp,
finalcta-call, finalcta-whatsapp, footer-call, footer-email, header-call, header-call-icon,
hero-call, hero-form-submit, hero-form-whatsapp, hero-whatsapp, location-form-submit,
location-form-whatsapp, mobile-menu-call, notfound-call, pricing-quote · pricing-table-quote, service-call,
service-form-submit, service-form-whatsapp, service-whatsapp, sticky-call, sticky-whatsapp,
thanks-call
```

`LeadForm` also mints `<placement>-success-call`, `<placement>-error-call` and
`<placement>-error-whatsapp` at runtime. Those are **not** in the static HTML — a grep of `out/` will
never find them, and a container trigger for them still works.

Calls and WhatsApp opens are the primary conversions on this site — the form is third. Do not treat
`lead_submit` as the only conversion.

## Never put PII in `dataLayer`

The lead form holds a name, a phone number and a free-text description. **None of it goes into
`dataLayer`.** The `lead_submit` family carries a form identifier and a failure reason, nothing else.
Do not add `phone`, `name`, `email` or the message body — not hashed, not truncated.

The same applies to the WhatsApp fallback URL: it already carries the lead in the query string to
Meta. Do not additionally push it into the dataLayer.

## Consent — shipped, and half of it is not in this repo

Consent Mode v2 is live. `lib/consent.ts` emits the denied-by-default snippet in `<head>`
(`ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage` all `denied`;
`functionality_storage` and `security_storage` granted; `wait_for_update: 500`), re-granting
immediately if this browser already stored a choice. `components/layout/ConsentBanner.tsx` collects
the choice and persists it in `localStorage` under `hb-consent`. `/מדיניות-פרטיות/` names Web3Forms,
Google (Tag Manager / Analytics) and WhatsApp/Meta, and discloses cookie use.

What is **not** done, and must be said whenever consent comes up:

- **Container-side consent is owner work.** Consent Mode has to be enabled on the tags inside
  `GTM-KWGGH438`, and consent-requiring tags configured to wait. A correct repo-side default with
  tags that ignore consent state still tracks everyone.
- **The lead form carries a disclosure notice, not a required checkbox.** The notice renders above
  the submit button and is wired to it with `aria-describedby`. A required checkbox was considered
  and deliberately not added — it has a real conversion cost and the decision is the owner's.
- **Measured analytics will fall** once tags honour the default. That drop is consent working, not a
  regression. Do not "fix" it by weakening the default.

Do not silently add more tracking on top of this stack; anything new needs a line in
`/מדיניות-פרטיות/` in the same change.

## Search Console

`app/layout.tsx` now spreads a `verification: { google: … }` block **when**
`manifest.analytics.googleSiteVerification` is set, and emits nothing when it is not — an empty
verification meta is worse than none. So setting the manifest value is no longer a no-op.

The field is still unset today. To verify ownership: set it in the roster, run
`ops/sync-manifest.ps1`, rebuild, and check the meta tag in `out/index.html` — or verify by DNS TXT
and leave the field alone. Do not set it and assume it shipped without checking the built output.

## Verifying, in order

```bash
# 1. the id is a real container
curl -s -o /dev/null -w '%{http_code}\n' "https://www.googletagmanager.com/gtm.js?id=GTM-KWGGH438"

# 2. the built output carries it, and only it
grep -o 'GTM-[A-Z0-9]*' out/index.html | sort -u

# 3. consent default precedes the container (qa:gate asserts this too)
grep -o 'id="consent-default"\|id="gtm-init"' out/index.html

# 4. the data-cta inventory the container has to match
grep -rho 'data-cta="[^"]*"' out --include=index.html | sort -u

# 5. it survived to production
curl -s https://hambabait.co.il/ | grep -o 'GTM-[A-Z0-9]*' | sort -u
```

Then, in the consoles: GTM Preview to confirm tags fire, and GA4 Realtime to confirm the hostname
routes to the right property. Steps 1–5 prove delivery of the snippet and the attributes. Only the
console proves data is being collected.
