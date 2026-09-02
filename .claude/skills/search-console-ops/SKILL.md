---
name: search-console-ops
description: Search Console operations for hambabait — the metadata.verification block that now exists in app/layout.tsx while the manifest's googleSiteVerification is still null (an owner action, set in the roster then synced), submitting the 45-URL sitemap whose Hebrew locs are percent-escaped, triaging coverage against the emitted route tree, reading query data split by the four page types so the weak silos stay visible, and the four-week rule before attributing any ranking change to a deploy. Use when verifying ownership, submitting a sitemap, or diagnosing indexing. Triggers: "Search Console", "site verification", "submit sitemap", "not indexed", "coverage", "why isn't this page indexed", "GSC".
---

# Search Console operations — hambabait

## Verification: wired, but unset

The wiring gap is **closed**. `app/layout.tsx` now spreads a guarded `verification` block into its
`metadata` export:

```ts
...(manifest.analytics?.googleSiteVerification
  ? { verification: { google: manifest.analytics.googleSiteVerification } }
  : {}),
```

Guarded on presence — emitting an empty verification meta is worse than emitting none. For months the
manifest carried the field with no block to consume it, so setting it in the roster silently did
nothing. That is fixed.

**The value is still `null`.** `site.config.json` → `analytics.googleSiteVerification: null`, so no
`google-site-verification` meta ships today. Getting a token is an **owner action** — it comes out of
the Search Console property setup.

When the token arrives, the path is: put it in the **roster** manifest
(`Israeli services sites/roster/sites/hambabait.json`), run `ops/sync-manifest.ps1` with `-DryRun` then
`-Confirm` to carry it into `site.config.json`, then rebuild. **Editing `site.config.json` directly is
prohibited**, and editing the roster alone changes nothing public — the value must reach the repo's
copy before the next build or the deploy ships the old one.

Verify in the **built output**, never the source:

```bash
npm run build
grep -o 'google-site-verification[^>]*' out/index.html
```

DNS-record verification is the alternative and is more robust (it survives a re-deploy that loses the
tag), but it is a zone change and therefore owner-owned. Either is fine; the meta tag is the one this
repo can actually ship.

## The sitemap

`app/sitemap.ts` emits **45 URLs**: 9 static + 6 services + 18 locations + 12 guides. Verified in parity
with the built output — 45 `<loc>` entries, 45 canonicals, 45 of 45 indexable pages carrying JSON-LD.
`npm run qa:gate` asserts all three plus byte-identical canonical ↔ `<loc>` parity in both directions.

Two things are deliberately excluded and must stay excluded: **`/תודה/`** (noindex conversion
destination) and the **404**.

The guide entries are the only ones with a meaningful `lastModified` — `new Date(g.updated)` from the
`Guide` object. Static, service and location entries still use build time, which is a timestamp saying
every page changed every build, i.e. saying nothing. That is a known limitation, not a bug to "fix" by
inventing dates. See `content-refresh`.

### The Hebrew escaping rule

Seven routes are Hebrew directories, plus `/מדריכים/[slug]/` whose parent segment is Hebrew and whose
slugs are English. Every `loc` runs through `encodeURI` because the sitemap protocol requires escaped
URLs _and_ because Next percent-escapes canonicals automatically — so the two come out
**byte-identical**. That parity is the point, and the gate now enforces it.

> **Never hand-write a raw-UTF-8 Hebrew URL into a sitemap, a canonical, or a redirect.** If the escaped
> `<loc>` and the escaped canonical ever diverge, every Hebrew route reports a canonical mismatch.

Submit `https://hambabait.co.il/sitemap.xml`. Submit once — resubmitting on every deploy does nothing
and is not a ranking signal.

`app/robots.ts` emits `allow: /` for `*`, a declarative allow block for 11 named AI crawlers, and the
sitemap reference. No disallow rules. **Cloudflare can prepend a managed block at the edge that
overrides all of it** — it did across this fleet until 2026-08. Verify the live file rather than
inferring it from source:

```bash
curl -sS -H 'Cache-Control: no-cache' "https://hambabait.co.il/robots.txt?cb=$RANDOM"
```

## Coverage triage

Expect **45 indexed** eventually. When a page is missing, work the list in order:

1. **Is it in the sitemap?** `grep -c '<loc>' out/sitemap.xml` → 45.
2. **Does it have a self-referencing canonical?** A page canonicalising elsewhere will not index under
   its own URL. The gate covers presence and parity, not intent.
3. **Is it linked internally?** An orphan is discoverable only via the sitemap, which is weak. The
   footer links all 6 services and all 18 locations on every page — that is the site's orphan insurance.
   Two things to know: the **header reaches none of the 6 service pages** (only the `/שירותים/` index),
   and **each of the 12 guides has an in-degree of exactly 1**, the hub index. If a guide is missing
   from coverage, that thin link is the first suspect. See `internal-linking`.
4. **Is it a near-duplicate?** This used to be the likely answer for a missing city page. The 18 cities
   now each carry a distinct answer block, ≥2 city-specific paragraphs, their own FAQs and nearby links,
   so duplication is no longer the default explanation — but **verify the specific page** rather than
   assuming depth solved it. Near-duplicates get filtered, not penalised; the symptom is "Crawled –
   currently not indexed" or "Duplicate, Google chose different canonical". The fix is content depth,
   not a technical change. See `city-research`.
5. **Is it new?** Indexing takes time. Do not diagnose a two-day-old page.

**Do not use the URL Inspection "Request indexing" button as a strategy.** It is for a genuinely urgent
single URL, not a workflow.

## Reading query data

Split by the **four** page types — home, service, location, guide — and track them **separately**.
Aggregate numbers hide the thing that matters: the location silo has historically been the weakest
surface and the guide silo is brand new, so averaging either with the homepage conceals what happened.

Watch for:

- **Cannibalisation** — two URLs alternating on the same query. `docs/keyword-map.md` fixes one intent
  to one URL; a query where two of our pages trade positions is a violation of that and needs a
  decision, not a copy tweak. The guides made this more likely, not less: a symptom guide and a service
  page can converge on the same query.
- **Impressions without clicks** — a title/description problem, or the wrong intent. The doubled brand
  suffix that once shipped on 24 of 33 pages is fixed and now gated, so it is no longer the explanation.
- **Queries with no page** — the informational cluster used to have no home at all; 12 guides now cover
  symptom, comparison, definition and seasonal. A genuinely unserved query is now a real finding worth a
  new guide, not a symptom of a missing silo.
- **ב+city forms** — confirm the queries arriving match the prefixed grammar the pages target.

Guides are also the only pages whose freshness is legible to a crawler (real `dateModified`, real
sitemap `lastModified`), so they are the cleanest place to observe whether a substantive edit moved
anything.

## The four-week rule

> **Do not attribute a ranking change to a deploy less than four weeks after it.**

Content changes take weeks to move rankings, and daily position data is mostly noise. Reporting a
one-week movement as a result is how a team learns the wrong lesson and repeats it.

When asked "did it work" too soon, the correct answer is "too early — here is the date to look", not a
number.

## Baseline first

Record the baseline in `docs/measurement.md` **before** any change ships: impressions, clicks, average
position, per page type, with the date measured. Without it, no future change can be evaluated and every
claim of improvement is unfalsifiable. The guide silo has no baseline at all yet — it is new, so its
first four weeks are the baseline.

## What lives outside the repo

Property ownership, the verification token itself, sitemap submission, coverage reports, query data and
manual actions are all **console-side**. This repo can ship the verification tag and a correct sitemap;
everything else needs owner access. Say so rather than guessing at numbers you cannot see.
