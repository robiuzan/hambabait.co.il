---
name: web-security-headers
description: Security posture for hambabait's static export — why this repo cannot set a single response header on either host, which headers the Cloudflare zone already adds and who owns them, the public-by-design Web3Forms key and its spammability, the browser-only honeypot, PII flowing to Web3Forms and Meta with no consent gate, a CSP path around the inline GTM snippet, and secret hygiene. Use when adding headers, planning a CSP, or auditing security. Triggers: "security headers", "CSP", "HSTS", "_headers", "is the form safe", "clickjacking", "is the access key a leak".
---

# Security headers & posture

## Start here: this repo controls no response headers

Under `output: "export"` Next's `headers()` is unavailable, and there is **no `public/_headers` and
no `public/_redirects`** in this repo. Nothing here emits a response header on either host:

- **GitHub Pages** (the still-armed CI target) ignores `_headers` entirely and has no per-response
  configuration at all.
- **Cloudflare Pages** (what actually serves the apex) _would_ honour `public/_headers` — that file
  simply does not exist yet.
- **`public/.htaccess` is dead on both.** Apache directives that neither host interprets; it is
  copied into the export and served as an ordinary public static file.

So when someone asks to "add HSTS": the answer is either a new `public/_headers` (now viable, since
production is Cloudflare Pages) or a zone-level rule — **not** an `.htaccess` edit, and not a Next
config change.

## What the live site already sends, and who owns it

Observed on the apex:

| Header                                                         | Source                                         |
| -------------------------------------------------------------- | ---------------------------------------------- |
| `X-Content-Type-Options: nosniff`                              | Cloudflare Pages default (also on `pages.dev`) |
| `Referrer-Policy: strict-origin-when-cross-origin`             | Cloudflare Pages default                       |
| `Permissions-Policy: geolocation=(), microphone=(), camera=()` | **zone-level rule**                            |
| `Strict-Transport-Security: max-age=15552000`                  | **zone-level rule**                            |
| `X-Frame-Options: SAMEORIGIN`                                  | **zone-level rule**                            |
| _(no `Content-Security-Policy`)_                               | —                                              |

The bottom three are absent from `hambabait.pages.dev` and present on the apex, which is how you know
they are added by the Cloudflare zone rather than by the Pages project.

**Zone settings are the owner's to change** (Sys Admin territory). Document the exact toggle; never
assume it was applied. If you add a `public/_headers`, be aware it can now _conflict_ with the zone
rules — check for duplicate or contradictory values after deploying.

`Strict-Transport-Security: max-age=15552000` is 180 days. The usual hardening path is 1 year plus
`includeSubDomains`, then preload — but preload is close to irreversible, so it is an owner decision,
not a default.

## The Web3Forms access key

`site.config.json` contains `formAccessKey: "37b27cbc-…"`. It is committed, and it ships in a public
JS chunk — verifiable by fetching the chunk from the live site.

**This is exposure as designed, not a leaked secret.** Web3Forms access keys are public by nature for
client-side forms. Do not "fix" it by moving it to an env var: `NEXT_PUBLIC_*` is equally public in a
static export, and there is no server to hide it behind.

What it _is_, is a **spammable identifier**:

- The honeypot (`company`) is checked in the browser only.
- Anyone can POST directly to `api.web3forms.com` with the harvested key and flood the inbox.
- Rate limiting and abuse control live on Web3Forms' side, outside this repo.

So: never describe the form as spam-protected. If abuse starts, the levers are Web3Forms' own
controls or rotating the key — both outside the codebase.

## PII flow — the real risk

Two paths carry a visitor's name, phone number and free-text problem description off-site:

1. **`api.web3forms.com`** — the normal submit path.
2. **`wa.me` (Meta)** — the fallback path, which interpolates the same fields into a URL. It runs on
   any delivery failure _and_ whenever the access key is missing or empty, silently.

On top of that, **GTM loads on first paint with no consent gate** — no banner, no Consent Mode
default, no consent state anywhere in the codebase.

And `/מדיניות-פרטיות/` states that details are not passed to third parties, while naming none of
these processors, no cookies, and no retention period.

**That gap is the weakest point of the posture** — bigger than any missing header. It is a factual
error on a legal page, not a preference. See `docs/business-facts.md` §4.1.

Minimum remediation: disclose the processors (Web3Forms, Google/GTM, WhatsApp), state a retention
period, and add a consent affordance at the point of collection linking the policy. Consent Mode v2
defaults (denied until granted) is the standard path and touches the container as much as the site.

## A CSP path — report-only first

There is no CSP today. Adding one is worthwhile but must be staged, because the site injects GTM as
an **inline** `<script>`:

1. **Start `Content-Security-Policy-Report-Only`** so nothing breaks while you learn what the page
   actually loads.
2. The inline GTM loader means `'unsafe-inline'` for `script-src`, **or** a nonce — and a nonce needs
   a server to generate it per response, which a static export does not have. Practical options: a
   hash for the inline snippet (it is stable, so hashing works), or accept `'unsafe-inline'` and rely
   on the other directives.
3. Expect to allow at minimum: `googletagmanager.com` (and whatever GA4 endpoints the container
   loads), `api.web3forms.com` in `connect-src`, `fonts.gstatic.com` for the self-hosted-at-build
   Google fonts, and the image host used by `ogImageMeta`.
4. Only after the report endpoint is quiet, promote to enforcing.

`frame-ancestors 'self'` in a CSP is the modern replacement for the `X-Frame-Options: SAMEORIGIN` the
zone already sets. `upgrade-insecure-requests` is redundant behind HSTS.

## Secret hygiene — currently clean

- `.gitignore` covers `.env` and `.env*.local`; no `.env` exists in the repo.
- `.env.example` holds only non-secret values.
- **No other credential is committed.** The Web3Forms key is the only credential-shaped value and it
  is public by design.
- **`.env.example` is stale**: it still describes server-side lead routing via `public/lead.php` and
  defines `LEAD_EMAIL_TO`. That file was deleted when leads moved to Web3Forms; `LEAD_EMAIL_TO` is
  read by no code, and the real delivery address is whatever inbox Web3Forms has registered — not
  knowable from this repo. Fix the file rather than trusting it.

## Dependency risk

Small, current surface: Next 14.2, React 18.3, `lucide-react`, `clsx`, `tailwind-merge`, and the
vendored `@ishub/site-kit`.

`framer-motion` is declared and imported by nothing — removing it drops ~2 MB of `node_modules` and
one supply-chain surface for zero behaviour change.

The kit is a **vendored tarball** (`file:vendor/…tgz`) with its integrity hash pinned in the
lockfile. That is good for reproducibility, but it means updates bypass the registry entirely — the
tarball's provenance is the hub, so review kit changes at the hub, not here. Never edit anything
under `vendor/` or `node_modules/`.

## Audit pass

```bash
# what the live site actually sends
curl -sI https://hambabait.co.il/ | grep -iE 'strict-transport|x-frame|content-security|permissions-policy|x-content-type|referrer'

# zone vs project: anything here and not below is added by the zone
curl -sI https://hambabait.pages.dev/ | grep -iE 'strict-transport|x-frame|content-security'

# secrets
grep -rnE '(api[_-]?key|secret|password|token)' app components lib --include=*.ts --include=*.tsx

# is _headers present yet?
ls public/_headers public/_redirects 2>/dev/null
```
