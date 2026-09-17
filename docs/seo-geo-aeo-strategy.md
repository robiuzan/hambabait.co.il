# SEO · GEO · AEO strategy — חם בבית

> The plan above the maps. [keyword-map.md](keyword-map.md) says _which URL owns a query_;
> [topical-map.md](topical-map.md) says _what shape the subject has_; [competitors.md](competitors.md)
> says _who else is there_. **This file says what we are actually trying to win, in what order, and
> where the ceiling is.**
>
> Cited by `content-strategist`, `local-seo-strategist`, `aeo-geo-strategist`, `seo-auditor`.
> Compiled 2026-08-31 against the verified state in [README.md](README.md) §0.

---

## 0. The strategy in one paragraph

This site cannot win the local pack and should stop pretending otherwise: there is no address, no
geo, no Google Business Profile, no review anywhere, and `sameAs` is empty. What it _can_ win is the
**organic and answer-engine layer** — 45 indexable URLs with complete schema, unique titles, real
per-city and per-service depth, and 12 guides covering the symptom, comparison and definition
clusters. So the strategy is: **concede the pack, take the answer.** Every hour spent on on-page
depth and extractability compounds; every hour spent tuning copy for a query whose screen is owned by
three map results is wasted until the owner acts on §4.

---

## 1. The three surfaces, and our honest position on each

| Surface                         | Who wins it                                         | Our position today                                  | Lever                           |
| ------------------------------- | --------------------------------------------------- | --------------------------------------------------- | ------------------------------- |
| **Local pack** (map results)    | Business Profiles with proximity, reviews, category | ❌ cannot enter — no profile exists                 | **Owner action only** (§4)      |
| **Organic commercial**          | Depth, intent match, internal mesh, schema          | ✅ competitive — 24 commercial URLs, all deep       | Ours, and already largely spent |
| **Organic informational / AEO** | Extractable answers, entity clarity, freshness      | 🟡 built but unproven — 12 guides, no citations yet | **The growth surface.** §3      |

> **The split governs prioritisation.** A recommendation that ignores which surface a query belongs
> to is telling the reader what they want to hear. Before optimising for any query, name its surface.

---

## 2. Clustering — four clusters, one URL each

The subject decomposes into four intent clusters. The **one-intent-one-URL** rule is absolute:
two pages competing for one query cannibalise and neither ranks.

| Cluster                  | Query shape                                 | Owner route          | Count | Depth today                                                   |
| ------------------------ | ------------------------------------------- | -------------------- | ----- | ------------------------------------------------------------- |
| **Commercial — service** | `תיקון דוד שמש`, `החלפת אלמנט`              | `/services/<slug>/`  | 6     | answer block · symptom→cause table · steps · 3 FAQs each      |
| **Commercial — local**   | `תיקון דודים ב<עיר>`                        | `/locations/<slug>/` | 18    | answer block · 2 city-specific paragraphs · 1–2 FAQs          |
| **Informational**        | `למה הדוד לא מתחמם`, `דוד שמש מול דוד חשמל` | `/מדריכים/<slug>/`   | 12    | Article + FAQPage, 4 clusters covered                         |
| **Commercial research**  | `מחיר תיקון דוד`                            | `/מחירון/`           | 1     | answer block · 8 VAT-inclusive price ranges · no call-out fee |

**The commercial-research cluster stopped being a token.** Until 2026-09-17 `/מחירון/` explained an
_approach_ and named no figure. The owner then reversed that policy, so the page publishes eight
VAT-inclusive ranges, an answer block carrying them, and the no-call-out-fee statement.
`מחיר תיקון דוד` is now a query we answer instead of one we deflected. Source of truth for figures:
[business-facts.md](business-facts.md) §1a.

**The expansion cap.** 6 services × 18 cities is **not** 108 pages. The matrix is deliberately kept
at 24, because 108 intersections cannot each carry unique, checkable material and would be doorway
pages by construction. Do not propose the matrix. See [content-standards.md](content-standards.md) §0.

**Hebrew query mechanics** — these propagate to the H1, the title, the description and the schema, so
get them right once: the `ב+city` construction (`בתל אביב`, `בירושלים`, `ברמת גן`), the
`דוד`/`דודים` plural split, and כתיב מלא/חסר spelling variance. The `keyword-research-il` skill owns
the full rule set.

> **No volume or difficulty number may be quoted anywhere in this repo.** No keyword tool is wired
> in. An invented number is indistinguishable from a real one to the next reader, and it will be
> planned against.

---

## 3. AEO / GEO — the growth surface

Answer engines do not rank pages, they **lift passages and attribute them**. That changes what
"optimised" means.

