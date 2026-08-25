# Media assets — חם בבית

> The image inventory, byte budgets, alt text and provenance. **The site currently ships zero images.**
>
> Cited by `media-asset-producer`, `performance-web-vitals`, `responsive-accessibility`.
> Compiled 2026-08-25.

---

## 0. Current state

`public/` contains exactly two files: `_headers` and `llms.txt`.

| Asset           | State                                                                    |
| --------------- | ------------------------------------------------------------------------ |
| Favicon         | `app/icon.svg` ✅                                                        |
| OG image        | external host, via the manifest `images` block ⚠️ third-party dependency |
| Hero            | ❌ none                                                                  |
| Logo file       | ❌ none                                                                  |
| Service imagery | ❌ none                                                                  |
| Photos of work  | ❌ none                                                                  |
| Diagrams        | ❌ none                                                                  |

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

---

## 5. What can be built honestly: diagrams

Inline SVG diagrams are the safe, high-value asset class here. They illustrate **technical reality**,
which needs no business fact — the same reason the knowledge hub is safe.

| Diagram                                                        | Serves                                     |
| -------------------------------------------------------------- | ------------------------------------------ |
| How a דוד שמש works — collector, tank, backup element          | `/services/solar/`, איך עובד דוד שמש       |
| Where a leak originates — fitting vs connection vs failed tank | `/services/leak-repair/`, `replacement`    |
| What an anode does and how it wears                            | `heating-element`, coastal city pages      |
| Thermostat vs element fault decision tree                      | `thermostat` ↔ `heating-element` blur pair |
| Symptom → likely cause                                         | the symptom guides                         |

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

Alt text is an **accessibility obligation first**, and it is legally in scope: the site publishes a
statement referencing ת״י 5568 and WCAG.

---

## 7. Inventory

| File           | Route | Purpose  | Dimensions | Budget | Actual | Alt | Type   | Provenance                     |
| -------------- | ----- | -------- | ---------- | ------ | ------ | --- | ------ | ------------------------------ |
| `app/icon.svg` | all   | favicon  | —          | —      | —      | —   | vector | in repo                        |
| _(external)_   | all   | OG image | 1200×630   | 200 KB | —      | —   | photo  | ⚠️ external host, via manifest |

**The provenance column is what stops a stock photo drifting into the site six months from now.** Every
row must name where the asset came from and who owns it.

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
