# Mobile UX and personalization — חם בבית

> Thumb-zone rules for a visitor mid-fault on a phone, and an honest account of what personalization
> a static export can and cannot safely do. Cited by `cro-ux-auditor`, `rtl-frontend-engineer`,
> `conversion-cro`, `geo-personalization`.
> Compiled 2026-08-31.

---

## 0. The mobile visitor

Assume: **a phone, one hand, poor signal, and a problem happening right now.** Possibly standing in a
utility room or on a roof looking at a solar tank. Possibly water on the floor.

That person is not browsing. Every design decision below follows from a single question: _does this
get them to a call faster, or does it get in the way?_

---

## 1. The thumb zone

On a phone held one-handed, the bottom third of the screen is comfortable, the middle is reachable,
and the top corners require a grip change.

| Zone                   | What belongs there                                        |
| ---------------------- | --------------------------------------------------------- |
| **Bottom (easy)**      | Primary conversion actions — the sticky call/WhatsApp bar |
| **Middle (reachable)** | Form fields, in-content CTAs, FAQ toggles                 |
| **Top (hard)**         | Logo, secondary nav, breadcrumbs                          |

**This is why the sticky bar exists and why it is not negotiable.** It puts goal #1 permanently in
the easiest 15 % of the screen, on every one of the 45 pages.

`components/layout/MobileCtaBar.tsx` — the rules it encodes:

- `fixed inset-x-0 bottom-0`, `lg:hidden` — mobile and tablet only.
- **A layout spacer** (`h-16 lg:hidden` in `app/layout.tsx`) so it never covers footer content.
- `pb-[env(safe-area-inset-bottom)]` so it clears the home indicator on notched devices.
- Two targets, equal width, full-height — impossible to mis-tap.
- The consent banner sits **above** it (`bottom-16 lg:bottom-0`) so it never covers the call button.
  **Losing a phone call to a cookie banner would be a poor trade on a site whose first goal is a
  call.** Anything else that ever docks to the bottom inherits this constraint.

---

## 2. Mobile interaction rules

| Rule                                     | Why                                                                                                                                                                                                                      |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tap targets ≥ 44×44 px on primary CTAs   | One-handed, possibly wet hands. **Stricter than WCAG 2.1 AA requires** — 2.1 AA has no target-size criterion at all; 2.5.5 is AAA and the 24 px AA floor arrives in WCAG 2.2. A usability decision, not a compliance one |
| `type="tel"` + `inputMode="tel"`         | Numeric keypad on first tap, no hunting                                                                                                                                                                                  |
| `autocomplete="name"` / `"tel"`          | Autofill turns a form into two taps                                                                                                                                                                                      |
| Base font ≥ 16 px on inputs              | Anything smaller triggers iOS auto-zoom on focus                                                                                                                                                                         |
| Never `user-scalable=no`                 | Accessibility failure, and it breaks pinch-zoom on a diagram                                                                                                                                                             |
| Phone as text in a `dir="ltr"` island    | Selectable, callable, and not scrambled by RTL                                                                                                                                                                           |
| No hover-only affordance                 | There is no hover on touch                                                                                                                                                                                               |
| Tables scroll inside their own container | A wide table must never make the page scroll sideways — and the container is `tabIndex={0}`, or a keyboard user cannot scroll it                                                                                         |

**Where the site is under 44 px, and why that is fine:** the footer's dense service and city lists
and its inline text CTAs run about 28 px tall (`inline-block py-1` on `text-sm`). They break no
success criterion today and they clear the 24 px floor WCAG 2.2 AA will bring. **Report them as a
density trade, never as a failure** — the distinction is the difference between an informed decision
and a bug report that sends someone to inflate a 24-item footer into three screens.

**The mobile menu** (`Header`, a client component) closes on Escape, returns focus to its trigger,
scrolls when the panel overflows, and releases the body scroll lock on Escape and at the breakpoint.
**It does not trap focus.** The natural tab order walks into the panel and back out of it; nothing
holds focus inside. Any doc saying otherwise is wrong, and a real trap remains an open improvement.

---

## 3. Anti-patterns — banned on mobile

- **Entry interstitials and exit-intent popups.** Google treats intrusive interstitials as a ranking
  problem, and here they would physically cover the call button.
- **A floating chat widget.** It competes with the sticky bar for the same pixels and the same
  intent, and it adds unbounded third-party JS. If the business ever wants chat, WhatsApp already
  _is_ the chat — it is goal #2 and it is already in the bar.
- **Carousels.** Low engagement, high CLS, and they hide content from answer engines.
- **Accordions hiding primary content.** FAQs are fine — an answer engine reads the DOM either way,
  but a person triaging a fault should not have to hunt.
- **Anything that shifts layout after paint.** See §5.

---

## 4. Personalization — what is actually possible here

> **The honest starting point: this is a static export on Cloudflare Pages. There is no server, no
> middleware, no API route, and no request-time rendering.** Every page is one HTML file, identical
> for every visitor on Earth.

That rules out server-side personalization entirely, and it is the single fact that most
personalization proposals ignore.

