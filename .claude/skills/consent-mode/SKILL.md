---
name: consent-mode
description: Consent Mode v2 for hambabait's static export, where GTM currently loads unconditionally on first paint with no consent state anywhere — the denied-by-default signal that must run before the container, what is repo-side versus container-side, why a banner in a static export needs a client component and localStorage, the interaction with the privacy policy that now names Web3Forms/Google/Meta, and the WhatsApp fallback that hands PII to Meta on a user click. Use when adding a consent gate or auditing tracking legality. Triggers: "consent mode", "cookie banner", "GDPR", "consent gate", "is tracking legal", "denied by default", "analytics before consent".
---

# Consent Mode v2 — hambabait

## The current state, precisely

`app/layout.tsx` builds the GTM loader from the manifest via the site-kit helpers:

```ts
const gtmHead = gtmHeadSnippet(manifest.analytics?.gtmId);
const gtmNoScript = gtmNoScriptSrc(manifest.analytics?.gtmId);
```

and injects it into `<head>` unconditionally. **There is no consent state anywhere in `app/`,
`components/` or `lib/`** — no banner, no Consent Mode default, no stored preference.

So analytics run on first paint, before the visitor has been asked anything. The privacy policy now
truthfully names Web3Forms, Google (Tag Manager / Analytics) and WhatsApp/Meta as processors, and
discloses cookie use — **disclosure without a gate**. That is an improvement over the previous state,
in which the policy claimed no third-party transfer at all, but it is not a consent mechanism.

## The rule that makes or breaks the implementation

> **The consent default must execute BEFORE the GTM container loads.**

Consent Mode works by setting a default state that gtag reads when tags fire. If the container loads
first, tags fire unconsented and the default arrives too late to matter.

In `app/layout.tsx` that means the default snippet goes in `<head>` **above** `gtmHead`. Order is the
whole implementation. Get it wrong and you ship a banner that changes nothing — the worst outcome,
because it _looks_ compliant.

```js
// conceptually, before the container:
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag("consent", "default", {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
  wait_for_update: 500,
});
```

Then a `gtag('consent','update', …)` when the visitor accepts.

## Repo-side vs container-side — know the split

| Concern                                      | Where                    | Who   |
| -------------------------------------------- | ------------------------ | ----- |
| Default `denied` snippet before the loader   | `app/layout.tsx`         | repo  |
| The banner UI and stored preference          | a small client component | repo  |
| The `consent update` push on accept          | that component           | repo  |
| Tags respecting consent state                | **GTM container**        | owner |
| Consent Mode enabled on the container's tags | **GTM container**        | owner |
| GA4 behaviour under denied                   | **GA4 / container**      | owner |

**Half of this is not in the repo.** A correct repo-side implementation with a container whose tags
ignore consent state still tracks everyone. Never report the work as done on the repo side alone —
document the container-side steps explicitly and say they are outstanding.

The container is **shared across the Israeli fleet** (`GTM-KWGGH438`), so container changes affect
other sites. That makes it firmly an owner decision, not something to change unilaterally.

## Static-export constraints

`output: "export"` — no middleware, no API routes, no server-side anything. So:

- The banner **must** be a client component (`"use client"`), because it needs state and storage.
- Preference persists in `localStorage`. There is no server to remember it.
- The default snippet is an inline script in `<head>`. There is no server to branch on.
- The banner renders for everyone and hides itself once a choice is stored — accept the momentary
  render rather than trying to avoid it, and reserve its space so it does not cause CLS.

Keep it **leaf-level and small**. There are only four client components today (`Header`, `Faq`,
`LeadForm`, `Reveal`); a consent banner is a justified fifth, but it must not drag anything else into
the client bundle.

## Interaction with the CSP plan

The consent default is an **inline script**, exactly like the GTM snippet. Any Content-Security-Policy
work has to accommodate both — nonce or hash. Since this repo controls no response header on either
host (see `web-security-headers`), a CSP is a **Cloudflare zone change owned by the owner**. Note the
dependency; do not design a CSP that silently breaks consent.

## The other PII path — do not forget it

`components/forms/LeadForm.tsx` builds a `wa.me` URL containing the visitor's **name, phone and
message** when Web3Forms delivery fails. That hands PII to Meta.

It is user-initiated — the panel renders and the visitor chooses to click — which is the defensible
design and better than the silent auto-open it replaced. But it belongs in the privacy disclosure, and
a consent implementation that covers only analytics while ignoring this path is incomplete.

Related, and currently open: **the lead form has no consent affordance.** There is a passive
disclosure paragraph under the submit button linking `/מדיניות-פרטיות/`, but no checkbox and no gate.

## Do not overreach

Consent Mode is not a licence to claim the site is "GDPR compliant" or "עומד בתקן". Implement the
mechanism, describe accurately what it does, and leave legal conclusions to a lawyer. The site already
carries one page asserting a standard it has not been audited against (`/הצהרת-נגישות/`); do not add a
second.

## Verification

```bash
npm run build
# the default must appear BEFORE the container in the emitted head
grep -o 'consent.\{0,40\}' out/index.html | head
grep -n 'gtm.js\|googletagmanager' out/index.html | head
```

Then in a browser with a clean profile: load the page, confirm **no analytics cookie is set before a
choice is made**, accept, and confirm the update fires. The cookie check is the real test — everything
else is a proxy for it.

And the standing assertion, whenever the container id is touched:

```bash
curl -s -o /dev/null -w "%{http_code}" "https://www.googletagmanager.com/gtm.js?id=GTM-KWGGH438"   # 200
```
