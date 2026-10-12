/**
 * hambabait.co.il — the announcement bar's lines and when each one shows, plus the one seasonal
 * card. Fleet live-kit register (3locksmiths.co.il/fleet/live-kit; the pilot's
 * content/enriched/_campaigns.mjs explains every field). Checked by
 * scripts/live/check-live-register.mjs before every build.
 *
 * ✅ APPROVED by the owner on 2026-10-12, on the fleet wording sign-off page — approved fingerprint
 *   4e7ea9e801c4 (sha256 of _campaigns.mjs + _updates.mjs as approved). A wording change needs a
 *   new approval; the build refuses a register without its `approved` stamp.
 *
 * THE RULES (fleet-wide, plus this site's own)
 *   - A tip must be something this site already says: `source` quotes the sentence, in the file
 *     that holds it, and the gate checks the sentence is still there — and, through
 *     live.config.mjs pageOfSource, that the tip links to the page that carries it.
 *   - No offers, prices, warranty, hours, availability, speed, coverage, staffing or expertise
 *     (live.config.mjs claims + the fleet list). Nothing here is ⬜/🔶 in docs/business-facts.md.
 *     The published price ranges are real (§1a) but never belong in a line.
 *   - One row: a seasonal line ≤ 46 characters as read (with its link label); evergreen ≤ 70.
 *   - Never type a phone number: {phone}, {whatsapp:<words>}.
 *   - Quiet days silence every line; Shabbat and chag silence the seasonal ones (the fleet
 *     calendar, content/live/_calendar.json — synced from the pilot, never edited here). The
 *     business is closed on Saturday, so nothing here may read as an invitation to call on
 *     Shabbat: the evergreen line asks for a WhatsApp message, never "call now".
 *   - from/until carry Israel's offset for that date: +03:00 until 25/10/2026, +02:00 from then
 *     until 26/03/2027, +03:00 again until 31/10/2027.
 *   - The water-heater year: the autumn check (before the first cold day), winter (the electric
 *     element carries the load), spring (dust on the collector), summer (the collector heats on
 *     its own), late summer (an element that burns out now is felt only in winter).
 */
