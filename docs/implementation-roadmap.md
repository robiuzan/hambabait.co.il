# Implementation roadmap — חם בבית

> **Phase 2.** The sequenced plan from the verified state of 2026-08-31 to a site that is honest,
> fast, accessible, well-measured and as visible as its off-site assets allow.
>
> **Updated 2026-08-31, after a working pass that closed ten items across five sprints — out of
> order.** Read §0.1 before assuming a sprint is untouched, and §0.2 before assuming this board is
> the same board it was yesterday.
>
> Every item below traces to something **verified in this repo or in a fresh `out/`** — see
> [README.md](README.md) §0. Nothing here is aspirational filler.
> Effort: **S** ≤1h · **M** a few hours · **L** a day or more.

---

## 0. The state we are starting from

**Most of the conventional technical-SEO work is already done.** 45 indexable URLs, 45/45 JSON-LD,
45/45 canonical↔sitemap parity, unique non-doubled titles, one H1 per page, zero banned RTL
utilities, real per-city and per-service depth, a 12-guide knowledge hub, Consent Mode v2 shipping
denied-by-default, **a complete JSON-LD graph**, and **a machine-checked release gate**
(`npm run qa:gate`, 25 assertions, 25 passing).

So this roadmap is **not** "add schema and fix titles". It is:

1. Make the environment stop describing a site that no longer exists.
2. Capture a baseline **before** anything else ships.
3. Close the honesty and compliance gaps that carry real risk.
4. Finish the small technical remainder.
5. Earn a standard we may actually claim.
6. Grow the surface that is still ours to win.
7. Unblock the off-site work, which is owner-gated and has the longest lead time — **start asking on
   day one.**

### Two rules that govern the whole plan

> **The baseline rule.** [measurement.md](measurement.md) §0 is empty. **A baseline recorded after a
> change is not a baseline.** Capturing it is the first gate, and it needs console access this repo
> does not have.

> **The four-week rule.** No ranking or conversion change is attributed to a deploy inside four
> weeks. Plan the read-outs accordingly; do not let anyone declare victory in week one.

### Every sprint ends the same way

```bash
npm run lint && npm run typecheck && npm run format:check && npm run build && npm run qa:gate
```

**Five commands now, not four.** CI still runs only the first four, so `qa:gate` is a local
obligation. Then `ops/deploy-site.ps1 -Domain hambabait.co.il -DryRun`, then `-Confirm`.
**Deploying is a production mutation — always ask first.** A green CI run deploys nothing.

---

## 0.1 What shipped on 2026-08-31

| #        | What actually shipped                                                                                         | Evidence                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **S0-3** | The owner questions consolidated into one list                                                                | [owner-questions.md](owner-questions.md)                                        |
| **S1-2** | The roster's softened `shortPitch` synced into `site.config.json` via the new `ops/sync-manifest.ps1`         | The homepage JSON-LD `description` no longer carries the warranty claim         |
| **S1-3** | **Partial.** The form's consent notice moved **above** the submit button, wired to it with `aria-describedby` | `LeadForm.tsx`; no checkbox — see the row in Sprint 1                           |
| **S2-1** | The `WebSite` node on the homepage. Deliberately **no** `SearchAction` — the site has no search               | `grep -rl '"@type":"WebSite"' out` = 1, and `qa:gate` asserts it                |
| **S2-3** | `assertManifest()` at module load in `lib/site-config.ts`                                                     | A malformed `site.config.json` now fails the **build**, not a visitor's browser |
| **S2-4** | `scripts/qa-gate.mjs` + `npm run qa:gate`                                                                     | **25 assertions, 25 passed, 0 failed**                                          |
| **S2-5** | Footer year from `new Date().getFullYear()` at build time                                                     | Correct in 2027 without a code change                                           |
| **S3-5** | The contrast sweep, and the four failures it found, fixed                                                     | Ratios in [accessibility-and-i18n.md](accessibility-and-i18n.md) §2.1           |
| **S4-4** | `public/llms.txt` at **45/45** sitemap coverage; zero orphans                                                 | Compared after `decodeURI` — the sitemap escapes Hebrew, `llms.txt` does not    |
| **S7-2** | A **report-only** CSP in `public/_headers` — with `'unsafe-inline'` and **no hashes**                         | [ux-cro-security.md](ux-cro-security.md) §4.1                                   |