### 3.1 The extraction contract

Every page that wants to be quoted carries, near the top:

1. A **question-form H2** matching how a person actually asks it.
2. Immediately beneath it, a **self-contained answer** — no pronouns referring backwards, no "as
   described above", no dependency on the H1 for meaning. If the paragraph is lifted out of the page
   and pasted into a chat window, it must still be a complete answer.
3. Only then the supporting detail.

**What ships: 37 answer blocks across 45 URLs** — all 6 service pages, all 18 city pages, all 12
guides (`answer: { question, body }` in `lib/content.ts` and `lib/guides.ts`) and `/מחירון/`
(`pricingAnswer`, added 2026-09-17). Every `question` is unique and every `body` is unique; there is
no duplicated block anywhere.

**The 8 URLs without one are the remaining static routes.** `/שירותים/` and `/איזורי-שירות/` are
worth adding one to and it is deferred, not rejected — it needs a content brief and a decision about
which component renders it (§5). The two legal pages and `/צור-קשר/` do not need one; nobody asks an
answer engine what a privacy policy says. The `/מחירון/` block is the one that states figures: it
quotes the published VAT-inclusive ranges and it must stay byte-consistent with `priceRanges` and
the page's meta description — [business-facts.md](business-facts.md) §1a governs all three.

**On the word count: the 40–60 band is guidance, not a gate.** Measured across all 36 blocks the
bodies run **32–47 words** (mean 38.8, median 39): 22 sit under 40, 14 land in the 40–60 band, none
exceeds 60. The band was deliberately widened rather than enforced — the blocks are self-contained
and they read well, and rewriting sound Hebrew to clear a self-imposed floor is churn that invites
padding, and padding on this site invites fabrication. **The test is extractability, not length.**
A 34-word answer that stands alone beats a 52-word answer that needed a filler sentence to get there.

**It is the single highest-leverage pattern on the site — do not let a new page ship without one.**

### 3.2 Structures answer engines prefer

| Structure                | Why it wins                                             | Where it ships                    |
| ------------------------ | ------------------------------------------------------- | --------------------------------- |
| Symptom → cause table    | Directly answers "why is X happening"; trivially parsed | 6 service pages, several guides   |
| Comparison table         | Answers `X מול Y` in one lift                           | `דוד שמש מול דוד חשמל` guide      |
| Definition block         | Feeds the "what is X" turn of a conversation            | definition-cluster guides         |
| Numbered procedure       | Survives summarisation; maps to how-to intent           | service pages, seasonal guides    |
| FAQ with visible answers | `FAQPage` on 37 pages, each matching visible copy       | home · services · cities · guides |

**The rule that keeps this legitimate:** the JSON-LD must match what a human sees. Marking up an FAQ
the page does not display is a structured-data violation, not a shortcut.

### 3.3 Entity clarity — our weakest AEO signal

An answer engine will happily quote this site and attribute the answer to _nobody_, because the
entity is thin: no address, no geo, empty `sameAs`, no profile to resolve against, no named author.

| Signal         | State                    | Unlock                                                  |
| -------------- | ------------------------ | ------------------------------------------------------- |
| `Plumber` node | ✅ ships on 37 pages     | —                                                       |
| `WebSite` node | ✅ ships — homepage only | Done. **No `SearchAction`** — the site has no search    |
| `sameAs`       | ❌ empty                 | **Owner** — a verified profile URL is the strongest fix |
| Address / geo  | ❌ none, by design       | Not fixable, and must not be invented                   |
| Author         | business-attributed only | **Owner** — a real named person; never invent a byline  |
| Dates          | 🟡 guides only           | Correct as is; commercial pages need none               |

The graph is now complete — every node in [schema-graph.md](schema-graph.md) ships. **That does not
make the entity strong.** Completeness is an on-site property; the two signals that would actually
let an answer engine resolve "who said this" are both off-site and both owner-gated. Do not read a
finished graph as a finished entity.

### 3.4 Crawler access — verify, never assume

`app/robots.ts` declares an explicit allow list for retrieval bots (`OAI-SearchBot`, `ChatGPT-User`,
`Claude-User`, `Claude-SearchBot`, `PerplexityBot`, `Perplexity-User`) and training bots (`GPTBot`,
`ClaudeBot`, `Google-Extended`, `Applebot-Extended`, `CCBot`). For a lead-gen site this is correct:
**a crawler that cannot read the page cannot cite it.**

> ⚠️ **Cloudflare can prepend a managed AI-crawler block at the edge that overrides all of it** — it
> did exactly that across this fleet until 2026-08. Nothing in this repo can undo a zone setting.
> Verify the live file, never infer it:
>
> ```bash
> curl -sS -H 'Cache-Control: no-cache' "https://hambabait.co.il/robots.txt?cb=$RANDOM"
> ```

