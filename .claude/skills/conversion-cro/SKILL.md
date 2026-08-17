---
name: conversion-cro
description: Lead conversion on hambabait — click-to-call above the fold, the sticky mobile bar, the Web3Forms lead form and its silent WhatsApp fallback, the browser-only honeypot, per-field errors and aria-invalid, the missing consent affordance and thank-you route, data-cta coverage on every CTA, and the honest-trust-signal gate. Use when conversions are weak, a page is missing its CTAs, or the form needs work. Triggers: "improve conversions", "CRO pass", "form validation", "thank you page", "add click-to-call", "why aren't leads tracked", "lead form".
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

## WhatsApp prefills

Prefilled messages already exist and should stay contextual:

- generic: `היי, אני מעוניין/ת בשירות תיקון דוד`
- service pages: `היי, אני מעוניין/ת בהצעת מחיר ל<service>`

A location page's prefill can name the city. Keep them short — long prefills get edited or abandoned.

## The lead form — current behaviour

`components/forms/LeadForm.tsx` POSTs JSON to `https://api.web3forms.com/submit` with
`access_key`, `subject`, `from_name`, `name`, `phone`, `service`, `message`. There is **no backend**;
delivery is browser → third party → the business inbox.

On success it fires `trackEvent("lead_submit", { form: "lead" })` — correctly gated behind a
confirmed response, so the event means a real send. Keep that gate.

### Four defects worth fixing

1. **The WhatsApp fallback is silent.** On any delivery failure the form opens WhatsApp with the
   lead interpolated into the URL. The same path runs in production when the access key is missing.
   The user is never told the form failed — they just get a WhatsApp window. At minimum, say so.
2. **A blank key degrades silently.** Key resolution is
   `siteConfig.formAccessKey ?? process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? ""`. Both `??` are _nullish_
   coalescing, so an empty-string key passes straight through and is then treated as unprovisioned —
   dropping every lead to the WhatsApp popup. Guard on emptiness, not just null.
3. **The env var is a fallback, not an override**, despite a comment calling it an override. The
   manifest always wins, so setting `NEXT_PUBLIC_WEB3FORMS_KEY` locally to redirect test leads to a
   scratch inbox does nothing. Fix the comment or invert the precedence for dev.
4. **The honeypot protects nothing at the API level.** The `company` field is checked in the browser
   only, and the access key ships in a public JS chunk. Anyone can POST directly with the harvested
   key. Rate limiting lives on Web3Forms' side, outside this repo. Do not claim the form is
   spam-protected.

## Form UX bar

- **Per-field errors**, rendered next to the field, in Hebrew.
- `aria-invalid` on the failing input and `aria-describedby` pointing at the error node.
- Move focus to the first error on failed submit.
- **Phone validation** suited to Israeli formats: accept `05X-XXXXXXX`, `05XXXXXXXX`, and spaces or
  hyphens. Do not reject a valid number over formatting.
- Disable the submit button while in flight and show a pending state — a double-submit sends two
  leads.
- Keep the field count minimal: name, phone, service, short message. Every extra field costs
  completions. Email is not needed when the callback is by phone.
- `inputMode="tel"` and `autoComplete="tel"` on the phone field; `autoComplete="name"` on the name.

## Two things that are missing

**A consent affordance.** The form collects a name, a phone number and a free-text problem
description, and ships them to a third-party processor. There is no consent checkbox and no link to
the privacy policy at the point of collection — while the privacy policy itself states details are
not passed to third parties. Add a short line linking `/מדיניות-פרטיות/` at minimum. See
`web-security-headers` and `docs/business-facts.md` §4.1.

**A thank-you route.** Success is currently an inline message. A distinct `/תודה/` URL would give a
much more reliable conversion trigger than a dataLayer event alone, and a place to set expectations
("נחזור אליכם בהקדם" plus the phone number for anyone who does not want to wait).

## `data-cta` coverage

Every call and WhatsApp CTA already carries a `data-cta` placement tag (header, hero, final CTA,
footer, mobile bar). **Any new CTA must carry one too**, or it becomes invisible to analytics.

Naming stays consistent: placement-based (`hero`, `header`, `final`, `mobile-bar`, `footer`), not
appearance-based. See `tracking-analytics`.

## Trust signals — the honest gate

The instinct in a CRO pass is to add badges, counters and testimonials. **On this site, almost all of
them would be fabricated.** There are no reviews, no ratings, no job counts, no years in business, no
licence and no insurance — and that omission is deliberate.

What you may use, because it is true:

- the service breadth (all boiler types)
- transparent-quote-before-work framing
- the response channels themselves (a real phone number answered by a human)

What you may **not** add without a source: star ratings, "1000+ לקוחות", "25 שנות ניסיון", warranty
terms, response-time SLAs, certification badges. Route each to `docs/business-facts.md` instead.

A fabricated trust signal converts slightly better and is a Google policy violation. Not a trade
worth making.

## Checklist

- [ ] Call action above the fold on mobile
- [ ] Sticky bar present, spacer intact
- [ ] Phone/WhatsApp are real links from `lib/site-config.ts`
- [ ] `data-cta` on every CTA
- [ ] Per-field errors + `aria-invalid` + focus management
- [ ] Submit disabled in flight
- [ ] `lead_submit` still fires only on confirmed success
- [ ] No new trust claim without a source