Plus an accessibility batch that was not on the board at all: WhatsApp button contrast, the
`FinalCta` body opacity, the `LeadForm` borders and placeholders, full-strength focus rings,
`tabindex="-1"` on `<main>` so the skip link works, keyboard-reachable scroll containers, `sr-only`
captions on the six service tables, and a mobile menu panel that scrolls and releases its scroll lock.

> **These sprints did not complete in order, and the plan did not fail.** The work was driven by
> audits, and an audit finds what it finds. Two consequences worth stating rather than discovering:
>
> 1. **S1-1, the baseline, is still empty** — and several of the items above are exactly the kind
>    that move numbers. Every day they sit deployed without a baseline is a day of un-attributable
>    change. It is still the highest-priority item on this board.
> 2. ~~**Shipped is not deployed.**~~ **DEPLOYED 2026-08-31** — `ops/deploy-site.ps1 -Confirm`,
>    110 of 140 files uploaded to the Cloudflare Pages project `hambabait`, drift check green.
>    Verified against the **live** site, not the build: `WebSite` node present, the softened
>    `shortPitch` serving as the JSON-LD `description` (old warranty text returns 0), no
>    `text-white` on the WhatsApp green, `<main tabindex="-1">`, the Consent Mode default preceding
>    `gtm-init`, the report-only CSP present with no zone duplicate, immutable caching honoured on a
>    hashed asset, and 9 sampled sitemap URLs — including percent-escaped Hebrew ones — all 200 with
>    no redirect hop. **Still verify against the live site rather than this table.**

### ⚠️ The deploy happened before the baseline

**S1-1 was not captured first.** Everything in §0.1 is now live, and the "before" numbers for it no
longer exist. This does not undo the work — most of it is correctness, accessibility and honesty,
which is worth doing unmeasured — but it does mean:

- **No item in §0.1 can be credited with a ranking or conversion change**, ever. There is nothing to
  compare against.
- The baseline captured now is a **post-change** baseline. Label it as such in
  [measurement.md](measurement.md) so nobody later mistakes it for the original.
- **Capture it now anyway.** It is the "before" for everything that comes next, and every day it
  slips makes the next tranche just as un-attributable.

Two live changes make this more urgent, not less: the `data-cta` split (N-1) means three placement
metrics are broken until the GTM container is updated, and Consent Mode denies analytics storage by
default — so measured traffic will legitimately fall. **Both would look like a regression in a
naive week-one read.**

## 0.2 What the audits added to the board

Five items that did not exist yesterday. Three are owner actions and one of them is urgent:

- **The GTM container is behind the repo** — 27 `data-cta` values now ship and three changed
  meaning. Until the container is updated it records less than it did before. **N-1**, below.
- **`lead_submit_blocked` fires into nothing** until a tag and trigger exist. **N-2**.
- **The header reaches 0 of the 6 service pages in one hop.** A submenu was considered and
  deliberately deferred as a design decision. **N-3**.
- **The mobile menu does not trap focus.** **N-4**, folded into Sprint 3.
- **Nine URLs have no answer block** — the static routes. **N-5**, folded into Sprint 4.

---

## Sprint 0 — make the environment tell the truth · S–M

**Why first:** every agent in `.claude/` reads its instructions before doing anything. Several still
describe the pre-build site — an absent knowledge hub, 18 templated city pages, no consent gate, an
accessibility statement asserting conformance. **An agent working from those will "fix" things that
are already fixed and miss what is actually broken.** This is the cheapest sprint and it multiplies
every one after it.

| #        | Item                                                                                                                                                    | Owner | Effort | Status                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------ | ------------------------------------------------------ |
| **S0-1** | Body-level de-staling of `.claude/`. Frontmatter descriptions were corrected first; the **bodies** carried false state                                  | Us    | M      | 🔄 **in progress in this pass**                        |
| **S0-2** | Re-baseline the stale docs: `optimization-backlog.md`, `topical-map.md`, `content-standards.md`, `keyword-map.md`, and the nine strategy/standards docs | Us    | M      | 🔄 **in progress in this pass**                        |
| **S0-3** | Record the **[needs confirmation]** questions as one message to the owner                                                                               | Us    | S      | ✅ **done** — [owner-questions.md](owner-questions.md) |

