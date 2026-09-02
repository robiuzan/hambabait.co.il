---
name: consent-mode
description: Consent Mode v2 on hambabait, which shipped — the denied-by-default snippet in lib/consent.ts that must execute before the GTM container, the ordering rule the qa:gate now asserts, the ConsentBanner client component and its localStorage key, what remains container-side and owner-owned inside the shared fleet container GTM-KWGGH438, the lead form's disclosure notice and the deliberately absent consent checkbox, and the WhatsApp fallback that hands PII to Meta on a user click. Use when auditing tracking legality or changing anything near the consent path. Triggers: "consent mode", "cookie banner", "GDPR", "consent gate", "is tracking legal", "denied by default", "analytics before consent".
---

# Consent Mode v2 — hambabait

## What is live

Consent Mode v2 **shipped**. Three pieces, all in the repo:

| Piece               | Where                                 | What it does                                                                                     |
| ------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| The default snippet | `lib/consent.ts` → `<head>`           | everything `denied` before anything loads; re-grants immediately if this browser stored a choice |
| The banner          | `components/layout/ConsentBanner.tsx` | asks, stores the choice, pushes `consent update` on accept                                       |
| The ordering        | `app/layout.tsx`                      | default in `<head>`, container in `<body>`                                                       |

```js
// lib/consent.ts — consentDefaultSnippet, emitted inline in <head>
gtag("consent", "default", {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
  functionality_storage: "granted",
  security_storage: "granted",
  wait_for_update: 500,
});
// then, in a try/catch: if localStorage['hb-consent'] === 'granted', immediately
// gtag('consent','update', …) so a returning visitor is neither re-asked nor
// needlessly downgraded for the 500ms window.
```

`functionality_storage` and `security_storage` stay granted: they cover what the site needs to work at
all, and neither is used for tracking.

The snippet is emitted only when `gtmHead` is truthy — no container id, no consent script, because
there is nothing to gate.

**Expected effect: measured analytics fall until visitors accept. That drop is consent working, not a
regression.** Do not "fix" it by weakening the default.

## The rule that makes or breaks it

> **The consent default must execute BEFORE the GTM container loads.**

Consent Mode works by setting a default state that tags read when they fire. If the container loads
first, tags fire unconsented and the default arrives too late to matter. That is the worst available
failure, because the page _looks_ compliant while behaving exactly as it did before.

In `app/layout.tsx` the default (`id="consent-default"`) is in `<head>` and the container
(`id="gtm-init"`) is in `<body>`. Scripts execute in document order, so `<head>` is unambiguous.

**This is now asserted by the release gate.** `scripts/qa-gate.mjs` §8 checks that
`id="consent-default"` precedes `id="gtm-init"` in every built HTML file. If you move either script,
`npm run qa:gate` fails — which is the point. Do not "fix" that failure by reordering the assertion.

## Repo-side vs container-side — know the split

| Concern                                      | Where                                 | Status                  |
| -------------------------------------------- | ------------------------------------- | ----------------------- |
| Default `denied` snippet before the loader   | `lib/consent.ts` + `app/layout.tsx`   | **done**                |
| Banner UI and stored preference              | `components/layout/ConsentBanner.tsx` | **done**                |
| `consent update` push on accept              | that component                        | **done**                |
| Ordering assertion                           | `scripts/qa-gate.mjs`                 | **done**                |
| Consent Mode enabled on the container's tags | **GTM container**                     | **outstanding — owner** |
| Tags configured to wait for consent          | **GTM container**                     | **outstanding — owner** |
| GA4 behaviour under denied                   | **GA4 / container**                   | **outstanding — owner** |

**Roughly half of this is not in the repo.** A correct repo-side default with a container whose tags
ignore consent state still tracks everyone. Never report the work as done on the repo side alone —
say the container half is outstanding.

The container is **shared across the Israeli fleet** (`GTM-KWGGH438`), so container changes affect
other sites. That makes it firmly an owner decision, not something to change unilaterally.

## The banner, and why it is built the way it is

- **A client component**, the fifth on the site (`Header`, `Faq`, `LeadForm`, `Reveal`, `ConsentBanner`).
  It needs state and `localStorage`, neither of which exists in a static export. Keep it leaf-level; it
  must not drag anything else into the client bundle.
