---
name: search-console-ops
description: Search Console operations for hambabait — ownership is NOT yet verified (DNS TXT as a Domain property is the chosen method and googleSiteVerification correctly stays null, but the record was never added, checked 2026-09-06, so this is an open owner action blocking the measurement baseline), submitting the 45-URL sitemap whose Hebrew locs are percent-escaped and whose lastmod is emitted only for the 12 guides, the three hosts that serve byte-identical copies, triaging coverage against the emitted route tree, reading query data split by the four page types so the weak silos stay visible, and the four-week rule before attributing any ranking change to a deploy. Use when verifying ownership, submitting a sitemap, or diagnosing indexing. Triggers: "Search Console", "site verification", "submit sitemap", "not indexed", "coverage", "why isn't this page indexed", "GSC".
---

# Search Console operations — hambabait

## Verification: DNS TXT is the chosen method — and it has NOT been done

> ❌ **Status, checked 2026-09-06: ownership is NOT verified.**
> `nslookup -type=TXT hambabait.co.il 8.8.8.8` returns exactly one TXT record —
> `v=spf1 include:_spf.mx.cloudflare.net ~all` — with no `google-site-verification` token. The
> meta-tag route is unused too (`grep -rl 'google-site-verification' out` = 0) and
> `/googlefile.html` 404s. A Domain property can be verified **only** by DNS TXT, so ownership rests
> on neither mechanism. **`S2-2` is open, and it blocks `S1-1`, the measurement baseline.**
>
> **Decision, 2026-09-03 (still correct).** The **method** is **DNS TXT on the Cloudflare zone**, as
> a **Domain property**, and `analytics.googleSiteVerification` therefore stays `null` in the roster
> on purpose. Do not "fix" the null by chasing a meta token — the null is right; the missing record
> is the problem.
>
> ⚠️ **How this went wrong is the lesson.** Between 2026-09-03 and 2026-09-06 six documents and two
> skills — including this one — stated the verification as an accomplished fact. Nobody had queried
> DNS. The rule at the bottom of this section already said "never assume it was applied — check
> DNS"; it was written and then not followed. **A decision recorded is not a change applied.**
>
> A Domain property is the right shape here because **three hosts serve byte-identical copies of all
> 45 pages** — `hambabait.co.il`, `www.hambabait.co.il` (which returns **200, not a 301**) and
> `hambabait.pages.dev`. All three canonicalize to the apex, so the duplication is contained, but a
> URL-prefix property would report on only one of them. ⚠️ A `hambabait.co.il` Domain property covers
> the apex and `www` — **not** `hambabait.pages.dev`, which is a separate domain. That host would need
> its own property, which is not worth creating.

The record, for reference when re-checking or re-verifying:

| Field   | Value                                       |
| ------- | ------------------------------------------- |
| Type    | `TXT`                                       |
| Name    | `@`                                         |
| Content | `google-site-verification=<token from GSC>` |
| TTL     | Auto                                        |

```bash
nslookup -type=TXT hambabait.co.il 8.8.8.8    # the google-site-verification= value must appear
```

Zone changes are **owner territory** (`CLAUDE.md` §12). Document the exact record; never assume it
was applied — check DNS.

### The meta-tag path (wired, unused)

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

**The value is `null` by design** — see the decision above. No `google-site-verification` meta ships,
and none needs to; the missing piece is the **DNS record**, not the manifest field. This section
documents the meta path only in case a second, tag-based owner token is ever wanted alongside it.

Were a token to be added, the path is: put it in the **roster** manifest
(`Israeli services sites/roster/sites/hambabait.json`), run `ops/sync-manifest.ps1` with `-DryRun` then
`-Confirm` to carry it into `site.config.json`, then rebuild. **Editing `site.config.json` directly is
prohibited**, and editing the roster alone changes nothing public — the value must reach the repo's
copy before the next build or the deploy ships the old one.

Verify in the **built output**, never the source:

```bash
npm run build
grep -o 'google-site-verification[^>]*' out/index.html
```

The meta tag is the one this repo can ship unaided, which is why the block exists. DNS was chosen
anyway because it is more robust — it survives a re-deploy that loses the tag, and it verifies the
whole domain rather than one URL prefix.

## The sitemap

`app/sitemap.ts` emits **45 URLs**: 9 static + 6 services + 18 locations + 12 guides. Verified in parity
with the built output — 45 `<loc>` entries, 45 canonicals, 45 of 45 indexable pages carrying JSON-LD.
`npm run qa:gate` asserts all three plus byte-identical canonical ↔ `<loc>` parity in both directions.

Two things are deliberately excluded and must stay excluded: **`/תודה/`** (noindex conversion
destination) and the **404**.

### `lastmod` — 12 entries, and only 12

The guide entries are the only ones carrying `lastModified`: `new Date(g.updated)` from the `Guide`
object, a real editorial date. **The other 33 URLs carry no `<lastmod>` at all**, which is valid per
the sitemap protocol and deliberate.

Until 2026-09-03 they carried `new Date()` — a build timestamp, identical to the millisecond across
33 URLs, saying every page changed on every deploy. The cost was never the 33: an untrustworthy
`lastmod` gets the signal discounted **site-wide**, including on the 12 guides where the date is
true. Omitting the false date is what protects the real one.

Do not "restore" it, and do not invent per-page dates to fill the gap (see `content-refresh` — a
date must reflect a real substantive edit). `npm run qa:gate` asserts both halves: `<lastmod>` count
is exactly 12, and every value is date-only (`T00:00:00.000Z`), because a build timestamp carries a
wall-clock time. A non-guide route may gain a `<lastmod>` only when it gains a genuine editorial
date, and the threshold constant moves with it.

### The Hebrew escaping rule

Nine routes under `app/` are Hebrew directories (eight reach the sitemap), plus `/מדריכים/[slug]/` whose parent segment is Hebrew and whose
slugs are English. Every `loc` runs through `encodeURI` because the sitemap protocol requires escaped
URLs _and_ because Next percent-escapes canonicals automatically — so the two come out
**byte-identical**. That parity is the point, and the gate now enforces it.

> **Never hand-write a raw-UTF-8 Hebrew URL into a sitemap, a canonical, or a redirect.** If the escaped
> `<loc>` and the escaped canonical ever diverge, every Hebrew route reports a canonical mismatch.

Submit `https://hambabait.co.il/sitemap.xml`. Submit once — resubmitting on every deploy does nothing
and is not a ranking signal. Google **removed the sitemap ping endpoint in 2023**, so there is no
programmatic submit: do not add a ping step to `ops/deploy-site.ps1`. Submissions do not carry across
properties, so a Domain property needs its own submission even if a URL-prefix property already has
one.

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