**The acceptance test for S0-1 and S0-2** is the drift table in [README.md](README.md) §3: no file in
`docs/` or `.claude/` may assert that there is no sync script, that the `WebSite` node is unbuilt,
that there are 32 indexable URLs or 21 `data-cta` values, that the header reaches all six services,
that the mobile menu traps focus, that a hash-based CSP is the only path, or that the gate is four
commands.

**Files known stale (S0-1):** `.claude/agents/` — `aeo-geo-strategist`, `content-strategist`,
`eeat-trust-auditor`, `gbp-offsite-strategist`, `security-auditor`, `seo-auditor`,
`local-seo-strategist`, `hebrew-copywriter`, `competitor-analyst`, `media-asset-producer`,
`perf-a11y-auditor`. `.claude/skills/` — `aeo-answer-content`, `new-article`,
`schema-structured-data`, `tracking-analytics`, `web-security-headers`, `consent-mode`,
`city-research`, `internal-linking`, `local-seo-il`, `new-city`, `search-console-ops`,
`responsive-accessibility`, `qa-build-gate`, `content-refresh`, `hebrew-rtl`.

> Some hits are legitimate — a skill describing the problem it exists to solve is not stale. **Read
> before editing;** the test is whether the sentence claims something false about the site _today_.

**Exit:** an agent invoked cold produces findings about the real site.

---

## Sprint 1 — honesty, consent and the baseline · S–M

**Why now:** these are the only items on the board with real downside risk — a policy violation, a
compliance gap, a lead that reaches nobody, or a metric nobody can interpret. They are also cheap.

| #        | Item                                                                                                            | Owner     | Effort | Status / acceptance                                                                                                                                                          |
| -------- | --------------------------------------------------------------------------------------------------------------- | --------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **S1-1** | **Capture the measurement baseline** — GSC and GA4, split by page type, dated, with the source named per figure | **Owner** | S      | ⬜ **open, and now the oldest debt on the board.** [measurement.md](measurement.md) §0 must be populated                                                                     |
| **S1-2** | **Remove the last unsourced claim in structured data**                                                          | Us + hub  | S      | ✅ **done** — with a corrected acceptance test, below                                                                                                                        |
| **S1-3** | Consent affordance on the lead form. **State it as a trade** — one more required interaction before submit      | Us        | S      | 🟡 **partial** — notice above the submit button with `aria-describedby`. **No required checkbox**: an owner decision with a real conversion cost, recorded as an open option |
| **S1-4** | Verify container-side consent: the tags inside `GTM-KWGGH438` must actually respect the signal                  | **Owner** | S      | ⬜ Tag Assistant shows tags held with consent denied, firing when granted                                                                                                    |
| **S1-5** | Confirm which mailbox the Web3Forms key delivers to                                                             | **Owner** | S      | ⬜ A test lead arrives in a mailbox someone reads                                                                                                                            |
| **S1-6** | Resolve the `lead_submit` / `/תודה/` **double-count**                                                           | **Owner** | S      | ⬜ Exactly **one** of the two is the GA4 conversion                                                                                                                          |
| **S1-7** | Settle the roster `_needsConfirmation` items — phone routing, email, hours, pricing approach                    | **Owner** | S      | ⬜ Array emptied in the roster, or each item explicitly re-affirmed                                                                                                          |

### S1-2 — done, and the acceptance test it was written with was wrong

The original test was `grep -rl "אחריות על העבודה" out --include=index.html` returning nothing. **That
test is too broad and it would fail forever.** The phrase also occurs in a _different_, deliberately
softened homepage FAQ answer about the terms being stated before work begins — a separate,
pre-existing item, judged on its own merits, and not a regression.

**The correct test:** the JSON-LD `description` no longer carries a warranty claim. The roster's
softened `shortPitch` was synced into `site.config.json`, so the homepage `description` is now the
softened text. A substring grep cannot tell a structured-data claim from a paragraph — write the
assertion against the node you actually care about.

> ⚠️ **The process gap S1-2 exposed is closed — mostly.** The rule is "edit the roster, never
> `site.config.json`", and for months there was **no roster→repo sync script**, so a roster edit
> alone changed nothing public. That was verified the hard way on 2026-08-25, when a softened
> `shortPitch` was edited in the roster and the old text kept shipping as the JSON-LD `description`.
> **`ops/sync-manifest.ps1` + `ops/sync-manifest.mjs` now exist**: field-level diff, `-DryRun` /
> `-Confirm`, stripping `$schema` and `_needsConfirmation` and writing the assumptions to
> [manifest-assumptions.md](manifest-assumptions.md) instead — because `site.config.json` is bundled
> into the client JS, so internal caveats would otherwise ship to visitors. **What is still manual:**
> running it. A roster edit nobody syncs still changes nothing public.

