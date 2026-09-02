# City briefs — חם בבית

> The truthful, checkable, city-specific material that lifts the 18 location pages off the doorway
> line. **This is the research file; `lib/content.ts` is where the finished copy lives.**
>
> Cited by `city-research`, `new-city`, `hebrew-copywriter`, `editorial-reviewer`.
> Compiled 2026-08-25. **Status: all 18 written — see §6.**

---

## 0. Why this file exists

Until 2026-08-25, all 18 location pages rendered from one template: `app/locations/[city]/page.tsx`
substituted `loc.name` into the H1, the subtitle, two body paragraphs, one H2 and the form heading,
and everything else was byte-identical across all 18 — including the meta description. There was no
per-city content map anywhere in the repo.

That is fixed. The output of this file is the typed `cityContent` map in `lib/content.ts`, keyed by
`LocationSlug`. **This file remains the source of record for _why_ each city says what it says** —
edit it first, then the copy.

---

## 1. The bar

> **≥2 paragraphs per city that could not be written about any other city.**

Test it the hard way: swap the city name for another's. If the paragraph still reads as true, it is
not city-specific and it does not count.

---

## 2. Source tiers — label every claim

| Tier                            | Meaning                                                                              | Use                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| ✅ **Verifiable general fact**  | coastal geography, the physics of anode corrosion, typical Israeli building patterns | safe to write                                                  |
| 🔶 **Plausible but unverified** | a specific claim about a city's boiler mix reasoned to rather than confirmed         | mark it, add a row to `business-facts.md`, soften the phrasing |
| ❌ **Business fact**            | anything about _our_ presence, staff, speed or coverage in that city                 | **never write it**                                             |

**Do not invent statistics.** "רוב הבניינים ב\<עיר\> מצוידים ב…" needs a source, or it must soften to a
qualitative statement that is defensibly true.

---

## 3. Banned patterns

Synonym spinning · population figures · neighbourhood lists · distance-from-Tel-Aviv padding ·
weather or tourism colour · **"הסניף שלנו ב\<עיר\>"** (false — no branch exists) ·
**"הטכנאי שלנו ב\<עיר\>"** (false — no evidence any technician exists) ·
**"מגיעים ב\<עיר\> תוך N שעות"** (unsourced response-time claim).

The last three are not merely thin — they are fabricated business facts, which is the more serious
failure.

---

## 4. The coastal split — the one differentiator already established

Salt air accelerates anode consumption and shortens tank life. This is **technical, checkable, and
genuinely discriminating** — which is exactly what makes it usable.

| Coastal exposure                                                                    | Inland                                                                                                        |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| haifa · netanya · ashdod · bat-yam · ashkelon · tel-aviv · herzliya · rishon-lezion | jerusalem · petah-tikva · beer-sheva · holon · bnei-brak · ramat-gan · rehovot · kfar-saba · modiin · raanana |

**Do not apply corrosion material to an inland city.** It would be false, and it would make the coastal
pages less distinctive — a differentiator only works if it discriminates.

Judge by _actual_ exposure, not by whether a city technically touches the coast. Rishon LeZion and
Herzliya have coastline but most housing sits inland of it; do not overreach.

---

## 4a. The primary anchor: building height → boiler mix

**This is the axis that does most of the discriminating**, and it is the one used across all 18
entries in `cityContent`.

Israeli regulation has required solar water heating on residential buildings since 1980, with taller
buildings exempt. The consequence is directly observable and genuinely varies by city:

- **Low-rise stock** → individual solar system per dwelling, private or shared roof access, and the
  fault set of an ageing solar system (ווסת, קולט, gravity feed, backup element).
- **High-rise stock** → electric or central heating, no collector, no private roof — and a completely
  different fault set centred on the element, the thermostat and the RCD.

So "what kind of building do you live in" predicts the job better than anything else, and cities
differ in their mix: Tel Aviv and Ramat Gan hold both; Petah Tikva is actively shifting from one to
the other through urban renewal; Modiin is uniformly modern; Kfar Saba and Raanana skew low-rise.

**Keep proportions qualitative.** There is no source in this repo for "N% of buildings in X", so
nothing written claims one.

## 4b. The secondary anchors

| Anchor                       | Applies to                                         | Why it is checkable                                                                                                                                            |
| ---------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cold winters / altitude**  | jerusalem                                          | verifiable climate; shifts winter load onto the electric backup element, so "no hot water" calls cluster in winter and trace to the element, not the collector |
| **Desert sun + hard water**  | beer-sheva                                         | verifiable regional characteristics; solar performs year-round, so the dominant failure mode becomes scale (אבנית) rather than lack of heat                    |
| **Household size / density** | bnei-brak                                          | high hot-water draw means the element runs far more hours; also reframes "hot water runs out" as an undersized-tank question rather than a fault               |
| **Building-stock age**       | modiin (young), tel-aviv / bat-yam / holon (older) | verifiable urban history; predicts whether the tank itself or a replaceable component is the likely culprit                                                    |
| **Topography**               | haifa                                              | verifiable; hillside siting complicates roof access and changes what a visit involves                                                                          |

## 5. The four legitimate material types

1. **Housing stock and boiler mix** — solar-dominant vs electric/pressure; older stock vs new
   construction; apartment blocks with shared arrays vs private roofs. _The richest of the four._
2. **Roof and access realities** — private roof access in low-rise vs shared arrays in high-rise;
   buildings without lifts; whether a collector is reachable at all. Determines what a technician can
   actually do on site.