| Approach                                | Available?              | Verdict                                                                                                                                               |
| --------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Server-side render per visitor          | ❌ `output: "export"`   | Impossible without abandoning static export                                                                                                           |
| Next middleware / API route             | ❌ forbidden by export  | Impossible                                                                                                                                            |
| **Cloudflare Pages Functions / Worker** | 🟡 technically possible | **Owner + Sys Admin decision.** Changes the deploy shape, adds an origin to reason about, and is not in this repo today. Do not add one unilaterally. |
| `navigator.geolocation`                 | 🟡 yes, with a prompt   | **Rejected.** A permission dialog in front of a person with water on the floor is hostile, and most will deny it.                                     |
| Third-party IP-geolocation API          | 🟡 yes                  | Costs a blocking request, adds a processor to `/מדיניות-פרטיות/`, and buys city-level accuracy we barely need. High bar.                              |
| **Client-side, additive, after paint**  | ✅ yes                  | **The only sanctioned approach.** §5.                                                                                                                 |

### 4.1 Why aggressive geo-swapping is dangerous here, not just hard

1. **The crawler sees the default.** Googlebot crawls from a fixed location. If the H1 says
   "תיקון דודים בתל אביב" only for Tel Aviv IPs, Google indexes the generic version and the
   personalization earns nothing.
2. **Divergence between crawler and user content is cloaking-adjacent.** Even when well-intentioned,
   serving materially different main content by IP is the pattern search guidelines exist to catch.
3. **We already solved this the right way.** There are **18 real city pages** with genuinely
   city-specific material, each with its own canonical, schema and `areaServed`. Personalization
   would be a worse, invisible version of an asset that already ranks.
4. **It fights our own honesty rules.** "טכנאי באזור שלך" rendered from an IP lookup is a coverage
   claim, and coverage is `⬜ authored, not verified` in
   [entity-profile.md](entity-profile.md).
5. **It costs CLS**, which is currently near-perfect.

---

## 5. The sanctioned envelope

Any personalization must satisfy **all** of these. One failure means it does not ship.

- [ ] **Additive only.** It may _add_ a suggestion. It may never _replace_ main content.
- [ ] **Never touches** the `<h1>`, `<title>`, meta description, canonical, JSON-LD, breadcrumbs or
      nav. Those are the indexed surface and they stay identical for everyone.
- [ ] **After paint**, in a client component, with **space reserved** so CLS stays 0.
- [ ] **Degrades to nothing.** No geo signal, no JS, blocked storage → the page is complete and
      correct without it.
- [ ] **No new blocking request** on the critical path.
- [ ] **No new third-party processor** unless it lands in `/מדיניות-פרטיות/` in the same change.
- [ ] **Asserts no business fact** — no coverage, arrival time, or presence claim.
- [ ] **Dismissible**, and the dismissal remembered in `localStorage`.
- [ ] **Measured** with its own `data-cta`, so it can be proven to work or removed.

### 5.1 Patterns that pass

| Pattern                              | Note                                                                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **"Nearest city" suggestion strip**  | A dismissible link to the closest of the 18 city pages. Additive, links to a real indexed URL, asserts nothing. The best available option. |
| **Service prefilled from the route** | Already shipped — `LeadForm` takes `defaultService` from the service page. Deterministic, in the HTML, zero risk.                          |
| **Remembering a dismissal**          | Consent banner already does this correctly.                                                                                                |
| **Returning-visitor CTA emphasis**   | Purely visual, no content change.                                                                                                          |

### 5.2 Patterns that fail

| Pattern                                     | Fails on                                                                                                                 |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Swapping the city name in the H1 by IP      | Cloaking-adjacent · invisible to crawlers · CLS                                                                          |
| "טכנאי זמין עכשיו ב<עיר>"                   | Fabricated coverage **and** availability claim                                                                           |
| Live "open now / closed now" from the clock | The hours themselves are `⬜ unconfirmed` in the roster — rendering them as a live status presents an assumption as fact |
| Countdown timers / fake urgency             | Fabricated scarcity                                                                                                      |
| Auto-redirect to a city page by IP          | Breaks the back button, breaks crawling, breaks canonicals                                                               |

---

## 6. Acceptance checks

- [ ] Sticky bar present on every page below `lg`; never overlaps footer or is overlapped by the
      consent banner. **Verified in the source**: `fixed inset-x-0 bottom-0 lg:hidden` on the bar, a
      `h-16 lg:hidden` spacer in `app/layout.tsx`, and `bottom-16 lg:bottom-0` on the banner.
- [ ] Every **primary CTA** ≥ 44 px. The dense footer lists and the footer's inline text CTAs are
      smaller by design — see §2. ⚠️ **The 320 px check has never been run in a rendered browser**;
      no browser automation is installed here, so this box is currently reasoned, not observed.
- [ ] Form completable with autofill in under 15 seconds on a phone.
- [ ] No layout shift after paint on any page (CLS ≤ 0.05) — likewise unmeasured in the field; the
      structural defences (fixed banner, no raster images, no late-mounting content) are in place.
- [ ] `grep -rl 'user-scalable=no' out` is empty.
- [ ] Any personalization present satisfies **every** box in §5.
- [ ] Any personalization present satisfies **every** box in §5.