**Exit:** no unsourced claim in any built page ✅, consent working end to end (S1-4 open), leads
provably arriving (S1-5 open), one conversion definition (S1-6 open), and a baseline that makes every
later claim falsifiable (S1-1 open).

---

## Sprint 2 — finish the technical remainder · S–M

**Why now:** small, well-understood, and it closes the schema graph. **Four of the five are done.**

| #        | Item                                                                                             | Owner          | Effort | Status                                                                                                                                                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------ | -------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **S2-1** | **`WebSite` node on the homepage** — the last unbuilt node in [schema-graph.md](schema-graph.md) | Us             | S      | ✅ **done.** `grep -rl '"@type":"WebSite"' out` = 1. **No `SearchAction`** — the site has no search, and marking one up is a false capability claim. `qa:gate` asserts both halves                                                                     |
| **S2-2** | Supply `googleSiteVerification`, verify in GSC, submit the 45-URL sitemap                        | **Owner** + us | S      | ⬜ **open.** The `verification` block exists and is guarded on presence; the manifest value is still `null`, so it emits nothing                                                                                                                       |
| **S2-3** | Validate the manifest at build                                                                   | Us             | M      | ✅ **done.** `assertManifest()` runs at module load; a broken manifest fails `npm run build`                                                                                                                                                           |
| **S2-4** | Extend the build gate                                                                            | Us             | M      | ✅ **done.** 25 assertions — route counts, unique non-doubled titles, one H1, canonical↔sitemap byte parity, JSON-LD parseability, the `WebSite` node, consent ordering, banned schema properties, priced `Offer`, banned physical-direction utilities |
| **S2-5** | Footer year was hardcoded `2026` — silently wrong from 2027-01-01                                | Us             | S      | ✅ **done.** Computed at build time; any rebuild within the year is correct                                                                                                                                                                            |

**Exit:** the schema graph is complete ✅, the gate catches the regressions this site has actually
suffered ✅, and ownership is verified in GSC — **still the owner's move.**

---

## Sprint 3 — earn an accessibility standard we may claim · M–L

**Why now:** the statement currently says, honestly, that **no external audit exists**. That is the
right thing to say and the wrong thing to leave true. WCAG 2.1 AA is the build target; ת״י 5568
adopts WCAG 2.0 AA, so clearing 2.1 clears the Israeli baseline with margin.

> **The blocker that governs this sprint: no browser automation is installed in this environment.**
> S3-1 and S3-4 cannot be executed here at all, and S3-3 never could be. That is a tooling gap, not
> a scheduling one — say so plainly rather than leaving the rows looking merely undone.

| #        | Item                                                                                                    | Owner     | Effort | Status                                                                                                                                                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------------- | --------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **S3-1** | axe + Lighthouse a11y across the four page types (home, service, city, guide)                           | Us        | M      | ⛔ **blocked** — no browser automation available here                                                                                                                                                                            |
| **S3-2** | Full keyboard pass — the pass that finds the real bugs                                                  | Us        | S      | 🟡 **partial.** Keyboard defects were found and fixed by reading (scroll containers, skip link, menu Escape). A rendered tab-through has not been done                                                                           |
| **S3-3** | **Screen-reader pass** — NVDA in Hebrew + VoiceOver iOS                                                 | Us        | M      | ⬜ open — the single biggest remaining unknown                                                                                                                                                                                   |
| **S3-4** | Reflow at 320 px and 400 % zoom                                                                         | Us        | S      | ⛔ **blocked** — reasoned from the CSS, never rendered                                                                                                                                                                           |
| **S3-5** | Contrast sweep of **every** pair, not just the primary                                                  | Us        | S      | ✅ **done.** Four failures found and fixed — 1.98 → 5.14:1 (WhatsApp fills), 4.23 → 4.83:1 (`FinalCta` body), 1.47 and 2.60 → 4.84:1 (form borders and placeholders), plus full-strength focus rings. **Computed, not rendered** |
| **S3-6** | Update `/הצהרת-נגישות/` to add what was newly verified — **and still claim no conformance**             | Us        | S      | ⬜ **now overdue.** The page still says not every colour pair was checked, which S3-5 made untrue. Under-claiming is the safe direction to be wrong in, but it is still wrong                                                    |
| **N-4**  | **Give the mobile menu a real focus trap.** It closes on Escape and returns focus; it does **not** trap | Us        | S      | ⬜ new, from the audit                                                                                                                                                                                                           |
| **S3-7** | _(Optional, owner)_ Commission an external audit and name an accessibility coordinator                  | **Owner** | —      | ⬜ Only this unlocks a conformance claim                                                                                                                                                                                         |

