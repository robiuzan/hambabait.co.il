---
name: qa-build-gate
description: The release gate before any deploy for hambabait — clean lint, typecheck, format:check and build (none of which CI runs except build), plus assertions on out/ for route count, unique non-doubled titles, one H1, canonical presence and sitemap parity, and the auditor sweep. Use before every deploy or when asked whether the site is ready to ship. Triggers: "run the build gate", "is this ready to ship", "pre-deploy check", "QA the site", "verify the build", "did I break anything".
---

# Build gate

Nothing ships on a red gate. **CI is not a substitute** — `.github/workflows/deploy.yml` runs only
`npm run build`, so lint, type and formatting errors reach production unless caught here.

## 1. The four commands

```
npm run lint && npm run typecheck && npm run format:check && npm run build
```

All four must pass. Notes specific to this repo:

- **`typecheck`** is the only thing enforcing `noUncheckedIndexedAccess`. Indexed reads in the two
  dynamic routes return `T | undefined` and must be narrowed — this is where it fails.
- **`format:check`** has failed on uncommitted work before (`app/layout.tsx`). Run `npm run format`
  to fix, then re-check.
- **`build`** is the only step CI runs, so a green Actions run tells you nothing about the other three.

## 2. Output assertions on `out/`

The build succeeding does not mean the output is correct. Verify the artifact.

### Route count

```bash
find out -name index.html | wc -l      # expect 33 = 32 indexable + out/404
grep -c '<loc>' out/sitemap.xml        # expect 32
```

32 = 1 home + 7 Hebrew static + 6 services + 18 locations. If either number moves, a route was added
or lost — confirm it was intentional.

### Titles — unique, and brand exactly once

```bash
# every title
grep -h -o '<title>[^<]*</title>' $(find out -name index.html) | sort | uniq -c | sort -rn

# the doubled-brand regression
grep -l 'חם בבית | חם בבית' $(find out -name index.html)
```

The second command **must return nothing**. It currently matches 24 pages — see the `seo-metadata`
skill. Treat any hit as a release blocker once fixed.

### One H1 per page

```bash
for f in $(find out -name index.html); do
  n=$(grep -o '<h1' "$f" | wc -l); [ "$n" -eq 1 ] || echo "$n H1s: $f"
done
```

### Canonicals present and self-referencing

```bash
for f in $(find out -name index.html); do
  grep -q 'rel="canonical"' "$f" || echo "NO CANONICAL: $f"
done
```

Every page must have one. The 404 is the known exception to _self_-referencing — it currently
canonicalizes to `/`, which is a defect, not an allowance.

### Sitemap parity — the two invariants

```bash
# 1. every loc ends in a slash
grep -o '<loc>[^<]*</loc>' out/sitemap.xml | sed 's/<[^>]*>//g' | grep -v '/$'   # expect empty

# 2. Hebrew locs are percent-escaped, not raw UTF-8
grep -o '<loc>[^<]*</loc>' out/sitemap.xml | grep -P '[\x{0590}-\x{05FF}]'        # expect empty
```

A slashless entry costs a redirect hop. A raw-UTF-8 entry 404s at the host.

### JSON-LD presence

```bash
grep -rl 'application/ld+json' out --include=index.html | wc -l
```

Today this is **7** (homepage + 6 service pages). The 18 location pages emit nothing. That is the
current known state, not the target — see `docs/schema-graph.md`. Assert it does not _regress_ below
7, and celebrate when it rises.

### Nothing unsourced crept into schema

```bash
grep -rEo '"(aggregateRating|review|ratingValue|reviewCount|foundingDate|warrantyPromise)"' out | sort -u
```

**Must return nothing.** Any hit means an unsourced claim reached structured data — a policy problem,
not a bug. Check `docs/business-facts.md` before doing anything else.

### Build hygiene

```bash
du -sh out
ls out/.htaccess out/CNAME 2>/dev/null   # both ship as inert static files — expected, not a failure
```

## 3. The auditor sweep

For anything beyond a small change, run the read-only agents and read their reports:

- `seo-auditor` — titles, canonicals, headings, sitemap/robots parity, thin pages
- `schema-auditor` — the JSON-LD graph against `docs/schema-graph.md`
- `perf-a11y-auditor` — Core Web Vitals and WCAG 2.1 AA / IS 5568
- `ts-react-reviewer` — RSC boundaries, strict typing, static-export safety
- `eeat-trust-auditor` — any new claim that needs a source
- `security-auditor` — form, PII, dependency and secret hygiene

## 4. Verdict

Report the gate as **one** of:

- **Green** — four commands pass, all assertions hold. Safe to deploy (still ask first).
- **Green with known defects** — passes, but ships a documented defect from
  `docs/optimization-backlog.md`. Name them explicitly; do not let a known bug pass as clean.
- **Red** — name the failing command or assertion and stop. Do not deploy.

Never report "ready to ship" without having actually run the commands. If you skipped a step, say
which one and why.
