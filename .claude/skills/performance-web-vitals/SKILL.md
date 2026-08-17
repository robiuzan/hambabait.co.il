---
name: performance-web-vitals
description: Core Web Vitals for hambabait's static export — the LCP hero, the fact that images.unoptimized is on with no assets/ pipeline and no image:optimize script in this repo, the site-kit media transform helpers that ship but are unused, font loading via next/font, CLS reserves, the INP client-JS budget with only four client components, and the dead framer-motion dependency. Use before shipping or when LCP, CLS or INP regress. Triggers: "perf pass", "Core Web Vitals", "LCP slow", "image optimization", "bundle size", "srcset", "why is the page heavy".
---

# Core Web Vitals

Targets: **LCP < 2.5s**, **CLS < 0.1**, **INP < 200ms**, measured on a mid-range Android over 4G —
not on your laptop.

A static export starts with a big advantage: no server think-time, no hydration of a data layer, no
runtime image service. Most regressions here come from images and from adding client components.

## Images — know what this repo actually has

`next.config.mjs` sets `images: { unoptimized: true }`, which is mandatory for `output: "export"`.
The practical consequences:

- **`next/image` does not resize, reformat or generate `srcset`.** Whatever byte you ship is what the
  browser downloads, at every viewport.
- **There is no `assets/` originals pipeline in this repo and no `npm run image:optimize` script.**
  The seven npm scripts are `dev`, `build`, `start`, `lint`, `format`, `format:check`, `typecheck`.
  If a fleet doc mentions an image script, it is describing a different site.
- So optimisation is **manual today**: produce WebP at sensible widths and put it in `public/`.

`@ishub/site-kit` ships a media layer — `mediaUrl`, `srcsetFor`, `srcFor`, `preloadPropsFor`,
`widthsFor`, plus a `SiteImage` component — and **none of it is imported anywhere in this repo**.
That is the available upgrade path: route images through the kit's transform helpers (they target a
CDN image endpoint) instead of shipping fixed files. Turning it on is a real change with a real host
dependency — scope it deliberately, do not half-wire it.

`SiteImage` also enforces rules this site is therefore not getting: `alt=""` is a compile error,
`width`+`height` are always emitted, SVG is never routed through the transform. Every `<img>` here is
hand-written and gets none of that.

## LCP

The LCP element is almost always the hero — its heading or its image.

- **Reserve space** for it: explicit `width`/`height` or an aspect-ratio box. This is where CLS is
  won or lost.
- **Preload the hero image** if it is an image, and never lazy-load it. `loading="lazy"` on the LCP
  element is the classic self-inflicted LCP regression.
- Everything below the fold gets `loading="lazy"` and `decoding="async"`.
- Serve WebP. A hero JPEG over 200 KB is a problem on 4G; aim well under.

## Fonts

Heebo and Rubik load through `next/font/google`, which self-hosts them at build time and emits
`font-display: swap`. That is already the right setup — **do not** replace it with a `<link>` to
Google Fonts, which reintroduces a third-party connection and a render-blocking request.

Both are loaded with `subsets: ["hebrew", "latin"]`. Dropping `latin` is not safe here — Latin glyphs
appear in phone numbers, the English brand name and URLs.

If the hero text is the LCP element, preloading the heading font is worth measuring.

## CLS

Reserve space for anything that arrives or changes late:

- images and icons — explicit dimensions
- the sticky mobile CTA bar — the `h-16 lg:hidden` spacer in `app/layout.tsx` exists for this; do not
  remove it
- the FAQ accordion — expanding is user-initiated, so it does not count against CLS, but do not
  animate height on load
- `Reveal` — it animates opacity/transform, which do not trigger layout. Keep it that way; never
  animate `height`, `top` or `margin`.

Fonts are the other classic CLS source. `next/font` handles the swap with a size-adjusted fallback,
which is another reason not to hand-roll font loading.

## INP and the client-JS budget

Only four components are `"use client"`: `Header`, `Faq`, `LeadForm`, `Reveal`. Everything else is a
server component rendered to static HTML. **Protect that.**

Rules:

- Adding `"use client"` to a component makes it _and its whole import subtree_ client code. Push the
  boundary as low as possible — a client leaf inside a server parent, never a client page wrapper.
- `IntersectionObserver` in `Reveal` is cheap and already bails under `prefers-reduced-motion`.
- No scroll or resize handler without throttling. Prefer `IntersectionObserver` and CSS.
- The main thread on a mid-range phone is the constraint. Every added interactive component costs
  hydration time on every page it appears on — and `Header` appears on all 32.

**`framer-motion` is declared in `package.json` and imported by nothing.** `Reveal.tsx` hand-rolls the
same effect with `IntersectionObserver` and CSS transitions. Removing the dependency drops ~2 MB from
`node_modules` for zero behaviour change. It is not currently in the client bundle — but it is one
careless `import { motion }` away from being a large regression.

## Build output hygiene

```bash
npm run build
du -sh out
find out -name '*.js' -size +100k -exec ls -lh {} \; | sort -k5 -h
find out -type f \( -name '*.jpg' -o -name '*.png' -o -name '*.webp' \) -size +150k -exec ls -lh {} \;
```

Also worth knowing: `out/.htaccess` and `out/CNAME` ship as inert static files, and `out.prev/` is a
full duplicate export sitting untracked in the working tree — it does not affect the deployed bundle,
but it does inflate greps and local disk.

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
- [ ] Numbers quoted from the built output or the live site
