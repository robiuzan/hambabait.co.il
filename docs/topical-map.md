# Topical map — חם בבית

> The cluster structure behind the keyword map. Where `docs/keyword-map.md` answers _"which URL owns
> this query"_, this file answers _"what is the shape of the whole subject, and what are we missing"_.
>
> Cited by `content-strategist`, `keyword-research-il`, `content-brief`, `new-article`.
> **Re-baselined 2026-08-31 against a fresh `out/`.**

---

## 0. The shape in one paragraph

All three silos are **built**. 6 service pages, 18 location pages and 12 guides, plus 9 static
routes — **45 indexable URLs, every one of them emitting JSON-LD and carrying a canonical that is
byte-identical to its sitemap entry**. The asymmetry that defined this map for months — strong where
intent is transactional, invisible where it is curious — is gone at the level of coverage. What is
left is not a missing silo but a **missing mesh**: the knowledge cluster exists and almost nothing
links into it, and the header reaches none of the six service pages in one hop. Depth was the last
map's problem. Connective tissue is this one's.

---

## 1. The three tiers

```
                    ┌──────────────────────────────┐
                    │  PILLAR:  /  תיקון דודים     │  national head term
                    └──────────────┬───────────────┘
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
    ┌──────────────────┐  ┌─────────────────┐  ┌──────────────────┐
    │ SERVICE  ×6      │  │ LOCATION  ×18   │  │ KNOWLEDGE  ×12   │
    │ /services/<slug> │  │ /locations/<..> │  │ /מדריכים/<slug>  │
    │ commercial       │  │ commercial+local│  │ informational    │
    │ ✅ built, deep   │  │ ✅ built, deep  │  │ ✅ built, deep   │
    │                  │  │                 │  │ ⚠️ in-degree 1   │
    └──────────────────┘  └─────────────────┘  └──────────────────┘
```

Support pages: `/מחירון/` (commercial research), `/אודות/` (trust), `/צור-קשר/` (conversion),
`/שירותים/`, `/איזורי-שירות/` and `/מדריכים/` (indexes), plus the two legal pages.

Emitted schema by tier: services and locations ship `Service` + `FAQPage` + `BreadcrumbList`; guides
ship `Article` + `FAQPage` + `BreadcrumbList`; the homepage ships `Plumber` + `WebSite` + `FAQPage`.
See [schema-graph.md](schema-graph.md).

---

## 2. Service cluster — 6 pages, built, deep

| Slug              | Owns                                   | Does **not** own                        |
| ----------------- | -------------------------------------- | --------------------------------------- |
| `solar`           | תיקון דוד שמש, קולט שמש, מערכת סולארית | electric faults → `electric`            |
| `electric`        | תיקון דוד חשמל, דוד חשמלי              | element replacement → `heating-element` |
| `thermostat`      | תרמוסטט לדוד, תרמוסטט שרוף             | element failure → `heating-element`     |
| `leak-repair`     | נזילה בדוד, דוד מטפטף                  | failed tank → `replacement`             |
| `replacement`     | החלפת דוד, התקנת דוד חדש               | repairable fitting → `leak-repair`      |
| `heating-element` | אלמנט לדוד, אלמנט שרוף, אנודה          | control fault → `thermostat`            |

**The two blur pairs.** `thermostat ↔ heating-element` and `leak-repair ↔ replacement` share symptoms.
Each page states which fault it covers and cross-links the other on the shared symptom. That sentence
is the cannibalisation guard — see `content-brief`.

**Current depth:** each page carries an answer block, its own symptom→cause table, on-site steps, a
repair-vs-replace section and three FAQs — roughly 35 unique blocks apiece. The six once shared one
identical `triggers` array, which is the textbook §0 doorway failure inside otherwise-distinct pages;
that is fixed and must not come back as a shared constant.

**What is genuinely still open here:** each service page should link the guide that owns the
diagnostic side of its fault. Today none of them does — see §5.

---

## 3. Location cluster — 18 pages, built, deep

Pattern: `תיקון דודים ב<עיר>`. The `ב` prefix is mandatory and propagates to title, H1, meta
description and JSON-LD.

