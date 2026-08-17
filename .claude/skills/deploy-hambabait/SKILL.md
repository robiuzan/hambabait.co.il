---
name: deploy-hambabait
description: Ship hambabait to production — ops/deploy-site.ps1 dry-run then -Confirm (wrangler direct upload to the Cloudflare Pages project "hambabait"), why the green GitHub Actions run publishes to a dead origin, the npm file: tarball and .next cache traps, the out.prev rollback, and post-deploy verification against the live site. Use when publishing. Triggers: "deploy", "ship it", "publish the site", "go live", "roll back", "why isn't my change live", "did the deploy work".
---

# Deploy

**Deploying is a production mutation. Always ask before running the `-Confirm` step.**

## The one thing to get right

There are **two** deploy paths wired to this repo and only one of them changes the public site.

| Path                                           | Trigger                    | Lands on                             | Serves the apex? |
| ---------------------------------------------- | -------------------------- | ------------------------------------ | ---------------- |
| `ops/deploy-site.ps1` (wrangler direct upload) | manual, from a workstation | Cloudflare Pages project `hambabait` | ✅ **yes**       |
| `.github/workflows/deploy.yml`                 | every push to `main`       | GitHub Pages origin                  | ❌ no            |

The Actions run still fires, still succeeds, and still shows a green checkmark. It publishes to an
origin that no longer answers for `hambabait.co.il`. **A green CI run is not evidence that anything
changed publicly** — this is the exact failure mode the fleet script was written to prevent.

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

Run the full gate, not just the build. **CI runs only `npm run build`**, so lint, type and format
errors ship unless you catch them here.

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

- **`public/.htaccess`** — Apache directives. Neither GitHub Pages nor Cloudflare Pages interprets
  them. It is copied into the export and served as an ordinary static file.
- **`public/CNAME`** — the GitHub Pages custom-domain binding. Vestigial now that the apex points at
  Cloudflare; on Pages it is just a static file.
- **`public/_headers` / `public/_redirects`** — do not exist in this repo. Cloudflare Pages _would_
  honour them, so they are the correct place to add redirects if ever needed. See
  `web-security-headers` before assuming headers can be set from here.
- **Next `redirects()` / `headers()`** — unavailable under `output: "export"`.

## Housekeeping the migration left behind

The fleet migration note set a cleanup deadline of **2026-08-09** for the old origins. The GitHub
Actions workflow and `public/CNAME` are both still armed past it. Until someone removes them, expect:

- a green Actions run on every push that means nothing;
- `https://hambabait.co.il/CNAME` and `/.htaccess` returning 200 as public static files.

Raise it; don't silently delete the workflow — that is an owner decision, and the GitHub Pages origin
is nominally still a rollback target.
