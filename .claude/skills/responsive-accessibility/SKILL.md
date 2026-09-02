---
name: responsive-accessibility
description: 'WCAG 2.1 AA and Israeli IS 5568 work on hambabait — the two-token accent system (#16833e passes on white at 4.83:1, the bright #61ce70 fails at 1.99:1 and is dark-background-only), the measured contrast fixes that landed on the WhatsApp buttons, FinalCta and LeadForm, the skip link and focusable <main>, why the mobile menu is a disclosure and deliberately does NOT trap focus, keyboard-reachable scroll containers, 44px tap targets, programmatic form labelling, reduced motion in Reveal, and the accessibility statement that now names its own limitations and carries a date instead of claiming conformance no audit backs. Use before shipping or when auditing accessibility. Triggers: "accessibility pass", "WCAG", "contrast check", "tap targets", "keyboard navigation", "נגישות", "IS 5568", "focus trap".'
---

# Accessibility — WCAG 2.1 AA + IS 5568

Israeli law (תקן ישראלי 5568) points at WCAG 2.0 AA; target **2.1 AA**, which is a superset and what
the rest of this repo assumes.

**No conformance may be claimed.** No audit has been run against this site — not by a tool, not by a
person. Everything below is either a measured contrast ratio or a described implementation. Neither
is a conformance statement, and the fixes that landed do not become one by accumulating.

## The accent system — understand it before you touch a colour

`app/globals.css` deliberately defines **two** greens, and swapping them is the easiest way to break
contrast site-wide:

| Token                | Value     | On white                               | On `--color-primary` (#344256) |
| -------------------- | --------- | -------------------------------------- | ------------------------------ |
| `--color-accent`     | `#16833e` | **4.83:1 — passes AA** for normal text | passes                         |
| `--color-accent-400` | `#61ce70` | **1.99:1 — fails everything**          | **5.13:1 — passes AA**         |

`#61ce70` is the brand green. It was deliberately darkened to `#16833e` for interactive surfaces and
text so it clears 4.5:1, and the bright original was kept at `accent-400` **for highlights on dark
backgrounds only**.

Rules that follow:

- Never use `accent-400` for text or an icon on white. That is the 1.99:1 failure.
- Never "restore the brand green" on a CTA. The darkened token _is_ the brand green, corrected.
- Both accents fail AAA (7:1). Do not promise AAA anywhere.
- Large text (≥18.66px bold or ≥24px) only needs 3:1 — but do not rely on that for CTA labels.

Check any new pairing before shipping it; do not eyeball green.

## Contrast fixes that landed — the measured record

Keep these ratios with the change; they are why the code looks the way it does.

| Surface                  | Was                                                   | Now                                               |
| ------------------------ | ----------------------------------------------------- | ------------------------------------------------- |
| WhatsApp buttons         | white on `#25D366` = **1.98:1**                       | `text-primary` on `#25D366` = **5.14:1**          |
| WhatsApp button hover    | darker `#1da851` dropped the dark label to **3.29:1** | `#4add80` (15% white tint) holds it at **5.80:1** |
| `FinalCta` body copy     | white at 90% over `#16833e` composites to **4.23:1**  | full white on `#16833e` = **4.83:1**              |
| `LeadForm` input borders | `gray-300` = **1.47:1** against SC 1.4.11             | `gray-500` (`#6a7282`) = **4.84:1**               |
| `LeadForm` placeholders  | `gray-400` = **2.60:1**                               | `gray-500`                                        |
| Focus rings              | reduced-opacity ring                                  | full-strength `focus-visible:ring-secondary`      |

Two non-obvious consequences worth preserving:

- **The WhatsApp hover direction is inverted.** Hover moves _lighter_, not darker, because the label
  is now dark. Re-darkening the hover re-breaks it.
- **The lucide icons inherit `currentColor`**, so they ride along with the label and clear the 3:1
  non-text floor. Do not hardcode an icon colour on those buttons.

## Keyboard and focus

- **Every interactive element reachable by Tab**, in a logical order. Under `dir="rtl"` the visual
  order is right-to-left while DOM order is unchanged — verify the tab order _looks_ right, not just
  that it exists.
- **Visible focus ring on everything.** Never `outline: none` without a replacement. Use
  `focus-visible:` so mouse users do not see rings but keyboard users do.
- **The skip link ships.** `app/layout.tsx` renders `דילוג לתוכן הראשי` as the first focusable
  element, and `<main id="main" tabIndex={-1}>` is what makes it work: without `tabIndex={-1}` Safari
  moves the fragment but leaves focus in the header, so the next Tab returns to the nav the user just
  skipped. `-1` keeps `<main>` out of the tab order while making it programmatically focusable, and
  `:focus-visible` does not fire for programmatic focus, so no ring appears for mouse users. Keep
  both halves.
- **Horizontally scrollable containers are keyboard-reachable.** The service symptom tables, the
  guide tables and `GuideDiagram` sit in `overflow-x-auto` wrappers carrying `tabIndex={0}`, because
  a scroll container that only a mouse can pan is unreachable (SC 2.1.1). Any new scrollable wrapper
  needs the same, plus an accessible name.
- The FAQ accordion (`components/marketing/Faq.tsx`) needs `aria-expanded` on the trigger and a
  programmatic association to its panel. Space and Enter must both work.

### The mobile menu does NOT trap focus — by design

Do not describe it as a focus trap, and do not add one without reading the comment block in
`components/layout/Header.tsx` first.

It is a **disclosure, not a dialog**: the panel sits in flow directly after the toggle, so the natural
Tab order already walks into it and out the other side. There is nothing behind an overlay to escape
into. What the open state does own, all in one effect so it tears down together:

- a **body scroll lock**, safe only because the panel is its own scroll container
  (`max-h-[calc(100vh-4rem)] overflow-y-auto`). Before that, a 320×256 viewport (400% zoom) locked the
  body around a ~445px panel and the lower menu items and the call button were unreachable;
- **Escape bound to `document`**, not to the `<header>` — an element handler only fires while focus is
  inside that element, so Escape did nothing once focus left the header. Closing returns focus to the
  toggle;
- a **breakpoint listener** at `64rem`, because `lg:hidden` hid the panel while `open` stayed true,
  leaving the body scroll-locked with no visible control to unlock it.

If the panel is ever converted into a true overlay dialog, then it needs a trap — and `aria-modal`,
and an inert background. Not before.

## Tap targets

Minimum **44×44 px** for anything tappable — call button, WhatsApp button, mobile menu toggle, form
submit, footer links, FAQ accordion headers.

Padding counts toward the target; a 20px icon inside a `p-3` button is fine. Adjacent targets need
visible separation so a thumb cannot hit both.

The sticky mobile CTA bar is the most-used control on the site. It must clear 44px and must not
overlap footer content — the `h-16 lg:hidden` spacer in `app/layout.tsx` exists for exactly that.
Do not remove it.

## Semantics and landmarks

- One `<h1>` per page; `<h2>`/`<h3>` below it with no skipped levels. `npm run qa:gate` asserts
  exactly one `<h1>` on every built page, the two noindex routes included.
- Real landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`. `main` wraps page content.
- `<nav aria-label="פירורי לחם">` for breadcrumbs (correct in `PageHeader`, and the same array feeds
  the `BreadcrumbList` JSON-LD — so a visible/marked-up mismatch is impossible by construction).
- Every data table needs a `<caption>`. The 6 service symptom tables carry `sr-only` captions —
  deliberately sr-only, because those tables sit directly under a visible heading that already names
  them, while the guide tables carry visible ones.
- Lists are `<ul>`/`<li>`. Buttons that navigate are `<a>`; links that act are `<button>`.

## Forms

`components/forms/LeadForm.tsx` is the only form on the site.

- Every input has a **real `<label>`**, not a placeholder standing in for one.
- Errors are programmatic, not just red: `aria-invalid="true"` on the field plus `aria-describedby`
  pointing at the error node.
- The **consent notice renders above the submit button** and is bound to it with
  `aria-describedby="lf-consent"` — before the action, not after it, so a screen-reader user hears
  the disclosure while still on the control that triggers it. It restates what `/מדיניות-פרטיות/`
  already says; it adds no claim. There is deliberately **no required consent checkbox** — an owner
  decision with a real conversion cost, recorded as an open option.
- On failed submit, move focus to the first invalid field.
- Announce the pending and success states — a visual-only spinner is invisible to a screen reader.
  `aria-live="polite"` on the status region.
- The honeypot (`company`) must be hidden from **everyone**, including assistive tech:
  `aria-hidden="true"` plus `tabIndex={-1}`, and never `display:none` alone if you want it to still
  submit.
- Hebrew error text, second person plural, matching the site voice.

## The consent banner is a keyboard surface too

`ConsentBanner` is rendered **second in `<body>`**, not last. It is `fixed`, so its on-screen
position does not depend on markup order — but as the last element it sat ~100 tab stops from the
top, so a keyboard user had to traverse the whole page to answer it, and at 400% zoom it covered the
viewport with unreachable controls. Consent logically precedes everything else, so it is reached
first. Do not move it back.

## Motion

`app/globals.css` carries a global `prefers-reduced-motion` kill-switch, and
`components/ui/Reveal.tsx` additionally bails via `matchMedia("prefers-reduced-motion")` before
observing. That is the right belt-and-braces pattern — **keep both** if you touch either.

Any new animation must respect the same query. Nothing may flash more than three times per second.

## Images and icons

- The site currently ships **zero raster images** — `grep '<img' out` returns nothing, and `public/`
  holds only `_headers` and `llms.txt`. The only image asset is `app/icon.svg` as the favicon.
- The moment that changes: every meaningful image needs a Hebrew `alt`; decorative gets `alt=""`.
- `lucide-react` icons are decorative by default — give them `aria-hidden="true"` unless the icon is
  the only content of a control, in which case the control needs an `aria-label`.
- The call and WhatsApp buttons must have accessible names even when they render icon-only on mobile.

## RTL specifics

- `dir="rtl"` is on `<html>`. Do not set `dir` again on containers except for genuine LTR islands.
- Phone numbers, emails and URLs use the `.ltr` helper — this is an accessibility issue, not just
  cosmetic: without isolation the bidi algorithm can reorder a phone number visually, so a user reads
  and dials the wrong digits.
- `qa:gate` scans the **built HTML** for banned physical-direction utilities, parsing class attributes
  into whole tokens and stripping variant prefixes so `text-primary` and `lucide-chevron-left` do not
  false-positive. A source-level grep is a useful first pass, not the gate.

## /הצהרת-נגישות/ — now honest, and it must stay that way

The page **used to** assert conformance with ת״י 5568 and WCAG 2.0 AA with no audit, no date and no
contact behind it, and listed "alt text for meaningful images" on a site that ships no images at all.
That is history. It now says, in Hebrew:

- **no external accessibility audit and no professional review against ת״י 5568 or WCAG has been
  carried out** — the checks were internal, and they are enumerated;
- a **"what was actually checked"** list (one H1 and heading order, the skip link and marked content
  region, mobile-menu keyboard navigation including Escape and focus return, the current-page marker
  for screen readers, labels on every form field, RTL with phone/email isolation, the primary accent
  against white);
- a **"known limitations"** list — no real screen-reader testing (NVDA/JAWS/VoiceOver), no external
  audit, not every colour pairing checked, and components that may not be fully accessible and were
  not caught internally;
- a route to report a problem (phone and email), and a **statement date**: `STATEMENT_DATE` in
  `app/הצהרת-נגישות/page.tsx`, currently `25/08/2026`.

Rules:

- **Do not re-add a conformance claim** without a real audit to point at. Not "fully accessible", not
  a badge, not "עומד בתקן".
- **The statement is behind the code.** The contrast and keyboard fixes above landed after that date
  and are not in the "what was checked" list. Bump `STATEMENT_DATE` and extend the list **in the same
  change** whenever you do accessibility work — and only for work actually done. A date bumped
  without a real edit is a fabricated freshness signal.
- **No accessibility coordinator is named.** Israeli practice expects one. That is an owner action —
  do not invent a name or a role to fill the slot.
- Fix underlying gaps _before_ strengthening the statement — not after.

See `docs/business-facts.md` §4.2.

## Audit pass

```bash
# banned physical utilities (source-level first pass; qa:gate checks the built HTML)
grep -rnE '\b(pl|pr|ml|mr)-[0-9]|text-(left|right)\b' app components

# outline suppression
grep -rn 'outline-none\|outline: *none' app components

# images without alt (currently there are no <img> at all)
grep -rn '<img' app components | grep -v 'alt='

# scroll containers that no keyboard can reach
grep -rn 'overflow-x-auto' app components | grep -v 'tabIndex'

# H1 count per built page — or just run the gate
npm run qa:gate
```

Then, by hand: tab the homepage end to end, open and close the mobile menu with the keyboard alone,
answer the consent banner without a mouse, submit the form empty, and zoom to 200% (and 400%) to
confirm nothing is clipped, overlapped or unreachable.
