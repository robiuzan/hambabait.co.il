---
name: responsive-accessibility
description: WCAG 2.1 AA and Israeli IS 5568 compliance for hambabait — the two-token accent system (#16833e passes on white at 4.83:1, the bright #61ce70 fails at 1.99:1 and is dark-background-only), 44px tap targets, keyboard and focus order, the mobile menu focus trap, semantic landmarks and one H1, programmatic form labelling with aria-describedby, reduced motion in Reveal, and keeping /הצהרת-נגישות/ truthful. Use before shipping or when auditing accessibility. Triggers: "accessibility pass", "WCAG", "contrast check", "tap targets", "keyboard navigation", "נגישות", "IS 5568", "focus trap".
---

# Accessibility — WCAG 2.1 AA + IS 5568

Israeli law (תקן ישראלי 5568) points at WCAG 2.0 AA; target **2.1 AA**, which is a superset and what
the rest of this repo assumes.

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

## Tap targets

Minimum **44×44 px** for anything tappable — call button, WhatsApp button, mobile menu toggle, form
submit, footer links, FAQ accordion headers.

Padding counts toward the target; a 20px icon inside a `p-3` button is fine. Adjacent targets need
visible separation so a thumb cannot hit both.

The sticky mobile CTA bar is the most-used control on the site. It must clear 44px and must not
overlap footer content — the `h-16 lg:hidden` spacer in `app/layout.tsx` exists for exactly that.
Do not remove it.

## Keyboard and focus

- **Every interactive element reachable by Tab**, in a logical order. Under `dir="rtl"` the visual
  order is right-to-left while DOM order is unchanged — verify the tab order _looks_ right, not just
  that it exists.
- **Visible focus ring on everything.** Never `outline: none` without a replacement. Use
  `focus-visible:` so mouse users do not see rings but keyboard users do.
- **The mobile menu needs a focus trap.** `Header` is a client component with an open/closed state.
  While open: focus moves into the menu, Tab cycles inside it, `Escape` closes it and returns focus
  to the toggle. Without that, Tab walks behind the overlay into content the user cannot see — a
  common and disqualifying failure.
- The FAQ accordion (`components/marketing/Faq.tsx`) needs `aria-expanded` on the trigger and a
  programmatic association to its panel. Space and Enter must both work.

## Semantics and landmarks

- One `<h1>` per page; `<h2>`/`<h3>` below it with no skipped levels.
- Real landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`. `main` wraps page content.
- `<nav aria-label="פירורי לחם">` for breadcrumbs (already correct in `PageHeader`).
- Lists are `<ul>`/`<li>`. Buttons that navigate are `<a>`; links that act are `<button>`.
- A skip-to-content link is worth adding — with a header this size, keyboard users otherwise tab
  through the whole nav on every page.

## Forms

`components/forms/LeadForm.tsx` is the only form on the site.

- Every input has a **real `<label>`**, not a placeholder standing in for one.
- Errors are programmatic, not just red: `aria-invalid="true"` on the field plus `aria-describedby`
  pointing at the error node.
- On failed submit, move focus to the first invalid field.
- Announce the pending and success states — a visual-only spinner is invisible to a screen reader.
  `aria-live="polite"` on the status region.
- The honeypot (`company`) must be hidden from **everyone**, including assistive tech:
  `aria-hidden="true"` plus `tabIndex={-1}`, and never `display:none` alone if you want it to still
  submit.
- Hebrew error text, second person plural, matching the site voice.

## Motion

`app/globals.css` carries a global `prefers-reduced-motion` kill-switch, and
`components/ui/Reveal.tsx` additionally bails via `matchMedia("prefers-reduced-motion")` before
observing. That is the right belt-and-braces pattern — **keep both** if you touch either.

Any new animation must respect the same query. Nothing may flash more than three times per second.

## Images and icons

- Every meaningful image needs a Hebrew `alt`; decorative gets `alt=""`.
- `lucide-react` icons are decorative by default — give them `aria-hidden="true"` unless the icon is
  the only content of a control, in which case the control needs an `aria-label`.
- The call and WhatsApp buttons must have accessible names even when they render icon-only on mobile.

## RTL specifics

- `dir="rtl"` is on `<html>`. Do not set `dir` again on containers except for genuine LTR islands.
- Phone numbers, emails and URLs use the `.ltr` helper — this is an accessibility issue, not just
  cosmetic: without isolation the bidi algorithm can reorder a phone number visually, so a user reads
  and dials the wrong digits.

## Keeping /הצהרת-נגישות/ truthful

`app/הצהרת-נגישות/page.tsx` currently claims conformance work per ת״י 5568 and WCAG 2.0 AA and lists
four things that were "made accessible". **No audit backs any of it**, there is no statement date,
and no accessibility coordinator is named — Israeli practice expects both.

So:

- **Do not deepen the claim.** Adding "fully accessible" or a conformance badge makes it worse.
- Bring the page in line with reality: what was done, when it was last reviewed, known limitations,
  and a named contact plus a route to report a problem.
- Fix the underlying gaps (focus trap, focus rings, form labelling) _before_ strengthening the
  statement — not after.

See `docs/business-facts.md` §4.2.

## Audit pass

```bash
# banned physical utilities (RTL correctness)
grep -rnE '\b(pl|pr|ml|mr)-[0-9]|text-(left|right)\b' app components

# outline suppression
grep -rn 'outline-none\|outline: *none' app components

# images without alt
grep -rn '<img' app components | grep -v 'alt='

# H1 count per built page
for f in $(find out -name index.html); do
  n=$(grep -o '<h1' "$f" | wc -l); [ "$n" -eq 1 ] || echo "$n H1s: $f"
done
```

Then, by hand: tab the homepage end to end, open and close the mobile menu with the keyboard alone,
submit the form empty, and zoom to 200% to confirm nothing is clipped or overlapped.
