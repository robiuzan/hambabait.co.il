/**
 * hambabait.co.il — the homepage updates strip (fleet live-kit). The newest three show after the
 * trust bar; the calm script and /assets/live.js hide the strip once the newest item is 45 days
 * old, so a quiet month shows nothing rather than old news. A new item is a real content change.
 *
 * Each item: { date: "YYYY-MM-DD" (the day it happened, never in the future), text (≤ 140,
 * no typed phone number, no price, no promise), href (a page of this site), linkLabel (≤ 18),
 * source (the fact it rests on) }. One item per date. scripts/live/check-live-register.mjs
 * enforces it. Never a customer, street, review, count, price or response time — so the
 * 2026-09-17 publication of the price ranges (/מחירון/), the newest real change, cannot be an
 * item here.
 *
 * ✅ APPROVED by the owner on 2026-10-12, on the fleet wording sign-off page — approved fingerprint
 *   4e7ea9e801c4 (sha256 of _campaigns.mjs + _updates.mjs as approved). A wording change needs a
 *   new approval; the build refuses a register without its `approved` stamp.
 * ⚠ The one item (25/08/2026) is past 45 days, so the strip ships HIDDEN until a fresh, real
 *   item is added (the owner added none at the 2026-10-12 sign-off; the weekly reminder asks).
 */
export default {
  approved:
    "2026-10-12 — Robi (owner), fleet wording sign-off page, fingerprint 4e7ea9e801c4",
  heading: "מה חדש באתר",
  items: [
    {
      date: "2026-08-25",
      text: "מדור המדריכים עלה לאוויר: תקלות ותסמינים, השוואות והחלטות, איך זה עובד, ובדיקות לפי עונה.",
      href: "/מדריכים/",
      linkLabel: "לכל המדריכים",
      source:
        "lib/guides.ts — published: 2026-08-25 on all twelve guides, and the four guideClusterLabels (commit 926f18f, deployed 2026-08-25)",
    },
  ],
};
