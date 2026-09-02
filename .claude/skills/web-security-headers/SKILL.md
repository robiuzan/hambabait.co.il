---
name: web-security-headers
description: Security posture for hambabait's static export — the report-only CSP that now ships in public/_headers and why a hash-based script-src is impossible here (169 rotating inline React Flight scripts), which headers come from the Cloudflare zone and who owns them, the public-by-design Web3Forms key and its spammability, the browser-only honeypot, and PII flowing to Web3Forms and Meta. Use when adding headers, planning a CSP, or auditing security. Triggers: "security headers", "CSP", "HSTS", "_headers", "is the form safe", "clickjacking", "is the access key a leak".
---

# Security headers & posture

## Start here: the repo controls Pages headers, and nothing else

Under `output: "export"` Next's `headers()` is unavailable. What exists instead:

- **`public/_headers` ships** and Cloudflare Pages honours it at the project level. It carries two
  blocks: immutable caching for `/_next/static/*`, and a **report-only CSP** on `/*`.
- **Zone-level rules** add headers `_headers` never sees. They are **the owner's to change** (Sys
  Admin territory) — document the exact toggle, never assume it was applied.
- **`public/_redirects` does not exist.** Pages would honour it; it is the right place for a path
  redirect if one is ever needed (mind the Hebrew percent-encoding).
- `public/CNAME` and `public/.htaccess` were removed 2026-08-17 along with the dead GitHub Pages
  deploy workflow. They were Apache/GitHub-era vestiges that neither host interpreted. If they
  reappear, someone restored them by mistake.

So "add HSTS" is answered by either `public/_headers` or a zone rule — never an `.htaccess` edit and
never a Next config change.

## What the live site sends, and who owns it

| Header                                                         | Source                                         |
| -------------------------------------------------------------- | ---------------------------------------------- |
| `X-Content-Type-Options: nosniff`                              | Cloudflare Pages default (also on `pages.dev`) |
| `Referrer-Policy: strict-origin-when-cross-origin`             | Cloudflare Pages default                       |
| `Permissions-Policy: geolocation=(), microphone=(), camera=()` | **zone-level rule**                            |
| `Strict-Transport-Security: max-age=15552000`                  | **zone-level rule**                            |
| `X-Frame-Options: SAMEORIGIN`                                  | **zone-level rule**                            |
| `Content-Security-Policy-Report-Only`                          | **`public/_headers`** — see below              |
| _(no enforcing `Content-Security-Policy`)_                     | — deliberate                                   |

The three zone rules are absent from `hambabait.pages.dev` and present on the apex; that difference
is how you tell zone from project. That observation predates the CSP, so **re-check it after the next
deploy** and confirm exactly one `Content-Security-Policy-Report-Only` comes back. Two policies do
not merge — both apply, and the browser enforces the intersection.

`max-age=15552000` is 180 days. The usual hardening path is one year plus `includeSubDomains`, then
preload — but preload is close to irreversible, so it is an owner decision, not a default.

## Stop: a hash-based CSP is IMPOSSIBLE here

This is the correction that matters most on this page. Shipping script hashes **blanks every page.**

Next.js App Router serialises the React Flight payload into **bare inline `<script>` tags** carrying
no `id` and no nonce. The current `out/` holds **169 distinct such bodies across the 48 built HTML
files** (502 tags in total), and their content changes on every build.

CSP ignores `'unsafe-inline'` **the moment any hash or nonce appears in `script-src`.** So hashing the
two id-bearing snippets (`consent-default`, `gtm-init`) would silently drop `'unsafe-inline'`, block
all 169 Flight bodies, and render the entire site blank. A nonce is not an alternative either:
`output: "export"` has no server to mint one per request.

Any doc, checklist or earlier plan saying "hash the inline GTM snippet — it is stable, so hashing
works" is **wrong**. It was written before the Flight payload was counted. Do not act on it.

## What actually shipped: report-only, `'unsafe-inline'`, no hashes

`public/_headers` sets `Content-Security-Policy-Report-Only` on `/*`. Nothing is blocked; the browser
logs violations. The value is in the directives that are **free and real** even alongside
`'unsafe-inline'`:

| Directive                         | Why it earns its place                                      |
| --------------------------------- | ----------------------------------------------------------- |
| `base-uri 'none'`                 | kills `<base>` injection, which rewrites every relative URL |
| `object-src 'none'`               | no plugins, ever                                            |
| `frame-ancestors 'none'`          | clickjacking; the modern replacement for `X-Frame-Options`  |
| `form-action 'self'`              | an injected form cannot POST the lead fields off-site       |
| tight `connect-src` / `frame-src` | exfiltration channels are enumerated, not open              |
| `img-src` / `font-src` allowlists | `font-src 'self'` — `next/font` self-hosts the woff2 files  |

Rules for touching it:

1. **Report-only stays report-only** until real traffic has been watched for a while.
   `GTM-KWGGH438` is the shared IL fleet container; a tag added to it later can pull from an origin
   not on the list, and enforcing would break this site for someone else's change.
2. **There is no `report-uri`/`report-to` endpoint.** Violations surface in DevTools only — somebody
   has to open a browser and look. Never report the policy as "monitored".
3. **`'unsafe-eval'` is not granted and must not be.** A few Google tag types still want it; the
   honest fix is to change the tag. Granting it hands any XSS a code-execution primitive.
