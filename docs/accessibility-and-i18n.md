# Accessibility and internationalisation — חם בבית

> The WCAG 2.1 AA rules this site is built to, the ARIA doctrine, and the multilingual architecture
> decision. Cited by `perf-a11y-auditor`, `responsive-accessibility`, `hebrew-rtl`,
> `rtl-frontend-engineer`, `i18n-multilingual`.
> Compiled 2026-08-31.

---

## Part I — Accessibility

## 0. The target, and the standard we may claim

**We build to WCAG 2.1 Level AA.** The Israeli standard **ת״י 5568** adopts WCAG **2.0** AA, so
building to 2.1 AA clears the Israeli baseline with margin — 2.1 adds the mobile and low-vision
criteria (reflow, non-text contrast, text spacing, orientation) that matter most to this audience.

> ⚠️ **Building to a standard is not conforming to it, and we may not say we conform.**
>
> `/הצהרת-נגישות/` was rewritten on 2026-08-25 to state exactly what was checked, when, and what was
> not — because it previously asserted ת״י 5568 and WCAG 2.0 AA conformance with no audit, no date
> and no named coordinator. **Do not re-add a conformance claim without a real external audit to
> point at.** The statement is the model for how this site handles an unsupportable claim; see
> [eeat-and-trust.md](eeat-and-trust.md) §1.

### What has actually been verified

**Internal, by reading and by arithmetic — 2026-08-25 and 2026-08-31.** No external audit exists.

- One H1 per page and correct heading order · skip link on every page · `aria-current` on the active
  nav item · labels bound to every form field · full RTL with LTR isolation for phone and email.
- **`<main>` now carries `tabIndex={-1}`**, which is what makes the skip link actually work: without
  it Safari and Chrome move the viewport but not focus, and the next Tab lands back in the nav the
  user just skipped.
- **Keyboard behaviour of the mobile menu**: Escape closes it and returns focus to the toggle, the
  panel scrolls when it overflows, and the body scroll lock is released on Escape and at the
  breakpoint. **It does not trap focus** — see §3.
- **Every horizontally scrollable container is keyboard-reachable** (`tabIndex={0}`). An
  `overflow-x-auto` region with no focusable child cannot be scrolled by keyboard at all, which is a
  2.1.1 failure hiding inside a layout utility.
- **The 6 service tables carry `sr-only` `<caption>` elements**; the guide tables carry visible ones.
- **A full contrast sweep** of the token palette and the markup, with four real failures found and
  fixed — the ratios are in §2.1.

### What has explicitly **not** been verified

- **No screen-reader testing** (NVDA, JAWS, VoiceOver). Nothing below the level of "the markup is
  correct" is known.
- **No rendered check at 320 px or 400 % zoom.** The CSS is written for it; nobody has looked at it.
- **No automated engine** — axe, Lighthouse or otherwise. **Browser automation is not installed in
  this environment**, which is the whole reason the two rows above are empty, and it is a tooling
  gap rather than an oversight.
- **No external audit**, automated or manual.
- The contrast work is **computed, not rendered** — real arithmetic on the real values, but not the
  same thing as looking at the page.

**Closing that list is what would let the statement change.** Nothing else.

> **`/הצהרת-נגישות/` is now behind the work.** It still says that not every colour pair was checked
> individually, which was true on 2026-08-25 and is no longer true after the sweep. Updating it —
> **without** adding a conformance claim — is **S3-6** in
> [implementation-roadmap.md](implementation-roadmap.md). Under-claiming is the safe direction to be
> wrong in, so this is a correction to schedule, not an emergency.

---

## 1. Structure

- **Exactly one `<h1>` per page**, matched to search intent. Everything else `<h2>`/`<h3>`, **no
  skipped levels**. `npm run qa:gate` asserts the one-H1 rule across all 47 built pages on every
  run, so this one cannot silently regress. Heading _order_ is not asserted — that stays a reading job.
- **Landmarks:** one `<main id="main">`, one `<header>`, one `<footer>`, `<nav>` labelled where more
  than one exists.
- **Skip link** first in the tab order, visible on focus.
- **Semantic elements before ARIA.** A `<button>` that behaves like a button needs no `role`.
- Lists are lists, tables are tables with a real `<caption>` — the guide tables already do this, and
  screen readers announce it.