**All 18 now clear the doorway test.** Each carries an answer block, at least two paragraphs that
could not be written about another city, one or two city-specific FAQs and 2–4 nearby-city links —
50 nearby links across the 18, none with fewer than two. Research basis in
[city-briefs.md](city-briefs.md).

That state is recent and it is not self-sustaining. Nine of the eighteen were still opening with the
same templated question (`מה מאפיין דודים ב<עיר>?`) after their bodies were already city-specific —
the doorway pattern surviving in the furniture of a page that passes on its body. See
[content-standards.md](content-standards.md) §0, which now carries that as its worked example.

The strongest structural differentiator remains **coastal corrosion / anode wear**, which genuinely
applies to some cities and not others:

| Coastal exposure                                                                    | Inland                                                                                                        |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| haifa · netanya · ashdod · bat-yam · ashkelon · tel-aviv · herzliya · rishon-lezion | jerusalem · petah-tikva · beer-sheva · holon · bnei-brak · ramat-gan · rehovot · kfar-saba · modiin · raanana |

Do not apply corrosion material to an inland city. Doing so is false _and_ it makes the coastal pages
less distinctive — the differentiator only works if it discriminates. The inland cities are carried
instead by housing stock, roof access and building age; where a city's material is reasoned rather
than sourced it is written conditionally and marked `// 🔶 confirm` in the content layer.

**Cap:** no 19th city until every one of the 18 still clears the bar. **No service × city
intersection pages** — 108 near-identical URLs is the textbook doorway pattern.

---

## 4. Knowledge cluster — 12 pages, built

Route: `/מדריכים/[slug]/`, with `/מדריכים/` as the index. Each guide ships `Article` + `FAQPage` +
`BreadcrumbList` in a single JSON-LD block, carries `datePublished` / `dateModified` and a visible
"עודכן" line attributed to the business, and opens with an answer block.

**Why this cluster earned the investment:** these topics are _technical_, so they require **no
business fact**. No warranty, no price, no timing, no credential. On a site whose trust ledger is
thin and whose claims budget is already overdrawn, this is the only place where depth can be added at
zero claims risk. That logic has not changed, and it is why the remaining expansion room here is
still the safest content spend on the site.

### 4.1 Symptom sub-cluster — 5 guides

The reader has a broken boiler and does not know why. This is also the most natural answer-engine
query shape.

| Guide slug         | Question shape              | Routes to                                   |
| ------------------ | --------------------------- | ------------------------------------------- |
| `no-hot-water`     | אין מים חמים בכלל           | `electric`, `heating-element`, `thermostat` |
| `lukewarm-water`   | המים רק פושרים              | `thermostat`, `heating-element`             |
| `tripping-breaker` | הדוד מפיל את החשמל / הפחת   | `heating-element`, `electric`               |
| `leaking-boiler`   | מאיפה הנזילה מגיעה          | `leak-repair`, `replacement`                |
| `noisy-boiler`     | רעשים מהדוד — נקישות ורתיחה | `heating-element` (אבנית)                   |

**Still open:** the symptom long tail is far from exhausted — water pressure, smell, discoloured
water, timer and שעון שבת faults, solar underperformance specifically in winter. This is the largest
remaining content opportunity on the site and the cheapest in claims risk.

Each of these carries a symptom → likely cause **table** in real `<table>` markup. That format is
lifted by answer engines far more reliably than prose, and it feeds the service pages internally.

### 4.2 Comparison sub-cluster — 2 guides

| Guide slug          | Shape                                                          |
| ------------------- | -------------------------------------------------------------- |
| `solar-vs-electric` | table — cost to run, weather dependence, maintenance, lifespan |
| `repair-or-replace` | decision table — age, fault type, tank condition               |

Comparison tables are the most extractable format that exists, and both are built as real tables.

⚠️ **Neither contains a price, and neither may gain one.** The business publishes no price list; any
figure is invented. Compare on qualitative axes. This is also why the comparison sub-cluster has
little expansion room left — most further comparisons a reader wants are cost comparisons.

### 4.3 Definition sub-cluster — 3 guides

`what-is-anode` · `how-thermostat-works` · `how-solar-boiler-works`

