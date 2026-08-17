---
name: deploy-hambabait
description: Ship hambabait to production — ops/deploy-site.ps1 dry-run then -Confirm (wrangler direct upload to the Cloudflare Pages project "hambabait"), why a green CI run deploys nothing, the npm file: tarball and .next cache traps, the out.prev rollback, and post-deploy verification against the live site. Use when publishing. Triggers: "deploy", "ship it", "publish the site", "go live", "roll back", "why isn't my change live", "did the deploy work".
---

# Deploy

**Deploying is a production mutation. Always ask before running the `-Confirm` step.**

## The one thing to get right

There is exactly **one** deploy path: `ops/deploy-site.ps1` (wrangler direct upload) from a
workstation to the Cloudflare Pages project `hambabait`. **Nothing in this repo deploys.**
`.github/workflows/ci.yml` runs the build gate on every push and PR — a green run means the gate
passed, not that production changed.

(Until 2026-08-17 a second workflow, `deploy.yml`, published every push to the dead GitHub Pages
origin, going green while changing nothing public. It was removed along with `public/CNAME` and
`public/.htaccess`. If an older doc mentions it, it predates that cleanup.)

Verify who is serving before you debug anything:

```bash
curl -sI https://hambabait.co.il/ | grep -iE '^(server|cf-ray|cf-cache-status)'
# Cloudflare Pages  ->  Server: cloudflare + CF-RAY + cf-cache-status: DYNAMIC
# GitHub Pages      ->  Server: GitHub.com + X-GitHub-Request-Id
```

`https://hambabait.pages.dev/` serves the same project directly, bypassing the zone — useful for
telling "my build didn't ship" apart from "a zone rule is interfering".

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
6. **Log** — records the deploy in the hub's `logs/`.

## The two staleness traps

Both bite silently — the build succeeds and ships the _old_ thing.

1. **npm caches `file:` tarballs.** `@ishub/site-kit` is installed from
   `vendor/ishub-site-kit-0.0.0.tgz`. Bumping the tarball without a clean reinstall leaves the old
   kit in `node_modules`. If `git status` shows the tarball modified, force the reinstall.
2. **Next caches under `.next/`.** A stale `.next/` can carry forward previous route output. Clear it
   when the kit or config changes.

The script handles both. If you deploy by hand, you own them.

## Before you ship — the gate

Run the full gate locally. CI (`ci.yml`) runs the same four commands, but the deploy script builds
from **your working tree**, not from CI — so what you ship is what your local gate checked.

```
npm run lint && npm run typecheck && npm run format:check && npm run build
```

Then the output assertions in the `qa-build-gate` skill (route count, unique titles, one H1,
canonical presence, sitemap parity). Do not deploy on a red gate.

## After you ship — verify against the live site

Never report a deploy as done without checking the public URL.

```bash
# 1. the origin is who you think it is
curl -sI https://hambabait.co.il/ | grep -i '^server'

# 2. your change is actually present (example: canonical)
curl -s https://hambabait.co.il/ | grep -o 'rel="canonical" href="[^"]*"'

# 3. no sitemap entry redirects — every loc must be 200
curl -s https://hambabait.co.il/sitemap.xml | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g' \
  | while read -r u; do printf '%s %s\n' "$(curl -s -o /dev/null -w '%{http_code}' "$u")" "$u"; done
```

Two cautions on that last loop: the Hebrew URLs must be passed as the escaped form the sitemap
already contains (do not re-encode them — double-encoding produces 404s and looks like a real
outage), and rapid sequential requests can trip edge rate limiting, which returns `000` and reads
like a failure. Space them out or spot-check.

Cloudflare Pages serves `out/404.html` for unknown paths by its own convention.

## Rollback

The previous export is preserved at `out.prev/`. Rolling back is re-uploading it to the same project
via the same script path, or re-deploying a known-good commit's build. There is **no** wrangler
rollback command in this flow and no automatic revert.

`out.prev/` is **not gitignored** (`.gitignore` covers `/out/` only). Never `git add -A` here — you
will commit an entire duplicate site export.

## What is NOT the deploy mechanism

- **`public/_headers`** — response headers on Cloudflare Pages, honoured at the project level. It
  exists here (immutable caching for `/_next/static/*`) but zone-level rules can still override it —
  verify live headers after deploying. See `web-security-headers`.
- **`public/_redirects`** — does not exist yet. Cloudflare Pages would honour it; it is the correct
  place for path redirects if ever needed (mind the Hebrew percent-encoding).
- **Next `redirects()` / `headers()`** — unavailable under `output: "export"`.
- **`public/CNAME` / `public/.htaccess`** — removed 2026-08-17. They were vestiges of the GitHub
  Pages and cPanel eras; if they reappear, someone restored them by mistake.
