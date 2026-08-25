---
name: search-console-ops
description: Search Console operations for hambabait — wiring the manifest's googleSiteVerification into a metadata.verification block that does not exist today so setting it stops being a no-op, submitting the 32-URL sitemap whose Hebrew locs are percent-escaped, triaging coverage against the emitted route tree, reading query data split by the three page types so the weak location silo is visible, and the four-week rule before attributing any ranking change to a deploy. Use when verifying ownership, submitting a sitemap, or diagnosing indexing. Triggers: "Search Console", "site verification", "submit sitemap", "not indexed", "coverage", "why isn't this page indexed", "GSC".
---

# Search Console operations — hambabait

## The wiring gap — fix this before anything else

The manifest carries a `googleSiteVerification` field. **`app/layout.tsx` has no `verification`
block.** It exports `metadata` with `metadataBase`, `alternates`, `title`, `description` and
`openGraph`, and a separate `viewport` with `themeColor` — and nothing else.

So setting `googleSiteVerification` in the roster today **silently does nothing.** The value is
carried, synced, and dropped on the floor.

```ts
// app/layout.tsx — the missing piece
export const metadata: Metadata = {
  …,
  verification: manifest.analytics?.googleSiteVerification
    ? { google: manifest.analytics.googleSiteVerification }
    : undefined,
};
```

Guard on presence — emitting an empty verification meta is worse than emitting none.

Verify in the **built output**, never the source:

```bash
npm run build
grep -o 'google-site-verification[^>]*' out/index.html
```

DNS-record verification is the alternative and is more robust (it survives a re-deploy that loses the
tag), but it is a zone change and therefore owner-owned. Either is fine; the meta tag is the one this
repo can actually ship.

## The sitemap

`app/sitemap.ts` emits **32 URLs**: 8 static + 6 services + 18 locations. Verified in parity with the
built output — 32 `<loc>` entries, 32 canonicals, 32 of 32 indexable pages carrying JSON-LD.

Two things are deliberately excluded and must stay excluded: **`/תודה/`** (noindex conversion
destination) and the **404**.

### The Hebrew escaping rule

Seven routes are Hebrew directories. Every `loc` runs through `encodeURI` because the sitemap protocol
requires escaped URLs _and_ because Next percent-escapes canonicals automatically — so the two come out
**byte-identical**. That parity is the point.

> **Never hand-write a raw-UTF-8 Hebrew URL into a sitemap, a canonical, or a redirect.** If the
> escaped `<loc>` and the escaped canonical ever diverge, every Hebrew route reports a canonical
> mismatch.

Submit `https://hambabait.co.il/sitemap.xml`. Submit once — resubmitting on every deploy does nothing
and is not a ranking signal.

`app/robots.ts` emits `allow: /` for all agents plus the sitemap reference. No disallow rules, no
per-bot rules, no AI-crawler directives.

## Coverage triage

Expect **32 indexed** eventually. When a page is missing, work the list in order:

1. **Is it in the sitemap?** `grep -c '<loc>' out/sitemap.xml` → 32.
2. **Does it have a self-referencing canonical?** A page canonicalising elsewhere will not index under
   its own URL.
3. **Is it linked internally?** An orphan is discoverable only via the sitemap, which is weak. The
   Footer links all 6 services and all 18 locations — that is the site's orphan insurance. Check it
   still does.
4. **Is it a near-duplicate?** This is the likely answer for a missing city page. All 18 render from
   one template with the name substituted, and **near-duplicates get filtered, not penalised** — the
   symptom is "Crawled – currently not indexed" or "Duplicate, Google chose different canonical". The
   fix is content depth, not a technical change. See `city-research`.
5. **Is it new?** Indexing takes time. Do not diagnose a two-day-old page.

**Do not use the URL Inspection "Request indexing" button as a strategy.** It is for a genuinely
urgent single URL, not a workflow.

## Reading query data

Split by the three page types — home, service, location — and track them **separately**. Aggregate
numbers hide the thing that matters: the location silo is the weakest surface, and averaging it with
the homepage conceals that.

Watch for:

- **Cannibalisation** — two URLs alternating on the same query. `docs/keyword-map.md` fixes one intent
  to one URL; a query where two of our pages trade positions is a violation of that and needs a
  decision, not a copy tweak.
- **Impressions without clicks** — a title/description problem, or the wrong intent. Check the title
  does not append the brand twice; that defect previously shipped on 24 of 33 pages.
- **Queries with no page** — mostly informational (symptom, comparison, definition). That is the
  knowledge hub's brief.
- **ב+city forms** — confirm the queries arriving match the prefixed grammar the pages target.

## The four-week rule

> **Do not attribute a ranking change to a deploy less than four weeks after it.**

Content changes take weeks to move rankings, and daily position data is mostly noise. Reporting a
one-week movement as a result is how a team learns the wrong lesson and repeats it.

When asked "did it work" too soon, the correct answer is "too early — here is the date to look", not a
number.

## Baseline first

Record the baseline in `docs/measurement.md` **before** any change ships: impressions, clicks, average
position, per page type, with the date measured. Without it, no future change can be evaluated and
every claim of improvement is unfalsifiable.

## What lives outside the repo

Property ownership, sitemap submission, coverage reports, query data and manual actions are all
**console-side**. This repo can ship the verification tag and a correct sitemap; everything else needs
owner access. Say so rather than guessing at numbers you cannot see.
