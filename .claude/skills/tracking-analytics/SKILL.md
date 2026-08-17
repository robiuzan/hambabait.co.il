---
name: tracking-analytics
description: GTM, GA4 and conversion events for hambabait on the shared Israeli fleet container GTM-KWGGH438 — head placement via the site-kit helpers, hostname-based GA4 routing inside the container, the data-cta inventory, the lead_submit event, the missing consent gate, Search Console verification that is wired to nothing, and the mandatory gtm.js 200-check whenever a container id changes. Use when turning on analytics or when conversions are not being recorded. Triggers: "set up GTM", "GA4", "track calls", "conversion tracking not firing", "Search Console", "container id", "dataLayer".
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

`GTM-KWGGH438` is the first id actually verified (HTTP 200, ~354 KB payload carrying all 10 hostname
patterns). It is what ships today and what the live HTML serves.

## How it is wired

`site.config.json` → `analytics.gtmId` → `lib/site-config.ts` → `app/layout.tsx`, via
`gtmHeadSnippet()` and `gtmNoScriptSrc()` from `@ishub/site-kit/analytics`.

The helpers validate against `/^GTM-[A-Z0-9]+$/i` and return `null` on a miss, so both the inline
loader and the `<noscript>` iframe render **nothing** when the id is absent or malformed. The loader
is inert by construction — which is good, and also why a wrong-but-well-formed id fails silently.

**Never hand-write a GTM snippet into a page.** Change the id in the roster manifest, sync, rebuild.

## GA4 — one container, many properties

The IL fleet deliberately uses **one shared GTM container** with **one GA4 property per site**,
resolved _inside_ the container by a RegEx Table variable on `{{Page Hostname}}`. This is the
opposite of the USA fleet's per-site containers. Do not "fix" it by creating a hambabait container.

Consequences:

- Measurement ids live in each manifest's `analytics.ga4MeasurementId`. **hambabait's repo manifest
  has no such field at all**, and the hub copy has it `null`.
- Whether the container's RegEx Table actually routes `hambabait.co.il` to a live GA4 property can
  only be checked in the GTM/GA4 consoles — it is not knowable from this repo.
- So: the snippet firing is **not** evidence that GA4 is receiving hambabait traffic. Verify in
  GA4 Realtime before reporting analytics as working.

## The event inventory

### `lead_submit`

Fired from `components/forms/LeadForm.tsx` via `trackEvent("lead_submit", { form: "lead" })`, gated
behind a **confirmed** Web3Forms success response. That gate is correct: the event means a lead was
actually delivered, not that a button was clicked. Preserve it.

`trackEvent` pushes to `window.dataLayer` and is a safe no-op when GTM is absent.

### `data-cta` placements

Every call and WhatsApp CTA carries a `data-cta` attribute naming its placement — header, hero, final
CTA, footer, mobile bar. Click tracking is configured in the container against that attribute, which
is why:

- **any new CTA must carry a `data-cta`**, or it is invisible to analytics;
- names are **placement-based** (`hero`, `header`, `final`, `mobile-bar`, `footer`), never
  appearance-based (`green-button`), because a redesign must not break the tag config.

Calls and WhatsApp opens are the primary conversions on this site — the form is third. Do not treat
`lead_submit` as the only conversion.

## Never put PII in `dataLayer`

The lead form holds a name, a phone number and a free-text description. **None of it goes into
`dataLayer`.** `lead_submit` carries a form identifier and nothing else. Do not add `phone`, `name`,
`email` or the message body — not hashed, not truncated.

The same applies to the WhatsApp fallback URL: it already carries the lead in the query string to
Meta. Do not additionally push it into the dataLayer.

## The consent gap

GTM loads unconditionally on first paint. There is **no cookie banner, no Consent Mode default, and
no consent state anywhere** in `app/`, `components/` or `lib/` — while `/מדיניות-פרטיות/` mentions no
cookies, no Google, no analytics and no third-party processors.

That combination is the weakest point of the site's posture. If asked to "add analytics", raise the
consent question in the same breath. Implementing Consent Mode v2 defaults (denied until granted) is
the standard path, and it is a change to the container as much as to the site.

Do not silently add more tracking on top of an undisclosed stack.

## Search Console

`analytics.googleSiteVerification` exists in the manifest as `null` — **and nothing reads it.**
`app/layout.tsx` has no `verification` block, so setting that field today would silently do nothing.

If verification is needed: wire `verification: { google: ... }` into the layout metadata at the same
time you set the manifest value, or verify by DNS TXT and leave the field alone. Do not set the field
and assume it shipped.

## Verifying, in order

```bash
# 1. the id is a real container
curl -s -o /dev/null -w '%{http_code}\n' "https://www.googletagmanager.com/gtm.js?id=GTM-KWGGH438"

# 2. the built output carries it, and only it
grep -o 'GTM-[A-Z0-9]*' out/index.html | sort -u

# 3. it survived to production
curl -s https://hambabait.co.il/ | grep -o 'GTM-[A-Z0-9]*' | sort -u
```

Then, in the consoles: GTM Preview to confirm tags fire, and GA4 Realtime to confirm the hostname
routes to the right property. Steps 1–3 prove delivery of the snippet. Only the console proves data
is being collected.
