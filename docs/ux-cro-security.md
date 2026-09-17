# UX · CRO · security — חם בבית

> Navigation, the conversion funnel, form behaviour, and the real security boundary of a static
> export. Cited by `cro-ux-auditor`, `security-auditor`, `rtl-frontend-engineer`, `conversion-cro`,
> `web-security-headers`.
> Compiled 2026-08-31.

---

## 0. Who is on this page

A homeowner whose water heater is broken or leaking, **mid-fault and in a hurry**, usually on a phone,
sometimes standing in a utility room with one hand free and poor signal. They are not researching;
they are triaging.

Everything below follows from that. The visitor does not want to read the site — they want to reach
someone. **Our job is to remove every step between arriving and calling.**

Conversion goals, in strict order:

1. **Phone call** — `tel:` click
2. **WhatsApp** — click-to-chat
3. **Lead form** — asynchronous fallback

---

## 1. Navigation and information architecture

**The reach rule: every one of the 45 URLs is reachable. The header is not what makes that true.**

| Surface       | What it actually does                                                                                                                                             |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header        | 6 index links — `/שירותים/`, `/איזורי-שירות/`, `/מדריכים/`, `/מחירון/`, `/אודות/`, `/צור-קשר/`. **0 of the 6 service pages in one hop.** Phone CTA always visible |
| Footer        | **Orphan insurance, and the surface that satisfies the reach obligation** — all 6 services and all 18 locations, on every page                                    |
| Breadcrumbs   | `PageHeader` renders the visible trail **and** emits the matching `BreadcrumbList`.                                                                               |
| Service pages | Link all 18 cities (not a slice — cities 9–18 were once cut off from the silo).                                                                                   |
| City pages    | Link the 6 services, plus **2–4** genuine neighbouring cities (measured: 18 arrays, 50 links, none below 2).                                                      |
| Guides        | Link into the relevant service and city pages contextually, in the prose.                                                                                         |

> **A services submenu in the header was considered and deliberately deferred.** It is the obvious
> fix for the one-hop gap, and it is a **design decision for the owner**: a six-item dropdown on a
> nav whose job on mobile is to stay out of the way of the call button is not a free addition. The
> orphan-insurance obligation is met by the footer regardless, which is why this is a deferral and
> not a defect. Do not write it up as either "fixed" or "broken".

**Zero orphans is a hard requirement**, and it currently holds — via the footer. A page reachable
only from the sitemap is a page Google discovers slowly and users never see.

Anchor text is descriptive and Hebrew: `תיקון דוד שמש`, never `לחצו כאן`, never a bare URL.

---

## 2. The conversion funnel

### 2.1 The CTA inventory

**28 distinct `data-cta` values ship today, in 492 occurrences.** The naming convention is
**`placement-action`** — `hero-call`, `sticky-whatsapp`, `service-form-whatsapp`, `footer-email`.
Keep it: the analytics segmentation in
[data-tracking-infrastructure.md](data-tracking-infrastructure.md) depends on placement being
parseable from the value.

```bash
grep -rho 'data-cta="[^"]*"' out --include=index.html | sort -u   # 28 values
```

> ⚠️ **The inventory changed, and three values changed meaning. The GTM container must be updated —
> it has not been.** `header-call` used to be reused for **three different elements on every page**,
> which made its number uninterpretable; it is now split into `header-call` (the desktop bar button),
> `header-call-icon` (the compact icon link) and `mobile-menu-call` (inside the open panel). Four
> `*-form-submit` values were also added. The container's triggers match these strings literally, so
> until someone edits `GTM-KWGGH438` **the new values record nothing and the old aggregate is gone**.
> That is an **owner action**, and it is the single easiest way to silently zero a metric.

### 2.2 The rules

1. **A call action is above the fold on every page.** No exceptions, no scroll required.
2. **The sticky mobile bar is permanent** — call + WhatsApp, `lg:hidden`, with a layout spacer so it
   never covers footer content and `pb-[env(safe-area-inset-bottom)]` for notched devices.
3. **Every CTA carries a `data-cta`.** An untagged CTA is invisible to measurement, which means it
   can never be proven to work or removed for not working.
4. **Never interrupt the funnel.** No entry interstitials, no exit-intent popups, no chat widget that
   covers the call button. Google treats intrusive interstitials as a ranking problem, and on this
   site they would physically obstruct goal #1.
5. **The phone number is text, never an image**, and always in a `dir="ltr"` island so RTL does not
   scramble it.

### 2.3 The form

`components/forms/LeadForm.tsx` — the third goal, and the one that must never fail silently.

**What it does correctly today:**

