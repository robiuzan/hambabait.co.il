---
name: new-article
description: Add the Hebrew knowledge hub to hambabait — the route does NOT exist yet, so this covers standing it up under /מדריכים/[slug]/ with a typed block model in the content layer, author attribution and dates the site currently has none of, Article + BreadcrumbList + FAQPage schema, the answer-block opening, and internal links into services and locations. Use when adding editorial content for topical authority and AEO. Triggers: "write an article", "blog post", "knowledge hub", "מדריך", "topical authority", "guide", "add a blog".
---

# Publish an article

## Status: this does not exist yet

**There is no articles route on hambabait.** No `app/מדריכים/`, no `app/blog/`, no article data in
`lib/content.ts`, no `Article` schema anywhere. The site is 32 URLs: 1 home + 7 Hebrew static +
6 services + 18 locations.

So this skill is "how to stand the hub up", not "how to add to it". The first article is a small
feature, not a content task. Say so when scoping.

## Why it is worth doing here

This is the site's biggest missing asset, for a specific reason. hambabait has **no address, no geo,
no reviews, an empty `sameAs` and no GBP** — its entity signals are close to nil, and its 18 location
pages are templated. Editorial depth is the one lever that is fully in the repo's control and does
not require the owner to confirm a single business fact.

Technical explanation is also the **only safe citation surface**: how a solar boiler works, why an
element fails, what an anode does. None of it touches the unsourced warranty/speed/price claims in
`docs/business-facts.md` §3. See `aeo-answer-content`.

## Standing it up

**Route:** `app/מדריכים/[slug]/page.tsx` plus an index at `app/מדריכים/page.tsx`.

Hebrew directory names are already the house pattern (7 routes use them), and the three Hebrew-route
rules apply automatically — see `hebrew-rtl`:

1. `app/sitemap.ts` must include the new paths, through `encodeURI` like everything else.
2. Canonicals get percent-escaped by Next; they will match the sitemap byte for byte.
3. In-page `href`s stay raw UTF-8.

**Data:** a typed block model in `lib/content.ts`, following the existing convention that copy never
lives in JSX.

```ts
export type ArticleBlock =
  | { kind: "answer"; heading: string; body: string } // question H2 + 40–60 word answer
  | { kind: "prose"; heading?: string; body: string }
  | { kind: "steps"; heading: string; items: string[] }
  | { kind: "table"; heading: string; head: string[]; rows: string[][] }
  | { kind: "faq"; items: { q: string; a: string }[] };

export type Article = {
  slug: string;
  title: string;
  description: string;
  published: string; // ISO date
  updated?: string; // ISO date
  author: string; // 🔶 confirm — see below
  blocks: ArticleBlock[];
  related: { services?: ServiceSlug[]; locations?: LocationSlug[] };
};
```

Deriving the schema from the blocks (rather than hand-writing it) is what keeps `FAQPage` matched to
visible FAQs automatically.

**Sitemap:** add the article slugs to `app/sitemap.ts` from the array, the same way services and
locations are derived. Never hand-maintain the list.

## The authorship problem — resolve it before publishing

The site has **no author, no reviewer and no dates anywhere**. An article without attribution is
worth much less for E-E-A-T, and inventing an author is a fabricated business fact of exactly the
kind `docs/business-facts.md` exists to prevent.

So, before the first article ships, get an answer to: **who is standing behind this content?** A
named technician or the business itself are both legitimate; a made-up "מומחה הדודים שלנו" is not.

Until it is answered, mark the field `// 🔶 confirm` and add a row to `docs/business-facts.md`.

Dates are safe and should be real: `published` when it ships, `updated` only when it is genuinely
revised. Never stamp a `dateModified` that no edit corresponds to.

## Article structure

1. **Open with the answer**, not with the brand. A 40–60 word direct response to the title question,
   as the first paragraph. Self-contained, quotable, no preamble.
2. **Question-form H2s** the whole way down, each with its own short answer first.
3. **Tables for comparisons** (`דוד שמש` vs `דוד חשמל`, repair vs replace) — real `<table>` markup.
4. **Numbered steps** for anything procedural.
5. **A closing FAQ block**, 3–5 questions.
6. **One CTA**, and only one. An article is a trust asset, not a landing page. Over-CTA'd guides read
   as advertorial and get cited less.

Target 800–1500 Hebrew words. Length is not the point; covering the question completely is.

## Safety rules for a repair-advice site

This is home equipment involving **water, electricity and pressure**. Two hard limits:

- **Never publish a DIY procedure that puts a reader near mains electricity or a pressurised tank.**
  "What to check" means the breaker, the timer, the taps — not opening the boiler.
- **Say when to stop and call someone.** Every guide that touches a fault needs an explicit "at this
  point, call a technician" line.

And the standing rule: no warranty terms, no response times, no prices, no technician credentials.
Domain knowledge only.

## Schema

Derive from the blocks:

- `Article` (or `HowTo` for genuinely procedural pieces) with `headline`, `description`,
  `datePublished`, `dateModified`, `author`, and `publisher` pointing at the `#business` `@id`.
- `BreadcrumbList` matching the visible `PageHeader` crumbs — note this is not emitted anywhere on
  the site yet, so the hub is a chance to do it right from the start.
- `FAQPage` **only** from a `faq` block that actually renders.

See `schema-structured-data`.

## Internal linking

Articles are the natural top of the funnel and should feed both silos:

- link the relevant service pages from inside the copy, on the symptom that maps to them;
- link the areas index;
- from a service page, link back to the guide that explains its fault in depth.

That last direction is also the fix for the service→location gap described in `internal-linking` —
the same editorial pass can wire both.

## Checklist

- [ ] Route, index, data model and sitemap wiring exist (first article only)
- [ ] Author resolved, or `🔶 confirm` + a row in `docs/business-facts.md`
- [ ] Real `published` date
- [ ] Opens with a 40–60 word self-contained answer
- [ ] Question-form H2s; comparisons as tables
- [ ] No DIY step near mains electricity or a pressurised tank; explicit "call a technician" line
- [ ] No warranty/price/timing claim
- [ ] `Article` + `BreadcrumbList` (+ `FAQPage` if a FAQ block renders)
- [ ] Links into services and the areas index
- [ ] Canonical trailing-slashed; sitemap entry escaped
