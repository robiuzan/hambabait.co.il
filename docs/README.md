# docs/ — the map

> Every acceptance bar, strategy and ledger this project runs on. **Read this file before citing any
> other doc**: the docs layer is dated, the code moves faster than prose, and a stale doc is worse
> than no doc because it reads as authority.

**Snapshot verified: 2026-08-31** against a fresh `out/` on branch `seo/phase-1-environment`.

---

## 0. Verified state — the numbers every doc must agree with

Re-run these before trusting any figure written anywhere in `docs/` or `.claude/`.

```bash
npm run lint && npm run typecheck && npm run format:check && npm run build && npm run qa:gate
find out -name index.html | wc -l                                   # 47  (45 indexable + 404 + /תודה/)
grep -rl 'application/ld+json' out --include=index.html | wc -l     # 45
grep -rl 'rel="canonical"'     out --include=index.html | wc -l     # 45
grep -o '<loc>' out/sitemap.xml | wc -l                             # 45
grep -rl '"@type":"Plumber"'   out --include=index.html | wc -l     # 37  (home + 6 services + 18 cities + 12 guides)
grep -rl '"@type":"Service"'   out --include=index.html | wc -l     # 24  (6 services + 18 area-scoped cities)
grep -rl '"@type":"Article"'   out --include=index.html | wc -l     # 12
grep -rl 'FAQPage'             out --include=index.html | wc -l     # 37
grep -rl 'BreadcrumbList'      out --include=index.html | wc -l     # 44  (every page except the homepage)
grep -rl '"@type":"WebSite"'   out --include=index.html | wc -l     # 1   <- homepage only. The graph is now complete
grep -rl '<img' out --include=index.html | wc -l                    # 0   <- zero raster images, still
grep -rho 'data-cta="[^"]*"' out --include=index.html | sort -u | wc -l   # 27
```

**The gate is five steps now, not four.** `npm run qa:gate` (`scripts/qa-gate.mjs`) runs **25
assertions over `out/`** and on this snapshot reports **25 passed, 0 failed**. It is the mechanism
that keeps this section from going stale between snapshots — route counts, unique non-doubled
titles, one H1, canonical↔sitemap byte parity, JSON-LD parseability, the `WebSite` node, consent
default ordering, the banned schema properties (`aggregateRating`, `reviewCount`, `ratingValue`,
`foundingDate`, `warrantyPromise`, `SearchAction`/`potentialAction`), priced `Offer`, and banned
physical-direction Tailwind utilities are all asserted, not remembered.

| Dimension                | State                                                                                                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Indexable URLs           | **45** — 9 static · 6 services · 18 locations · 12 guides                                                                                                                       |
| Built HTML files         | 48 (47 `index.html` + `out/404.html`), 3.96 MB on disk                                                                                                                          |
| JSON-LD coverage         | 45 / 45 ✅ (404 and `/תודה/` bare, both correct)                                                                                                                                |
| Canonical ↔ sitemap      | 45 / 45 byte-identical ✅ (asserted by `qa:gate`)                                                                                                                               |
| `WebSite` node           | ✅ homepage only — **the graph is complete**. No `SearchAction`: no search exists                                                                                               |
| Titles                   | unique, 0 doubled brand ✅                                                                                                                                                      |
| H1                       | exactly 1 on every page ✅                                                                                                                                                      |
| Banned RTL utilities     | 0 in `app/`, `components/` **and** in the built HTML ✅                                                                                                                         |
| `data-cta` values        | **27 distinct**, 492 occurrences. Three changed meaning — **the GTM container is behind the repo**, see [data-tracking-infrastructure.md](data-tracking-infrastructure.md) §3.2 |
| Answer blocks            | **36** of 45 URLs (6 services · 18 cities · 12 guides); the 9 static routes have none                                                                                           |
| Consent Mode v2          | **shipped** — default `denied` in `<head>`, above the container                                                                                                                 |
| Consent affordance, form | 🟡 notice rendered **above** the submit button, wired by `aria-describedby`. **No required checkbox** — deliberate, owner-gated                                                 |
| CSP                      | 🟡 **report-only** in `public/_headers`, no hashes — see [ux-cro-security.md](ux-cro-security.md) §4.1                                                                          |
| Manifest validation      | ✅ `assertManifest()` runs at module load — a malformed manifest fails the **build**                                                                                            |
| Raster images            | **0** — inline SVG only                                                                                                                                                         |
| Reviews / ratings        | **0**, and no `Review`/`AggregateRating` markup anywhere ✅                                                                                                                     |
| Google Business Profile  | ❌ none — blocked on the roster `_needsConfirmation` array                                                                                                                      |
| `sameAs`                 | empty → pruned from the JSON-LD                                                                                                                                                 |
| Address / geo            | none, by design (mobile trade)                                                                                                                                                  |