`public/llms.txt` lists all services, all 18 cities and all 12 guides, and its coverage is currently
**45 of the 45 sitemap URLs — zero missing**. It is hand-maintained and nothing fails the build if it
drifts, so re-check it whenever a route is added. Compare after `decodeURI`: the sitemap
percent-escapes Hebrew and `llms.txt` writes raw UTF-8, so a naive string diff reports 7 false
misses. The one "extra" line is the bare origin in the header, not a page.

---

## 4. Local SEO — what is ours and what is the owner's

**Ours (repo-side, done):** the 18-city silo with genuinely city-specific material, `ב+city` grammar,
area-scoped `Service` schema with an `areaServed` City override, bidirectional service↔location
linking, city→city neighbour links, breadcrumbs, and byte-identical canonical/sitemap parity.

**The owner's, and blocking:** Google עסק שלי. Nothing in this repo substitutes for it.

> ⛔ **Do not publish a Business Profile or a single citation yet.** The roster
> (`Israeli services sites/roster/sites/hambabait.json:60-67`) flags the phone routing, the email and
> the hours as **assumptions**, and the repo's `site.config.json` drops that array — which makes them
> look settled. (Pricing left that list on 2026-09-17 — the ranges are owner-confirmed.) A citation
> corpus built on a wrong phone number must be unwound directory by directory, and the
> inconsistency period actively hurts. **Confirm first.**
> [entity-profile.md](entity-profile.md) holds the exact strings; `gbp-local-listings` holds the
> procedure.

**NAP discipline:** `055 660 1006`, `055-6601006` and `+972-55-660-1006` are three different NAPs to
a matcher. One string, byte-identical, everywhere.

---

## 5. Sequencing — where the next hour goes

1. **Unblock the owner items** (§4). They gate more value than anything repo-side and they cost the
   owner minutes, not days. The warranty string that used to sit here is **done**: the roster's
   softened `shortPitch` was synced through `ops/sync-manifest.ps1` and the JSON-LD `description` no
   longer carries the claim.
2. **The graph is finished.** The `WebSite` node ships on the homepage — deliberately with no
   `SearchAction`, because the site has no search and marking one up is a false capability claim.
   Nothing in [schema-graph.md](schema-graph.md) is unbuilt. Remaining schema work is depth, not
   coverage.
3. **Give the two remaining commercial static routes an answer block.** `/שירותים/` and
   `/איזורי-שירות/` are the only URLs left with real query demand and no extractable answer (§3.1).
   `/מחירון/` is done — it got `pricingAnswer` on 2026-09-17, quoting the published ranges.
4. **Extend the informational cluster.** The 12 guides cover the four clusters but the symptom
   long-tail is nowhere near exhausted, and this is the surface where we can still win outright.
5. **Deepen the three weakest city pages** (`rehovot`, `raanana`, `kfar-saba` — see
   [city-briefs.md](city-briefs.md) §6).
6. **Only then** consider new cities. Not before all 18 clear the doorway test.

---

## 6. How we will know it worked

Tied to [measurement.md](measurement.md) — do not restate KPIs here.

- **Split every report by page type.** Aggregate numbers hide the thing that matters: the location
  silo is the weakest surface, and averaging it with the homepage conceals that.
- **The four-week rule.** No ranking change is attributed to a deploy inside four weeks. Indexing,
  re-crawl and evaluation lag; a week-one reading is noise.
- **A baseline recorded after the change is not a baseline.** [measurement.md](measurement.md) §0 is
  still empty. That is the highest-priority measurement task and it needs console access this repo
  does not have.

---

## 7. Anti-patterns — banned outright

- **Doorway pages.** Any page a find-and-replace could regenerate from a sibling.
- **The 108-page matrix.** See §2.
- **Invented volume, difficulty, or ranking numbers.** See §2.
- **`Review` / `AggregateRating` markup.** Zero real reviews exist. This is a Google policy
  violation, not a style preference. See `review-acquisition`.
- **A priced `Offer` or `AggregateOffer`.** The ranges are published on `/מחירון/` but stay out of
  structured data **by choice**: a range is easy to express wrongly in schema and can surface raw in
  a SERP. `qa:gate` asserts "no priced Offer node" and that assertion stays.
- **Copying a competitor's claims.** Their warranty, their years, their certifications are theirs and
  are probably unverified too.
- **Keyword-stuffed `ב+city` repetition.** The grammar rule exists to read naturally, not to hit a
  density target.
- **Marking up content the page does not display.**
