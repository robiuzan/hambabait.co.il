---
name: hebrew-rtl
description: RTL and Hebrew (he-IL) discipline for hambabait — logical Tailwind utilities only with the pl/pr/ml/mr/left/right/text-left/text-right ban that qa:gate now enforces on the built HTML, dir="ltr" islands for phone, email and URL, Israeli number and date formats, Hebrew punctuation with גרש and גרשיים, the ב+city grammar rule, and the percent-encoded Hebrew route trap across nine Hebrew route directories and the knowledge hub's Hebrew parent segment. Use whenever writing markup, classes or copy that appears on the page. Mandatory per CLAUDE.md §6. Triggers: "RTL", "Hebrew", "which padding utility", "text direction", "LTR island", "Hebrew slug 404", "mirrored layout".
---

# Hebrew & RTL discipline

`<html lang="he" dir="rtl">` is set in `app/layout.tsx`. Do not remove it. Everything below follows
from it.

## The utility ban — non-negotiable

Horizontal spacing and positioning use **logical** properties only, so the layout mirrors correctly.

| Use                         | Never use                   |
| --------------------------- | --------------------------- |
| `ps-*` `pe-*`               | `pl-*` `pr-*`               |
| `ms-*` `me-*`               | `ml-*` `mr-*`               |
| `start-*` `end-*`           | `left-*` `right-*`          |
| `text-start` `text-end`     | `text-left` `text-right`    |
| `border-s-*` `border-e-*`   | `border-l-*` `border-r-*`   |
| `rounded-s-*` `rounded-e-*` | `rounded-l-*` `rounded-r-*` |

Vertical utilities (`pt-` `pb-` `mt-` `mb-` `top-` `bottom-`) are unaffected — direction does not
mirror the vertical axis.

**The only exception** is a genuinely direction-agnostic case, and it must carry a comment saying so:

```tsx
{
  /* direction-agnostic: centred icon badge, no logical side */
}
<span className="left-1/2 -translate-x-1/2" />;
```

### The gate, and why a plain grep is not it

`npm run qa:gate` checks the **built HTML**, not the source, and it is the authority. It reads class
attributes only, splits them into whole tokens, strips variant prefixes at bracket depth 0 (so
`data-[state=open]:ml-2` reduces to `ml-2` while `bg-[url(data:...)]` is left alone), then matches the
base utility exactly.

That machinery exists because the naive grep is full of false positives: `text-primary`,
`border-primary`, `placeholder:text-gray-400` and `lucide-chevron-left` all contain a banned
substring. Use the source grep as a fast first pass, then trust the gate:

```bash
grep -rnE '\b(pl|pr|ml|mr)-[0-9]|\b(left|right)-[0-9]|text-(left|right)\b' app components
npm run build && npm run qa:gate
```

## Let `dir="rtl"` do the mirroring

Flex and grid already reverse under RTL. **Do not** add `flex-row-reverse` to "fix" an order — you
will double-reverse it and break LTR fallbacks. The legitimate use of `flex-row-reverse` is wrapping
an LTR island (a phone number beside an icon) so the island itself reads correctly.

`space-x-*` needs `space-x-reverse` under RTL. Prefer `gap-*`, which has no direction problem.

## LTR islands

Latin or numeric runs inside Hebrew text get isolated, or the bidi algorithm reorders punctuation:

```tsx
<a href={telHref} className="ltr" dir="ltr">
  055-6601006
</a>
```

`.ltr` is defined in the `@layer utilities` block of `app/globals.css` as
`direction: ltr; unicode-bidi: isolate`. Use it for:

- phone numbers (`055-6601006`)
- email addresses (`info@hambabait.co.il`)
- URLs
- prices and any standalone number with a symbol

Without isolation, `055-6601006` beside Hebrew can render with the hyphen or the leading zero in the
wrong place — a bug that only appears in production copy, never in a code review. It is also an
accessibility defect, not just a cosmetic one: a user reads and dials the wrong digits.

## Israeli formats

- **Phone:** `0XX-XXX-XXXX` for display; `+972…` for `tel:` and schema.
- **Currency:** `₪`, symbol before the number, wrapped as an LTR island. Thousands take a comma
  (`₪1,300`). The site publishes VAT-inclusive ranges on `/מחירון/`, so this is a live rule, not a
  hypothetical — see **Price ranges** below.
- **Dates:** `dd/mm/yyyy`.
- **Hours:** `08:00–18:00` with an en-dash, days written in Hebrew
  (`ראשון–חמישי`, `שישי`). Saturday absent means closed — do not write "סגור" as a row unless the
  design calls for it.

### Price ranges — the ₪ trap

