# Keyword map — חם בבית

> The intent → URL map. Every row points at a route that exists today. Cited by `seo-metadata`,
> `local-seo-il`, `new-service`, `new-city` and `hebrew-copywriter`.

**Rule: one intent, one URL.** Two pages competing for the same query cannibalise each other and
neither ranks.

---

## 1. The two axes

The site publishes **6 services + 18 locations = 24 pages**, not 108 intersections. That restraint is
deliberate. See §6.

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

---

## 2. Head terms and where they land

| Query              | Intent                 | Target URL               |
| ------------------ | ---------------------- | ------------------------ |
| תיקון דודים        | commercial, national   | `/`                      |
| תיקון דודים ב<עיר> | commercial, local      | `/locations/<slug>/`     |
| תיקון דוד שמש      | commercial, service    | `/services/solar/`       |
| תיקון דוד חשמל     | commercial, service    | `/services/electric/`    |
| החלפת דוד          | commercial, high value | `/services/replacement/` |
| נזילה בדוד         | problem-aware          | `/services/leak-repair/` |
| מחיר תיקון דוד     | commercial research    | `/מחירון/`               |
| אזורי שירות        | navigational           | `/איזורי-שירות/`         |

The homepage owns the national head term. **Do not** create a `/services/` page targeting
`תיקון דודים` — it would compete with the homepage.

---

## 3. The ב+city grammar rule

Hebrew prefixes the city: **`תיקון דודים בתל אביב`**, never `תיקון דודים תל אביב`.

This matters mechanically: the city string feeds the title, the H1, the meta description **and** the
JSON-LD, so a wrong form propagates to four places. Any city needing a non-default prefix form gets
that form stored in `lib/site-config.ts` beside the name — never patched with a conditional at the
call site.

---

## 4. Title and description formulas

| Page type | Title (before the template)   | Renders as                             |
| --------- | ----------------------------- | -------------------------------------- |
| Home      | _(none — inherits `default`)_ | חם בבית – מומחים לתיקון דודים בכל הארץ |
| Service   | `<שם השירות>`                 | תיקון דוד שמש \| חם בבית               |
| Location  | `תיקון דודים ב<עיר>`          | תיקון דודים בתל אביב \| חם בבית        |
| Static    | the page's noun               | מחירון \| חם בבית                      |

**The layout template already appends `| חם בבית`. Never append it yourself.** Both dynamic routes
once did, shipping the brand twice on 24 of 33 pages. That is **fixed** — `out/` now contains zero
doubled titles — and the build gate asserts it stays fixed.

Descriptions: 140–160 chars, unique, service + place first, action last, **and no claim the body does
not make**. Service descriptions are re-emitted as JSON-LD `Service.description`, so an unsourced
claim there becomes structured data.

---

## 5. Intent by page type

- **Service pages — problem-aware to solution-aware.** The reader knows something is broken. Cover
  the fault, symptoms, what happens on site, and repair-vs-replace.
- **Location pages — commercial + local.** The reader wants someone who will come to _their_ city.
  Currently these pages satisfy the query shape but not the intent, because they say nothing local.
- **`/מחירון/` — commercial research.** Ranks for price queries while honestly publishing no price
  list. Serve the intent with _how pricing works_, never with an invented figure.
- **Knowledge/informational — unserved.** No articles route exists. Queries like
  "למה הדוד לא מתחמם" have no home on this site. That is the biggest keyword gap and the reason to
  stand up the hub (`new-article`).

---

## 6. Cannibalisation and expansion rules

**Do not create service × city intersection pages.** 6 × 18 = 108 near-identical URLs for a business
with no address and no per-city presence is the textbook doorway pattern, and it risks the whole
domain rather than just the new pages.

**Do not add a 19th city** until all 18 clear the doorway bar in
[content-standards.md](content-standards.md).

**Before adding any service**, check it does not overlap an existing page's intent. `דוד חשמלי` is
the same intent as `/services/electric/` — deepen that page instead of creating a second one.

Watch these existing adjacencies, which are close enough to blur if copy drifts:

- `thermostat` ↔ `heating-element` — a suspected thermostat fault is often an element fault. Keep
  each page's symptom framing distinct and cross-link them.
- `leak-repair` ↔ `replacement` — a leaking tank often becomes a replacement. Make the boundary
  explicit: repairable fitting/connection vs. failed tank.

---

## 7. Unserved intent — the knowledge hub

All of the below currently have **no home on the site**. The target route is `/מדריכים/<slug>/`, which
does not exist yet. Full cluster structure in [topical-map.md](topical-map.md) §4.

| Rank | Cluster        | Example queries                                                           | Target                   |
| ---- | -------------- | ------------------------------------------------------------------------- | ------------------------ |
| 1    | **Symptom**    | אין מים חמים · מים פושרים · הדוד מפיל את החשמל · הדוד מטפטף · רעשים מהדוד | `/מדריכים/<symptom>/`    |
| 2    | **Comparison** | דוד שמש או דוד חשמל · תיקון או החלפה                                      | `/מדריכים/<comparison>/` |
| 3    | **Definition** | מה זה אנודה · מה עושה תרמוסטט · איך עובד דוד שמש                          | `/מדריכים/<term>/`       |
| 4    | **Seasonal**   | בדיקת דוד לפני החורף · למה דודים מתקלקלים בחורף                           | `/מדריכים/<seasonal>/`   |

**A symptom → likely cause table is the single highest-value asset the site could build.** It is
lifted by answer engines far more reliably than prose, and it feeds the service pages internally.

All of these are **technical**, which makes them safe: they need no business fact, so they carry none
of the claims risk that warranty, timing and price content carries. See `aeo-answer-content` and
`new-article`.

**Every hub page must route to a commercial page.** A symptom guide that does not link the service
page fixing that symptom is a dead end. And each hub URL must be added to `app/sitemap.ts`,
`public/llms.txt`, the Header nav and the Footer when it ships.

⚠️ **No prices in a comparison guide.** The business publishes no price list; any figure is invented.