**Exit:** the known-limitations list in the statement is materially shorter, and every remaining item
is true. **We are not there:** the list is shorter by one line and longer by the honesty that the
contrast work is computed rather than rendered.

---

## Sprint 4 — content depth and AEO reach · L

**Why now:** with risk closed and measurement live, this is the surface still genuinely ours to win.
The local pack is not available to us (Sprint 6); the answer layer is.

| #        | Item                                                                                                          | Owner | Effort | Status                                                                                                                                                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------------------- | ----- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **S4-1** | Deepen the three weakest city pages — `rehovot`, `raanana`, `kfar-saba` ([city-briefs.md](city-briefs.md) §6) | Us    | M      | ⬜ ≥2 paragraphs per city that could not be written about any other                                                                                                                                                              |
| **S4-2** | Extend the guide cluster into the symptom long-tail. **Brief before writing** (`content-brief`)               | Us    | L      | ⬜ Each guide: question-form H2 + self-contained answer + `Article` + `FAQPage`; no cannibalisation of an existing URL                                                                                                           |
| **S4-3** | Answer-block audit across all 45 URLs                                                                         | Us    | M      | ✅ **audited.** 36 of 45 carry one; bodies run **32–47 words** (mean 38.8), every question and body unique. The 40–60 band is **guidance, not a gate** — see below                                                               |
| **N-5**  | Answer blocks for `/מחירון/`, `/שירותים/`, `/איזורי-שירות/`                                                   | Us    | M      | ⬜ **deferred, not rejected** — needs a content brief and a decision about which component renders it. ⚠️ **A `/מחירון/` block may not state a price or a pricing approach** — that is one of the unconfirmed roster assumptions |
| **S4-4** | Orphan and mesh check after every addition; keep `public/llms.txt` in sync                                    | Us    | S      | ✅ **done, and permanently re-openable.** Zero orphans; `llms.txt` at 45/45. It is hand-maintained and nothing fails the build if it drifts                                                                                      |
| **S4-5** | Stand up the refresh cycle — `dateModified` moves **only** on a real substantive edit                         | Us    | S      | ⬜ A written cadence in [measurement.md](measurement.md); no date bumped for freshness theatre                                                                                                                                   |

> **On S4-3's original acceptance bar.** It asked for a 40–60 word answer on every page. The measured
> reality is 32–47 words, and the blocks are self-contained and they work. Rewriting sound Hebrew to
> clear a self-imposed floor is churn, and padding an answer block is how fabrication gets in.
> **The real bar is: does it survive being lifted out of the page?** Keep the word range as guidance
> and stop treating it as a gate.

**Exit:** every cluster in [topical-map.md](topical-map.md) has a home, and every page worth quoting
is quotable. The 9 URLs without an answer block are the 9 static routes; the two legal pages and
`/צור-קשר/` do not need one.

---

## Sprint 5 — visual assets and the performance trade · M

**Why here and not earlier:** the site ships **zero raster images** and its LCP is **text**, which is
close to optimal. Every asset added spends a budget that is currently unspent. That is fine — but it
is a trade, and it should be made deliberately, after the things that carry no cost.

