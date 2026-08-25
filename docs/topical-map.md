# Topical map — חם בבית

> The cluster structure behind the keyword map. Where `docs/keyword-map.md` answers _"which URL owns
> this query"_, this file answers _"what is the shape of the whole subject, and what are we missing"_.
>
> Cited by `content-strategist`, `keyword-research-il`, `content-brief`, `new-article`.
> Compiled 2026-08-25.

---

## 0. The shape in one paragraph

The commercial silo is **built**: 6 service pages and 18 location pages, all emitting schema, all
canonicalised, all in the sitemap. The informational silo is **absent** — there is no articles route,
so every symptom, comparison and definition query has no home here. That asymmetry is the entire map:
we are strong where intent is transactional and invisible where it is curious, which is also where
answer engines look first.

---

## 1. The three tiers

```
                    ┌──────────────────────────────┐
                    │  PILLAR:  /  תיקון דודים     │  national head term
                    └──────────────┬───────────────┘
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
    ┌──────────────────┐  ┌─────────────────┐  ┌──────────────────┐
    │ SERVICE  ×6      │  │ LOCATION  ×18   │  │ KNOWLEDGE  ×0    │
    │ /services/<slug> │  │ /locations/<..> │  │ /מדריכים/<slug>  │
    │ commercial       │  │ commercial+local│  │ informational    │
    │ ✅ built         │  │ ⚠️ templated    │  │ ❌ absent        │
    └──────────────────┘  └─────────────────┘  └──────────────────┘
```

Support pages: `/מחירון/` (commercial research), `/אודות/` (trust), `/צור-קשר/` (conversion),
`/שירותים/` and `/איזורי-שירות/` (indexes).

---

## 2. Service cluster — 6 pages, built, thin

| Slug              | Owns                                   | Does **not** own                        |
| ----------------- | -------------------------------------- | --------------------------------------- |
| `solar`           | תיקון דוד שמש, קולט שמש, מערכת סולארית | electric faults → `electric`            |
| `electric`        | תיקון דוד חשמל, דוד חשמלי              | element replacement → `heating-element` |
| `thermostat`      | תרמוסטט לדוד, תרמוסטט שרוף             | element failure → `heating-element`     |
| `leak-repair`     | נזילה בדוד, דוד מטפטף                  | failed tank → `replacement`             |
| `replacement`     | החלפת דוד, התקנת דוד חדש               | repairable fitting → `leak-repair`      |
| `heating-element` | אלמנט לדוד, אלמנט שרוף, אנודה          | control fault → `thermostat`            |

**The two blur pairs.** `thermostat ↔ heating-element` and `leak-repair ↔ replacement` share symptoms.
Each page must state which fault it covers and cross-link the other on the shared symptom. That
sentence is the cannibalisation guard — see `content-brief`.

**Current depth:** one ~45-word paragraph each (`serviceMeta`, `lib/content.ts:20-57`) plus a
`triggers` array that is **identical on all six pages**. The bar is ~500 substantive words. This is
the second-largest content gap.

---

## 3. Location cluster — 18 pages, built, templated

Pattern: `תיקון דודים ב<עיר>`. The `ב` prefix is mandatory and propagates to title, H1, meta
description and JSON-LD.

**Every one of the 18 currently fails the doorway test** — one template, `loc.name` substituted, same
meta description string. See `city-research` for what may legitimately differentiate them.

The only structural differentiator available today is **coastal corrosion / anode wear**, which
genuinely applies to some and not others:

| Coastal exposure                                                                    | Inland                                                                                                        |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| haifa · netanya · ashdod · bat-yam · ashkelon · tel-aviv · herzliya · rishon-lezion | jerusalem · petah-tikva · beer-sheva · holon · bnei-brak · ramat-gan · rehovot · kfar-saba · modiin · raanana |

Do not apply corrosion material to an inland city. Doing so is false _and_ it makes the coastal pages
less distinctive — the differentiator only works if it discriminates.

