# Media assets — חם בבית

> The image inventory, byte budgets, alt text and provenance. **The site ships zero photographs.**
>
> Cited by `media-asset-producer`, `image-art-director`, `performance-web-vitals`,
> `responsive-accessibility`. Compiled 2026-08-25 · updated 2026-09-01.

---

## 0. Current state

`public/` contains exactly two files: `_headers` and `llms.txt`.

| Asset           | State                                                                          |
| --------------- | ------------------------------------------------------------------------------ |
| Favicon         | `app/icon.svg` ✅                                                              |
| OG image        | `hambabait/og.jpg` in the Media Studio catalog, served from `imgquarry.com` ✅ |
| Diagrams        | 4 inline SVGs in `components/marketing/GuideDiagram.tsx`, on 4 guides ✅       |
| Hero            | ❌ none                                                                        |
| Logo file       | ❌ none                                                                        |
| Service imagery | ❌ none                                                                        |
| Photos of work  | ❌ none                                                                        |

**Who does what.** `media-asset-producer` owns this file, the byte budgets, the diagrams and the
markup. `image-art-director` decides whether a photograph belongs in a given slot at all and, when
one does, writes the prompt file that produces it — see §1a. The art director never writes markup
and never edits `site.config.json`.

---

## 1. The two constraints that shape everything

### No pipeline

`next.config.mjs` sets `images: { unoptimized: true }` — **mandatory** under `output: "export"` — and
there is **no `image:optimize` script** among the seven npm scripts. There is no `assets/` directory.

**Whatever lands in `public/` is exactly what users download.** Every byte is hand-managed; nothing
will resize a 4 MB phone photo for you.

### The LCP is currently text

The hero renders type, not an image. That makes LCP about as fast as it can be.

> **Adding a hero image can only make LCP worse.** It may still be worth it — for conversion, for
> E-E-A-T, for the credibility of showing real work — but that cost is stated and budgeted, never
> slipped in as a free improvement. Measure before and after, and be willing to revert.

---

## 1a. The one pipeline that does exist: the Media Studio

§1 is about this **repo**, and it stays true: nothing here resizes, converts or budgets a file. But
raster assets do not have to live in `public/`. The fleet's Media Studio already carries this site:

```
Media Studio/prompts/hambabait/<slot>.md      the prompt — the approval unit, committed
        │  owner sets approved: (never an agent)
        ▼
scripts/generate-image.mjs → tmp/generated/   a FILE. No upload, no R2, no D1.
        │  studio-api.ps1 -Action Upload      EXIF stripped · sha256 · history/ archive · replace guards
        ▼
R2 → imgquarry.com/<key>                      transformed at the edge by /cdn-cgi/image/
        │  ops/sync-media.ps1
        ▼
roster/sites/hambabait.json + site.config.json   the images block: key, dimensions, alt, altHe
```

The manifest's `images` block is already wired: `mediaHost: "imgquarry.com"`, `defaultQuality: 80`,
`og.key: "hambabait/og.jpg"` (1200×630, 39,026 bytes, sha256 on file), `badges: []`, `gallery: null`.

Three rules this pipeline imposes, none of them optional:

- **`images.key` is immutable.** Replacing a photo is an overwrite at the **same key**. The Media
  Studio refuses a replacement that changes the aspect ratio by more than ±0.01 or that is narrower
  than the original, because deployed HTML carries baked `width`/`height`.
- **Hebrew alt is enforced at publish**, because `sites.dir = 'rtl'` for this domain. `altHe` is not
  a nicety here; the route rejects the publish without it.
- **`site.config.json` is written by `ops/sync-media.ps1`, never by hand** — the same golden rule 3
  that governs the rest of the manifest.

Provenance for anything that comes through this path is **"AI-generated from
`Media Studio/prompts/hambabait/<slot>.md`"**. It is never "a photo of our work", and §4 explains why
that distinction is the whole point.

---

## 2. Use `SiteImage`. Do not hand-roll `<img>`.

`@ishub/site-kit/components` exports `SiteImage`, built for exactly this situation and **shipping
unused today**. That is the gap — not a reason to write something new.

What it guarantees, per its source:

- Server component, no client JS; safe inside a client component
- Plain `<img>`, because every fleet site is `output: "export"` with `images.unoptimized`
- **`alt` is structurally required — `alt=""` is a compile error.** Decorative art must pass
  `decorative`, so intent is explicit and reviewable
- `width` + `height` always emitted → **zero CLS**
- `priority` → `fetchpriority=high` + eager; otherwise `loading=lazy` + `decoding=async`
- SVG never routed through a rasterizer
- A local `/`-prefixed src is served verbatim with **no srcset** — a static export has no resizer, and
  advertising widths the origin cannot produce would be a lie
- `preferHebrewAlt` defaults to **true** in this fleet

Read `node_modules/@ishub/site-kit/src/components/SiteImage.tsx` before use. **The kit's README is
stale about its contents — verify against source.**

---

## 3. Byte budgets

| Asset                   | Format     | Max bytes  | Notes                            |
| ----------------------- | ---------- | ---------- | -------------------------------- |
| Hero (mobile render)    | WebP       | **120 KB** | `priority`, exactly one per page |
| Section / service image | WebP       | 80 KB      | lazy                             |
| OG image                | JPG or PNG | 200 KB     | 1200×630                         |
| Inline SVG diagram      | SVG        | 15 KB      | inlined, no network request      |
| Favicon                 | SVG        | —          | already shipped                  |

Total image weight per page: **≤ 250 KB**. If a page needs more, it probably needs fewer images.

---

## 4. ⛔ Never fabricate visual evidence

This is the media form of the site's claims rule, and it is harder to audit than text.