## 2. Colour and contrast

The two-token accent system exists for exactly this reason:

| Token                | Value     | Use                                                     |
| -------------------- | --------- | ------------------------------------------------------- |
| `--color-accent`     | `#16833e` | **Interactive surfaces and text on white** — 4.83:1, AA |
| `--color-accent-400` | `#61ce70` | Bright brand green — **highlights on dark only**        |

> **Do not swap them.** `#61CE70` is the brand green and it fails AA on white. That is why the
> darkened value is the default token.

Rules: 4.5:1 for body text, 3:1 for large text and for **non-text** UI (borders, icons, focus
indicators — WCAG 2.1 SC 1.4.11). Colour is never the only carrier of meaning: form errors are red
**and** carry text **and** set `aria-invalid`.

### 2.1 What the 2026-08-31 sweep computed, and what it changed

Every colour pair in the tokens and the markup was worked out arithmetically. This is now the
best-evidenced part of the whole accessibility picture — and it is still **computed, not rendered**
(§7). Four real failures came out of it and all four were fixed:

| Surface                       | Was                                          | Now                                                     |
| ----------------------------- | -------------------------------------------- | ------------------------------------------------------- |
| WhatsApp buttons + sticky bar | white on `#25D366` — **1.98:1** ❌           | `text-primary` (`#344256`) on `#25D366` — **5.14:1** ✅ |
| `FinalCta` body copy          | `/90` opacity — **4.23:1** ❌                | opacity dropped — **4.83:1** ✅                         |
| `LeadForm` borders            | `gray-300` — **1.47:1** ❌ against SC 1.4.11 | `gray-500` (`#6a7282`) — **4.84:1** ✅                  |
| `LeadForm` placeholders       | `gray-400` — **2.60:1** ❌                   | `gray-500` — **4.84:1** ✅                              |

The focus rings also went back to full strength; a dimmed focus ring is a 1.4.11 failure that looks
like a design choice.

> **`#25D366` is WhatsApp's brand fill and it is a trap.** It is light enough that white text on it
> fails badly, and every WhatsApp button on the web gets this wrong. Dark text on the brand green is
> the fix, and it is what the `whatsapp` Button variant and the sticky bar both do. Do not "restore"
> white text for brand fidelity.

## 3. Keyboard and focus

- Every interactive element is reachable and operable by keyboard, in a logical order.
- **Visible focus everywhere** — shipped globally in `app/globals.css` using `currentColor` so the
  ring stays legible on white, on the dark footer and on the green band alike.
- No positive `tabindex`. Horizontally scrollable containers carry `tabIndex={0}` so a keyboard user
  can actually scroll them — `overflow-x-auto` alone is mouse-and-touch only.
- **The mobile menu does not trap focus, and no doc may say it does.** What it does: the panel is in
  the natural tab order, so Tab walks into it; Escape (bound to `document`, not to the header —
  an element handler stopped firing the moment focus left) closes it and **returns focus to the
  toggle**; the panel scrolls when it is taller than the viewport; and the body scroll lock is
  cleared both on Escape and when the viewport crosses the `lg` breakpoint with the menu open.
  A real trap is a genuine improvement and it is **not** implemented — write it up as open, not as
  done.
- `:focus-visible`, not `:focus` — pointer users should not see rings.

## 4. Forms

Every rule here already ships in `LeadForm.tsx`; the point is that they stay.

- A `<label for>` for every control. **A placeholder is not a label.**
- Errors: per-field, in Hebrew, adjacent to the field, referenced by `aria-describedby`, with
  `aria-invalid` on the control, and focus moved to the first offending field.
- `autocomplete` and `inputMode` on every field that has a sensible value.
- Success and failure states use `role="status"` and `role="alert"` — each already implies its own
  `aria-live` value, and stating both made some screen readers announce twice. The validation-error
  region is **mounted empty and always present**: a live region inserted at the same instant as its
  message is frequently never announced at all.
- `noValidate` is set deliberately so our Hebrew messages replace the browser's — which means our
  validation must be complete.

## 5. Motion, targets, zoom

- **`prefers-reduced-motion` is honoured globally** in `app/globals.css`. Any new animation inherits
  it; do not opt out.
