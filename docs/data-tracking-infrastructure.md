# Data and tracking infrastructure — חם בבית

> How measurement is plumbed, who owns each half, and the rules that keep it lightweight, legal and
> honest. **KPIs, targets and the baseline live in [measurement.md](measurement.md)** — this file is
> the plumbing, not the reporting.
>
> Cited by `analytics-reporter`, `tracking-analytics`, `consent-mode`, `search-console-ops`.
> Compiled 2026-08-31.

---

## 0. The stack, end to end

```
                       ┌──────────────────────────────────────────┐
   page load  ──────►  │ 1. Consent Mode v2 default  (<head>)     │  lib/consent.ts
                       │    everything DENIED, wait_for_update    │  ← MUST run first
                       └───────────────────┬──────────────────────┘
                                           ▼
                       ┌──────────────────────────────────────────┐
                       │ 2. GTM container  GTM-KWGGH438  (<body>) │  @ishub/site-kit/analytics
                       │    SHARED across the Israeli fleet       │
                       └───────────────────┬──────────────────────┘
                                           ▼
                       ┌──────────────────────────────────────────┐
                       │ 3. GA4, routed inside the container by   │  ← container-side, owner-owned
                       │    hostname RegEx table                  │
                       └──────────────────────────────────────────┘

   lead form  ──────►  api.web3forms.com  ──►  business inbox        (PII leaves the browser)
   WhatsApp   ──────►  wa.me / Meta                                  (identity leaves on click)
   consent    ──────►  localStorage 'hb-consent'                     (per-browser, no server)
```

---

## 1. Ownership — the split that causes most of the confusion

| Layer                          | Contains                                                                         | Changed by                          |
| ------------------------------ | -------------------------------------------------------------------------------- | ----------------------------------- |
| **This repo**                  | Consent default, container loader, `data-cta` tags, `trackEvent` calls, `/תודה/` | Us                                  |
| **GTM container GTM-KWGGH438** | Tags, triggers, variables, GA4 routing, consent settings **on the tags**         | **Owner** — shared across the fleet |
| **GA4 property**               | Conversions, audiences, retention                                                | **Owner**                           |
| **Search Console**             | Verification, sitemap, coverage                                                  | **Owner**                           |
| **Cloudflare zone**            | Headers, cache, AI-crawler rules                                                 | **Owner / Sys Admin**               |

> **Roughly half of "set up analytics" is not in this repo.** A correct repo-side implementation with
> a container whose tags ignore consent state still tracks everyone. Say which half a
> recommendation lives in, every time.

---

## 2. Consent Mode v2

**Shipped 2026-08-26.** `lib/consent.ts` + `components/layout/ConsentBanner.tsx`.

### The rule that makes or breaks it

**The consent default must execute before the container loads.** Consent Mode works by setting a
default state that tags read when they fire. If the container loads first, tags fire unconsented and
the default arrives too late — and that is the worst possible failure, because **the page looks
compliant while behaving exactly as it did before.**

In `app/layout.tsx` the container lives in `<body>` and the default snippet in `<head>`. Scripts
execute in document order, so `<head>` is unambiguous. **Never move the default below the loader.**

### What ships

- `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage` → **`denied`**
- `functionality_storage`, `security_storage` → `granted` (needed for the site to work; not tracking)
- `wait_for_update: 500` — the window for a stored choice to upgrade before tags give up
- A returning visitor's stored `granted` re-grants immediately, so they are neither re-asked nor
  needlessly downgraded for 500 ms
- The banner renders **after mount** (reading `localStorage` during render would break hydration),
  `fixed` so it costs no CLS, and positioned above the sticky CTA bar

### Still open

- **Container-side consent settings are the owner's** — the tags inside `GTM-KWGGH438` must be
  configured to respect consent. Unverified from here, and a correct repo-side default with
  consent-blind tags still tracks everyone.
- **The lead form discloses but does not capture consent.** The notice now renders **above** the
  submit button and is wired to it with `aria-describedby`, so it is read before the control that
  sends the data rather than after. There is deliberately **no required checkbox**: it costs one more
  required interaction in front of the site's third conversion goal, which is a real trade and an
  **owner decision**, recorded as an open option rather than quietly closed.

> **Expect measured analytics to fall once consent is live.** That drop is consent working. Do not
> "fix" it by weakening the default.

---

## 3. The dataLayer contract

### 3.1 Events