| #        | Item                                                                                      | Owner     | Effort | Status                                                                                          |
| -------- | ----------------------------------------------------------------------------------------- | --------- | ------ | ----------------------------------------------------------------------------------------------- |
| **S5-1** | Extend inline SVG diagrams — the one honest, near-free visual class                       | Us        | M      | 🟡 the first diagrams ship (`GuideDiagram`); extending them is ongoing                          |
| **S5-2** | Ship a **local** OG image; today it depends on an external host                           | Us        | S      | ⬜ open — `og:image` still resolves from `imgquarry.com`                                        |
| **S5-3** | Hero image **decision**, measured before and after. If LCP passes 2.0 s, it does not ship | Us        | M      | ⬜ Recorded before/after per [performance-guidelines.md](performance-guidelines.md) §8          |
| **S5-4** | _(Owner-gated)_ Real photos of real work → enables case studies                           | **Owner** | —      | ⬜ Permission, no identifying detail, EXIF stripped. **Never stock photography of technicians** |

**Exit:** the site has visual substance without having spent its best technical asset.

---

## Sprint 6 — off-site authority · owner-gated, longest lead time

**Blocked until S1-7.** Start the conversation in Sprint 0; execute when the confirmations land.

> ⛔ **Do not publish a Business Profile or a single citation while the phone routing, email and
> hours are still flagged as assumptions.** A citation corpus built on a wrong number must be
> unwound directory by directory, and the inconsistency period actively hurts. **Waiting is cheaper
> than correcting.**

| #        | Item                                                                              | Owner     | Acceptance                                                                       |
| -------- | --------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| **S6-1** | Google עסק שלי as a service-area business (no storefront, address hidden)         | **Owner** | Verified profile live                                                            |
| **S6-2** | Add the verified profile URL to the roster `sameAs` → sync it into the JSON-LD    | Us        | `sameAs` no longer empty — the strongest entity signal available                 |
| **S6-3** | Ranked Israeli directory citations, byte-identical NAP                            | **Owner** | [entity-profile.md](entity-profile.md) strings, exactly                          |
| **S6-4** | Honest review acquisition — WhatsApp ask, at the moment the hot water works again | **Owner** | Real reviews accumulating. **No incentives, no gating, no drafting, no seeding** |
| **S6-5** | A **real** named author for the guides                                            | **Owner** | A real person, real role. Never an invented byline                               |

> **`Review`/`AggregateRating` markup ships only after S6-4 produces real, attributable reviews.**
> Not before, under any pressure. `qa:gate` now fails the gate if any of it appears, which makes the
> rule harder to break by accident — not harder to break on purpose.

**Exit:** the entity resolves to something outside our own website — which is the one thing on-site
work can never substitute for.

---

## Sprint 7 — security hardening · M

**Why last:** the current posture is defensible. **S7-2 shipped, and it invalidated the shared
premise of S7-3 and S7-4** — read the note before touching either.

| #        | Item                                                                                                      | Owner     | Effort | Status                                                                                                  |
| -------- | --------------------------------------------------------------------------------------------------------- | --------- | ------ | ------------------------------------------------------------------------------------------------------- |
| **S7-1** | Verify live response headers and record which come from the zone vs `public/_headers`                     | Us        | S      | ⬜ open — and it must now also confirm **exactly one** `Content-Security-Policy-Report-Only` comes back |
| **S7-2** | **CSP in report-only**                                                                                    | Us        | M      | ✅ **done** — `'unsafe-inline'`, **no hashes**, tight everything else                                   |
| **S7-3** | ~~Build-gate assertion that the CSP hashes match the shipped inline scripts~~                             | Us        | —      | ❌ **impossible, and correctly dropped** — see below                                                    |
| **S7-4** | Decide whether enforcing buys anything                                                                    | Us        | S      | ⬜ open, and **no longer a formality**                                                                  |
| **S7-5** | Document the exact zone toggles for the owner (HSTS, cache TTL, AI-crawler rules) — **never assume done** | Us        | S      | ⬜ A checklist the owner can execute and confirm                                                        |
| **S7-6** | Web3Forms rate limiting / spam controls in the dashboard                                                  | **Owner** | S      | ⬜ Spam volume acceptable. `lead_submit_blocked` (N-2) is what will make that volume visible            |

### Why S7-3 cannot exist, and what replaced it

A hash-based `script-src` is **not achievable on this site**. Next.js App Router serialises the React
Flight payload into bare inline `<script>` tags — **169 distinct bodies across the 48 built HTML
files**, changing every build. CSP ignores `'unsafe-inline'` the moment any hash appears, so listing
the two snippets we control (`consent-default`, `gtm-init`) would block all 169 and **render every
page blank**. A nonce needs a server; `output: "export"` has none.

