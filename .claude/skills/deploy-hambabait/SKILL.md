---
name: deploy-hambabait
description: Ship hambabait to production — the five-command local gate (lint, typecheck, format:check, build, qa:gate), ops/deploy-site.ps1 dry-run then -Confirm (wrangler direct upload to the Cloudflare Pages project "hambabait"), why a green CI run deploys nothing and runs only four of the five commands, the npm file: tarball and .next cache traps, the out.prev rollback, and post-deploy verification against the live site. Use when publishing. Triggers: "deploy", "ship it", "publish the site", "go live", "roll back", "why isn't my change live", "did the deploy work".
---

# Deploy

**Deploying is a production mutation. Always ask before running the `-Confirm` step.**

## ⚠️ Production is behind the working tree

The last recorded deploy is **2026-08-25** (`logs/deploys.csv`, 141 files uploaded). The current
export is 47 HTML pages plus assets, and several substantial changes have landed since: Consent Mode
v2 and the consent banner, the report-only CSP in `public/_headers`, the accessibility contrast and
keyboard fixes, the synced manifest (softened `shortPitch`), the `WebSite` JSON-LD node, and
`scripts/qa-gate.mjs`.

**None of that is live until someone deploys.** Do not answer "is X on the site?" from the source
tree — check the live URL, or check `logs/deploys.csv` for the last upload.

## The one thing to get right

There is exactly **one** deploy path: `ops/deploy-site.ps1` (wrangler direct upload) from a
workstation to the Cloudflare Pages project `hambabait`. **Nothing in this repo deploys.**
`.github/workflows/ci.yml` runs the build gate on every push and PR — a green run means the gate
passed, not that production changed.

(Until 2026-08-17 a second workflow, `deploy.yml`, published every push to the dead GitHub Pages
origin, going green while changing nothing public. It was removed along with `public/CNAME` and
`public/.htaccess`. If an older doc mentions it, it predates that cleanup. The GitHub Pages origin
still exists at the host and simply no longer receives deploys.)

Verify who is serving before you debug anything:

```bash
curl -sI https://hambabait.co.il/ | grep -iE '^(server|cf-ray|cf-cache-status)'
# Cloudflare Pages  ->  Server: cloudflare + CF-RAY + cf-cache-status: DYNAMIC
# GitHub Pages      ->  Server: GitHub.com + X-GitHub-Request-Id
```

`https://hambabait.pages.dev/` serves the same project directly, bypassing the zone — useful for
telling "my build didn't ship" apart from "a zone rule is interfering".

## Before you ship — the gate is FIVE commands

```
npm run lint && npm run typecheck && npm run format:check && npm run build && npm run qa:gate
```

`qa:gate` runs `scripts/qa-gate.mjs` over `out/`: **25 assertions** covering built-page and indexable
counts (47 / 45), sitemap `<loc>` count and byte-identical canonical parity, JSON-LD and canonical
coverage, unique and non-doubled titles, unique descriptions, one `<h1>` per page, the banned schema
properties (`aggregateRating`, `reviewCount`, `ratingValue`, `foundingDate`, `warrantyPromise`) and
banned actions (`SearchAction`, `potentialAction`), no priced `Offer`, the `WebSite` node on the
homepage, Consent-Mode-default-before-`gtm-init` ordering, and banned physical-direction Tailwind
utilities in the built HTML. It reads `out/`, so it must run **after** `build`.

Two asymmetries to keep in mind:

1. **CI runs only four of the five.** `ci.yml` runs `lint`, `typecheck`, `format:check`, `build` —
   **not** `qa:gate`. A green CI run does not mean the output assertions passed.
2. **The deploy script builds from your working tree, not from CI.** What you ship is what your local
   gate checked. The script's own output gate is a fleet-level sanity check (`out/index.html` exists,
   the export is not truncated, `og:image` is not an SVG, the media-host preconnect is present) — it
   does **not** run `qa:gate`. Run it yourself.

Do not deploy on a red gate.

## The deploy

Always dry-run first. The script refuses any target other than `cloudflare-pages`.

```powershell
powershell -File "c:/Users/robiu/antigravity/Projects/Israeli services sites/ops/deploy-site.ps1" -Domain hambabait.co.il -DryRun
powershell -File "c:/Users/robiu/antigravity/Projects/Israeli services sites/ops/deploy-site.ps1" -Domain hambabait.co.il -Confirm
```