| Event                 | Fires when                                              | Source                          |
| --------------------- | ------------------------------------------------------- | ------------------------------- |
| `lead_submit`         | Web3Forms confirms a successful send                    | `LeadForm.tsx` via `trackEvent` |
| `lead_submit_failed`  | Delivery failed, or no access key in prod               | `LeadForm.tsx`, with a `reason` |
| `lead_submit_blocked` | The honeypot caught a submission (`reason: "honeypot"`) | `LeadForm.tsx` via `trackEvent` |
| _(pageview)_ `/תודה/` | Client-side route change after a confirmed send         | `router.push("/תודה/")`         |

> **`lead_submit_blocked` is new, and it is inert.** Nothing in `GTM-KWGGH438` listens for it yet, so
> it currently records nothing — adding a tag and trigger is an **owner action**. It is worth doing:
> it turns bot pressure on a public-key form endpoint from invisible into a number, and a sudden rise
> in it is the earliest signal that the Web3Forms key is being hammered. Keep it **out** of any
> conversion definition.

> ⚠️ **Double-counting risk.** `lead_submit` **and** the `/תודה/` pageview both mark the same lead.
> If the container counts both as conversions, every lead is counted twice. This is checkable only in
> the GTM/GA4 consoles and is logged as **[needs confirmation]** in
> [optimization-backlog.md](optimization-backlog.md). **Pick one as the conversion.**

### 3.2 CTA tagging

**27 distinct `data-cta` values ship, in 492 occurrences.** The convention is **`placement-action`**:

```
contact-call · contact-email · contact-form-submit · contact-form-whatsapp · contact-whatsapp
finalcta-call · finalcta-whatsapp · footer-call · footer-email · header-call · header-call-icon
hero-call · hero-form-submit · hero-form-whatsapp · hero-whatsapp · location-form-submit
location-form-whatsapp · mobile-menu-call · notfound-call · pricing-quote · service-call
service-form-submit · service-form-whatsapp · service-whatsapp · sticky-call · sticky-whatsapp
thanks-call
```

> ## ⚠️ The container is behind the repo. Until it is updated, some of these record nothing.
>
> This inventory grew from 21 to 27 **and three values changed meaning**, which is the more dangerous
> half:
>
> - **`header-call` used to tag three different elements on every page** — the desktop bar button,
>   the compact icon link and the link inside the mobile panel. Its number was an uninterpretable
>   sum. It is now split into **`header-call`**, **`header-call-icon`** and **`mobile-menu-call`**.
> - Four submit-side values were added: **`contact-form-submit`**, **`hero-form-submit`**,
>   **`location-form-submit`**, **`service-form-submit`**.
>
> The triggers inside `GTM-KWGGH438` match these strings **literally**. Until someone edits the
> container, the six new values fire into nothing and the old `header-call` aggregate has silently
> lost two of its three sources. **This is an owner action**, it is invisible in every dashboard
> until someone goes looking, and it is exactly the failure mode rule 3 below exists to prevent.
> The container is **shared across the Israeli fleet** — changes there are not this site's alone.

Rules:

1. **Every CTA gets one.** An untagged CTA cannot be proven to work, and cannot be removed for not
   working.
2. **Placement first, action second.** The container splits on the hyphen to segment by placement.
3. **Never rename, split or add one without updating the container in the same piece of work** — a
   rename silently zeroes a metric, and a split silently halves one while looking like a decline.
4. Verify what actually ships, rather than what the source suggests:

```bash
grep -rho 'data-cta="[^"]*"' out --include=index.html | sort -u
```

### 3.3 The PII rule

> **Never put PII in `dataLayer`.** No name, no phone number, no message text, no email. Not hashed,
> not truncated.

`lead_submit` carries `{ form: "lead" }` and nothing else. That is deliberate and it is enough — the
lead content arrives by email, which is the appropriate channel for it.

---

## 4. Keeping it lightweight

The performance budget in [performance-guidelines.md](performance-guidelines.md) governs; the
tracking-specific rules:

- **One tag manager. One analytics destination.** A second is a rewrite, not an addition.
- **No tag that blocks rendering.** The container loads from `<body>`; the only thing ahead of it is
  the tiny inline consent default.
- **No session-recording or heatmap tool** without an explicit budget decision — they are among the
  heaviest scripts available and they record PII by default.
- **Preconnect is finite.** One ships today (`mediaHost`). Each unused one is waste.
- **Consent-denied is the fast path** and will be the majority state. Do not design as though every
  visitor loads every tag.

### 4.1 Genuinely lighter alternatives, if the owner wants them