- **Two required fields only** — name and phone. Every additional required field costs leads.
- **Per-field validation** with Hebrew messages, `aria-invalid`, `aria-describedby`, and focus moved
  to the first offending field.
- **Israeli phone validation** that accepts mobile, landline and the `+972` international form.
- **`inputMode="tel"`, `autoComplete`, `type="tel"`** — the mobile keyboard is correct on first tap.
- **Failure is never silent.** A delivery failure renders an explicit error card offering a call and
  a WhatsApp hand-off **the user clicks themselves**. An automatic `window.open()` after an `await`
  is outside the user-gesture window, gets eaten by popup blockers, and used to lose the lead with no
  feedback at all. Do not reintroduce it.
- **Honeypot** (`company`) — browser-only, and see §4. A caught submission now fires
  `lead_submit_blocked` with `reason: "honeypot"`, so bot pressure becomes measurable instead of
  invisible. **The event records nothing until a tag and trigger exist in `GTM-KWGGH438`** — an
  owner action.
- **Confirmed sends only** fire `lead_submit`, then route to `/תודה/` for a destination-URL
  conversion. The dev simulation deliberately fires nothing.
- **A consent notice renders above the submit button**, wired to it with `aria-describedby`, so a
  screen-reader user hears what happens to their details _before_ the control that sends them rather
  than after.

**What is still open, stated as the trade it is:** there is **no required consent checkbox**. The
notice discloses; it does not capture consent. Adding a checkbox costs one more required interaction
in front of goal #3 on a form whose entire design is two required fields, and that cost is real —
so it is an **owner decision**, recorded as an open option in
[implementation-roadmap.md](implementation-roadmap.md) S1-3, not a repo-side oversight to be quietly
closed. Do not sell it as a free win, and do not pretend the notice already is one.

**Never add:** multi-step wizards, required email, required address, CAPTCHA before first submit,
or any field the business will not actually use.

---

## 3. Accessibility as conversion

Not a separate concern — a person who cannot operate the form cannot become a lead. Full rules in
[accessibility-and-i18n.md](accessibility-and-i18n.md). The conversion-critical subset:

- Tap targets ≥ 44 px on **every primary CTA** (`min-h-11` on buttons, full-height halves on the
  sticky bar). The exception is the footer's inline text CTAs (`footer-call`, `footer-email`) and the
  dense footer link lists, which sit inside a line of text and are smaller. That is a deliberate
  density trade, not a WCAG 2.1 AA failure — 2.1 AA has no target-size criterion at all. See
  [accessibility-and-i18n.md](accessibility-and-i18n.md) §5.
- Visible focus on every interactive element — shipped globally in `app/globals.css`, at full
  strength (the rings were once dimmed and are not any more).
- Labels tied to inputs by `for`/`id`; placeholders are never labels.
- Errors announced, not just coloured — into an **always-mounted** `role="alert"` region, so the
  message is spoken rather than swallowed by an element that appeared at the same instant.
- Colour never the sole carrier of meaning.

---

## 4. Security — the real boundary

> **This repo controls almost no response header, and pretending otherwise is the main way people get
> this wrong.**

`output: "export"` forbids `headers()`, `redirects()`, `rewrites()`, middleware and API routes. There
is no server. The security surface is therefore split three ways:

| Layer               | Owns                                                                       | Who changes it        |
| ------------------- | -------------------------------------------------------------------------- | --------------------- |
| **This repo**       | `public/_headers` — honoured by Cloudflare Pages only                      | Us                    |
| **Cloudflare zone** | HSTS, `X-Frame-Options`, `Permissions-Policy`, cache TTL, AI-crawler rules | **Owner / Sys Admin** |
| **Third parties**   | Web3Forms, GTM/GA4, WhatsApp/Meta                                          | Their consoles        |

`public/_headers` sets **two** things: immutable caching for `/_next/static/*`, and the report-only
CSP in §4.1. It deliberately sets **no other security header** — HSTS, `X-Frame-Options` and
`Permissions-Policy` are present on the apex and absent on `hambabait.pages.dev`, which is the
signature of zone-level rules. Duplicating them here would create two sources of truth for one
header. CSP is not among the zone's headers today, which is why adding it here is safe — **confirm
that after the next deploy** rather than trusting this sentence.

**Verify live, never infer:**

```bash
curl -sSI https://hambabait.co.il/ | grep -iE 'strict-transport|x-frame|x-content-type|referrer-policy|permissions-policy|content-security'
```

### 4.1 CSP — what shipped, and why hashes are impossible here

**A report-only CSP ships today** in `public/_headers`, applied to `/*`:

```
Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' 'unsafe-inline'
https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: …;
font-src 'self'; connect-src 'self' https://api.web3forms.com …; frame-src
https://www.googletagmanager.com; form-action 'self'; base-uri 'none'; object-src 'none';
frame-ancestors 'none'
```

> **The hash-based CSP that every previous version of this section recommended cannot be built on
> this site.** That is not a difficulty rating; it is an impossibility, and the reason is worth
> knowing before anyone proposes it again.

Next.js App Router serialises the React Flight payload into **bare inline `<script>` tags**. The
current `out/` carries **169 distinct such bodies across the 48 built HTML files** (502 tags in
total), and their content changes on every build. The CSP spec is unforgiving here: **the moment any
hash or nonce appears in `script-src`, `'unsafe-inline'` is ignored entirely.** So listing the SHA-256
of the two id-bearing snippets we control — `consent-default` and `gtm-init` — would block all 169
Flight scripts and **render every page blank**. Hashing all 171 would produce a header that is stale
the next time anyone runs `npm run build`. And a nonce is not available either: `output: "export"`
has no server to mint one per request.

What shipped instead banks the protections that are **free and real** even with `'unsafe-inline'`
present, and they are not nothing: `base-uri 'none'` (an injected `<base>` cannot re-point every
relative URL on the page), `object-src 'none'`, `frame-ancestors 'none'` (clickjacking, independently
of the zone's `X-Frame-Options`), `form-action 'self'` (an injected form cannot POST the lead
elsewhere), and tight `connect-src` / `frame-src` / `img-src` / `font-src` allowlists that bound
where an injected script could exfiltrate to.

Three things to know before touching it:

1. **`'unsafe-eval'` is not granted.** A few Google tag types want it. If a container change starts
   throwing eval violations, **change the tag** — granting `'unsafe-eval'` hands any XSS a
   code-execution primitive, which is most of what the policy was protecting.
2. **There is no `report-uri`/`report-to` endpoint.** Violations surface in DevTools only, which
   means someone has to open a browser and look. Report-only with nobody reading the reports is
   theatre.
3. **Enforcing is a separate decision, not a follow-up chore.** The container is the shared IL fleet
   container `GTM-KWGGH438`; a tag added to it for another site can pull from an origin this
   allowlist does not carry, and under an enforcing policy that breaks tracking on this one.

### 4.2 The form's threat model

- **The Web3Forms access key is public by design.** It is in `site.config.json`, it ships in the JS
  bundle, and moving it to `NEXT_PUBLIC_*` changes nothing. **It is not a leak — do not "fix" it.**
- **It _is_ spammable.** Anyone can POST to the endpoint with that key. The honeypot is browser-only
  and stops naive bots, nothing more. Real rate limiting lives in the Web3Forms dashboard.
- **Delivery is unverified from here.** Which mailbox the key is registered against is knowable only
  in that dashboard. A lead can "succeed" and reach nobody — this is
  **[needs confirmation]** in [optimization-backlog.md](optimization-backlog.md).
- **PII leaves the browser to two third parties**: name/phone/message to Web3Forms, and — on a
  WhatsApp click — the visitor's identity to Meta. Both are disclosed in `/מדיניות-פרטיות/`. **Any
  new destination must land in that page in the same change.**

### 4.3 Standing rules

- **Never put PII in `dataLayer`.** No name, no phone, no message text.
- **No secrets in the repo.** `.env.example` documents shape only; the only key here is public by
  design.
- **Escape/encode anything user-supplied** that is ever rendered. Today nothing is — keep it that
  way.
- **Deploys are a production mutation.** Always ask before running `ops/deploy-site.ps1 -Confirm`.
  A green CI run deploys nothing.
- **Dependencies need a reason that survives "can the platform already do this?"** Every added script
  is added attack surface and added bytes.

---

## 5. Acceptance checks

- [ ] A call CTA is above the fold on every page type.
- [ ] Sticky bar visible on mobile; never overlaps the footer; clears the consent banner.
- [ ] Every CTA has a unique, placement-prefixed `data-cta` — and **if any value changed, the
      GTM container was updated in the same change**.
- [ ] Form: submit with empty fields → per-field Hebrew errors, focus on the first.
- [ ] Form: submit with a malformed phone → phone error only.
- [ ] Form: simulate a delivery failure → error card with call + WhatsApp, no popup, no silent loss.
- [ ] Zero orphans across all 45 URLs — the footer is what guarantees this, not the header.
- [ ] `npm run qa:gate` green (28 assertions), alongside lint / typecheck / format:check / build.
- [ ] Live headers checked after every deploy (§4), including **exactly one**
      `Content-Security-Policy-Report-Only` — two policies do not merge, they intersect.
- [ ] `/מדיניות-פרטיות/` matches the actual set of third parties in the code.
