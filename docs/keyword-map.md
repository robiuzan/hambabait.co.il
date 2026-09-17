# Keyword map — חם בבית

> The intent → URL map. Every row points at a route that exists today. Cited by `seo-metadata`,
> `local-seo-il`, `new-service`, `new-city`, `new-article` and `hebrew-copywriter`.
>
> **Re-baselined 2026-08-31.**

**Rule: one intent, one URL.** Two pages competing for the same query cannibalise each other and
neither ranks. §8 records what happens when that rule slips.

---

## 1. The three axes

The site publishes **6 services + 18 locations + 12 guides**, plus 9 static routes — **45 indexable
URLs**, not 108 intersections. That restraint is deliberate. See §6.

The 9 static routes are the homepage, the three indexes (`/שירותים/`, `/איזורי-שירות/`, `/מדריכים/`),
`/מחירון/`, `/אודות/`, `/צור-קשר/` and the two legal pages. `/תודה/` is a `noindex` conversion
destination and is deliberately absent from the sitemap; it owns no query.

### Services — `/services/<slug>/`

| Slug              | Hebrew name       | Primary intent | Supporting terms                            |
| ----------------- | ----------------- | -------------- | ------------------------------------------- |
| `solar`           | תיקון דוד שמש     | תיקון דוד שמש  | דוד שמש לא מתחמם · קולט שמש · מערכת סולארית |
| `electric`        | תיקון דוד חשמל    | תיקון דוד חשמל | דוד חשמל לא מתחמם · דוד חשמלי               |
| `thermostat`      | החלפת תרמוסטט     | תרמוסטט לדוד   | החלפת תרמוסטט · תרמוסטט שרוף                |
| `leak-repair`     | תיקון נזילות בדוד | נזילה בדוד     | דוד מטפטף · נזילת מים מהדוד                 |
| `replacement`     | החלפת דוד         | החלפת דוד      | התקנת דוד חדש · דוד חדש                     |
| `heating-element` | החלפת אלמנט חימום | אלמנט לדוד     | אלמנט שרוף · החלפת אלמנט · אנודה            |

### Locations — `/locations/<slug>/`

18 cities, all on the pattern **`תיקון דודים ב<עיר>`**:

תל אביב · ירושלים · חיפה · ראשון לציון · פתח תקווה · נתניה · אשדוד · באר שבע · חולון · בני ברק ·
רמת גן · רחובות · הרצליה · כפר סבא · מודיעין · בת ים · רעננה · אשקלון

Slugs are English (`tel-aviv`, `beer-sheva`, …); the display name is Hebrew.

### Guides — `/מדריכים/<slug>/`

12 guides in four sub-clusters. These are **informational, not commercial**: they own the question,
and they route the reader to the service page that owns the job.

| Slug                         | Owns the query shape         | Routes to                                   |
| ---------------------------- | ---------------------------- | ------------------------------------------- |
| `no-hot-water`               | אין מים חמים בכלל            | `electric`, `heating-element`, `thermostat` |
| `lukewarm-water`             | המים רק פושרים               | `thermostat`, `heating-element`             |
| `tripping-breaker`           | הדוד מפיל את החשמל / את הפחת | `heating-element`, `electric`               |
| `leaking-boiler`             | מאיפה הנזילה בדוד מגיעה      | `leak-repair`, `replacement`                |
| `noisy-boiler`               | רעשים מהדוד · נקישות · רתיחה | `heating-element` (אבנית)                   |
| `solar-vs-electric`          | דוד שמש או דוד חשמל          | `solar`, `electric`                         |
| `repair-or-replace`          | לתקן או להחליף דוד           | `replacement`, `leak-repair`                |
| `what-is-anode`              | מה זה אנודה בדוד             | `heating-element`                           |
| `how-thermostat-works`       | מה עושה תרמוסטט בדוד         | `thermostat`                                |
| `how-solar-boiler-works`     | איך עובד דוד שמש             | `solar`                                     |
| `winter-boiler-check`        | בדיקת דוד לפני החורף         | `solar`, `heating-element`                  |
| `why-boilers-fail-in-winter` | למה דודים מתקלקלים בחורף     | `electric`, `heating-element`               |

---

## 2. Head terms and where they land