A range is two LTR islands joined by a neutral dash, so in RTL prose the bidi algorithm reorders it:
`₪250–₪850` can render with the bounds or the shekel signs in the wrong place. The reader sees the
wrong price, and nothing in the source looks wrong. Two shipped answers:

- **In a cell:** assemble the whole string in JS and emit it as **one** text node inside
  `<span className="ltr" dir="ltr">` — `PriceRangeCell` in `components/marketing/PriceTable.tsx`.
  Interpolating `₪{low}–₪{high}` inline makes React emit `₪<!-- -->250<!-- -->–…`: invisible in a
  browser, but it fragments the figure for anything parsing the raw HTML.
- **In prose:** drop the dash entirely — `בין ₪250 ל-₪880`, or `₪250 עד ₪500`. The Hebrew words carry
  the direction, so no neutral character is left to reorder. `pricingAnswer` and the `/מחירון/` meta
  description both do this, and a meta description has no `dir` attribute available at all, so there
  the prose form is the **only** safe one.

`כולל מע״מ` stays attached to the figure wherever it appears — Consumer Protection Law §17א, and it
survives extraction into a snippet.

## Hebrew punctuation

- Use **גרש** `׳` and **גרשיים** `״` in Hebrew abbreviations — `ת״י 5568`, not `ת"י 5568`.
- Use a proper en-dash `–` in ranges and an em-dash `—` in asides.
- Do not mix languages mid-sentence. "SEO" inside a Hebrew sentence is acceptable as a term; a whole
  English clause is not.
- Keep user-facing strings Hebrew. Only code identifiers, slugs and comments are English.

## The ב+city grammar rule

Hebrew prefixes the city: `תיקון דודים **ב**תל אביב`. It never follows. This matters because location
titles, descriptions, H1s and JSON-LD are all generated from the city name.

If a city needs a non-default prefix form, encode it in `lib/site-config.ts` alongside the name —
never patch it with a conditional at the call site, because the same city string feeds the title, the
H1, the meta description and the schema.

## The Hebrew route trap

**Nine route directories are Hebrew** — `אודות`, `איזורי-שירות`, `הצהרת-נגישות`, `מדיניות-פרטיות`,
`מדריכים`, `מחירון`, `צור-קשר`, `שירותים`, `תודה` — and the knowledge hub adds a Hebrew **parent
segment** to 13 more URLs (`/מדריכים/` plus its 12 guide slugs, whose slugs themselves are English).
`/תודה/` is deliberately outside the sitemap; the other eight are in it.

Three rules keep them working:

1. **Sitemap:** every `loc` goes through `encodeURI` in `app/sitemap.ts`. The protocol requires
   escaped URLs, and the host matches the **escaped** asset key — a raw-UTF-8 path 404s.
2. **Canonicals:** Next escapes them automatically, producing a byte-identical match to the sitemap
   `<loc>`. `qa:gate` asserts that parity in both directions across all 45 indexable URLs. Never
   hand-write one.
3. **In-page `href`s:** ship as raw UTF-8 (`href="/אודות/"`). Browsers encode on navigation. This is
   correct — do not "fix" it.

**When testing a Hebrew URL from a shell, pass the already-escaped form.** Re-encoding an escaped URL
double-encodes the bytes (`%D7%9E` → `%C3%97%C2%9E`) and returns a 404 that looks exactly like a real
outage. This has burned people; it is a test-harness bug, not a site bug.

One more shell trap on Windows: `grep -P '[\x{0590}-\x{05FF}]'` fails outright in this environment
("character value too large"). Match Hebrew paths by testing for non-ASCII bytes instead of by
codepoint range.

## Copy voice

Second person plural (אתם/אתן), warm and plain. The reader usually has no hot water right now — lead
with what happens next, not with brand adjectives. No exclamation marks. No hard sell.

Before adding any sentence that makes a factual promise (warranty, timing, coverage), check
`docs/business-facts.md` and `docs/manifest-assumptions.md`. Much of this site's speed and warranty
language is already unsourced, and the hours, email and phone routing are recorded as **assumptions,
not confirmed facts**. Do not add more. Prices are the exception — owner-confirmed since 2026-09-17
(§1a) — but a figure is still never typed into JSX: it comes from `priceRanges` in `lib/content.ts`.

## Review checklist

- [ ] No banned physical utility (source grep, then `qa:gate` on the built HTML)
- [ ] No `flex-row-reverse` added to "fix" ordering
- [ ] Every phone/email/URL/price is an LTR island; every ₪ range is one text node, or prose form
- [ ] Hebrew abbreviations use `׳`/`״`
- [ ] City names take the `ב` prefix
- [ ] Any new Hebrew route is reachable, escaped in the sitemap, and canonical-matched