Low volume individually, but these are **entity-building**: they teach an answer engine what this site
knows about. They are also meant to anchor the internal link mesh — every service page should link
the definition of the part it replaces. **That link direction is not built yet** (§5).

**Still open:** אלמנט חימום · ווסת · ברז ביטחון. Cheap, safe, and each has a service page waiting to
link it.

### 4.4 Seasonal sub-cluster — 2 guides

`winter-boiler-check` · `why-boilers-fail-in-winter`

Boiler failure is strongly seasonal. These are already published; the work now is **refresh timing,
not new URLs** — revisit in autumn, before demand arrives, not during the winter peak. A
`dateModified` moves only when the content actually changed. See `content-refresh`.

---

## 5. Internal link rules for the map — and where reality diverges

The rules, and the measured state of each:

| Rule                                                                    | State                                                                                                                                                                              |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Service pages link cities                                               | ✅ all 18 linked from every service page (the old `locations.slice(0, 8)` cut-off is gone)                                                                                         |
| City pages link services                                                | ✅ all 6 from every city page                                                                                                                                                      |
| Cities link nearby cities                                               | ✅ 2–4 each, 50 links total                                                                                                                                                        |
| Blur pairs cross-link on the shared symptom                             | ✅                                                                                                                                                                                 |
| No page is an orphan                                                    | ✅ the footer links all 6 services and all 18 cities on every page — the site's orphan insurance                                                                                   |
| **Every informational page routes to a commercial one**                 | ✅ every guide links the service page that resolves its fault                                                                                                                      |
| **Every service page links its relevant guides**                        | ❌ **not built.** No service page links any guide.                                                                                                                                 |
| **Definition pages are linked from the service that replaces the part** | ❌ **not built.**                                                                                                                                                                  |
| Header reaches the main clusters in one hop                             | ⚠️ the header reaches all three indexes — `/שירותים/`, `/איזורי-שירות/`, `/מדריכים/` — plus `/מחירון/`, `/אודות/`, `/צור-קשר/` — and **0 of the 6 service pages**. Deferred, §5.1. |

### 5.1 The two live mesh defects

**Guide in-degree is 1.** Measured against `out/`: each of the 12 guides is linked from exactly one
page, the `/מדריכים/` index. The hub is reachable and crawlable — it is in the header nav, the footer
and `llms.txt` — but the "depth flows both ways" rule is satisfied in one direction only. The guides
push authority into the commercial silo and receive none back. Fixing it is content-layer work: a
`relatedGuides` link on each service page, and the definition links above.

**The header reaches no service page in one hop.** Only the `/שירותים/` index is in the nav, so a
reader wanting `תיקון דוד שמש` is always two clicks away. A services submenu was **considered and
deliberately deferred** — it is a navigation-design decision with real trade-offs on a mobile-first
site whose reader is mid-fault, and it belongs to the owner rather than to a docs pass. The
orphan-insurance obligation is met regardless: the footer links all 6 services and all 18 cities on
every page. Record it as an open decision, not as a bug that was missed.

---

## 6. Priority order

Re-derived 2026-08-31. Coverage is done; this list is now about mesh and long tail.

1. **Wire the guides into the commercial silo** — service → guide links, and service → definition
   links. Cheapest fix on the list, closes the only structural defect in an otherwise complete map,
   and it is pure content-layer work with zero claims risk.
2. **Symptom long-tail guides** — the largest remaining topical gap and the safest content spend on
   the site.
3. **Answer blocks for `/מחירון/`, `/שירותים/` and `/איזורי-שירות/`** — three of the nine static
   routes that carry none, each fielding a real question. Needs a brief and a rendering decision
   first, and the `/מחירון/` one must not state a price **or** a pricing approach.
4. **The three remaining definition guides** — אלמנט חימום, ווסת, ברז ביטחון. Cheap, entity-building,
   and each has a service page waiting to link it.
5. **Header navigation depth** — owner decision, see §5.1.
6. **Seasonal refresh, timed to autumn** — not new URLs.

Note what is _not_ on this list: more cities, more services, more pages of any kind. **Breadth is
still not the lever here.** The 24 commercial pages and 12 guides that exist are deep; what they are
not yet is fully connected.