- **Tap targets ≥ 44×44 px on primary CTAs.** Note this is _stricter than required_: **WCAG 2.1 AA
  has no target-size criterion at all** — 2.5.5 Target Size is AAA, and the 24 px AA minimum
  (2.5.8) arrives only in WCAG 2.2. We hold 44 px on buttons and the sticky bar because the audience
  is one-handed on a phone mid-fault. That is a **usability decision, not a compliance one**, and the
  distinction matters when someone reports a "failure".
  **Where the site is under 44 px:** the dense footer link lists and the footer's inline text CTAs —
  `inline-block py-1` on `text-sm`, roughly 28 px tall. They clear the 24 px floor that WCAG 2.2 AA
  will introduce, and they fail nothing today. Deliberate density, correctly documented; do not
  "fix" it by inflating a 24-item footer list into three screens of padding.
- **Never** `user-scalable=no` or `maximum-scale=1`.
- Base font ≥ 16 px on inputs — smaller triggers iOS auto-zoom on focus.
- **Reflow (SC 1.4.10):** the CSS is written for 320 px and 400 % zoom — fluid containers, no fixed
  widths, and every wide table or diagram scrolls **inside its own focusable container** rather than
  scrolling the page. ⚠️ **This has never been checked in a rendered browser.** It is reasoned from
  the stylesheet, which is not the same claim.
- **Text spacing (SC 1.4.12):** no fixed heights on text containers.

## 6. ARIA doctrine

> **No ARIA beats bad ARIA.** Incorrect ARIA actively breaks a screen reader that would otherwise
> have worked from the native semantics.

- Use native elements first. Reach for ARIA only when there is no native equivalent.
- **`aria-hidden` on every decorative icon** — the `lucide-react` icons all carry it today. An
  unlabelled, unhidden icon is announced as noise.
- `aria-label` on links whose text is not self-describing out of context (the WhatsApp icon link).
- `aria-current="page"` on the active nav item.
- Never `aria-hidden` on anything focusable.
- Landmark regions that repeat get an `aria-label`.

## 7. Testing protocol

| Layer                 | Tool                                           | State                                            |
| --------------------- | ---------------------------------------------- | ------------------------------------------------ |
| Static, automated     | `npm run qa:gate` (28 assertions over `out/`)  | ✅ green — one H1 per page, no banned utilities  |
| Static, agentic       | `perf-a11y-auditor` over `out/`                | Run on every content change                      |
| Computed contrast     | Ratios computed from the tokens and the markup | ✅ done 2026-08-31 (§2)                          |
| Automated a11y engine | axe / Lighthouse                               | ❌ **not run** — no browser automation installed |
| Keyboard              | Manual tab-through of every page type          | Protocol before every deploy                     |
| Screen reader         | NVDA (Hebrew) + VoiceOver iOS                  | ❌ **not yet done** — gating the statement       |
| Zoom / reflow         | 400 % zoom and a 320 px viewport               | ❌ **not rendered** — reasoned from CSS only     |

**Three of those rows are red, and that is the honest state.** Automated tools catch roughly a third
of real issues on a good day; here they have not run at all, because nothing in this environment can
drive a browser. Everything in §2 is **computed** — arithmetic on colour values that are certainly
the ones in the tokens and the markup, but arithmetic all the same. It is strong evidence about
contrast and **no evidence at all** about whether a screen reader announces the FAQ correctly or
whether a table clips at 320 px.

**The keyboard pass is the one that finds the bugs that matter**, and it takes five minutes per page
type — there are four (home, service, city, guide).

---

## Part II — Internationalisation

## 8. Current state

The site is **monolingual he-IL**. `<html lang="he" dir="rtl">` is set in `app/layout.tsx` and does
not change. English appears in exactly three harmless places: URL slugs (`/services/solar/`,
`/locations/tel-aviv/`), `brandNameEn` as a JSON-LD `alternateName`, and code.

**A monolingual site needs no `hreflang` and no `x-default`.** Adding them today would be noise.

## 9. The RTL rules (non-negotiable)

Full rule set in the `hebrew-rtl` skill; the short version, because these are the ones that get
broken:

- **Logical Tailwind utilities only**: `ps-*`/`pe-*`, `ms-*`/`me-*`, `start-*`/`end-*`,
  `text-start`/`text-end`, `space-x-reverse`.
  **Banned:** `pl-* pr-* ml-* mr-* left-* right-* text-left text-right`. Currently **0 violations** in
  `app/` and `components/` — keep it there.