4. **Never add a hash or a nonce** — see the section above.
5. Origins were verified from `out/` and the source: `googletagmanager.com` (the `gtm.js` loader in
   `#gtm-init` and the `ns.html` noscript iframe) and `api.web3forms.com` (the lead form's fetch in
   `components/forms/LeadForm.tsx`). `imgquarry.com` is deliberately **not** listed: it appears only
   as a `preconnect` hint (CSP does not govern preconnect) and in `og:image`/`twitter:image`, which
   crawlers fetch rather than the browser. The `google-analytics`/`doubleclick` entries are the
   documented GA4 transports and are **not observed in this repo** — which is exactly why the header
   is report-only.
6. It applies to `/*` rather than an enumerated route list: a CSP delivered on a subresource response
   is inert, and enumerating the 47 built HTML routes would rot on the next page added.

`upgrade-insecure-requests` stays out — it is redundant behind HSTS.

## The Web3Forms access key

`site.config.json` contains `formAccessKey`. It is committed, and it ships in a public JS chunk —
verifiable by fetching the chunk from the live site.

**This is exposure as designed, not a leaked secret.** Web3Forms access keys are public by nature for
client-side forms. Do not "fix" it by moving it to an env var: `NEXT_PUBLIC_*` is equally public in a
static export, and there is no server to hide it behind.

What it _is_, is a **spammable identifier**:

- The honeypot (`company`) is checked in the **browser only**.
- Anyone can POST directly to `api.web3forms.com` with the harvested key and flood the inbox.
- Rate limiting and abuse control live on Web3Forms' side, outside this repo.

So: never describe the form as spam-protected. If abuse starts, the levers are Web3Forms' own
controls or rotating the key — both outside the codebase.

Related and load-bearing: `site.config.json` is imported by `lib/site-config.ts`, so webpack bundles
the **whole file** into the client JS. That is why `ops/sync-manifest.ps1` strips `_needsConfirmation`
on the way in and writes it to `docs/manifest-assumptions.md` instead. **Anything added to the
manifest is published to every visitor** — treat that file as public by construction.

## PII flow

Two paths carry a visitor's name, phone number and free-text problem description off-site:

1. **`api.web3forms.com`** — the normal submit path.
2. **`wa.me` (Meta)** — the fallback path, which interpolates the same fields into a URL.

Both are now named in `/מדיניות-פרטיות/`, along with Google (Tag Manager / Analytics) and cookie use.
**Any new data flow must land on that page in the same change** — a legal page that omits a processor
is a factual error, not a style preference.

Consent Mode v2 has shipped: `lib/consent.ts` emits a denied-by-default signal in `<head>` ahead of
the container, `ConsentBanner` persists the visitor's choice in `localStorage`, and `npm run qa:gate`
asserts the default precedes `gtm-init`. Two things follow:

- **Repo-side consent is only half the mechanism.** Tags inside `GTM-KWGGH438` must be configured to
  respect consent state, and that container is shared across the fleet — an owner action. A correct
  default with tags that ignore it still tracks everyone.
- **The lead form has a consent notice, not a consent checkbox.** The notice renders above the submit
  button, wired to it with `aria-describedby`. A required checkbox was considered and deliberately
  not added: it carries a real conversion cost and the call is the owner's. Record it as an open
  option; do not describe the current state as either finished or broken.

## Secret hygiene — currently clean

- `.gitignore` covers `.env` and `.env*.local`; no `.env` exists in the repo.
- **No credential is committed** other than the Web3Forms key, which is public by design.
- **`.env.example` is stale**: it still describes server-side lead routing via `public/lead.php` and
  defines `LEAD_EMAIL_TO`. That file was deleted when leads moved to Web3Forms; `LEAD_EMAIL_TO` is
  read by no code, and the real delivery address is whatever inbox Web3Forms has registered — not
  knowable from this repo. Fix the file rather than trusting it.

## Dependency risk

Small, current surface: Next 14.2 (installed 14.2.35), React 18.3, `lucide-react`, `clsx`,
`tailwind-merge`, and the vendored `@ishub/site-kit`. `framer-motion` was declared-but-imported-by-
nothing for a long stretch; it is **no longer in `package.json`**. If it reappears, ask what imports
it before accepting the weight.

The kit is a **vendored tarball** (`file:vendor/…tgz`) with its integrity hash pinned in the
lockfile. That is good for reproducibility, but updates bypass the registry entirely — the tarball's
provenance is the hub, so review kit changes at the hub, not here. Never edit anything under
`vendor/` or `node_modules/`.

## Audit pass

```bash
# what the live site actually sends — expect exactly ONE report-only CSP
curl -sI https://hambabait.co.il/ | grep -iE 'strict-transport|x-frame|content-security|permissions-policy|x-content-type|referrer'

# zone vs project: anything here and not below is added by the zone
curl -sI https://hambabait.pages.dev/ | grep -iE 'strict-transport|x-frame|content-security'

# the count that forbids hashes — re-run it before anyone proposes one
grep -roh '<script>' out --include=index.html | wc -l

# secrets
grep -rnE '(api[_-]?key|secret|password|token)' app components lib --include=*.ts --include=*.tsx

# _headers is present and its CSP is still report-only
grep -c 'Content-Security-Policy-Report-Only' public/_headers
```
