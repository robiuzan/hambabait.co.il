# Measurement — חם בבית

> KPIs, the baseline, the event inventory and the reporting cadence. **Without a baseline recorded
> before a change ships, no future claim of improvement is falsifiable.**
>
> Cited by `analytics-reporter`, `tracking-analytics`, `search-console-ops`.
> Re-baselined 2026-08-31.

---

## 0. Baseline — NOT YET RECORDED

**Status: ❌ no baseline exists.** Search Console and GA4 both require console access this repo does
not have. Nothing below has been filled in, and nothing below may be filled in from memory, from an
estimate, or from a number that appeared in another document.

**This must be captured before the next production deploy.** Record the date measured and the source
for every figure. A baseline taken after the change is not a baseline.

| Metric                       | Value  | Date | Source                        |
| ---------------------------- | ------ | ---- | ----------------------------- |
| Impressions — all            |        |      | GSC                           |
| Impressions — home           |        |      | GSC                           |
| Impressions — `/services/*`  |        |      | GSC                           |
| Impressions — `/locations/*` |        |      | GSC                           |
| Impressions — `/מדריכים/*`   |        |      | GSC                           |
| Clicks — all                 |        |      | GSC                           |
| Avg position — all           |        |      | GSC                           |
| Indexed / submitted          | ? / 45 |      | GSC Coverage                  |
| Calls (`*-call`)             |        |      | GA4                           |
| WhatsApp (`*-whatsapp`)      |        |      | GA4                           |
| `lead_submit`                |        |      | GA4                           |
| `/תודה/` pageviews           |        |      | GA4                           |
| LCP / CLS / INP              |        |      | CrUX or lab — **label which** |

**Split by page type.** Aggregate numbers hide the thing that matters. There are now four surfaces
with genuinely different jobs — home, the 6 service pages, the 18 location pages and the 12 guides —
and averaging the guides (informational, zero commercial intent) with the location pages
(commercial + local) conceals both.

The submitted denominator is **45**, not 32. The sitemap carries 45 `<loc>` entries; `/תודה/` is
deliberately excluded as a `noindex` conversion destination and the 404 is not a route.

**Read `Indexed / submitted` in the Domain property** — once one exists. ⚠️ **Ownership is not yet
verified:** the DNS TXT record has never been added (checked 2026-09-06), so there is no property to
read and this section is blocked until there is. DNS TXT remains the right method because only a
Domain property covers all three hosts that serve the site (`hambabait.co.il`, `www` — currently 200
rather than a redirect). A URL-prefix property reports on only one of them and will understate
coverage. Note `hambabait.pages.dev` is a **separate domain** and is _not_ covered by a
`hambabait.co.il` Domain property; it would need its own, which is not worth doing.

---

## 1. The verified technical baseline

Unlike the traffic figures, this is measurable from the repo today. **Verified 2026-08-31 against a
fresh `out/`:**

```
built HTML files           48   (47 index.html + out/404.html)
built pages                47   (45 indexable + 404 + /תודה/)
pages with JSON-LD         45   (only 404 and /תודה/ bare — correct)
canonicals                 45   (exactly one per indexable page)
sitemap <loc>              45   (45 unique)
doubled brand titles        0
banned schema props         0   (aggregateRating|reviewCount|ratingValue|foundingDate|warrantyPromise)
banned RTL utilities        0   (pl-|pr-|ml-|mr-|left-|right-|text-left|text-right)
data-cta identifiers       27   (492 occurrences)
raster images (<img>)       0   (public/ holds only _headers and llms.txt)
inline SVG diagrams         4   (on 4 of the 12 guides)
llms.txt coverage       45/45
```

Weight, same build: `out/_next/static` **1.1 MB**, 30 JS files at **761,779 raw bytes**, one CSS file
at **40,451 B raw / 8,723 B gzip**, `out/index.html` at **184,799 B raw / 25,205 B gzip**. Largest
chunk **172,834 B raw / 53,531 B gzip**. Shared First Load JS **87.5 kB**.

**`npm run qa:gate` re-asserts the structural half of this on every release** —
`scripts/qa-gate.mjs`, 28 assertions over `out/`, currently 28 passed / 0 failed. It runs alongside
`lint`, `typecheck`, `format:check` and `build`, and it is the regression net. Among what it checks:
one canonical per page, canonical ↔ sitemap byte parity, exactly one `<h1>`, unique titles and
descriptions, the `WebSite` node on the homepage, the Consent Mode default preceding the GTM
container, no priced `Offer`, and no `potentialAction`/`SearchAction`.

---

## 2. Conversion event inventory

Goal order: **(1) phone call, (2) WhatsApp, (3) lead form.**

### `data-cta` — 27 identifiers, 492 occurrences

```
contact-call · contact-email · contact-form-submit · contact-form-whatsapp · contact-whatsapp
finalcta-call · finalcta-whatsapp · footer-call · footer-email
header-call · header-call-icon · hero-call · hero-form-submit · hero-form-whatsapp · hero-whatsapp
location-form-submit · location-form-whatsapp · mobile-menu-call · notfound-call · pricing-quote
service-call · service-form-submit · service-form-whatsapp · service-whatsapp
sticky-call · sticky-whatsapp · thanks-call
```

Naming convention: `<placement>-<action>`. **A CTA with no `data-cta` is invisible to the
container.** Audit new pages for this.

```bash
grep -rho 'data-cta="[^"]*"' out --include=index.html | sort | uniq -c | sort -rn
```

### ⛔ The container is now behind the code — OWNER ACTION

