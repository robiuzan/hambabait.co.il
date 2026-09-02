---
name: conversion-cro
description: Lead conversion on hambabait — click-to-call above the fold, the sticky mobile bar, the Web3Forms lead form and its WhatsApp fallback panel (an explicit user choice, not a silent auto-open), the browser-only honeypot and its lead_submit_blocked event, per-field errors with aria-invalid and focus management, the /תודה/ destination-URL conversion route paired with lead_submit, the consent notice above the submit button and the deliberately absent consent checkbox, the 27-value data-cta inventory whose three renamed values leave the GTM container behind the repo, and the honest-trust-signal gate. Use when conversions are weak, a page is missing its CTAs, or the form needs work. Triggers: "improve conversions", "CRO pass", "form validation", "thank you page", "add click-to-call", "why aren't leads tracked", "lead form".
---

# Conversion

Priority order, always: **(1) phone call, (2) WhatsApp, (3) lead form.** The visitor typically has no
hot water right now. They want a human, not a form.

## Non-negotiables per page

- A **click-to-call** action visible without scrolling on mobile.
- The **sticky mobile CTA bar** (`components/layout/MobileCtaBar.tsx`) present — with the
  `h-16 lg:hidden` spacer in the layout so it never covers footer content.
- A closing CTA (`FinalCta`) before the footer.
- Phone and WhatsApp as **real links** (`tel:`, `wa.me`), never buttons wired through JS. They must
  work with JS disabled and be long-pressable.

Use `telHref` and `whatsappHref()` from `lib/site-config.ts`. Never hardcode the number — it is the
shared fleet line and it can change.

Note the consent banner is positioned `bottom-16`, deliberately **above** the sticky bar, so it never
covers the call button. Anything else that renders `fixed` at the bottom must respect the same
stacking. Losing a call to a cookie banner is a poor trade.

## WhatsApp prefills

Prefilled messages already exist and should stay contextual:

- generic: `היי, אני מעוניין/ת בשירות תיקון דוד`
- service pages: `היי, אני מעוניין/ת בהצעת מחיר ל<service>`

A location page's prefill can name the city. Keep them short — long prefills get edited or abandoned.

## The lead form — current behaviour

`components/forms/LeadForm.tsx` POSTs JSON to `https://api.web3forms.com/submit` with
`access_key`, `subject`, `from_name`, `name`, `phone`, `service`, `message`. There is **no backend**;
delivery is browser → third party → the business inbox.

The success path is: confirmed response → `trackEvent("lead_submit", { form: "lead" })` →
`router.push("/תודה/")`. The event is correctly gated behind a confirmed send, and the dataLayer push
is synchronous so it survives the client-side navigation. **Keep that gate.**

`/תודה/` exists as a **noindex conversion destination** — deliberately not in the sitemap, and one of
the only two built pages with no canonical and no JSON-LD (the 404 is the other). It gives GA4/Ads a
destination-URL conversion, which is far more reliable than a dataLayer event alone.

### Failure paths, all of them explicit

| Path                                     | What happens                                                          |
| ---------------------------------------- | --------------------------------------------------------------------- |
| Honeypot `company` filled                | silent return + `lead_submit_blocked` (`reason: "honeypot"`)          |
| No access key, `NODE_ENV !== production` | simulated success, so `next dev` works; **no** `lead_submit`          |
| No access key, production                | WhatsApp hand-off panel + `lead_submit_failed` (`reason: "no_key"`)   |
| Delivery failure                         | WhatsApp hand-off panel + `lead_submit_failed` (`reason: "delivery"`) |

The WhatsApp fallback is **never silent and never an auto-popup**: it renders a panel the user chooses
to click. That replaced an auto-open that left the visitor with a WhatsApp window and no idea the form
had failed. Do not regress it.

Key resolution is `siteConfig.formAccessKey || process.env.NEXT_PUBLIC_WEB3FORMS_KEY || ""` — `||`, not
`??`, so an **empty-string** key no longer passes through as "provisioned". That was a real defect: two
nullish coalescers meant a blank key in the manifest silently dropped every lead to the WhatsApp popup.

Two things still true and worth knowing:

- **The env var is a fallback, not an override.** The manifest always wins, so setting
  `NEXT_PUBLIC_WEB3FORMS_KEY` locally to redirect test leads to a scratch inbox does nothing while the
  manifest carries a key.
- **The honeypot protects nothing at the API level.** `company` is checked in the browser only, and the
  access key ships in a public JS chunk — `site.config.json` is bundled into the client bundle, and the
  key is greppable in `out/_next/static`. Anyone can POST directly with the harvested key. Rate limiting
  lives on Web3Forms' side, outside this repo. **Do not claim the form is spam-protected.**

