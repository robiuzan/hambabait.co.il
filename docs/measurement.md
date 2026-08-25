# Measurement — חם בבית

> KPIs, the baseline, the event inventory and the reporting cadence. **Without a baseline recorded
> before a change ships, no future claim of improvement is falsifiable.**
>
> Cited by `analytics-reporter`, `tracking-analytics`, `search-console-ops`.
> Compiled 2026-08-25.

---

## 0. Baseline — NOT YET RECORDED

**Status: ❌ no baseline exists.** Search Console and GA4 both require console access this repo does
not have.

**This must be captured before the Phase 2 deploy.** Record the date measured and the source for every
figure. A baseline taken after the change is not a baseline.

| Metric                       | Value  | Date | Source                        |
| ---------------------------- | ------ | ---- | ----------------------------- |
| Impressions — all            |        |      | GSC                           |
| Impressions — home           |        |      | GSC                           |
| Impressions — `/services/*`  |        |      | GSC                           |
| Impressions — `/locations/*` |        |      | GSC                           |
| Clicks — all                 |        |      | GSC                           |
| Avg position — all           |        |      | GSC                           |
| Indexed / submitted          | ? / 32 |      | GSC Coverage                  |
| Calls (`*-call`)             |        |      | GA4                           |
| WhatsApp (`*-whatsapp`)      |        |      | GA4                           |
| `lead_submit`                |        |      | GA4                           |
| `/תודה/` pageviews           |        |      | GA4                           |
| LCP / CLS / INP              |        |      | CrUX or lab — **label which** |

**Split by page type.** Aggregate numbers hide the thing that matters: the location silo is the
weakest surface, and averaging it with the homepage conceals that.

---

## 1. The verified technical baseline

Unlike the traffic figures, this is measurable from the repo today. **Verified 2026-08-25:**

```
built pages                34   (32 indexable + 404 + /תודה/)
pages with JSON-LD         32   (only 404 and /תודה/ bare — correct)
canonicals                 32
sitemap <loc>              32
doubled brand titles        0
banned schema props         0   (aggregateRating|review|ratingValue|reviewCount|foundingDate|warrantyPromise)
data-cta identifiers       17
images in public/           0
```

Re-assert these on every deploy via `qa-build-gate`. They are the regression net.

---

## 2. Conversion event inventory

Goal order: **(1) phone call, (2) WhatsApp, (3) lead form.**

### `data-cta` — 17 identifiers

`header-call` (×3) · `hero-call` · `hero-whatsapp` · `sticky-call` · `sticky-whatsapp` ·
`service-call` · `service-whatsapp` · `contact-call` · `contact-whatsapp` · `contact-email` ·
`footer-call` · `footer-email` · `finalcta-call` · `finalcta-whatsapp` · `pricing-quote` ·
`notfound-call` · `thanks-call`

Naming convention: `<placement>-<action>`. **A CTA with no `data-cta` is invisible to the container.**
Audit new pages for this.

```bash
grep -rho 'data-cta="[^"]*"' out --include=index.html | sort | uniq -c | sort -rn
```

### `trackEvent` calls

| Event                | Fires when                                    | Payload                            |
| -------------------- | --------------------------------------------- | ---------------------------------- |
| `lead_submit`        | Web3Forms confirms `res.ok && result.success` | `{form: "lead"}`                   |
| `lead_submit_failed` | delivery failure or empty key                 | `{reason: "no_key" \| "delivery"}` |

### ⚠️ The double-count risk

On a confirmed send the form does **two** things: fires `lead_submit`, then `router.push("/תודה/")`.

**That is one conversion with two signals.** If the container counts both the dataLayer event **and**
the `/תודה/` pageview as conversions, every lead is counted twice.

**[needs confirmation]** — which of the two is configured as the conversion. This is a container
question and cannot be answered from the repo. Do not assume it is correct.

---

## 3. Container

`GTM-KWGGH438` — **shared across the Israeli fleet**, so container changes affect other sites. GA4
routing happens inside the container by hostname; there is no GA4 measurement id in the manifest, and
that absence is correct.

### The standing assertion

```bash
curl -s -o /dev/null -w "%{http_code}" "https://www.googletagmanager.com/gtm.js?id=GTM-KWGGH438"
# must be 200
```

**A GTM snippet in the HTML proves nothing** — it proves a string is in a file. Two fabricated
container ids once cost the fleet 18 days of zero analytics across every site. Assert the container
loads whenever the id changes.

---

## 4. Known measurement gaps

| Gap                                           | Consequence                                                                                                                                 |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **No consent gate**                           | analytics fire before any consent; a Consent Mode rollout will _reduce_ measured traffic, and that drop must not be misread as a regression |
| **`googleSiteVerification` wired to nothing** | `app/layout.tsx` has no `verification` block, so setting the roster value silently does nothing                                             |
| **[needs confirmation]** GA4 routing          | unverifiable without console access                                                                                                         |
| **[needs confirmation]** Web3Forms inbox      | a lead can "succeed" and reach nobody                                                                                                       |

---

## 5. Cadence and the two rules

**Baseline now → monthly thereafter.**

### The four-week rule

> **Never attribute a ranking change to a deploy less than four weeks after it.**

Content changes take weeks to move rankings and daily position data is mostly noise. Asked "did it
work" too soon, the correct answer is _"too early — here is the date to look"_, not a number.

### The measurement-honesty rule

> **Never quote a metric you did not measure.**

No keyword tool, rank tracker or analytics API is wired into this repo. Every number in a report cites
its source and its date, or it is marked **[needs confirmation]**. Ranked qualitative judgement is
worth more than a fabricated figure that gets planned against for six months.

### PII

**Never put PII in `dataLayer`** — no name, phone, email or message content. The lead form has all four
in scope and is one careless edit away from leaking them. Audit `trackEvent` call sites every pass.

Note the WhatsApp fallback builds a `wa.me` URL containing name, phone and message, handing PII to
Meta. It is user-initiated, which is the defensible design, but it belongs in the privacy disclosure.

---

## 6. What "better" looks like

Ordered by what actually matters to this business:

1. **More calls and WhatsApp taps**, especially on mobile. The reader is mid-fault and on a phone.
2. **Location pages earning non-brand impressions.** Today they are near-duplicates; if depth works,
   this is where it shows first.
3. **Informational queries arriving at all** — currently near zero, because no page serves them.
4. **Indexed count reaching 32/32.**
5. Rankings — last, because they are the lagging indicator of everything above.
