---
name: new-article
description: Add a guide to hambabait's existing Hebrew knowledge hub at /מדריכים/[slug]/ — the typed Guide and GuideBlock model in lib/guides.ts, business attribution with real published/updated dates, the answer block that opens every guide, Article + FAQPage + BreadcrumbList schema assembled in the route, the hand-maintained llms.txt entry, and the in-degree-1 problem every new guide inherits. Use when adding editorial content for topical authority and AEO. Triggers: "write an article", "blog post", "knowledge hub", "מדריך", "topical authority", "guide", "add a blog".
---

# Add a guide to the knowledge hub

## Status: the hub exists

`/מדריכים/` shipped with **12 guides** across four clusters. The index plus the 12 slug routes are
**13 of the site's 45 indexable URLs**, and all 13 emit JSON-LD.

| Cluster      | Label           | Guides | Slugs                                                                            |
| ------------ | --------------- | ------ | -------------------------------------------------------------------------------- |
| `symptom`    | תקלות ותסמינים  | 5      | no-hot-water · lukewarm-water · tripping-breaker · leaking-boiler · noisy-boiler |
| `comparison` | השוואות והחלטות | 2      | solar-vs-electric · repair-or-replace                                            |
| `definition` | איך זה עובד     | 3      | what-is-anode · how-thermostat-works · how-solar-boiler-works                    |
| `seasonal`   | לפי עונה        | 2      | winter-boiler-check · why-boilers-fail-in-winter                                 |

So this is a **content task on a working model**, not a feature. Adding a guide means appending one
typed object to `lib/guides.ts` and one line to `public/llms.txt`. Nothing else needs building.

## Why the hub is the right place to invest

hambabait has **no address, no geo, no reviews, an empty `sameAs` and no GBP** — its entity signals
are close to nil. Editorial depth is the one lever fully inside the repo's control that requires the
owner to confirm no business fact at all.

Technical explanation is also the **only safe citation surface**: how a solar boiler works, why an
element fails, what an anode does. None of it touches the unsourced warranty/speed claims in
`docs/business-facts.md` §3, or the published prices in §1a. See `aeo-answer-content`.

That is also why the guides are the only pages on the site carrying a date and an author — they are
the natural home for freshness and authorship signals, and they carry them honestly.

## The data model — `lib/guides.ts`

Copy is data in the content layer, never typed into JSX. `guides.ts` lives beside `content.ts` rather
than inside it because `content.ts` already carries the marketing copy, the six `serviceDepth` entries
and the eighteen `cityContent` entries.

```ts
export type GuideBlock =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | {
      kind: "table";
      caption: string; // rendered as a real <caption> — screen readers announce it
      head: [string, string];
      rows: [string, string][];
    }
  | { kind: "callout"; tone: "warning" | "info"; text: string };

export type GuideCluster = "symptom" | "comparison" | "definition" | "seasonal";

export type GuideDiagramName =
  "solar-system" | "leak-origin" | "anode-wear" | "thermostat-vs-element";

export interface Guide {
  slug: string; // English, lowercase, hyphenated
  title: string; // pre-template — NEVER append the brand
  heading: string; // the H1; may differ from the meta title
  cluster: GuideCluster;
  description: string; // 140–160 chars, unique, no claim the body does not make
  published: string; // ISO
  updated: string; // ISO — a real edit only
  answer: { question: string; body: string };
  diagram?: GuideDiagramName;
  blocks: GuideBlock[];
  faqs: Faq[]; // { q, a } — the interface from lib/content.ts
  relatedServices: ServiceSlug[]; // every guide must route to a commercial page
}
```

Notes that bite:

- The `table` block is **fixed at two columns** (`head: [string, string]`). A three-column comparison
  needs the type widened first — do not fake it with a list.
- `diagram` accepts only the four names above. A fifth needs an inline SVG added to
  `components/marketing/GuideDiagram.tsx`. **Technical diagrams only** — never a photograph of work or
  people, which is a business claim rendered as an image (`docs/media-assets.md` §4). The site ships
  zero raster images today and the current LCP is text; keep it that way.
- `faqs` reuses the `Faq` interface exported by `lib/content.ts`. Do not declare a second one.
- `relatedServices` is **not optional**. A guide with no way out is a dead end.

## What follows automatically, and what does not

Append a `Guide` and these update themselves:

- `app/מדריכים/[slug]/page.tsx` → `generateStaticParams()` maps `guides`, so the route prerenders.
- `app/מדריכים/page.tsx` → the index groups by cluster and lists it.
- `app/sitemap.ts` → the `<loc>` appears, `encodeURI`'d, with `lastModified: new Date(g.updated)` —
  the guides are the **only** sitemap entries carrying a real modification date rather than build time.
- The `Article` + `FAQPage` + `BreadcrumbList` JSON-LD, assembled in the route from the object.

**`public/llms.txt` does NOT update itself.** It is a hand-written static file, currently at 45/45
coverage of the sitemap. Add the guide under its cluster heading in the `## מדריכים` section, or
coverage silently drops to 45 of 46. See `aeo-answer-content`.

