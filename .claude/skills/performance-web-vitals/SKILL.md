---
name: performance-web-vitals
description: Core Web Vitals for hambabait's static export — the measured bundle (1.1 MB of _next/static, 30 JS files, a 53.5 kB-gzip largest chunk, one 8.7 kB-gzip CSS file), the text LCP and what an image would cost it, images.unoptimized with no assets/ pipeline and no image:optimize script, the site-kit media helpers that ship but are unused, font loading via next/font, CLS reserves, and the INP client-JS budget of five client components. Use before shipping or when LCP, CLS or INP regress. Triggers: "perf pass", "Core Web Vitals", "LCP slow", "image optimization", "bundle size", "srcset", "why is the page heavy".
---

# Core Web Vitals

Targets: **LCP < 2.5s**, **CLS < 0.1**, **INP < 200ms**, measured on a mid-range Android over 4G —
not on your laptop.

A static export starts with a big advantage: no server think-time, no hydration of a data layer, no
runtime image service. Most regressions here come from images and from adding client components.

## What the build actually weighs — measured, not estimated

From a fresh `out/`. Treat these as the baseline; a change that moves one materially needs a reason.

| Thing                | Measured                                                               |
| -------------------- | ---------------------------------------------------------------------- |
| `out/` total         | 6.9 MB (47 HTML pages + 404.html; HTML alone is 3.96 MB)               |
| `out/_next/static`   | **1.1 MB** — chunks 791 KB, css 40 KB, the rest fonts/media            |
| JS files             | **30**, 761,779 B raw in total                                         |
| Largest chunk        | `chunks/fd9d1056-*.js` — **172,834 B raw / 53,531 B gzip**             |
| Next two             | `framework-*.js` 139,978 / 44,765 · `117-*.js` 124,635 / 31,875        |
| CSS                  | one file, `css/bfd486868f844bed.css` — **40,451 B raw / 8,723 B gzip** |
| Shared First Load JS | **87.5 kB** (Next's own report)                                        |
| `out/index.html`     | **184,799 B raw / 25,205 B gzip**                                      |
| Largest font         | `0a86735c6520d94f-s.p.woff2` — 35,324 B                                |
| Raster images        | **zero** — `grep '<img' out` returns nothing across all HTML           |

Two things to read off that table:

- **The homepage HTML is the single largest document the browser downloads on first paint** (25 kB
  gzip), ahead of any one JS chunk. Most of it is content, plus Next's serialised Flight payload. Copy
  added to the homepage is a real first-paint cost, not free text.
- **CSS is one 8.7 kB-gzip file.** Tailwind v4 with `@theme` in `app/globals.css` is doing its job.
  Adding a second stylesheet or a component-level CSS file would be a regression, not a refactor.

## Images — know what this repo actually has

`next.config.mjs` sets `images: { unoptimized: true }`, which is mandatory for `output: "export"`.
The practical consequences:

- **`next/image` does not resize, reformat or generate `srcset`.** Whatever byte you ship is what the
  browser downloads, at every viewport.
- **There is no `assets/` originals pipeline in this repo and no `npm run image:optimize` script.**
  The eight npm scripts are `dev`, `build`, `start`, `lint`, `format`, `format:check`, `typecheck`,
  `qa:gate`. If a fleet doc mentions an image script, it is describing a different site.
- So optimisation is **manual today**: produce WebP at sensible widths and put it in `public/`.

`@ishub/site-kit` ships a media layer — `mediaUrl`, `srcsetFor`, `srcFor`, `preloadPropsFor`,
`widthsFor`, plus a `SiteImage` component — and **none of it is imported anywhere in this repo**.
That is the available upgrade path: route images through the kit's transform helpers (they target a
CDN image endpoint) instead of shipping fixed files. Turning it on is a real change with a real host
dependency — scope it deliberately, do not half-wire it.

`SiteImage` also enforces rules a hand-written `<img>` does not get: `alt=""` is a compile error,
`width`+`height` are always emitted, SVG is never routed through the transform.

## LCP — currently text

**The LCP element on this site is text**, because there are no images at all. That is the fastest
possible starting point and it sets the bar for anything added:

- **Any hero image can only make LCP worse.** Budget for that explicitly before adding one — measure
  before and after, and be willing to revert.
- If an image does land in the hero: **reserve space** (explicit `width`/`height` or an
  aspect-ratio box), **preload it**, and never `loading="lazy"` on it. Lazy-loading the LCP element
  is the classic self-inflicted regression.
- Everything below the fold gets `loading="lazy"` and `decoding="async"`.
- Serve WebP. A hero JPEG over 200 KB is a problem on 4G; aim well under.
- **Never** ship stock photography of technicians or work — that is a staffing claim rendered as an
  image, and the honesty rules apply to pixels.

