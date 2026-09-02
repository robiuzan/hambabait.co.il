---
name: qa-build-gate
description: The release gate before any deploy for hambabait — five commands now, not four: lint, typecheck, format:check, build, then `npm run qa:gate`, which runs scripts/qa-gate.mjs and asserts 25 invariants over out/ (route counts, unique non-doubled titles, one H1, canonical↔sitemap byte parity, JSON-LD coverage, banned schema props, the priced-Offer bar, the WebSite node, Consent Mode ordering, and the physical-direction Tailwind ban). CI runs the first four; deploys build from the working tree. Use before every deploy or when asked whether the site is ready to ship. Triggers: "run the build gate", "is this ready to ship", "pre-deploy check", "QA the site", "verify the build", "did I break anything".
---

# Build gate

Nothing ships on a red gate. `.github/workflows/ci.yml` runs the first four commands on every push and
PR, but production deploys from the working tree via `ops/` — so run the gate locally anyway.

## The five commands

```
npm run lint && npm run typecheck && npm run format:check && npm run build && npm run qa:gate
```

Run them **in order**: `qa:gate` reads `out/`, so it is meaningless before a build and stale after a
source edit.

Notes specific to this repo:

- **`typecheck`** is the only thing enforcing `noUncheckedIndexedAccess`. Indexed reads in the three
  dynamic routes return `T | undefined` and must be narrowed — this is where it fails. It also now
  catches a `LocationSlug` widened without a matching `cityContent` entry, because that map is a total
  `Record`.
- **`format:check`** has failed on uncommitted work before (`app/layout.tsx`). Run `npm run format` to
  fix, then re-check.
- **`build`** additionally fails on a malformed `site.config.json`: `lib/site-config.ts` runs
  `assertManifest()` at module load, so a bad manifest breaks the build instead of breaking in a
  visitor's browser.
- CI runs the first four since 2026-08-17, but **a green run still deploys nothing** — see
  `deploy-hambabait`.

## `npm run qa:gate` — run this, don't hand-roll the greps

`scripts/qa-gate.mjs` is read-only, exits 0 when every assertion holds and 1 with a measured-vs-expected
list otherwise. **25 assertions.** Every defect it guards against shipped green at least once: the
doubled brand suffix on 24 of 33 pages, canonicals that drifted out of byte-parity with the
percent-escaped sitemap, and pages with no JSON-LD at all.

| #     | Group               | Asserts                                                                                                                               |
| ----- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1–3   | Route counts        | 47 built `index.html`; 45 indexable; the two noindex routes (`/404/`, `/תודה/`) are actually present                                  |
| 4–5   | Coverage            | JSON-LD on all 45 indexable; canonical on all 45                                                                                      |
| 6–9   | Titles/descriptions | no `… \| חם בבית \| חם בבית`; every page has a `<title>`; titles unique; meta descriptions unique                                     |
| 10    | Headings            | exactly one `<h1>` per page                                                                                                           |
| 11–13 | Sitemap             | 45 `<loc>`; canonical ↔ `<loc>` **byte-identical** both ways; no duplicate `<loc>`                                                    |
| 14–20 | Banned schema       | `aggregateRating`, `reviewCount`, `ratingValue`, `foundingDate`, `warrantyPromise`, `SearchAction`, `potentialAction` — none anywhere |
| 21–23 | Graph               | all JSON-LD blocks parse; no priced `Offer`; a `WebSite` node on the homepage                                                         |
| 24    | Consent             | `id="consent-default"` precedes `id="gtm-init"` in every page                                                                         |
| 25    | RTL                 | no physical-direction Tailwind utilities (`pl-*`, `mr-*`, `left-*`, `text-right`…) in any class attribute                             |

Two design details worth knowing before you "fix" a failure:

- The banned-schema scan reads **whole HTML files**, not just `ld+json` blocks, because Next also
  serialises the JSON-LD into the React Flight payload. A banned property must not survive there either.
- The RTL scan reads class attributes only, splits into whole tokens and strips variant prefixes at
  bracket depth 0 — so `text-primary`, `border-primary` and `lucide-chevron-left` are not false
  positives, while `data-[state=open]:ml-2` correctly reduces to `ml-2`.

**The route counts are hard-coded thresholds** at the top of the file (`EXPECTED_BUILT_PAGES`,
`EXPECTED_INDEXABLE`, `EXPECTED_SITEMAP_LOCS`). When a route is legitimately added or removed, update
**those three constants and nothing else** — everything below them is derived. A count that moved
without a corresponding intentional route change is the signal, not the nuisance.

## What the assertions mean — the manual equivalents

Keep these for diagnosis. `qa:gate` tells you _that_ something broke; these tell you _which file_.