> **The warranty claim is out of structured data.** The roster's softened `shortPitch` was synced
> into `site.config.json`, so the homepage JSON-LD `description` no longer ends
> `…עם אחריות על העבודה`. The phrase still appears **once** in `out/` — in a different, deliberately
> softened homepage FAQ answer about the terms being stated before work begins. That is a
> pre-existing item on its own merits, **not** a regression, and a bare substring grep will keep
> finding it. The correct assertion is about the JSON-LD `description`, not about the string.

> **There is a roster→repo sync script now.** `ops/sync-manifest.ps1` + `ops/sync-manifest.mjs` do a
> field-level diff under the same `-DryRun` / `-Confirm` contract as the deploy script, strip
> `$schema` and `_needsConfirmation`, and write the assumptions out to
> [manifest-assumptions.md](manifest-assumptions.md) instead. **That last part is not tidiness:**
> `site.config.json` is bundled into the client JS (the Web3Forms key and `shortPitch` are both
> findable in `out/_next/static`), so anything left in the manifest ships to visitors. Internal
> notes must not travel with it. Any doc still saying "there is no sync script" is out of date.

---

## 1. Which file answers which question

### Strategy — what we are trying to win, and how

| File                                               | Answers                                                               |
| -------------------------------------------------- | --------------------------------------------------------------------- |
| [seo-geo-aeo-strategy.md](seo-geo-aeo-strategy.md) | The whole plan: clusters, the local silo, AEO, and the honest ceiling |
| [topical-map.md](topical-map.md)                   | The shape of the subject and what is missing from it                  |
| [keyword-map.md](keyword-map.md)                   | Which single URL owns a given query                                   |
| [competitors.md](competitors.md)                   | Who ranks, with what, and which gaps are realistically ours           |
| [entity-profile.md](entity-profile.md)             | The canonical NAP and `sameAs` build-out, for every off-site surface  |

### Standards — the bar a change must clear

| File                                                                 | Answers                                                         |
| -------------------------------------------------------------------- | --------------------------------------------------------------- |
| [content-standards.md](content-standards.md)                         | Is this page deep enough to ship, or is it a doorway?           |
| [eeat-and-trust.md](eeat-and-trust.md)                               | May we say this at all, and what would make it sayable?         |
| [business-facts.md](business-facts.md)                               | **The claims ledger.** What is confirmed vs merely asserted     |
| [accessibility-and-i18n.md](accessibility-and-i18n.md)               | WCAG 2.1 AA rules, ARIA doctrine, and the multilingual decision |
| [performance-guidelines.md](performance-guidelines.md)               | Core Web Vitals budgets and what may spend them                 |
| [ux-cro-security.md](ux-cro-security.md)                             | Navigation, funnel, form, and the real security boundary        |
| [mobile-ux-and-personalization.md](mobile-ux-and-personalization.md) | Thumb-zone rules, and what personalization is safe here         |

### Infrastructure and execution