`lead_submit_blocked` carries no field values — only the fact that a submit was dropped. It is **inert
until someone adds a tag/trigger in GTM-KWGGH438**, which is an owner action. If real humans ever turn
up in that count (an autofill filling a `display:none` field), that count is the only signal.

## Form UX bar

Already in place — keep it:

- **Per-field errors** in Hebrew, rendered next to the field, with `aria-describedby` pointing at the
  error node and focus moving to the first failure. A fresh errors object is created on every submit so
  a repeated failure still changes identity and re-runs the focus effect.
- **Israeli phone validation** via `isValidIsraeliPhone` — accept `05X-XXXXXXX`, `05XXXXXXXX`, spaces
  and hyphens. Do not reject a valid number over formatting.
- **Submit disabled while in flight** with a pending label — a double-submit sends two leads.
- Minimal field count: name, phone, service, short message. Every extra field costs completions. Email
  is not needed when the callback is by phone.
- `inputMode="tel"` and `autoComplete="tel"` on the phone field; `autoComplete="name"` on the name.

## The consent affordance

A consent notice renders **above the submit button**, wired to it with `aria-describedby="lf-consent"`.
It names Web3Forms as the processor, says contact will be by phone or WhatsApp, states the
access/deletion right, and links `/מדיניות-פרטיות/`. Position is deliberate: a notice rendered _after_
the button is announced only once the user has already passed the control that sends their data.

> **There is deliberately no required consent checkbox.** That is an owner decision with a real
> conversion cost on a form whose visitor usually has water on the floor, and it is recorded as an open
> option — not an oversight. Do not add one unilaterally, and do not report its absence as a bug.

See `consent-mode`.

## `data-cta` coverage

**27 unique values, 492 occurrences** across the built site:

```
contact-call, contact-email, contact-form-submit, contact-form-whatsapp, contact-whatsapp,
finalcta-call, finalcta-whatsapp, footer-call, footer-email, header-call, header-call-icon,
hero-call, hero-form-submit, hero-form-whatsapp, hero-whatsapp, location-form-submit,
location-form-whatsapp, mobile-menu-call, notfound-call, pricing-quote, service-call,
service-form-submit, service-form-whatsapp, service-whatsapp, sticky-call, sticky-whatsapp,
thanks-call
```

Naming is **placement-based** (`hero`, `header`, `sticky`, `footer`, `contact`, `finalcta`), never
appearance-based. **Any new CTA must carry one**, or it is invisible to analytics.

> ⚠️ **The GTM container is behind the repo.** `header-call` used to be reused for three different
> elements on every page, collapsing them into one indistinguishable count; it was split into
> `header-call` (desktop bar button), `header-call-icon` (compact icon link) and `mobile-menu-call`
> (inside the panel). Four `*-form-submit` values were added at the same time. **Container triggers
> match these strings**, so until someone updates GTM-KWGGH438 the new and renamed values record
> nothing. That is an **owner action**, and it must be stated whenever CTA tracking is discussed.

See `tracking-analytics`.

## Trust signals — the honest gate

The instinct in a CRO pass is to add badges, counters and testimonials. **On this site, almost all of
them would be fabricated.** There are no reviews, no ratings, no job counts, no years in business, no
licence and no insurance — and that omission is deliberate. `npm run qa:gate` fails the build output if
`aggregateRating`, `reviewCount`, `ratingValue`, `foundingDate` or `warrantyPromise` reaches the markup.

What you may use, because it is true:

- the service breadth (all boiler types, 6 service pages)
- the 12 technical guides — demonstrated domain knowledge is a trust signal that needs no source
- transparent-quote-before-work framing
- the response channels themselves (a real phone number answered by a human)

What you may **not** add without a source: star ratings, "1000+ לקוחות", "25 שנות ניסיון", warranty
terms, response-time SLAs, certification badges. Route each to `docs/business-facts.md` instead.

A fabricated trust signal converts slightly better and is a Google policy violation. Not a trade worth
making.

## Checklist

- [ ] Call action above the fold on mobile
- [ ] Sticky bar present, spacer intact, nothing fixed covering it
- [ ] Phone/WhatsApp are real links from `lib/site-config.ts`
- [ ] `data-cta` on every CTA, placement-named — and say so if the container needs the new value
- [ ] Per-field errors + `aria-describedby` + focus management
- [ ] Submit disabled in flight
- [ ] `lead_submit` still fires only on confirmed success, and `/תודה/` still receives the push
- [ ] The consent notice still renders **before** the submit button
- [ ] No new trust claim without a source
