# City briefs — חם בבית

> The truthful, checkable, city-specific material that lifts the 18 location pages off the doorway
> line. **This is the research file; `lib/content.ts` is where the finished copy lives.**
>
> Cited by `city-research`, `new-city`, `hebrew-copywriter`, `editorial-reviewer`.
> Compiled 2026-08-25. **Status: scaffold — research pending (Phase 2, Track D).**

---

## 0. Why this file exists

All 18 location pages render from one template. `app/locations/[city]/page.tsx` substitutes `loc.name`
into the H1, the subtitle, two body paragraphs, one H2 and the form heading; everything else is
byte-identical across all 18, including the meta description. `lib/site-config.ts` holds `locations`
as a flat `{slug, name}` array — **there is no per-city content map anywhere in the repo.**

The output of this file becomes a typed `cityContent` map in `lib/content.ts`, keyed by
`LocationSlug`.

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

Fill during Track D. **A row that cannot be filled truthfully is a recommendation to remove that
city's page**, not a prompt to pad it. Removal is a legitimate and preferred outcome
(`content-standards.md` §3).

| #   | Slug            | City        | Coastal | Angle 1 (housing / boiler mix) | Angle 2 (access / corrosion) | City FAQ | Source tier | Status |
| --- | --------------- | ----------- | ------- | ------------------------------ | ---------------------------- | -------- | ----------- | ------ |
| 1   | `tel-aviv`      | תל אביב     | ~       |                                |                              |          |             | ⬜     |
| 2   | `jerusalem`     | ירושלים     | —       |                                |                              |          |             | ⬜     |
| 3   | `haifa`         | חיפה        | ✅      |                                |                              |          |             | ⬜     |
| 4   | `rishon-lezion` | ראשון לציון | ~       |                                |                              |          |             | ⬜     |
| 5   | `petah-tikva`   | פתח תקווה   | —       |                                |                              |          |             | ⬜     |
| 6   | `netanya`       | נתניה       | ✅      |                                |                              |          |             | ⬜     |
| 7   | `ashdod`        | אשדוד       | ✅      |                                |                              |          |             | ⬜     |
| 8   | `beer-sheva`    | באר שבע     | —       |                                |                              |          |             | ⬜     |
| 9   | `holon`         | חולון       | —       |                                |                              |          |             | ⬜     |
| 10  | `bnei-brak`     | בני ברק     | —       |                                |                              |          |             | ⬜     |
| 11  | `ramat-gan`     | רמת גן      | —       |                                |                              |          |             | ⬜     |
| 12  | `rehovot`       | רחובות      | —       |                                |                              |          |             | ⬜     |
| 13  | `herzliya`      | הרצליה      | ~       |                                |                              |          |             | ⬜     |
| 14  | `kfar-saba`     | כפר סבא     | —       |                                |                              |          |             | ⬜     |
| 15  | `modiin`        | מודיעין     | —       |                                |                              |          |             | ⬜     |
| 16  | `bat-yam`       | בת ים       | ✅      |                                |                              |          |             | ⬜     |
| 17  | `raanana`       | רעננה       | —       |                                |                              |          |             | ⬜     |
| 18  | `ashkelon`      | אשקלון      | ✅      |                                |                              |          |             | ⬜     |

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