**Never:**

- present stock photography as this business's own work
- generate or source an image of a technician, van, team, certificate or completed job and let it read
  as documentary
- create a logo-like badge implying a certification that does not exist

A stock photo of a smiling technician is a **staffing claim**. `docs/business-facts.md` §3.5 records
that the site has **no evidence any technician exists**. Publishing one is fabrication rendered as a
JPEG.

Real photos are an **owner action**. Document the request; do not fill the hole.

### The narrow envelope a photograph may occupy

Because of the above, the only subject matter this site may honestly photograph — generated or
otherwise — is **equipment and physical reality**: a boiler, a solar collector on a rooftop, a
corroded anode rod, a scaled heating element, a burnt thermostat, a ceiling hatch, a roof.

**No people in frame. None** — not a technician, not a crew, not a customer, and not a pair of hands
performing a repair. Sibling fleet sites allow approved brand characters; this one does not, and
`Media Studio/refs/` has no `hambabait` directory precisely because there is nothing to keep
consistent. Also out: vans, uniforms, branded workwear, signage, logos, livery, any lettering in the
frame, any price, and any framing that reads as a specific job this business performed.

`image-art-director` enforces this envelope at the prompt, before an image exists.

---

## 5. What can be built honestly: diagrams

Inline SVG diagrams are the safe, high-value asset class here. They illustrate **technical reality**,
which needs no business fact — the same reason the knowledge hub is safe.

| Diagram                                                        | `GuideDiagramName`      | State                                   |
| -------------------------------------------------------------- | ----------------------- | --------------------------------------- |
| How a דוד שמש works — collector, tank, backup element          | `solar-system`          | ✅ shipped                              |
| Where a leak originates — fitting vs connection vs failed tank | `leak-origin`           | ✅ shipped                              |
| What an anode does and how it wears                            | `anode-wear`            | ✅ shipped                              |
| Thermostat vs element fault decision tree                      | `thermostat-vs-element` | ✅ shipped                              |
| Symptom → likely cause                                         | —                       | ❌ not drawn; would need a union member |

The union is typed in `lib/guides.ts`; a guide opts in through its optional `diagram` field, and the
SVGs live in `components/marketing/GuideDiagram.tsx`. **Check the union before proposing a fifth** —
adding a diagram means adding a member, not a parallel set.

**Rules:** inline SVG · `role="img"` with a Hebrew `<title>` · real `<text>` elements where possible ·
**RTL-correct reading order** · legible in light and dark · never colour as the sole carrier of
meaning · `@theme` tokens only.

> Token note: `--color-accent` is `#16833e` and passes AA on white at **4.83:1**. The bright brand
> `#61ce70` fails at **1.99:1** and belongs only on dark backgrounds. Do not swap them.

A diagram is also an **AEO asset** — it anchors a concept an answer engine is explaining, and gives the
page something no competitor's templated text has.

---

## 6. Alt text

Hebrew, specific, describing **what is in the image and why it is here**.

|     |                                                                                                                        |
| --- | ---------------------------------------------------------------------------------------------------------------------- |
| ❌  | `alt="דוד"` — true and useless                                                                                         |
| ❌  | `alt="תיקון דודים חם בבית תיקון דוד שמש"` — keyword stuffing; reads as spam to screen readers and search engines alike |
| ✅  | `alt="תרמוסטט שרוף שהוצא מדוד חשמל, עם סימני חריכה על המגעים"`                                                         |

Alt text is an **accessibility obligation first**, and it is in scope regardless of what the site
says about itself. `/הצהרת-נגישות/` was rewritten to claim **no** conformance with ת״י 5568 or WCAG —
it now states only what was actually checked, with a date. That lowers nothing: bad alt text is a
real defect rather than merely a broken promise, and **that page must never be cited as evidence the
site is accessible.**

Alt text also carries claims. Years of experience, response times, ratings, customer counts and
warranty terms are unsourced on this site ([docs/business-facts.md](business-facts.md)) — an `alt`
attribute is not a hiding place for one.

---

## 7. Inventory

| File / key         | Route    | Purpose  | Dimensions | Budget     | Actual   | Alt                               | Type   | Provenance                                                                |
| ------------------ | -------- | -------- | ---------- | ---------- | -------- | --------------------------------- | ------ | ------------------------------------------------------------------------- |
| `app/icon.svg`     | all      | favicon  | —          | —          | —        | —                                 | vector | in repo                                                                   |
| `hambabait/og.jpg` | all      | OG card  | 1200×630   | 200 KB     | 39,026 B | `images.og.altHe` in the manifest | raster | Media Studio catalog → `imgquarry.com`; 🔶 origin of the bytes unrecorded |
| `GuideDiagram.tsx` | 4 guides | diagrams | —          | 15 KB each | inline   | Hebrew `<title>` per diagram      | vector | hand-drawn in repo                                                        |

**The provenance column is what stops a stock photo drifting into the site six months from now.** Every
row must name where the asset came from and who owns it. For anything the Media Studio generates,
provenance is the prompt file path — `Media Studio/prompts/hambabait/<slot>.md` — and never "a photo
of our work".

---

## 8. `ImageObject` schema

Only where a real image actually renders on that page. **Never** for an image that does not exist, and
never for stock. Build with `@ishub/site-kit/seo` helpers — never hand-write JSON-LD.

---

## 9. Verification

```bash
npm run build
find out -name '*.webp' -o -name '*.jpg' -o -name '*.png' | xargs -r ls -la   # every shipped image + size
grep -rc '<img' out/index.html
```

Confirm: every `<img>` has `alt`, `width` and `height`; exactly one `priority`/eager image per page;
LCP measured before and after any hero change.