What the script does for you, in order:

1. **Drift check** — asks the Cloudflare API whether the Pages project actually serves this domain.
2. **Staleness busting** — see the two traps below.
3. **Build + output gate** — refuses to upload an `out/` that fails its assertions.
4. **Rollback preservation** — moves the previous export to `out.prev/`.
5. **Upload** — `npx wrangler pages deploy .\out --project-name hambabait --branch main`.
6. **Log** — appends a row to the hub's `logs/deploys.csv` (timestamp, domain, project, file count).

### If the manifest changed, sync before you build

`site.config.json` is synced downstream from the roster and must never be edited in the repo. The
sync is its own guarded step and the deploy script does **not** run it — it reads the repo's copy
as-is:

```powershell
powershell -File "c:/Users/robiu/antigravity/Projects/Israeli services sites/ops/sync-manifest.ps1" -Domain hambabait.co.il -DryRun
powershell -File "c:/Users/robiu/antigravity/Projects/Israeli services sites/ops/sync-manifest.ps1" -Domain hambabait.co.il -Confirm
```

This is not hypothetical housekeeping. On **2026-08-25** a softened `shortPitch` was written into the
roster and the old text kept shipping as the live homepage JSON-LD `description`, because at that
time nothing carried it across. Sync, then build, then deploy — in that order.

## The two staleness traps

Both bite silently — the build succeeds and ships the _old_ thing.

1. **npm caches `file:` tarballs.** `@ishub/site-kit` is installed from
   `vendor/ishub-site-kit-0.0.0.tgz`. Bumping the tarball without a clean reinstall leaves the old
   kit in `node_modules`. If `git status` shows the tarball modified, force the reinstall.
2. **Next caches under `.next/`.** A stale `.next/` can carry forward previous route output. Clear it
   when the kit or config changes.

The script handles both. If you deploy by hand, you own them.

## After you ship — verify against the live site

Never report a deploy as done without checking the public URL.

```bash
# 1. the origin is who you think it is
curl -sI https://hambabait.co.il/ | grep -i '^server'

# 2. your change is actually present (example: canonical)
curl -s https://hambabait.co.il/ | grep -o 'rel="canonical" href="[^"]*"'

# 3. the headers _headers is responsible for — expect exactly ONE report-only CSP,
#    and immutable caching on a hashed asset
curl -sI https://hambabait.co.il/ | grep -i 'content-security-policy'
curl -sI https://hambabait.co.il/_next/static/css/*.css | grep -i 'cache-control'

# 4. no sitemap entry redirects — every loc must be 200
curl -s https://hambabait.co.il/sitemap.xml | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g' \
  | while read -r u; do printf '%s %s\n' "$(curl -s -o /dev/null -w '%{http_code}' "$u")" "$u"; done
```

Two cautions on that last loop: the Hebrew URLs must be passed as the **escaped form the sitemap
already contains** (do not re-encode them — double-encoding produces 404s and looks like a real
outage), and rapid sequential requests can trip edge rate limiting, which returns `000` and reads
like a failure. Space them out or spot-check. There are 45 `<loc>` entries.

Cloudflare Pages serves `out/404.html` for unknown paths by its own convention.

## Rollback

The previous export is preserved at `out.prev/`. Rolling back is re-uploading it to the same project
via the same script path, or re-deploying a known-good commit's build. There is **no** wrangler
rollback command in this flow and no automatic revert.

`.gitignore` now covers `/out.prev/` and `*.bak`, so they will not be committed by accident — but
`out.prev/` is still a full duplicate site export sitting in the working tree. Exclude it from greps
and `find`s, and check `git status` before any bulk add.

## What is NOT the deploy mechanism

- **`public/_headers`** — response headers on Cloudflare Pages, honoured at the project level. It
  ships immutable caching for `/_next/static/*` and a **report-only** CSP. Zone-level rules can still
  override or duplicate — verify live headers after deploying. See `web-security-headers`.
- **`public/_redirects`** — does not exist. Cloudflare Pages would honour it; it is the correct place
  for path redirects if ever needed (mind the Hebrew percent-encoding).
- **Next `redirects()` / `headers()`** — unavailable under `output: "export"`.
- **`public/CNAME` / `public/.htaccess`** — removed 2026-08-17. They were vestiges of the GitHub
  Pages and cPanel eras; if they reappear, someone restored them by mistake.