While LCP is text, the levers are the font stack and the HTML size, not an image pipeline.

## Fonts

Heebo and Rubik load through `next/font/google`, which self-hosts them at build time and emits
`font-display: swap`. That is already the right setup — **do not** replace it with a `<link>` to
Google Fonts, which reintroduces a third-party connection and a render-blocking request. It is also
why `font-src 'self'` is sufficient in the CSP.

Both are loaded with `subsets: ["hebrew", "latin"]`. Dropping `latin` is not safe here — Latin glyphs
appear in phone numbers, the English brand name and URLs.

The largest woff2 is 35 KB. Since the LCP element is text, preloading the heading font is the one
font change worth measuring.

## CLS

Reserve space for anything that arrives or changes late:

- images and icons — explicit dimensions
- the sticky mobile CTA bar — the `h-16 lg:hidden` spacer in `app/layout.tsx` exists for this; do not
  remove it
- **the consent banner** — it is `fixed` and renders only after mount, so it must not push layout.
  It sits above the CTA bar (`z-50` over `z-40`, `bottom-16`). Anything similar must be `fixed` too.
- the FAQ accordion — expanding is user-initiated, so it does not count against CLS, but do not
  animate height on load
- `Reveal` — it animates opacity/transform, which do not trigger layout. Keep it that way; never
  animate `height`, `top` or `margin`.

Fonts are the other classic CLS source. `next/font` handles the swap with a size-adjusted fallback,
which is another reason not to hand-roll font loading.

## INP and the client-JS budget

**Five** components are `"use client"`: `Header`, `Faq`, `LeadForm`, `Reveal`, `ConsentBanner`.
Everything else is a server component rendered to static HTML. **Protect that.**

Rules:

- Adding `"use client"` to a component makes it _and its whole import subtree_ client code. Push the
  boundary as low as possible — a client leaf inside a server parent, never a client page wrapper.
- `IntersectionObserver` in `Reveal` is cheap and already bails under `prefers-reduced-motion`.
- No scroll or resize handler without throttling. Prefer `IntersectionObserver` and CSS. `Header`'s
  breakpoint listener is a `matchMedia` `change` handler that only exists while the menu is open —
  that is the pattern to copy.
- The main thread on a mid-range phone is the constraint. Every added interactive component costs
  hydration time on every page it appears on — and `Header`, `ConsentBanner` and `MobileCtaBar` are
  on all 45.
- A sixth client component needs to justify itself against `docs/performance-guidelines.md`.

`framer-motion` was declared in `package.json` and imported by nothing for a long stretch; it has
since been removed. `Reveal.tsx` hand-rolls the same effect with `IntersectionObserver` and CSS
transitions. If the dependency reappears, one careless `import { motion }` is a large regression —
ask what needs it.

## Caching

`public/_headers` sets `Cache-Control: public, max-age=31536000, immutable` on `/_next/static/*`.
Content-hashed assets are immutable by construction, and without this the zone's observed 4-hour
browser TTL (`max-age=14400, must-revalidate`) made repeat visitors revalidate the entire JS/CSS/font
set every four hours. **If a live response still shows `max-age=14400` after a deploy, the zone's
Browser Cache TTL override is winning** and the fix is at the zone, not in this file.

## Build output hygiene

```bash
npm run build
du -sh out out/_next/static
find out/_next/static -name '*.js' -size +100k -exec ls -lh {} \; | sort -k5 -h
find out -type f \( -name '*.jpg' -o -name '*.png' -o -name '*.webp' \) -size +150k -exec ls -lh {} \;

# gzip transfer size of the biggest offenders
for f in out/_next/static/chunks/*.js out/_next/static/css/*.css out/index.html; do
  printf '%8s  %s\n' "$(gzip -c "$f" | wc -c)" "$f"
done | sort -rn | head
```

`out.prev/` is a full duplicate export sitting untracked in the working tree — it does not affect the
deployed bundle, but it does inflate greps and local disk. Exclude it from any `find` over the repo.

## Measuring — in this order

1. `npm run build`, then serve `out/` locally and run **Lighthouse mobile**. Lab numbers, good for
   catching regressions.
2. **PageSpeed Insights on the live URL** for field data (CrUX), which is what actually counts.
3. Compare `https://hambabait.co.il/` against `https://hambabait.pages.dev/` if you suspect the zone
   rather than the build.

Test the **built output**, never `npm run dev` — dev ships unminified bundles and no static
optimisation, so its numbers are meaningless.

## Before claiming a perf win

- [ ] Measured before and after, same conditions, mobile throttled
- [ ] LCP element identified (not guessed) and not lazy-loaded
- [ ] No new `"use client"` boundary above a leaf
- [ ] No layout-triggering animation added
- [ ] Numbers quoted from the built output or the live site, with the file they came from
