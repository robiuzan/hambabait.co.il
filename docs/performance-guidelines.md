# Performance guidelines — חם בבית

> Core Web Vitals budgets, what may spend them, and the caching and asset rules that keep a static
> export fast. Cited by `perf-a11y-auditor`, `performance-web-vitals`, `media-asset-producer`,
> `rtl-frontend-engineer`.
> Measured 2026-08-31 against a fresh `out/`.

---

## 0. The starting position is unusually good — protect it

The hero renders **type, not an image**. There is no raster image anywhere on the site. That makes
the LCP element text, which is about as fast as LCP gets.

> **Almost every "improvement" proposed for this site makes performance worse.** A hero image, a
> gallery, a chat widget, an animation library, a second font — each one spends a budget that is
> currently unspent. That does not make them wrong. It makes them **trades that must be stated as
> trades**, with the cost named before the work starts.

---

## 1. Budgets

### 1.1 Field targets (the ones that count)

| Metric   | Target   | Hard fail | Notes                                                         |
| -------- | -------- | --------- | ------------------------------------------------------------- |
| **LCP**  | ≤ 2.0 s  | > 2.5 s   | Currently a text node. Any image hero must be measured first. |
| **CLS**  | ≤ 0.05   | > 0.1     | Highest risk: the consent banner and any late-mounting UI.    |
| **INP**  | ≤ 150 ms | > 200 ms  | Low risk — five client components, no heavy interaction.      |
| **TTFB** | ≤ 400 ms | > 800 ms  | Cloudflare edge; zone-owned, not ours.                        |

**Label every measurement lab or field.** A Lighthouse run on a fast laptop is not evidence about
real users. CrUX is the authority; lab numbers are for regression detection only.

### 1.2 Asset budgets — measured on disk, uncompressed

The host serves brotli, so transfer is materially smaller. The raw column is the number the build
produces and the one we gate on; the gzip column is there so nobody mistakes the raw figure for what
a visitor downloads.

| Asset                    | Raw (2026-08-31) | gzip     | Budget (raw)                      |
| ------------------------ | ---------------- | -------- | --------------------------------- |
| `out/_next/static` total | 1.1 MB           | —        | ≤ 1.4 MB                          |
| All JS (30 files)        | 761,779 B        | —        | ≤ 900 KB                          |
| Largest JS chunk         | 172,834 B        | 53,531 B | ≤ 200 KB                          |
| CSS (single file)        | 40,451 B         | 8,723 B  | ≤ 60 KB                           |
| Homepage HTML            | 184,799 B        | 25,205 B | ≤ 220 KB                          |
| Largest font (woff2)     | 35,324 B         | —        | already compressed                |
| Any single raster image  | —                | —        | **≤ 150 KB**, WebP, and justified |
| Total images per page    | —                | —        | **≤ 400 KB**                      |

The whole of `out/` is 6.9 MB, of which the 48 HTML files are 3.96 MB. Next after the largest chunk:
`framework-*.js` at 139,978 B raw / 44,765 gzip, then `117-*.js` at 124,635 / 31,875.

```bash
du -sh out/_next/static
find out/_next/static -name '*.js' -printf '%s %p\n' | sort -rn | head -5
ls -l out/index.html
```

> The homepage HTML is large for a text page because every icon is **inline SVG**. That is a
> deliberate trade — inline SVG costs HTML bytes but zero requests and zero CLS, and it compresses
> extremely well (25 KB gzip against 185 KB raw is a 7.3× ratio). Do not "fix" it by moving icons to
> sprite files or an icon font.

**Two recent changes spend a little of this budget on purpose, and both are worth it:**

- **`assertManifest()` in `lib/site-config.ts`** runs at module load and validates the manifest
  shape. `site-config` is imported by client components, so the guard ships in the client bundle —
  a small, bounded cost. It buys a **build-time** failure for a malformed `site.config.json` instead
  of a runtime failure in a visitor's browser, on a file that is synced in from outside this repo.
- **The lead form's always-mounted `role="alert"` region** adds an empty element to the HTML of
  every page carrying the form. Inserting a live region at the same instant as its message is the
  classic way to get it never announced; mounting it empty is what makes errors reliably spoken.

Neither is large. Both are the kind of cost that should be **named** rather than discovered later by
someone comparing chunk sizes.

---

## 2. Images

**There is no image pipeline in this repo, and there cannot be one.** `next.config.mjs` sets
`images: { unoptimized: true }` — mandatory under `output: "export"` — and there is no
`image:optimize` script among the seven npm scripts and no `assets/` directory.

> **Whatever lands in `public/` is exactly what the user downloads.** Nothing will resize a 4 MB
> phone photo. Every byte is hand-managed.

Rules:

1. **Optimise before committing.** WebP, correctly sized for its largest rendered box, ≤ 150 KB.
2. **Always `width` and `height`** (or an aspect-ratio box). A missing intrinsic size is a CLS bug.
3. **Prefer the kit's `SiteImage`** over a hand-rolled `<img>` — it makes `alt` structurally required
   and always emits dimensions. It ships today and is unused.
4. **Hebrew `alt` on anything meaningful; `alt=""` on anything decorative.** No filenames as alt text.
5. **`loading="lazy"` on everything below the fold; never on the LCP element.**
6. **A hero image must be measured before and after.** If LCP regresses past 2.0 s, it does not ship.
7. **Inline SVG for diagrams** — the honest, cheap visual asset class this site already uses.
8. **Never stock photography of technicians or work.** That is an E-E-A-T rule, not a perf rule, but
   it is the most common way an image gets proposed. See [eeat-and-trust.md](eeat-and-trust.md) §1.

---

## 3. Fonts

Two families, loaded via `next/font/google` in `app/layout.tsx`: **Heebo** (body) and **Rubik**
(headings), both with `subsets: ["hebrew", "latin"]` and `display: "swap"`.

- `next/font` self-hosts and preloads — **no runtime request to Google Fonts.** Do not replace it
  with a `<link>`.
- **A third font family does not ship.** Two is already the ceiling for a site whose LCP is text.
- Do not add weights that no component uses. Each weight is a separate file.
- `display: "swap"` is deliberate: a flash of fallback text beats invisible text on a slow
  connection, and a person mid-fault needs to read the phone number.

---

## 4. JavaScript

**Five client components, and that is the budget:** `Header`, `Faq`, `LeadForm`, `Reveal`,
`ConsentBanner`. Everything else is a Server Component and ships no JS.

Adding a sixth requires an answer to: _does this genuinely need state, an effect, or a browser API?_
If it needs none of those, it is a Server Component.

- **No animation library.** `framer-motion` was removed after shipping as a dead dependency;
  `Reveal.tsx` hand-rolls the same effect with `IntersectionObserver` for no bytes.
- **Keep client components leaf-level.** A `"use client"` high in the tree drags its whole subtree
  into the bundle.
- **No polyfills for browsers we do not support.**
- **No third-party widget** — chat, review carousel, booking embed — without an explicit budget
  decision. Each is a new origin, a new connection, and unbounded third-party JS.

---

## 5. Third parties

**GTM is the single largest third-party cost on the site**, and it is the only one on the critical
path.

- The container is the **shared Israeli fleet container** `GTM-KWGGH438` — its weight is not fully
  under our control, and changes affect other sites.
- Consent Mode v2 defaults to `denied`, which means most tags do not fire for most visitors until
  they accept. **That is a performance benefit as well as a legal one.**
- `<link rel="preconnect">` ships for the `mediaHost` only. Preconnect is a finite resource — three
  or four is the practical ceiling, and each unused one is pure waste.
- **Never add a second tag manager or a second analytics script.** See
  [data-tracking-infrastructure.md](data-tracking-infrastructure.md).

---

## 6. Caching

`public/_headers` (Cloudflare Pages only) sets one rule:

```
/_next/static/*
  Cache-Control: public, max-age=31536000, immutable
```

Content-hashed build assets are immutable by construction. Without this, the zone's observed 4-hour
browser-cache TTL (`max-age=14400, must-revalidate`) makes repeat visitors revalidate the entire
JS/CSS/font set every four hours.

> **If a deploy does not change the live `Cache-Control` on a `/_next/static/` asset, the zone's
> Browser Cache TTL override is winning and this needs a zone-level fix.** Verify, do not assume:
>
> ```bash
> curl -sSI https://hambabait.co.il/_next/static/css/<hash>.css | grep -i cache-control
> ```

HTML must **not** be cached long — a stale HTML page pinned for hours makes every deploy invisible.

---

## 7. CSS

Tailwind v4, CSS-first. Tokens live in `@theme` in `app/globals.css`. **There is no
`tailwind.config.ts` and there must not be.**

- One stylesheet, generated. Do not add a second entry point.
- No CSS-in-JS — it would ship a runtime for zero benefit here.
- No `!important` outside the deliberate `prefers-reduced-motion` block.
- Use the `@theme` tokens; never hardcode brand hex in a component.

---

## 8. The regression gate

Before any change that touches assets, fonts, client components or third parties:

1. Record the §1.2 numbers **before**.
2. Make the change.
3. `npm run build` and record them **after**.
4. State the delta in the PR or the hand-back. A change that grows the largest chunk by 20 % and says
   nothing about it is the failure this gate exists to catch.
5. If a budget is exceeded, either bring it back under or **state explicitly what was bought with the
   overspend** and get that trade accepted.

`npm run qa:gate` (25 assertions over `out/`) runs the correctness half and fails the release gate
when one breaks. **It asserts nothing about bytes** — no size assertion exists, which is exactly why
this section is a discipline rather than a gate, and why step 4 above is the whole mechanism.