- Let `dir="rtl"` mirror flex and grid. Do not force `flex-row-reverse` except to wrap an LTR island.
- **LTR islands**: phone numbers, email addresses, URLs and prices get `dir="ltr"` and the `.ltr`
  helper (`direction: ltr; unicode-bidi: isolate`). Without isolation, a Hebrew sentence ending in a
  phone number renders the digits in the wrong order.
- Israeli formats: phone `0XX-XXX-XXXX`, currency `₪`, dates `dd/mm/yyyy`.
- Hebrew punctuation: גרש `׳` and גרשיים `״`, not straight quotes.
- **The Hebrew-slug route trap:** seven routes are Hebrew directories. `app/sitemap.ts` runs every
  `loc` through `encodeURI` because the sitemap protocol requires escaped URLs _and_ Cloudflare Pages
  matches only the escaped asset key. Canonicals are escaped by Next automatically, so the two are
  byte-identical. **Never hand-write a raw-UTF-8 Hebrew URL into a sitemap, canonical or redirect.**

## 10. Adding English — the recommendation is _not yet_

**Recommendation: do not add an English version.** State the reasons plainly to anyone who asks for
it:

1. **The audience searches in Hebrew.** A homeowner in Israel with a leaking דוד types
   `תיקון דודים`. English-language demand for this service in this market is marginal.
2. **It doubles 45 URLs to 90**, and the second 45 would almost certainly be translated rather than
   authored — which is the definition of thin content, in a second language nobody audits.
3. **Every claim must be re-audited in the new language.** The claims discipline in
   [business-facts.md](business-facts.md) is the site's core asset, and a translator softening
   "אנחנו מסבירים את התנאים לפני העבודה" into "guaranteed service" reintroduces the exact claim we
   spent weeks removing.
4. **The maintenance surface doubles**: content, metadata, schema, sitemap, `llms.txt`, the link
   mesh, and the docs that govern them.
5. **It buys nothing structurally.** There is no server; every locale is another static tree.

**The cheaper thing that gets most of the value:** the existing `brandNameEn` `alternateName`, and —
if a specific English query ever proves real — one English page, not a mirror.

## 11. If it is added anyway — the architecture

Decided in advance so nobody improvises it under deadline.

**Next's built-in `i18n` routing config does not work with `output: "export"`** — it requires a
server. The only correct App Router pattern here is a **dynamic locale segment**:

```
app/[lang]/layout.tsx        → <html lang={lang} dir={lang === "he" ? "rtl" : "ltr"}>
app/[lang]/page.tsx          → generateStaticParams() → [{lang:"he"},{lang:"en"}]
```

Non-negotiables for that build:

| Concern        | Rule                                                                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Default locale | Hebrew stays at the root (`/`). English goes under `/en/`. **Never move the Hebrew URLs** — they are the ranking asset.                   |
| `dir`          | Set from the segment on `<html>`, never guessed per component. Logical utilities then work for both.                                      |
| `hreflang`     | Reciprocal `alternates.languages` on every page pair, **plus `x-default` → Hebrew**. Non-reciprocal hreflang is ignored.                  |
| Canonicals     | Self-referencing per locale. An English page never canonicalises to Hebrew.                                                               |
| Content        | Locale-keyed maps in the content layer — the same shape as `cityContent`. **Never a translation call at render time.**                    |
| Schema         | `inLanguage` set per locale; one `Plumber` entity shared by `@id`, not duplicated.                                                        |
| Sitemap        | Both trees, escaped, with `xhtml:link` alternates.                                                                                        |
| `llms.txt`     | Hebrew stays canonical; English listed separately.                                                                                        |
| Fonts          | Heebo/Rubik already carry Latin subsets — **no new font ships**.                                                                          |
| Translation    | Human, by someone who knows the trade. Machine translation of technical plumbing copy produces confident nonsense and it will be indexed. |
| Claims         | Re-run the [eeat-and-trust.md](eeat-and-trust.md) §6 gate on **every** translated page.                                                   |

**Acceptance:** no Hebrew URL changed, every pair reciprocal, `x-default` present, both trees in the
sitemap, and the build gate green.