The inventory grew from 17 to 27, and **three of the values changed meaning**. GTM triggers match
these strings literally, so until container `GTM-KWGGH438` is updated, the new identifiers record
**nothing** and one existing identifier now records **less than it used to**.

| Identifier         | Before                                                       | Now                                                     |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------------------- |
| `header-call`      | reused for **three** different header elements on every page | the desktop header-bar call button **only**             |
| `header-call-icon` | did not exist — folded into `header-call`                    | the compact icon call link                              |
| `mobile-menu-call` | did not exist — folded into `header-call`                    | the call action inside the open mobile menu panel       |
| `*-form-submit` ×4 | did not exist                                                | `hero-`, `service-`, `location-`, `contact-form-submit` |

The split is the right change — one identifier covering three elements collapsed three different
placements into one undifferentiated count, so nobody could tell a desktop header call from a
mobile-menu call. But **the reporting consequence is real and it is live right now**: a trigger
still matching `header-call` no longer sees the icon link or the mobile menu, which is where phone
calls actually come from on this site. Expect header-attributed calls to fall the moment this ships,
and **do not read that fall as a behaviour change.**

**Accept:** the container has triggers covering all 27 identifiers, and a spot check confirms a tap
on the mobile-menu call button reaches GA4.

### `trackEvent` calls

| Event                 | Fires when                                       | Payload                                          |
| --------------------- | ------------------------------------------------ | ------------------------------------------------ |
| `lead_submit`         | Web3Forms confirms `res.ok && result.success`    | `{form: "lead"}`                                 |
| `lead_submit_failed`  | delivery failure or empty access key             | `{form: "lead", reason: "no_key" \| "delivery"}` |
| `lead_submit_blocked` | the browser-only honeypot catches the submission | `{form: "lead", reason: "honeypot"}`             |

`lead_submit_blocked` is **new and currently inert** — it pushes to `dataLayer`, and container
`GTM-KWGGH438` has no tag or trigger consuming it, so nothing is recorded. Standing one up is an
owner action. It is worth doing: it is the only signal that distinguishes "the form is quiet" from
"the form is being hit by bots", and reading a bot-suppressed period as a conversion drop would send
the next content decision in the wrong direction.

`lead_submit_failed` deserves a tag for the same reason — a `reason: "no_key"` spike means leads are
being silently dropped, not that demand fell.

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

| Gap                                      | Consequence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CTA clicks — now measured**            | ✅ 2026-09-06. The container never had CTA triggers at all (two tags total), so nothing was lost in the `data-cta` split and there is **no** pre-2026-09-06 CTA history to compare against. `GA4 - cta_click` now sends `cta_id` for every value — 28 as of 2026-09-17, and a new one needs no container change because the tag reads the attribute. Baselines for this metric start here.                                                                                                                          |
| **`lead_submit_blocked` has no tag**     | honeypot activity is invisible, so a bot-suppressed quiet period looks like a conversion drop                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **Consent Mode v2 now ships**            | analytics are `denied` by default until the visitor chooses, so **measured traffic will drop against any pre-consent baseline**. That drop is the gate working. Do not read it as a regression, and do not compare across the boundary without labelling it.                                                                                                                                                                                                                                                        |
| **GSC ownership is NOT verified**        | ❌ The DNS TXT record was never added — `nslookup -type=TXT hambabait.co.il 8.8.8.8` (2026-09-06) returns only `v=spf1`. DNS TXT as a Domain property is still the right **method**, and `googleSiteVerification` correctly stays `null`, so the guarded block in `app/layout.tsx` shipping nothing is fine — but **ownership, the property and the sitemap submission are all outstanding owner actions, and they block this entire baseline.**                                                                    |
| **GA4 routing — CONFIRMED WORKING**      | ✅ 2026-09-06, GTM Preview against the live site (owner). The hostname routing resolves to GA4 property **`G-RLE7LGPPX3`**; the `GA4 — Per-site config` Google Tag fired once and `GA4 - cta_click` sent its hits to that id, so the container→GA4 chain is proven end to end. Consent Default fired as event **1**, ahead of Initialization — the ordering `qa:gate` asserts in the built HTML holds at runtime too. The manifest `ga4MeasurementId` still stays `null` **on purpose**: routing is container-side. |
| **[needs confirmation]** Web3Forms inbox | a lead can "succeed" and reach nobody                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

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

The same rule applies to this document. The technical baseline in §1 is quotable because it was
measured from `out/`; the traffic table in §0 is not quotable, because it is empty.

### PII

**Never put PII in `dataLayer`** — no name, phone, email or message content. The lead form has all four
in scope and is one careless edit away from leaking them. Audit `trackEvent` call sites every pass;
all four current calls pass only `form` and `reason`.

Note the WhatsApp fallback builds a `wa.me` URL containing name, phone and message, handing PII to
Meta. It is user-initiated, which is the defensible design, and `/מדיניות-פרטיות/` names WhatsApp/Meta
as a processor.

---

## 6. What "better" looks like

Ordered by what actually matters to this business:

1. **More calls and WhatsApp taps**, especially on mobile. The reader is mid-fault and on a phone.
   Measurable only once the container covers the split identifiers in §2.
2. **Location pages earning non-brand impressions.** They now carry per-city material rather than one
   template; if depth works, this is where it shows first.
3. **Informational queries arriving at all.** The 12 guides serve the symptom, comparison, definition
   and seasonal clusters. Before the hub existed this number was structurally zero; it is now a real
   metric with a real denominator, and the first one to check four weeks after a deploy.
4. **Indexed count reaching 45/45.**
5. Rankings — last, because they are the lagging indicator of everything above.