| Query                 | Intent                 | Target URL                    |
| --------------------- | ---------------------- | ----------------------------- |
| תיקון דודים           | commercial, national   | `/`                           |
| תיקון דודים ב<עיר>    | commercial, local      | `/locations/<slug>/`          |
| תיקון דוד שמש         | commercial, service    | `/services/solar/`            |
| תיקון דוד חשמל        | commercial, service    | `/services/electric/`         |
| החלפת דוד             | commercial, high value | `/services/replacement/`      |
| נזילה בדוד — תיקון    | commercial, service    | `/services/leak-repair/`      |
| למה הדוד לא מתחמם     | problem-aware          | `/מדריכים/no-hot-water/`      |
| הדוד מטפטף — מה עושים | problem-aware          | `/מדריכים/leaking-boiler/`    |
| דוד שמש או דוד חשמל   | comparison             | `/מדריכים/solar-vs-electric/` |
| מה זה אנודה           | definition             | `/מדריכים/what-is-anode/`     |
| מחיר תיקון דוד        | commercial research    | `/מחירון/`                    |
| אזורי שירות           | navigational           | `/איזורי-שירות/`              |

The homepage owns the national head term. **Do not** create a `/services/` page targeting
`תיקון דודים` — it would compete with the homepage.

Note the split on the leak pair: the **guide** owns the diagnostic question ("where is it leaking
from"), the **service page** owns the commercial one ("what does the repair involve"). That boundary
is not decorative — see §8.

---

## 3. The ב+city grammar rule

Hebrew prefixes the city: **`תיקון דודים בתל אביב`**, never `תיקון דודים תל אביב`.

This matters mechanically: the city string feeds the title, the H1, the meta description **and** the
JSON-LD, so a wrong form propagates to four places. Any city needing a non-default prefix form gets
that form stored in `lib/site-config.ts` beside the name — never patched with a conditional at the
call site.

---

## 4. Title and description formulas

| Page type | Title (before the template)   | Renders as                              |
| --------- | ----------------------------- | --------------------------------------- |
| Home      | _(none — inherits `default`)_ | חם בבית – מומחים לתיקון דודים בכל הארץ  |
| Service   | `<שם השירות>`                 | תיקון דוד שמש \| חם בבית                |
| Location  | `תיקון דודים ב<עיר>`          | תיקון דודים בתל אביב \| חם בבית         |
| Guide     | the guide's `title`           | אין מים חמים בכלל — מה לבדוק \| חם בבית |
| Static    | the page's noun               | מחירון \| חם בבית                       |

**The layout template already appends `| חם בבית`. Never append it yourself.** Both dynamic routes
once did, shipping the brand twice on 24 of 33 pages. That is **fixed** — `out/` contains zero
doubled titles across 47 built pages — and `npm run qa:gate` asserts it stays fixed, alongside title
and description uniqueness.

Descriptions: 140–160 chars, unique, service + place first, action last, **and no claim the body does
not make**. Service descriptions are re-emitted as JSON-LD `Service.description`, so an unsourced
claim there becomes structured data.

---

## 5. Intent by page type

- **Service pages — problem-aware to solution-aware.** The reader knows something is broken. Cover
  the fault, symptoms, what happens on site, and repair-vs-replace. Each has an answer block, a
  distinct symptom→cause table and its own FAQs.
- **Location pages — commercial + local.** The reader wants someone who will come to _their_ city.
  All 18 now carry city-specific material — housing stock and boiler mix, roof and access realities,
  coastal corrosion where it genuinely applies — rather than one substituted template.
- **Guides — informational.** The reader is diagnosing, comparing or learning, and is not yet ready
  to call. Every guide routes to the commercial page that resolves the fault; a guide that does not
  is a dead end.
- **`/מחירון/` — commercial research, and since 2026-09-17 a real commercial target.** The owner
  reversed the no-price-list policy and approved VAT-inclusive price **ranges**, so the page now
  answers the money question with figures instead of describing an approach. It carries a price
  table, an answer block and the "no call-out fee, no surcharges" statement. Every figure traces to
  [business-facts.md](business-facts.md) §1a — quote nothing from anywhere else, change nothing
  without fresh owner sign-off, and never republish a range ex-VAT (Consumer Protection Law §17א).

---

## 6. Cannibalisation and expansion rules

**Do not create service × city intersection pages.** 6 × 18 = 108 near-identical URLs for a business
with no address and no per-city presence is the textbook doorway pattern, and it risks the whole
domain rather than just the new pages.

**Do not add a 19th city** until every one of the 18 still clears the doorway bar in
[content-standards.md](content-standards.md) — the bar is a standing test, not a one-time gate that
was passed in August.

**Before adding any service**, check it does not overlap an existing page's intent. `דוד חשמלי` is
the same intent as `/services/electric/` — deepen that page instead of creating a second one.

**Before adding any guide**, check the question is not already answered by an existing guide or by a
service page's answer block. The hub covers the main clusters; the collision risk is now highest
_inside_ the hub and between the hub and the service pages, not out at the edges.

Watch these adjacencies, which are close enough to blur if copy drifts:

- `thermostat` ↔ `heating-element` — a suspected thermostat fault is often an element fault. Keep
  each page's symptom framing distinct and cross-link them.
- `leak-repair` ↔ `replacement` — a leaking tank often becomes a replacement. Make the boundary
  explicit: repairable fitting/connection vs. failed tank.
- `/services/leak-repair/` ↔ `/מדריכים/leaking-boiler/` — diagnosis vs. repair. See §8.
- `/מדריכים/repair-or-replace/` ↔ `/services/replacement/` — the guide owns the decision, the
  service page owns the job.

---

## 7. The knowledge hub — served, not exhausted

The hub at `/מדריכים/` exists and carries 12 guides with `Article` + `FAQPage` + `BreadcrumbList`.
Every hub URL is in `app/sitemap.ts` and in `public/llms.txt` (coverage is 45/45 against the
sitemap), and the hub index is in both the header nav and the footer.

| Cluster        | Guides | Covered                                                   | Still open                                                       |
| -------------- | ------ | --------------------------------------------------------- | ---------------------------------------------------------------- |
| **Symptom**    | 5      | אין מים חמים · מים פושרים · מפיל את החשמל · מטפטף · רעשים | the long tail — pressure, smell, discoloured water, timer faults |
| **Comparison** | 2      | דוד שמש או דוד חשמל · תיקון או החלפה                      | little left that does not need a price to be useful              |
| **Definition** | 3      | אנודה · תרמוסטט · איך עובד דוד שמש                        | אלמנט חימום · ווסת · ברז ביטחון                                  |
| **Seasonal**   | 2      | בדיקה לפני החורף · למה מתקלקלים בחורף                     | timed refresh rather than new URLs — see `content-refresh`       |

**The symptom long tail is where the remaining volume is**, and it is the safest place to spend
effort: these topics are **technical**, so they need no business fact and carry none of the claims
risk that warranty, timing and price content carries.

**The hub's live structural defect is in-degree, not coverage.** Measured against `out/`, every one
of the 12 guides is linked from exactly **one** page — the `/מדריכים/` index. No service page and no
city page links a guide, so the "depth flows both ways" rule in
[topical-map.md](topical-map.md) §5 is currently satisfied in one direction only. A new guide inherits
that defect on day one.

⚠️ **No prices in a comparison guide** — the rule survived the 2026-09-17 price reversal, only the
reason changed. Figures live on `/מחירון/` and nowhere else, so a guide that repeats a range drifts
out of sync the moment a range moves. Compare qualitatively and link to `/מחירון/` for the numbers.

---

## 8. Two collisions caught, and how they looked

Both were found by grepping the answer-block `question` strings for duplicates and for a shared
template. Neither was visible from reading a single page — which is the point.

### 8.1 The same question on two pages

`/services/leak-repair/` and `/מדריכים/leaking-boiler/` both opened with the **identical** string
`מאיפה הדוד דולף?`. Two URLs, one query, each emitting it as a question-form heading — the exact
cannibalisation the one-intent-one-URL rule exists to prevent, and worse than usual because an answer
engine choosing between two pages with the same question and different answers will often pick
neither.

**Fixed by splitting the intent, not by rewording for variety.** The guide keeps the diagnostic
question, because someone asking "where is it leaking from" is diagnosing. The service page now asks
`מה כולל תיקון נזילה בדוד?`, because someone on a commercial page wants the leak fixed. The code
carries the reasoning in a comment beside the string so the next edit does not undo it.

### 8.2 Nine cities, one question

Nine of the 18 city answer blocks asked the same templated question with the name swapped:
`מה מאפיין דודים ב<עיר>?` — ashdod, holon, ramat-gan, rehovot, herzliya, kfar-saba, modiin, raanana,
ashkelon. The **bodies** were genuinely city-specific; only the question was a find-and-replace.

That is the doorway pattern surviving inside a page that otherwise passes, and it is easy to miss
because the visible difference is one line. Each now asks something only that city's answer resolves
— `כמה מערכות שמש עומדות על גג משותף בחולון?`,
`מה מתקלקל בדוד בכפר סבא אם הקורוזיה אינה הגורם?`,
`האם השמש החזקה באשקלון מספיקה לחמם את הדוד?`.

**The standing check** — run it whenever an answer block is added or edited:

```bash
# every answer-block question across content.ts and guides.ts; duplicates must be zero
grep -ho 'question: "[^"]*"' lib/content.ts lib/guides.ts | sort | uniq -d
```

Currently: 37 answer blocks, **0 duplicate questions and 0 duplicate bodies**.