3. **Coastal corrosion and anode wear** — §4.
4. **City-specific FAQs** — usually downstream of 1–3.

---

## 6. The 18 — research table

Written into `cityContent` in `lib/content.ts` on 2026-08-25. Every entry uses the building-height
anchor (§4a) plus at least one secondary anchor (§4b), and each carries 1–2 city-specific FAQs.

| #   | Slug            | City        | Coastal | Primary angle                                       | Secondary angle                                        |
| --- | --------------- | ----------- | ------- | --------------------------------------------------- | ------------------------------------------------------ |
| 1   | `tel-aviv`      | תל אביב     | ~       | old low-rise w/ private solar vs new towers         | salt air → anode wear                                  |
| 2   | `jerusalem`     | ירושלים     | —       | cold winters shift load to the electric element     | varied stock: stone low-rise vs newer                  |
| 3   | `haifa`         | חיפה        | ✅      | hillside siting complicates roof access             | salt air → anode wear                                  |
| 4   | `rishon-lezion` | ראשון לציון | ~       | growth in waves → build year predicts the fault     | western areas more exposed than eastern                |
| 5   | `petah-tikva`   | פתח תקווה   | —       | urban renewal: solar-on-roof → electric-in-flat     | RCD trips become the common symptom                    |
| 6   | `netanya`       | נתניה       | ✅      | seafront towers (electric) vs low-rise east (solar) | direct salt exposure on the shore strip                |
| 7   | `ashdod`        | אשדוד       | ✅      | planned low-rise → private solar widespread         | salt air → anode wear                                  |
| 8   | `beer-sheva`    | באר שבע     | —       | strong irradiance → solar carries winter too        | hard water → scale is the failure mode                 |
| 9   | `holon`         | חולון       | —       | 1960s–70s walk-ups, several systems per shared roof | identifying which system is yours                      |
| 10  | `bnei-brak`     | בני ברק     | —       | large households → high draw, element runs hot      | "runs out" = undersized tank, not a fault              |
| 11  | `ramat-gan`     | רמת גן      | —       | old walk-ups and tower districts side by side       | RCD trips in the electric stock                        |
| 12  | `rehovot`       | רחובות      | —       | low-rise / private homes → single-owner roofs       | research/teaching institutions → fixed-term tenants 🔶 |
| 13  | `herzliya`      | הרצליה      | ~       | detached housing → private roof, standalone systems | coastal exposure near the shore                        |
| 14  | `kfar-saba`     | כפר סבא     | —       | garden-city low-rise → private solar common         | mature-tree shading cuts collector yield 🔶            |
| 15  | `modiin`        | מודיעין     | —       | uniformly young stock → whole areas age together    | inland; first component replacements due               |
| 16  | `bat-yam`       | בת ים       | ✅      | directly on the sea + dense older stock             | sharpest corrosion case on the list                    |
| 17  | `raanana`       | רעננה       | —       | low-rise, single-owner roofs                        | storage tank vs instantaneous heater expectations 🔶   |
| 18  | `ashkelon`      | אשקלון      | ✅      | spread-out low-rise → solar widespread              | strong sun and salt air together                       |

**No city was removed.** Every one had at least one truthful, discriminating angle available.

### ✅ Deepened 2026-08-31 — the three weakest are no longer the three weakest

`rehovot`, `raanana` and `kfar-saba` were the weakest cases: all three leaned on the
low-rise/private-roof pattern and differed from each other mainly in distance from the coast. Each
now carries a **third paragraph built on a genuinely different dimension**:

| City        | New dimension                                       | The technical consequence it earns                                                                                     |
| ----------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `rehovot`   | research/teaching institutions → fixed-term tenants | the person who meets the fault is not the person who decides repair-vs-replace                                         |
| `raanana`   | residents who arrived from abroad                   | an instantaneous heater stores nothing; a finite-volume tank behaves differently, and that difference reads as a fault |
| `kfar-saba` | mature trees beside low buildings                   | partial collector shading cuts yield with nothing broken — gradual decline, worst in winter                            |

**All three city characterisations are 🔶 reasoned, not sourced**, and are logged in
[business-facts.md](business-facts.md) §3.7 with the exact question each one needs answered. The
_technical_ consequence drawn from each is ✅ verifiable general physics, which is what makes the
paragraph safe to ship while the framing is still unconfirmed.

None of the three says anything about _our_ presence, speed or coverage in that city.

> **The rule still stands:** if a future review decides a city cannot be genuinely differentiated,
> removing it is the preferred outcome over padding (`content-standards.md` §3).

✅ coastal · ~ partial exposure · — inland

---

## 7. Grammar

`ב` + city everywhere: `תיקון דודים בבת ים`. The city string feeds the **title, H1, meta description
and JSON-LD** — four places — so a wrong prefix form propagates to all four. Any non-default prefix
form is stored in `lib/site-config.ts` beside the name, never conditionally at the call site.

---

## 8. Expansion cap

**No 19th city until all 18 clear the bar.** **No service × city intersection pages** — 6 × 18 = 108
near-identical URLs is the textbook doorway pattern and risks the whole domain.

Removing a city is data-driven: drop the entry from the `locations` array and the route, the areas
index, the link mesh and the sitemap all follow. Note the URL then **404s** — a static export cannot
redirect, so flag it for a zone-level redirect decision.
