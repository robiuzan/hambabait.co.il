---
name: i18n-multilingual
description: The multilingual decision and architecture for hambabait, a monolingual he-IL static export — why adding English is currently a net negative (the audience searches in Hebrew, 45 URLs become 90, every claim needs re-auditing in a second language), why Next's built-in i18n routing does NOT work under output "export" and the app/[lang]/ dynamic-segment pattern is the only correct alternative, reciprocal hreflang with x-default, per-locale canonicals, locale-keyed content maps, and the rule that the Hebrew URLs never move because they are the ranking asset. Use when anyone proposes an English version, asks about hreflang, or wants a language switcher. Triggers: "add English", "multilingual", "hreflang", "i18n", "language switcher", "translate the site", "x-default", "second language".
---

# Multilingual — hambabait

## The recommendation, up front

> **Do not add an English version.** Not as a refusal — as a cost/benefit call that has been made
> deliberately and written down so it does not get re-litigated under deadline.

The site is **monolingual he-IL** (`locale: "he-IL"` in the manifest). `<html lang="he" dir="rtl">` is
set in `app/layout.tsx` and does not change. English appears in exactly three harmless places: URL
slugs (`/services/solar/`, `/locations/tel-aviv/`, and the guide slugs under the Hebrew `/מדריכים/`
segment), `brandNameEn: "Cham BaBait"` which the kit emits as the JSON-LD `alternateName`, and code.

**A monolingual site needs no `hreflang` and no `x-default`.** Adding them today is noise.

## Why not — say these plainly when asked

1. **The audience searches in Hebrew.** An Israeli homeowner with a leaking דוד types `תיקון דודים`.
   English-language demand for this service in this market is marginal.
2. **45 URLs become 90**, and the second 45 would almost certainly be translated rather than
   authored. That is thin content by construction, in a language nobody on the project audits.
3. **Every claim must be re-audited in the new language.** This is the real risk. The claims
   discipline in `docs/business-facts.md` is the site's core asset, and a translator rendering
   "אנחנו מסבירים את התנאים לפני העבודה" as "guaranteed service" silently reintroduces the exact
   warranty claim that took a full pass to remove.
4. **The maintenance surface doubles**: content, metadata, schema, the sitemap, the **hand-maintained**
   `llms.txt` (currently at full 45/45 sitemap coverage — a second tree means keeping 90 lines
   correct by hand), the link mesh, the `data-cta` inventory the GTM container has to match, and the
   docs governing all of it.
5. **It buys nothing structurally.** There is no server. Every locale is just another static tree.

**The cheaper thing that captures most of the value:** the existing `alternateName`, plus — if a
specific English query ever proves real — **one** English page. Not a mirror.

## If it is built anyway — the architecture

Decided in advance so nobody improvises it.

### The constraint that surprises people

**Next's built-in `i18n` routing config does not work with `output: "export"`.** It requires a
server. Anyone reaching for `next.config.mjs` `i18n: { locales, defaultLocale }` will get a build
that either fails or silently does nothing.

The only correct App Router pattern here is a **dynamic locale segment**:

```
app/[lang]/layout.tsx     → <html lang={lang} dir={lang === "he" ? "rtl" : "ltr"}>
app/[lang]/page.tsx       → export function generateStaticParams() {
                              return [{ lang: "he" }, { lang: "en" }];
                            }
```

Note what that implies: **every one of the 45 routes moves under the segment** — including the nine
Hebrew route directories and the whole `/מדריכים/` hub. It is a whole-app refactor, not an addition.
Budget it as one.

It also invalidates the release gate: `scripts/qa-gate.mjs` hard-codes `EXPECTED_BUILT_PAGES = 47`,
`EXPECTED_INDEXABLE = 45` and `EXPECTED_SITEMAP_LOCS = 45`, and its `NOINDEX_ROUTES` set names
`/404/` and `/תודה/` by their current paths. All four would have to be re-derived per locale before
`npm run qa:gate` says anything meaningful again. Do not disable the gate to get past it.

### Non-negotiables

| Concern         | Rule                                                                                                                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default locale  | Hebrew stays at the **root** (`/`). English goes under `/en/`. **Never move a Hebrew URL** — they are the ranking asset.                                                                                  |
| `dir`           | Set from the segment on `<html>`, never guessed per component. Logical utilities then work unchanged for both.                                                                                            |
| `hreflang`      | Reciprocal `alternates.languages` on every page pair, **plus `x-default` → Hebrew**. Non-reciprocal hreflang is ignored outright.                                                                         |
| Canonicals      | Self-referencing per locale. An English page **never** canonicalises to its Hebrew twin.                                                                                                                  |
| Content         | Locale-keyed maps in the content layer, same shape as `cityContent`. **Never a translation call at render time** — there is no server.                                                                    |
| Schema          | `inLanguage` per locale; **one** `Plumber` entity shared by `@id`, never duplicated per language.                                                                                                         |
| Sitemap         | Both trees, percent-escaped, with `xhtml:link` alternates.                                                                                                                                                |
| `llms.txt`      | Hand-maintained, not generated. Hebrew stays canonical; English listed separately, and both trees stay at full sitemap coverage.                                                                          |
| Fonts           | Heebo and Rubik already carry Latin subsets. **No new font ships.**                                                                                                                                       |
| Translation     | Human, by someone who knows the trade. Machine translation of technical plumbing copy produces confident nonsense — and it gets indexed.                                                                  |
| Claims          | Re-run the `docs/eeat-and-trust.md` §6 gate on **every** translated page.                                                                                                                                 |
| Language switch | A real link with `hreflang` and readable text. **Never** an auto-redirect by IP or `Accept-Language` — it breaks the back button, breaks crawling, and hides content from users who wanted the other one. |

### Acceptance

- [ ] No Hebrew URL changed.
- [ ] Every pair reciprocal; `x-default` present and pointing at Hebrew.
- [ ] Both trees in the sitemap, percent-escaped, byte-identical to their canonicals.
- [ ] `dir` correct on both trees; zero banned physical-direction utilities.
- [ ] Claims gate re-run on every English page.
- [ ] `scripts/qa-gate.mjs` thresholds re-derived for the two-locale tree, not disabled.
- [ ] Build gate green — **five commands**:
      `npm run lint && npm run typecheck && npm run format:check && npm run build && npm run qa:gate`.

## Related

`hebrew-rtl` (the RTL rule set) · `docs/accessibility-and-i18n.md` (the full decision record) ·
`seo-metadata` (canonicals and the brand-suffix template rule).