**Cap:** no 19th city until all 18 clear the bar. **No service × city intersection pages** — 108
near-identical URLs is the textbook doorway pattern.

---

## 4. Knowledge cluster — 0 pages, absent, the biggest opportunity

Route: `/מדריכים/[slug]/`. Does not exist yet.

**Why this cluster is the priority:** these topics are _technical_, so they require **no business
fact**. No warranty, no price, no timing, no credential. On a site whose trust ledger is thin and
whose claims budget is already overdrawn, this is the only place where depth can be added at zero
claims risk.

### 4.1 Symptom sub-cluster — highest value

The reader has a broken boiler and does not know why. This is also the most natural answer-engine
query shape.

| Guide                  | Primary intent                  | Routes to                                   |
| ---------------------- | ------------------------------- | ------------------------------------------- |
| אין מים חמים בכלל      | no hot water at all             | `electric`, `heating-element`, `thermostat` |
| המים רק פושרים         | lukewarm water                  | `thermostat`, `heating-element`             |
| הדוד מפיל את החשמל     | tripping the breaker            | `heating-element`, `electric`               |
| הדוד מטפטף / נזילה     | leak                            | `leak-repair`, `replacement`                |
| רעשים מהדוד            | noise                           | `heating-element` (scale)                   |
| דוד שמש לא מתחמם בחורף | seasonal solar underperformance | `solar`                                     |

**The single highest-value asset on this list is a symptom → likely cause table**, in real `<table>`
markup. It is lifted by answer engines far more reliably than prose, and it feeds every service page
internally.

### 4.2 Comparison sub-cluster

| Guide               | Shape                                                          |
| ------------------- | -------------------------------------------------------------- |
| דוד שמש או דוד חשמל | table — cost to run, weather dependence, maintenance, lifespan |
| תיקון או החלפה      | decision table — age, fault type, tank condition               |

Comparison tables are the most extractable format that exists. Build both as real tables.

⚠️ **Neither may contain a price.** The business publishes no price list; any figure is invented. Compare
on qualitative axes.

### 4.3 Definition sub-cluster

מה זה אנודה · מה עושה תרמוסטט · איך עובד דוד שמש · מה זה אלמנט חימום

Low volume individually, but these are **entity-building**: they teach an answer engine what this site
knows about. They also anchor the internal link mesh — every service page can link the definition of
the part it replaces.

### 4.4 Seasonal sub-cluster

בדיקת דוד לפני החורף · למה דודים מתקלקלים בחורף

Boiler failure is strongly seasonal. Publish and refresh in **autumn**, before demand arrives — not
during the winter peak. See `content-refresh`.

---

## 5. Internal link rules for the map

- **Every informational page routes to a commercial one.** A symptom guide that does not link the
  service page fixing that symptom is a dead end.
- **Every service page links its relevant guides.** Depth flows both ways.
- **Definition pages link the service that replaces the part.**
- Service pages link cities; city pages link services. Today the service→city direction uses
  `locations.slice(0, 8)`, which leaves cities 9–18 with no service-page inbound link. Fix that.
- Cross-link the two blur pairs explicitly, on the shared symptom.
- No page is an orphan. The footer links all 6 services and all 18 locations — that is the site's
  orphan insurance and must keep covering the hub once it exists.

---

## 6. Priority order

1. **Knowledge hub, symptom sub-cluster** — largest gap, zero claims risk, feeds everything else.
2. **Location depth ×18** — largest defect; 56% of indexable URLs currently near-duplicate.
3. **Service depth ×6** — clear bar, clear gap, and the descriptions double as JSON-LD.
4. **Comparison guides** — highest extractability per hour spent.
5. **Definition guides** — entity building, cheap.
6. **Seasonal** — timed to autumn.

Note what is _not_ on this list: more cities, more services, more pages of any kind. **Breadth is not
the lever here.** 24 commercial pages already exist and 18 of them are one template.