- **Renders nothing until mounted.** Reading `localStorage` during render would mismatch the
  server-rendered HTML and break hydration, so the check is in an effect and the banner appears a beat
  later. That is also why it is `fixed` — appearing late must not push content around and cost CLS.
- **Storage failure is safe by design.** A `catch` around the read shows the banner rather than
  assuming; it never silently upgrades anyone to granted.
- **Positioned `bottom-16` above the sticky mobile CTA bar**, so it never covers the call button.
  Losing a phone call to a cookie banner is a poor trade on a site whose first conversion goal is a call.
- **Second in the DOM, not last.** As the final element in `<body>` it sat ~100 tab stops from the top:
  a keyboard user had to traverse the whole page to answer it, and at 400% zoom it covered the viewport
  with unreachable controls. It is `fixed`, so DOM position does not affect where it paints. Consent
  logically precedes everything else, so it is reached first. **Do not move it back.**

The two buttons are a real choice: `בלי מדידה` (denied) and `מאשר/ת` (granted). Both dismiss; only
`granted` pushes an update.

## Static-export constraints

`output: "export"` — no middleware, no API routes, no server-side anything. So:

- Preference persists in `localStorage` under `hb-consent`. There is no server to remember it.
- The default snippet is an inline script in `<head>`. There is no server to branch on.
- The banner renders for everyone and hides itself once a choice is stored.

## Interaction with the CSP

`public/_headers` ships a **report-only** CSP whose `script-src` is
`'self' 'unsafe-inline' https://www.googletagmanager.com`. The consent default and the GTM snippet are
both inline scripts and both rely on `'unsafe-inline'`.

**A hash-based `script-src` is impossible here.** Next.js App Router serialises the React Flight
payload into bare inline `<script>` tags — 169 distinct bodies across the current `out/` — and their
content changes every build. CSP ignores `'unsafe-inline'` the moment any hash or nonce is present, so
adding hashes for the two id-bearing snippets would block all 169 and render every page blank. A nonce
is not an option either: a static export has no server to mint one per request.

So the CSP will not break consent, and consent does not constrain the CSP. If the policy is ever moved
to enforcing, re-verify both inline scripts still execute before doing anything else. See
`web-security-headers`.

## The lead form — disclosure, deliberately not a checkbox

`components/forms/LeadForm.tsx` renders a consent notice **above the submit button**, wired to it with
`aria-describedby="lf-consent"`. It names Web3Forms as the processor, says contact will be by phone or
WhatsApp, states the access/deletion right, and links `/מדיניות-פרטיות/`.

Position is deliberate: a notice rendered _after_ the button is announced only once the user has
already passed the control that sends their data.

> **There is deliberately no required consent checkbox.** That is an owner decision with a real
> conversion cost on a form whose visitor usually has water on the floor. It is recorded as an open
> option, not as an oversight — do not add one unilaterally, and do not describe its absence as a
> defect that was missed.

## The other PII path — do not forget it

The form builds a `wa.me` URL containing the visitor's **name, phone and message** when Web3Forms
delivery fails. That hands PII to Meta.

It is user-initiated — the panel renders and the visitor chooses to click — which is the defensible
design and better than the silent auto-open it replaced. It belongs in the privacy disclosure, and a
consent implementation that covers only analytics while ignoring this path is incomplete.

## Do not overreach

Consent Mode is not a licence to claim the site is "GDPR compliant" or "עומד בתקן". The mechanism is
implemented; describe accurately what it does and leave legal conclusions to a lawyer. The site already
carries one page asserting a standard it has not been audited against (`/הצהרת-נגישות/`); do not add a
second.

## Verification

```bash
npm run build && npm run qa:gate     # assertion 8 covers the ordering

# the default must appear BEFORE the container in the emitted head
grep -o 'id="consent-default"\|id="gtm-init"' out/index.html
```

Then in a browser with a clean profile: load the page, confirm **no analytics cookie is set before a
choice is made**, accept, and confirm the update fires and `hb-consent` is stored. The cookie check is
the real test — everything else is a proxy for it. Reload and confirm the banner does not reappear.

And the standing assertion, whenever the container id is touched:

```bash
curl -s -o /dev/null -w "%{http_code}" "https://www.googletagmanager.com/gtm.js?id=GTM-KWGGH438"   # 200
```