So the gate asserts different things instead — the ones that are both checkable and worth checking:
the consent default precedes the container, no banned schema property, no priced `Offer`, canonical
parity. **Any doc still calling a hash-based CSP "the only workable path" is wrong.**

**S7-4 is now a real decision, not a formality.** Enforcing a policy that carries `'unsafe-inline'`
buys the non-script directives — `base-uri`, `object-src`, `frame-ancestors`, `form-action` and the
connect/frame/img/font allowlists — and nothing at all on script injection. That is a genuine gain
and a modest one, weighed against a genuine risk: the container is shared across the Israeli fleet,
and a tag added there for another site can pull from an origin this allowlist does not carry.
**And there is no `report-uri`**, so violations land in DevTools only. Report-only with nobody
reading the reports buys nothing — that is the first thing to fix in this sprint, before enforcing
anything.

---

## N — added by the 2026-08-31 audits

| #       | Item                                                                                                                                                                                        | Owner     | Effort | Why it matters                                                                                                                                                                                                                                                                              |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **N-1** | **Update the GTM container for the new `data-cta` inventory.** 27 values now; `header-call` split into `header-call`, `header-call-icon` and `mobile-menu-call`; four `*-form-submit` added | **Owner** | S      | 🔴 **Urgent.** Triggers match these strings literally. Until it happens the new values record nothing and the old `header-call` aggregate has lost two of its three sources — a silent zeroing that reads as a decline in the dashboard                                                     |
| **N-2** | Tag + trigger for `lead_submit_blocked` (honeypot catches)                                                                                                                                  | **Owner** | S      | Turns bot pressure on a public-key form endpoint from invisible into a number. Keep it out of any conversion definition                                                                                                                                                                     |
| **N-3** | **Header services submenu — a design decision, deliberately deferred**                                                                                                                      | **Owner** | S      | The header reaches **0 of 6** service pages in one hop. The footer links all 6 and all 18 cities on every page, so orphan insurance is met and this is a reach improvement, not a defect. A six-item dropdown on a nav whose mobile job is to stay out of the call button's way is not free |
| **N-4** | Mobile-menu focus trap — folded into Sprint 3                                                                                                                                               | Us        | S      | Escape and focus return already work; nothing holds focus inside the panel                                                                                                                                                                                                                  |
| **N-5** | Answer blocks for the three commercial static routes — folded into Sprint 4                                                                                                                 | Us        | M      | ⚠️ No price and no pricing approach on `/מחירון/`                                                                                                                                                                                                                                           |

---

## The critical path, at a glance

```
S0 (environment truth)  ──►  S1 (baseline + honesty + consent)  ──►  S2 (technical remainder)
   🔄 in progress             S1-2 ✅  S1-3 🟡  S1-1 ⬜ owner        S2-1 ✅ S2-3 ✅ S2-4 ✅ S2-5 ✅
                                      │                                   S2-2 ⬜ owner
                                      │                                        │
                                      │                                        ▼
                                      │                              S3 (accessibility)
                                      │                              S3-5 ✅ · S3-1 / S3-4 ⛔ no browser
                                      ▼                                        │
                        S6 owner asks sent on day one              S4 (content + AEO depth)
                        ──────────────────────────────►             S4-3 ✅  S4-4 ✅
                        (long lead time; runs in parallel)                     │
                                                                               ▼
                                                                   S5 (visual assets, measured)
                                                                               │
                                                                               ▼
                                                                     S7 (security hardening)
                                                                     S7-2 ✅ · S7-3 ❌ impossible

N-1 (the GTM container) sits outside this path and blocks nothing — which is exactly why it will be
forgotten. It is also the only item on the board that silently corrupts data while everything on
screen looks fine.
```

**Sequencing principles, if a trade-off comes up:**

1. **Truth before speed.** An environment that misdescribes the site makes every later sprint slower.
2. **Baseline before change.** Otherwise no improvement is provable — and this pass shipped ten items
   ahead of the baseline, which is the one sequencing rule it broke. Say so rather than quietly
   re-drawing the arrow.
3. **Risk before growth.** A policy violation costs more than a ranking gains.
4. **Owner-gated work starts first even though it finishes last** — it is the only work with a lead
   time we do not control, and **eleven open items are owner-gated or owner-blocked.**
5. **Cheap and certain before expensive and speculative.**
6. **Never spend the honesty record to accelerate any of it.**