| Option                       | Cost                                   | Note                                                                                                                 |
| ---------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Cloudflare Web Analytics** | ~zero config, small beacon, no cookies | Pairs well with a static site on Pages; **owner action** in the zone. Complements GA4, does not replace conversions. |
| **Server-side GTM**          | Real infrastructure, real cost         | Solves ad-blocker loss and third-party weight. **Owner decision**, and out of scope for this repo.                   |
| **Log-based analysis**       | Free                                   | Cloudflare logs; no client JS at all. Coarse, but honest.                                                            |

Do not implement any of these unilaterally — each adds a processor and a privacy-policy obligation.

---

## 5. Search Console

`app/layout.tsx` emits a `verification` block, **guarded on presence** — the manifest field existed
for months with no block consuming it, so setting it in the roster silently did nothing.

**`analytics.googleSiteVerification` stays `null` on purpose** — but ⚠️ **ownership is not verified.**
The chosen **method** is **DNS TXT on the Cloudflare zone**, as a **Domain property** — over the meta
tag because it survives a re-deploy and because three hosts serve byte-identical copies of all 45
pages (`hambabait.co.il`, `www.hambabait.co.il` at **200, not a 301**, and `hambabait.pages.dev`); a
URL-prefix property would report on only one. That decision stands and the field should not be filled
in. **What was never done is adding the record.** `nslookup -type=TXT hambabait.co.il 8.8.8.8`
(2026-09-06) returns exactly one TXT record, `v=spf1 include:_spf.mx.cloudflare.net ~all`. A Domain
property can be verified _only_ by DNS TXT, so ownership rests on neither mechanism today. **Open
owner action — a zone change — and it blocks the measurement baseline.**

The sitemap carries 45 percent-escaped `<loc>` entries, with `<lastmod>` on the 12 guides only.
**It has not been submitted** — there is no property to submit it to yet. Once the TXT record above is
live, **submit it once** in the Domain property — submissions do not carry across properties, and Google
removed the ping endpoint in 2023, so there is no programmatic path and no reason to resubmit per
deploy. Then triage coverage **split by page type** — aggregate coverage hides the location silo.

---

## 6. CRM integration

**Today there is no CRM.** A lead is an email from Web3Forms to the business inbox.

Any future integration must satisfy all of:

1. **No secret in the client.** A static export ships every key it holds to every visitor. An
   integration needing a private key needs a server — which means a Pages Function and an owner
   decision, not a repo change.
2. **Delivery must remain non-silent.** The current failure path (explicit error card, call and
   WhatsApp hand-off the user clicks) is the floor, not the ceiling.
3. **No new blocking request** in the submit path. A CRM POST that delays or blocks the Web3Forms
   send trades leads for tidiness.
4. **It lands in `/מדיניות-פרטיות/` in the same change.** A new processor is a disclosure obligation.
5. **Consent applies** if it is marketing rather than fulfilment.
6. **No PII into `dataLayer`** as a side effect.

**The pragmatic option, if volume grows:** keep Web3Forms as the delivery path and let the CRM ingest
the mailbox. No client-side key, no new failure mode, no new script.

---

## 7. Verification protocol

Run these; do not infer any of them from the source.

```bash
# 1. The container id actually resolves. Two fabricated ids once cost this fleet 18 days
#    of zero analytics across every site. ALWAYS run this when an id changes.
curl -sS -o /dev/null -w '%{http_code}\n' "https://www.googletagmanager.com/gtm.js?id=GTM-KWGGH438"   # expect 200

# 2. The consent default precedes the container in the shipped HTML.
#    `npm run qa:gate` asserts this ordering on every run, so this is the manual confirmation
#    rather than the safety net.
grep -o 'consent-default\|gtm-init' out/index.html          # consent-default must appear first

# 3. The CTA inventory that actually ships.
grep -rho 'data-cta="[^"]*"' out --include=index.html | sort -u | wc -l   # 27 (492 occurrences)

# 4. Live robots policy (the zone can override what app/robots.ts declares).
curl -sS -H 'Cache-Control: no-cache' "https://hambabait.co.il/robots.txt?cb=$RANDOM"
```

Console-side, and therefore the owner's: Tag Assistant with consent denied **and** granted, GA4
DebugView for `lead_submit`, and confirmation that only **one** of the two lead signals is a
conversion.

> **The four-week rule.** No ranking or conversion-rate change is attributed to a deploy inside four
> weeks. Anything read earlier is noise, and a baseline recorded after the change is not a baseline.