export default {
  approved:
    "2026-10-12 — Robi (owner), fleet wording sign-off page, fingerprint 4e7ea9e801c4",
  ui: { close: "סגירה" },

  // From 1024px whenever nothing seasonal shows, and the JavaScript-off state. A WhatsApp
  // message, not a call: it is honest on a Friday afternoon or a Saturday, when the business is
  // closed, and it promises no answer time.
  evergreen: {
    topbar: { text: "הדוד לא מחמם? {whatsapp:שלחו לנו הודעה בוואטסאפ}" },
    source:
      "components/marketing/FinalCta.tsx — ״הדוד לא מחמם?״ · components/forms/LeadForm.tsx — ״מעדיפים וואטסאפ?״ ״שלחו לנו הודעה״",
  },

  // The fleet's pre-written wartime line (wording confirmed for 3locksmiths 2026-10-04), shown
  // only while the status switch says `reduced`, on every page. Confirmed for THIS business by
  // the owner on 2026-10-12 (fleet wording sign-off page): חם בבית keeps working under Home
  // Front Command restrictions.
  reduced: {
    topbar: { text: "פועלים בכפוף להנחיות פיקוד העורף" },
    source:
      "3locksmiths.co.il docs/business-facts.md §D.12 (wording confirmed by the owner 2026-10-04) · fleet rollout decision 2026-10-11 · confirmed for hambabait.co.il by the owner 2026-10-12 (fleet wording sign-off page)",
  },

  windows: [
    // Autumn — the check before the first cold day, and the season's one card.
    {
      id: "autumn-check-2026",
      variant: "autumn-check",
      kind: "seasonal",
      from: "2026-10-18T08:00:00+03:00",
      until: "2026-12-01T00:00:00+02:00",
      priority: 30,
      topbar: {
        text: "רוב תקלות הדוד מתגלות ביום הקר הראשון",
        link: { label: "למדריך", href: "/מדריכים/winter-boiler-check/" },
      },
      dialog: {
        title: "מה בודקים בדוד לפני החורף?",
        body: "לפני החורף כדאי לוודא שלושה דברים: שגוף החימום החשמלי אכן פועל, שאין נזילות או לחות סביב הדוד ובחיבורים, ושהקולט נקי אם מדובר במערכת שמש.",
        call: "חייגו {phone}",
        whatsapp: "וואטסאפ",
        link: { label: "מה אפשר לבדוק לבד", href: "/מדריכים/winter-boiler-check/" },
        capDays: 14,
      },
      source:
        "lib/guides.ts — ״רוב תקלות הדוד מתגלות ביום הקר הראשון, אף שהן נוצרו חודשים קודם.״ · ״לפני החורף כדאי לוודא שלושה דברים: שגוף החימום החשמלי אכן פועל, שאין נזילות או לחות סביב הדוד ובחיבורים, ושהקולט נקי אם מדובר במערכת שמש.״ · ״מה אפשר לבדוק לבד״",
    },

    // Early winter: in a SOLAR heater, no hot water at all is almost always the electric
    // element, not the collector. The line names the solar heater because the bar runs on
    // every page: for an electric heater the site's own no-hot-water guide names three equal
    // suspects (element, thermostat, power) and warns against guessing between them.
    {
      id: "winter-backup-2026",
      variant: "winter-backup",
      kind: "seasonal",
      from: "2026-12-01T00:00:00+02:00",
      until: "2027-02-15T00:00:00+02:00",
      priority: 20,
      topbar: {
        text: "דוד שמש בלי מים חמים? לרוב זה גוף החימום",
        link: { label: "פרטים", href: "/services/solar/" },
      },
      source:
        "lib/content.ts — ״ירידה מסוימת בחימום בחורף היא טבעית, כי הקולט מקבל פחות קרינה. אבל אם אין מים חמים כלל, הבעיה כמעט תמיד בגוף החימום החשמלי שאמור להשלים את החום בימים מעוננים — ולא בקולט עצמו.״",
    },

    // Late winter: heat before use rather than all day.
    {
      id: "winter-energy-2027",
      variant: "winter-energy",
      kind: "seasonal",
      from: "2027-02-15T00:00:00+02:00",
      until: "2027-04-01T00:00:00+03:00",
      priority: 20,
      topbar: {
        text: "הפעלה ממוקדת לפני השימוש חוסכת חשמל",
        link: { label: "למדריך", href: "/מדריכים/why-boilers-fail-in-winter/" },
      },
      source:
        "lib/guides.ts — ״הפעלה ממוקדת לפני שעות השימוש חוסכת חשמל לעומת חימום מתמיד.״",
    },

    // Spring, the dusty season: a dusty collector absorbs less, and the loss is gradual.
    {
      id: "spring-collector-2027",
      variant: "spring-collector",
      kind: "seasonal",
      from: "2027-04-01T00:00:00+03:00",
      until: "2027-06-01T00:00:00+03:00",
      priority: 20,
      topbar: {
        text: "קולט מאובק סופג פחות קרינה",
        link: { label: "למדריך", href: "/מדריכים/how-solar-boiler-works/" },
      },
      source:
        "lib/guides.ts — ״אבק ושכבת לכלוך מפחיתים את כמות הקרינה שהקולט סופג. ההידרדרות הדרגתית ולכן קשה להבחין בה, וניקוי הוא חלק מתחזוקה בסיסית של המערכת.״",
    },

    // Summer: the collector does the work; the electric element is hardly needed.
    {
      id: "summer-collector-2027",
      variant: "summer-collector",
      kind: "seasonal",
      from: "2027-06-01T00:00:00+03:00",
      until: "2027-08-15T00:00:00+03:00",
      priority: 20,
      topbar: {
        text: "בקיץ הקולט מספק מים חמים בעצמו",
        link: { label: "למדריך", href: "/מדריכים/winter-boiler-check/" },
      },
      source:
        "lib/guides.ts — ״בקיץ הקולט מספק מים חמים בעצמו, וגוף החימום החשמלי כמעט אינו נדרש.״",
    },

    // Late summer into the autumn: in a SOLAR heater the collector carries the summer, so an
    // element that burns out now goes unnoticed — the reason the guide says to check in the
    // autumn. Not true of an electric heater (its element is its only heat), hence "בדוד שמש".
    {
      id: "silent-failure-2027",
      variant: "silent-failure",
      kind: "seasonal",
      from: "2027-08-15T00:00:00+03:00",
      until: "2027-10-25T00:00:00+03:00",
      priority: 20,
      topbar: {
        text: "בדוד שמש, גוף חימום שרוף לא מורגש בקיץ",
        link: { label: "למדריך", href: "/מדריכים/why-boilers-fail-in-winter/" },
      },
      source:
        "lib/guides.ts — ״בקיץ הקולט מספק מים חמים לבדו, כך שגוף החימום החשמלי יכול להישרף בלי שאיש ירגיש.״ · ״המסקנה המעשית פשוטה: הזמן לבדוק דוד הוא הסתיו, לא החורף.״",
    },
  ],
};