| File                                                               | Answers                                                                 |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| [data-tracking-infrastructure.md](data-tracking-infrastructure.md) | How tracking is plumbed, and who owns each half                         |
| [measurement.md](measurement.md)                                   | The KPIs, the baseline, and the reporting cadence                       |
| [schema-graph.md](schema-graph.md)                                 | The target JSON-LD graph vs what ships                                  |
| [media-assets.md](media-assets.md)                                 | The image inventory, byte budgets, alt text, and the Media Studio path  |
| [city-briefs.md](city-briefs.md)                                   | Why each of the 18 city pages says what it says                         |
| [optimization-backlog.md](optimization-backlog.md)                 | Verified open defects, with evidence and acceptance tests               |
| [implementation-roadmap.md](implementation-roadmap.md)             | **The sequenced plan.** What ships, in what order, and why              |
| [manifest-assumptions.md](manifest-assumptions.md)                 | The roster `_needsConfirmation` array, kept out of the shipped manifest |
| [owner-questions.md](owner-questions.md)                           | The one list of questions only the owner can answer                     |

---

## 2. The rules that govern this directory

1. **Date everything.** Every doc carries a "verified" or "compiled" date. A doc without one is
   treated as unverified.
2. **Numbers come from `out/`, not from memory.** If a doc states a count, the command that produced
   it belongs beside it.
3. **One fact, one home.** Claims live in [business-facts.md](business-facts.md). KPIs live in
   [measurement.md](measurement.md). Other docs _link_; they do not restate. A number copied into two
   files will disagree with itself within a month.
4. **Docs describe reality, not intent.** "We should add X" belongs in the backlog or the roadmap. A
   standards doc that describes an aspiration as though it were the state is the exact failure mode
   this directory exists to prevent.
5. **When a doc and the code disagree, the code wins and the doc gets fixed** — in the same change
   that revealed the drift.

---

## 3. Known drift — fix on sight

The content build-out of 2026-08-25, the consent work of 2026-08-26 and the audit pass of
2026-08-31 (accessibility, security headers, schema, tracking, manifest sync) each closed a batch of
findings and each left prose behind describing the site as it was the day before.

**De-staled on 2026-08-31 (this pass):** the nine strategy/standards docs listed in §1 — README,
[seo-geo-aeo-strategy.md](seo-geo-aeo-strategy.md), [eeat-and-trust.md](eeat-and-trust.md),
[ux-cro-security.md](ux-cro-security.md), [performance-guidelines.md](performance-guidelines.md),
[accessibility-and-i18n.md](accessibility-and-i18n.md),
[mobile-ux-and-personalization.md](mobile-ux-and-personalization.md),
[data-tracking-infrastructure.md](data-tracking-infrastructure.md) and
[implementation-roadmap.md](implementation-roadmap.md). The older docs and the `.claude/` bodies are
being re-baselined in the same pass — **S0-1 and S0-2** in
[implementation-roadmap.md](implementation-roadmap.md).

**The specific sentences that must not survive anywhere in `docs/` or `.claude/`.** Each of these was
true once and is false now; each is the kind of claim an agent acts on without re-checking:

| Stale claim                                              | What is actually true                                                                          |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| "There is no roster→repo sync script"                    | `ops/sync-manifest.ps1` + `.mjs` exist, with a `-DryRun`/`-Confirm` contract                   |
| "The `WebSite` node is unbuilt"                          | It ships on the homepage; the graph is complete, deliberately without `SearchAction`           |
| "32 indexable URLs"                                      | 45                                                                                             |
| "21 `data-cta` values"                                   | 27, and `header-call` was split three ways — the container must be updated                     |
| "The header reaches all 6 services in one hop"           | It reaches **0**; only the `/שירותים/` index is in the nav. The footer is the orphan insurance |
| "The mobile menu traps focus"                            | It does not. Escape closes it and returns focus to the trigger; there is no trap               |
| "A hash-based CSP is the only workable path"             | Hashes are **impossible** here; a report-only CSP with `'unsafe-inline'` shipped instead       |
| "The 40–60 word answer block ships on every page"        | 36 of 45 URLs carry one; the band is guidance, and bodies measure 32–47 words                  |
| "`shortPitch` puts an unsourced warranty in the JSON-LD" | Synced and softened; the phrase survives once in a separate homepage FAQ answer                |
| "The gate is four commands"                              | Five — `npm run qa:gate` is part of it                                                         |

> **The rule this section encodes:** a doc that was right last week is not evidence. Before citing a
> number from any file in this directory, check it against §0 or re-run the command beside it.