## Authorship — settled, and it stays settled

`author` and `publisher` are the **business**, joined by `@id` to the homepage `Plumber` node. There is
no named author anywhere on this site and `docs/business-facts.md` §3.5 records no evidence that any
specific technician exists.

> **Never invent a byline.** No fabricated technician name, no credential, no "נבדק על ידי מומחה".

A named human author is a genuine E-E-A-T upgrade, but it needs a real person the owner confirms —
`🔶 confirm` plus a row in `docs/business-facts.md`, not a decision made while writing.

Dates are real and visible: the route renders `עודכן ב־<dd/mm/yyyy>` inside a `<time dateTime>` with
`dir="ltr"`, and `dateModified` in the markup matches it. Set `updated` only for a substantive edit —
a date the reader can see must be a date that means something.

## Guide structure

1. **The answer block opens the page.** `answer.question` is an H2 in the reader's own phrasing;
   `answer.body` is a self-contained direct response, no preamble. The 12 existing bodies run
   **32–47 words** (median 39). Self-contained and extractable is the bar; the word range is guidance,
   not a gate — see `aeo-answer-content`.
2. **Optional diagram** immediately after, where it explains the mechanism the answer just described.
3. **`blocks[]`** — `heading` blocks the whole way down, each followed by prose that answers the
   heading first.
4. **A `table` block for any comparison.** Tables are lifted by answer engines far more reliably than
   prose, and the `caption` doubles as the accessible name.
5. **`callout` with `tone: "warning"`** for the stop-and-call-someone line (see below).
6. **`faqs`** — 3–5, rendered as a `<dl>` and emitted as `FAQPage`.
7. **One CTA**, which the route already supplies via `relatedServices` + `FinalCta`. Do not add more.
   An article is a trust asset; over-CTA'd guides read as advertorial and get cited less.

Target 800–1500 Hebrew words. Length is not the point; covering the question completely is.

## Safety rules for a repair-advice site

This is home equipment involving **water, electricity and pressure**. Two hard limits:

- **Never publish a DIY procedure that puts a reader near mains electricity or a pressurised tank.**
  "What to check" means the breaker, the timer, the taps — not opening the boiler.
- **Say when to stop and call someone.** Every guide that touches a fault needs an explicit "at this
  point, call a technician" line. The `callout` block exists for exactly this.

And the standing rule: no warranty terms, no response times, no technician credentials. Domain
knowledge only. **No prices either** — the published ranges live on `/מחירון/` and nowhere else, so a
guide can never drift out of sync with them. Link to the price page instead of quoting a figure.

## Schema

Emitted from the route, all three nodes in one `jsonLdScript([...])` call:

- **`Article`** — assembled inline in `app/מדריכים/[slug]/page.tsx`, because the kit exports no
  `articleJsonLd`. `headline` is `guide.heading`, `datePublished`/`dateModified` come from the object,
  and `author`/`publisher` both carry `@type` + `name` **alongside** the `@id` join to `#business`, so
  the node stays self-describing for a consumer that does not resolve the `@id`. A proper `Article`
  builder belongs upstream in `@ishub/site-kit`, not in a local fork — note it rather than spreading
  the pattern.
- **`FAQPage`** via `faqJsonLd(guide.faqs)` — matched to the FAQs that actually render.
- **`BreadcrumbList`** via `breadcrumbJsonLd`, matching the visible `PageHeader` trail item for item.

Measured in the current `out/`: `Article` on all **12** guides, `FAQPage` on **37** pages site-wide,
`BreadcrumbList` on **44**. See `schema-structured-data` and `docs/schema-graph.md`.

## Internal linking — the gap a new guide inherits

**Every guide currently has an in-degree of exactly 1**: the hub index at `/מדריכים/` is the only page
on the site that links an individual guide. The footer links the hub, not the guides.

That is not an orphan, but it is the thinnest reachability on the site, and it is the thing a new
guide should be written to fix rather than repeat:

- from the guide, `relatedServices` links out to the service pages (mandatory, already wired);
- **back the other way is missing.** A service page explaining a symptom should link the guide that
  explains it in depth, and a `cityContent` entry that turns on a seasonal fault should link the
  seasonal guide. Both live in the content model, not in JSX.

Wiring that direction is the same editorial pass that fixes the guides' in-degree — see
`internal-linking`.

## Checklist

- [ ] `Guide` object appended to `lib/guides.ts`; slug English, `title` with **no** brand suffix
- [ ] `cluster` is one of the four; the index groups by it
- [ ] Real `published`; `updated` set only for a substantive edit
- [ ] Opens with a self-contained `answer` block that quotes cleanly without context
- [ ] Comparisons are `table` blocks (two columns) with a `caption`
- [ ] No DIY step near mains electricity or a pressurised tank; an explicit "call a technician" callout
- [ ] No warranty/price/timing/credential claim anywhere in the body
- [ ] 3–5 `faqs`; `relatedServices` non-empty
- [ ] Line added to `public/llms.txt` under the right cluster heading
- [ ] `npm run lint && npm run typecheck && npm run format:check && npm run build && npm run qa:gate`