```bash
# route counts
find out -name index.html | wc -l          # 47 = 45 indexable + /404/ + /תודה/
grep -c '<loc>' out/sitemap.xml            # 45 — /תודה/ and the 404 are deliberately excluded
```

45 = 9 static + 6 services + 18 locations + 12 guides. The 9 static are the homepage, the three silo
indexes (`/שירותים/`, `/איזורי-שירות/`, `/מדריכים/`), `/מחירון/`, `/אודות/`, `/צור-קשר/` and the two
legal pages.

```bash
# titles — unique, brand exactly once
grep -h -o '<title>[^<]*</title>' $(find out -name index.html) | sort | uniq -c | sort -rn
grep -l 'חם בבית | חם בבית' $(find out -name index.html)      # must return nothing

# one H1 per page
for f in $(find out -name index.html); do
  n=$(grep -o '<h1' "$f" | wc -l); [ "$n" -eq 1 ] || echo "$n H1s: $f"
done

# canonicals present
for f in $(find out -name index.html); do
  grep -q 'rel="canonical"' "$f" || echo "NO CANONICAL: $f"
done

# sitemap invariants
grep -o '<loc>[^<]*</loc>' out/sitemap.xml | sed 's/<[^>]*>//g' | grep -v '/$'    # expect empty
grep -o '<loc>[^<]*</loc>' out/sitemap.xml | grep -P '[\x{0590}-\x{05FF}]'         # expect empty

# JSON-LD coverage
grep -rl 'application/ld+json' out --include=index.html | wc -l                     # 45

# nothing unsourced in schema
grep -rEo '"(aggregateRating|review|ratingValue|reviewCount|foundingDate|warrantyPromise)"' out | sort -u

# consent ordering, per page
grep -o 'id="consent-default"\|id="gtm-init"' out/index.html
```

Exactly **two** pages legitimately carry no canonical and no JSON-LD: `out/404/index.html` and
`out/תודה/index.html`. The 404 previously canonicalised to `/`, which was a defect; it now carries none
at all, which is correct.

A slashless sitemap entry costs a redirect hop. A raw-UTF-8 Hebrew `<loc>` 404s at the host.

### Build hygiene

```bash
du -sh out                                # ~6.9M; out/_next/static ~1.1M
ls out/.htaccess out/CNAME 2>/dev/null    # must be ABSENT — both removed 2026-08-17
ls out/llms.txt out/_headers              # both must be present (copied from public/)
```

`out/llms.txt` is **hand-maintained** and currently covers all 45 sitemap URLs. Nothing derives it, and
nothing asserts it — a new route with no line there drops coverage silently. Check it by hand when the
route count changes, comparing after `decodeURI` (the sitemap escapes Hebrew, llms.txt does not).

## Known state that is not a failure

Report these as current facts, not as gate failures:

- **The header reaches 0 of the 6 service pages in one hop** — only the `/שירותים/` index is in the nav.
  A services submenu was considered and deliberately deferred to the owner. The footer links all 6, so
  reachability is covered.
- **Each of the 12 guides has an in-degree of exactly 1** (the hub index). Not an orphan; the thinnest
  link on the site. See `internal-linking`.
- **9 of the 45 indexable pages carry no answer block** — the 9 static routes. Adding one to `/מחירון/`,
  `/שירותים/` and `/איזורי-שירות/` is deferred pending a content brief.
- **The GTM container is behind the repo** on three renamed and four new `data-cta` values. Owner action.
- **The CSP in `public/_headers` is report-only** and grants `'unsafe-inline'`. A hash-based policy is
  impossible here; see `web-security-headers`.

## The auditor sweep

For anything beyond a small change, run the read-only agents and read their reports:

- `seo-auditor` — titles, canonicals, headings, sitemap/robots parity, thin pages
- `schema-auditor` — the JSON-LD graph against `docs/schema-graph.md`
- `perf-a11y-auditor` — Core Web Vitals and WCAG 2.1 AA / IS 5568
- `ts-react-reviewer` — RSC boundaries, strict typing, static-export safety
- `eeat-trust-auditor` — any new claim that needs a source
- `security-auditor` — form, PII, dependency and secret hygiene

## Verdict

Report the gate as **one** of:

- **Green** — five commands pass, all 25 assertions hold. Safe to deploy (still ask first).
- **Green with known defects** — passes, but ships a documented defect from
  `docs/optimization-backlog.md`. Name them explicitly; do not let a known bug pass as clean.
- **Red** — name the failing command or assertion and stop. Do not deploy.

Never report "ready to ship" without having actually run the commands. If you skipped a step, say which
one and why. **A `qa:gate` failure is never fixed by editing the assertion** — fix the output, or change
a threshold only when the route change behind it was intentional.
