/**
 * The fleet live-kit's settings for hambabait.co.il — the announcement bar, the seasonal card and
 * the homepage updates strip (3locksmiths.co.il/fleet/live-kit). Read by components/live/Live.tsx
 * and by every scripts/live/ gate. The registers themselves are content/live/_campaigns.mjs and
 * content/live/_updates.mjs.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** One rule from several families of wording. String.raw: each backslash is typed once. */
const any = (...families) => new RegExp(families.join("|"));
const r = String.raw;
/** What the business does, as a verb — the subject of a speed or duration promise. */
const VERB =
  "נגיע|מגיעים|מגיע|יגיע|נתקן|מתקנים|נטפל|מטפלים|נחזור|חוזרים|יחזור|יחזרו|תחזור|עונים|נענה|יענה|מגיבים|נגיב|מאבחנים|נאבחן|מסיימים|נסיים|יוצאים|נצא|מחליפים|נחליף|מתאמים|נתאם|פועלים|עובדים";
/** A job reported as done: "ההחלפה נעשית בשעה אחת", "העבודה מסתיימת בביקור אחד". */
const DONE =
  "נעשית|נעשה|נעשות|מתבצעת|מתבצע|מתבצעים|מתבצעות|נגמרת|נגמר|נגמרות|נגמרים|מסתיימת|מסתיים|מסתיימות|מסתיימים";
/** What the business does, as a noun — "שירות מהיר", "מענה זריז", "תיקון של שעה". */
const NOUN = "שירות|טיפול|תיקון|מענה|הגעה|אבחון|תגובה|חזרה|פתרון|החלפה|ביקור|תיאום";

export default {
  site: "hambabait.co.il",
  url: "https://hambabait.co.il",
  dir: "content/live",
  siteConfig: "site.config.json",

  /**
   * Calm pages: no seasonal line, no card (a safety or wartime line still shows). Exact paths,
   * or prefixes ending in "*". The noindex conversion receipt, the two legal pages, and the one
   * guide that is about a live electrical hazard (a breaker tripping on the boiler — "סכנת
   * התחשמלות"): no seasonal nudge belongs over that. No page here tells the reader to call
   * 100/101/102 (checked 2026-10-11).
   */
  calm: ["/תודה/", "/מדיניות-פרטיות/", "/הצהרת-נגישות/", "/מדריכים/tripping-breaker/"],
  /** No card here, but the bar is normal: the lead-form page — the card would compete with it. */
  noDialog: ["/צור-קשר/"],

  /** The homepage strip sits in the site's own container width (components/ui/Container.tsx). */
  updatesContainerClass: "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8",

  /**
   * This site's own ⛔ stems, on top of the fleet's (years, arrival times, ratings, counts,
   * discounts, scarcity, prices, warranty). Each rule covers one ⬜/🔶 row of
   * docs/business-facts.md, or what kit README rule 2 keeps out of a line even when true (hours
   * §1, prices and the call-out fee §1a/§3.4): no live surface may state it. They apply to the
   * registers' visible copy only — the fleet calendar's labels answer to the fleet rules alone.
   *
   * STEMS, not phrases. Mutation-tested 2026-10-12: 118 near-miss rewordings of every row
   * (tenure in digits and words, counts, prices, hours, availability, speed, duration, warranty
   * and durability, credentials and legal entity, reviews and rank, coverage, the §3.7 city
   * profiles, accessibility conformance, parts and brands, emergency) went from 7 caught to all
   * 118, plus five held-out rounds written after each widening (140 more; each scored once
   * before it was used: 11/30, 17/30, 12/30, 22/30, 13/20 — expect stems to catch roughly two
   * thirds of a fresh paraphrase: the owner's approval is the real gate). Every register string
   * passes, and none of the 1,205 visible sentences that make no such claim is hit (517 of them
   * from the guides).
   *
   * Left alone on purpose, because the site's own claim-free sentences use them: "משתלם" (a
   * repair that is worth it), "שנים רבות" and "לאורך שנים" (old buildings, slow decline), a bare
   * "מיד" / "מהר" / "מהיר" (symptoms and corrosion), "גיבוי" (the backup element), "מכוסה" (a
   * dusty collector), "קבוע" (a steady drip), "תמיד", "עשור", "ותק" ("תקלות של ותק"), "בערב",
   * "עולים מ" (hot water rises), "שקל" (אשקלון, "שקלים" = lighter), "ערי" (a climate
   * comparison), "ביטחון" (the safety valve), "לפי תקן" (Modiin's buildings), "כל סוגי
   * המערכות" (Rishon), "פריסה" (Ashkelon's sprawl), "טכנאי" in a generic guide question, and
   * "מזמין" / "הזמינו" (to order), which contain "זמין". Urgency words stay blocked even in
   * guide sentences ("בדיקה דחופה"): README rule 2 keeps emergency framing out of a line.
   *
   * No \b (ASCII-only in JS); (?<![א-ת]) and (?![א-ת]) are the Hebrew word edges. Final letters:
   * a stem that can end a word lists both forms (זמי[נן], מומל[צץ], תק[נן], אור[כך]). Written in
   * an editor, never through a shell (a shell once ate the kit's backslashes: \s became s).
   * Re-test after any edit: every near-miss must still fail, and every register string and every
   * claim-free guide sentence must still pass.
   */
  claims: [
    // §3.1 — the warranty, and every other promise about the outcome or how long it lasts.
    {
      id: "warranty",
      re: any(
        r`אחריות|מגוב(?:ה|ים|ות)|ערבות|תעודת התחייבות`,
        r`(?<![א-ת])[וש]?מתחייב(?:ים|ת|ות)?(?![א-ת])|(?:עם\s+|(?<![א-ת])ב)התחייבות|התחייבות\s+(?:מלאה|ל|ש)`,
        r`עומד(?:ים|ת)?\s+מאחורי|על\s+חשבוננו|כסף\s+בחזרה|החזר\s+(?:כספי|מלא|כסף)|מחזירים\s+(?:את\s+)?הכסף`,
        r`(?<![א-ת])[וש]?(?:מבטיח|מבטיחה|מבטיחים|נבטיח)(?![א-ת])|(?<!(?:בלי|ללא|אין)\s)(?<![א-ת])[הבו]?הבטח(?:ה|ות)(?![א-ת])`,
        r`גיבוי\s+(?:מלא|לכל|על)|(?:עבודה|תיקון)\s+(?:[א-ת]+\s+)?מכוס(?:ה|ים|ות)|מכוס(?:ה|ים|ות)\s+(?:אצלנו|על\s+ידינו|באחריות)`,
        r`(?:כל|ה)\s*(?:חלק|תיקון|עבודה)(?:\s+[א-ת]+){0,3}\s+מכוס|(?:מתקינים|מחליפים|מתקנים|מספקים)\s+(?:[א-ת]+\s+)?מכוס`,
        r`שקט\s+נפשי|לשנים\s+(?:קדימה|ארוכות|רבות)|(?:מחזיק|יחזיק|מחזיקים|יחזיקו)\s+(?:לאורך\s+זמן|שנים|לשנים)|פתרון\s+(?:של\s+)?קבע|לטווח\s+(?:ה)?ארוך|פעם\s+אחת\s+ולתמיד`,
        r`(?:עבודה|תיקון|פתרון)\s+(?:[א-ת]+\s+)?ש(?:מחזיק|מחזיקה|יחזיק|תחזיק)\s+(?:מעמד|לאורך|שנים|לשנים)|(?:עבודה|שירות|תיקון|חלקים|טיפול|ציוד)\s+איכותי`,
        r`כיסוי\s+(?:מלא|לכל|על\s+(?:ה)?(?:עבודה|תיקון|חלקים))|(?:תיקון|עבודה|פתרון)\s+(?:ש)?(?:אפשר\s+)?לסמוך\s+עלי|אחראי(?:ם|ת|ות)?\s+על\s+(?:כל\s+)?(?:ה)?(?:תיקון|עבודה|תוצאה)`,
        r`ביטחון\s+(?:מלא|בעבודה|בתיקון|לשנים)|בלי\s+לשאול\s+שאלות|ללא\s+שאלות|תצטרכו\s+לחזור\s+עלי|(?:לא|בלי)\s+(?:תצטרכו|צריך)\s+(?:לתקן|להזמין)\s+שוב`,
      ),
    },
    // §3.2 — speed, same day, the callback with no stated window. A bare "מהר" / "מהיר" only
    // after a verb or noun of the business: "האנודה מתכלה מהר" is a symptom the pages describe.
    {
      id: "speed",
      re: any(
        r`(?:${VERB})(?:\s+[א-ת]+){0,2}\s+(?:מהר|במהירות|במהרה|בזריזות|בהקדם|מיד|תיכף)(?![א-ת])|(?:נגיע|מגיעים|יוצאים|נצא|עונים|חוזרים|נחזור)\s+ברגע\s*ש`,
        r`(?:${NOUN})(?:\s+[א-ת]+)?\s+(?:מהיר(?:ה|ים|ות)?|זריז(?:ה|ים|ות)?|בזק|מיידי(?:ת|ים|ות)?|קצר(?:ה)?)(?![א-ת])`,
        r`מיידי|הכי\s+מהירה?|במהירות\s+(?:ה)?אפשרית|(?:ב|תוך\s+|בתוך\s+)זמן\s+קצר|בזמן\s+(?:שיא|קצר|מהיר)|בן\s+רגע|הכי\s+מהר`,
        r`עוד\s+(?:הלילה|הערב|הבוקר)|עוד\s+לפני\s+(?:ה)?(?:צהריים|ערב|לילה|סוף\s+היום)|באותו\s+(?:ה)?(?:יום|בוקר|ערב|שבוע)|בו\s+ביום|מהיום\s+להיום|ב(?:שעה|שעות)\s+הקרוב`,
        r`(?:נחזור|חוזרים|יחזור|יחזרו|תחזור)\s+(?:אלי|לכל)|כבר\s+מחר|עד\s+מחר|מחר\s+בבוקר|(?:אנחנו|הטכנאי|טכנאי)\s+(?:כבר\s+)?בדרך(?!\s+כלל)`,
        r`(?:זמן|זמני|בלי|ללא)\s+(?:ה)?המתנה|(?:לא|בלי|ללא)\s+(?:צריך\s+)?(?:לחכות|להמתין)|לא\s+תחכו|לא\s+תצטרכו\s+לחכות|תור(?:\s+אצלנו)?\s+(?:קצר|מהיר)|(?:בלי|ללא)\s+(?:שום\s+)?(?:עיכוב|עיכובים|דיחוי|תור|תורים)(?![א-ת])`,
      ),
    },
    // §3.3 — the one hard number ("כשעה עד שעתיים") and any other repair or arrival duration, in
    // digits or words. Minutes only with the business as the subject: "הפחת יורד מיד או תוך
    // דקות" is how the breaker guide tells a burnt element apart.
    {
      id: "duration",
      re: any(
        r`כשעה|שעתיים|תוך\s*(?:כ|כמה\s+|מספר\s+|[א-ת]+\s+)?(?:\d+\s*)?(?:שעה|שעות|יום|יומיים|ימים|בוקר|שבוע)(?![א-ת])|(?:תוך|בתוך|פחות\s+מ)\s*(?:[א-ת]+\s+)?(?:ה)?יממה`,
        r`(?:${VERB}|${NOUN})(?:\s+[א-ת]+){0,2}\s+(?:תוך|בתוך|אחרי)\s*(?:כ|כמה\s+|מספר\s+|[א-ת]+\s+)?(?:\d+\s*)?(?:דקות|דקה)|תוך\s*(?:כמה\s+|מספר\s+|[א-ת]+\s+)?דקות(?:\s+[א-ת]+)?\s+(?:אצלכם|אליכם|אצלך|אליך)`,
        r`(?<![א-ת])(?:נמשכ|נמשך|לוקח|אור[כך])[א-ת]*\s+(?:רק\s+|בערך\s+)?(?:כ)?(?:\d+\s*|[א-ת]+\s+)?(?:דקות|דקה|שעה|שעות|יום|ימים)|(?:לוקח|נמשך|אורך)\s+(?:הרבה\s+)?פחות\s+זמן|פחות\s+זמן\s+ממה`,
        r`פחות\s+מ(?:שעה|יום|יומיים)|(?:שעה|שעתיים|יום|דקות)\s+לכל\s+היותר|(?:${NOUN}|עבודה)\s+של\s+(?:כ)?(?:שעה|שעתיים|חצי\s+שעה|רבע\s+שעה|\d+\s*דקות|כמה\s+דקות|דקות)`,
        r`בביקור\s+(?:אחד|יחיד)|באותו\s+ביקור|(?:${VERB}|${DONE})(?:\s+[א-ת]+){0,3}\s+(?:בבוקר|ביום|בביקור|בפעם|בשעה)\s+(?:אחד|אחת|יחיד|יחידה)(?![א-ת])`,
      ),
    },
    // The hours are confirmed (ראשון–חמישי 08:00–18:00, שישי עד 14:00), but the bar runs at any
    // hour: no live availability, no 24/7, nothing about nights, weekends, Shabbat or chag.
    // "זמין" only as a word — "מזמין" and "הזמינו" (to order) are in the guides.
    {
      id: "availability",
      re: any(
        r`24\s*[/\-–×x]\s*7|24\s+שעות|עשרים\s+וארבע|מסביב\s+לשעון|יום\s+ולילה|לילה\s+ויום|שעות\s+היממה|כל\s+היממה|(?:7|שבעה)\s+ימים\s+בשבוע|ימות\s+(?:השבוע|השנה)|365|כל\s+השבוע`,
        r`(?:עובדים|פועלים|מגיעים|שירות|עונים|נגיע|מתקנים|זמינים|פתוח(?:ים)?)\s+(?:גם\s+|אפילו\s+)?ב(?:לילה|לילות|ערב|ערבים|סופ|שבת|שבתות|חג|חגים)`,
        r`(?:שירות|מענה|קו|טכנאי|תיקוני|תיקון|ביקורי)\s+(?:של\s+)?(?:לילה|לילות|ערב|ערבים|סוף\s+שבוע|שבת|חגים)(?![א-ת])`,
        r`סופ(?:י|״ש|"ש|'ש)\s?שבוע|סופ[״"']ש|סופש(?![א-ת])|סוף\s+השבוע|מוצאי\s+שבת|מוצ[״"']ש|בשבת|בחג|בכל\s+שעה|[הב]שעות\s+הקטנות|באמצע\s+(?:ה)?(?:לילה|שבת|חג|סוף\s+השבוע)`,
        r`(?<![א-ת])(?:[ושבלכ]|כש|וה|שה)?זמי[נן](?:ה|ים|ות)?(?![א-ת])|(?<![א-ת])ה?זמינות(?![א-ת])`,
        r`פתוחים|פתוח(?:ים)?\s+(?:גם|עד|כל|בימי|ביום|בשבת|בחג|ב?ערב|ב?לילה|ב?בוקר|מ(?:ראשון|שמונה|\d))|פתוח\s+עכשיו`,
        r`(?:כאן|זמינים|עונים|איתכם|פה)\s+(?:בשבילכם\s+|לשירותכם\s+)?תמיד|(?:תמיד|כל\s+הזמן)\s+(?:יש\s+)?(?:מי\s+ש)?(?:כאן|זמינ|זמין|עונ|איתכם)|מי\s+ש(?:עונה|יענה|זמין)`,
        r`(?:עובדים|פועלים|עונים|מגיעים|פתוחים|זמינים)\s+(?:גם\s+)?כל\s+(?:יום|ערב|לילה|השבוע|השנה)|בכל\s+שעות\s+(?:ה)?(?:יום|יממה|ערב|לילה)`,
      ),
    },
    // Kit README rule 2 — no hours in a line, even the confirmed ones (the fleet list has none).
    {
      id: "hours",
      re: any(
        r`\d{1,2}:\d{2}|שעות\s+(?:ה)?(?:פעילות|קבלה|עבודה|פתיחה)|א[׳']\s*[–-]\s*ה[׳']|ראשון\s*(?:[–-]|עד)\s*חמישי`,
        r`בימי\s+(?:ראשון|שני|שלישי|רביעי|חמישי|שישי|חול)|ביום\s+(?:ראשון|שני|שלישי|רביעי|חמישי|שישי)(?![א-ת])|(?<![א-ת])(?:ב|עד|וב|ו)שישי(?![א-ת])`,
        r`עד\s+(?:ה)?(?:ערב|צהריים|לילה)(?![א-ת])|עד\s+(?:ה)?שעה\s+(?:\d|אחת|שתיים|שתים|שלוש|ארבע|חמש|שש|שבע|שמונה|תשע|עשר)`,
        r`(?:אחת|שתיים|שתים|שלוש|ארבע|חמש|שש|שבע|שמונה|תשע|עשר)(?:\s+ו?חצי)?\s+(?:בערב|בבוקר|בלילה|בצהריים|אחה[״"]צ)`,
        r`בין\s*\d{1,2}\s*(?:ל|עד)\s*[־-]?\s*\d{1,2}(?!\d|\s*(?:מעלות|°|ליטר|ס[״"]מ|מ[״"]מ|אחוז|%|קומות|שנים|שנה|ימים))`,
      ),
    },
    // Kit README rule 2 — no price or fee in a line. §1a's ranges and §3.4's "no call-out fee"
    // are true, but they are not line copy, and the fleet's price rules need a ₪ or "מחיר".
    // "שקל" only after a negation: "אשקלון" and "שקלים יותר" (lighter) are on the pages.
    {
      id: "fee",
      re: any(
        r`דמי\s+ביקור|תוספות|תעריף|עלויות|מע[״"']?מ(?![א-ת])`,
        r`החל\s+מ[־-]?\s*₪?\s*\d|מ[־-]\s*₪?\s*\d{3,}|בין\s*₪?\s*\d{2,}[\d,]*\s*(?:ל|עד)\s*[־-]?\s*₪?\s*\d|\d\s*(?:₪\s*)?בלבד`,
        r`(?:בלי|ללא|לא|אין)\s+(?:צריך\s+)?(?:לשלם|תשלום|משלמים|תשלמו)|(?:משלמים|ה?תשלום)\s+(?:רק|לאחר|אחרי|בסוף)|(?:ההגעה|הביקור|האבחון|הבדיקה|הנסיעה)\s+עלינו`,
        r`לא\s+עולה\s+(?:כלום|דבר|שקל|כסף)|(?:בלי|אף|לא)\s+(?:[א-ת]+\s+)?שקל(?![א-ת])|שקל\s+אחד|(?<![א-ת])בזול|בזיל\s+הזול|מוזל`,
        r`(?<![א-ת])ו?ה?הוגנ(?:ים|ות|ת)(?![א-ת])|(?<![א-ת])ו?ה?הוגן(?![א-ת])`,
      ),
    },
    // §3.5 — staff. Nothing establishes that any technician exists, so "טכנאים", "הטכנאי שלנו",
    // "טכנאי מגיע אליכם" are claims — but not a guide's "צריכים טכנאי לתקלה הזו?".
    {
      id: "staffing",
      re: any(
        r`טכנאים|(?<![א-ת])[הוש]?טכנאי(?:ת)?\s+(?:שלנו|מוסמך|מנוסה|מקצועי|מיומן|מטעמנו|מומחה|ותיק|קבוע|תורן|כונן|זמין|באזור|בדרך|מגיע|יגיע|יוצא|אצלכם|אליכם|לביתכם|לכל|בכל)`,
        r`(?<![א-ת])(?:נשלח|נשלחים|שולחים|יגיע|מגיע|יבוא|זימון|הגעת|ביקור|תיאום)\s+(?:אליכם\s+)?טכנאי`,
        r`(?<![א-ת])[הובלמש]?צוות|בעלי\s+(?:ה)?מקצוע|אנשי\s+(?:ה)?מקצוע\s+(?:שלנו|מנוסים|מעולים|מוסמכים|מיומנים)|מהשורה\s+הראשונה|מקצוע[נן]`,
        r`(?:שירות|עבודה|טיפול|תיקון|יחס|מענה)\s+(?:[א-ת]+\s+)?ו?(?:מקצועי(?:ת|ים)?|אמי[נן](?:ה|ים)?)(?![א-ת])|אמינות|(?:חשמלאי|שרברב|אינסטלטור)(?:ים)?\s+(?:שלנו|מוסמ[כך]|מנוס|מקצועי|מיומ[נן])`,
      ),
    },
    // §3.5 — specialist status and "every boiler type". "ניסיון" only as experience ("ניסיון
    // לתקן לבד" is an attempt); "כל סוגי" only of boilers ("כל סוגי המערכות" describes Rishon).
    {
      id: "expertise",
      re: any(
        r`מומח|מנוס(?:ה|ים|ות)|מיומ[נן]|בקיא|מתמח|התמחות`,
        r`ני?סיון\s+(?:רב|עשיר|מוכח|של|בתחום|ארוך|מקצועי)|(?:שנות|עם|בעלי|(?<![א-ת])מ)\s*ני?סיון|ידע\s+(?:רב|עשיר|של\s+שנים|מקצועי|וני?סיון)`,
        r`(?:מתקנים|מטפלים|עובדים\s+(?:על|עם)|מתמחים\s+ב|מומחים\s+ב|מכירים)\s+(?:[א-ת]+\s+)?כל\s+(?:סוגי|סוג|הסוגים|הדגמים|דגם)`,
        r`(?:לכל|בכל)\s+סוגי|מכל\s+הסוגים|כל\s+סוגי\s+ה?דוד|כל\s+סוג\s+של\s+דוד|כל\s+(?:דגם|הדגמים|היצרנים|המותגים)|מכל\s+היצרנים`,
      ),
    },
    // §1 — foundedYear is null: no tenure in digits, words, decades or "since". "כבר שנים" only
    // after the business acts ("מתקנים דודים כבר עשרים שנה"), never of a boiler's age ("בן").
    {
      id: "tenure",
      re: any(
        r`שנות\s+ני?סיון|שנים\s+של\s+(?:ני?סיון|עבודה|שירות)|(?:ידע|ני?סיון|מומחיות|ותק)\s+(?:ש)?(?:נצבר|נרכש|צברנו|רכשנו)|מני?סיוננו`,
        r`(?<![א-ת])[מב]?שנת\s*(?:19|20)\d\d|(?<![א-ת])ו?מאז\s*(?:19|20)\d\d|(?:19|20)\d\d\s+(?:ועד|עד)\s+היום|המאה\s+הקודמת|עוד\s+מ(?:שנות|ימי)(?![א-ת])`,
        r`עשור(?:ים)?\s+(?:של\s+)?(?:ני?סיון|עבודה|שירות|פעילות|ב(?:תחום|ענף|מקצוע))|מעשור\s+ב(?:תחום|ענף|מקצוע)|(?:שני|שלושה|ארבעה|כמה)\s+עשורים`,
        r`(?:שנה|שנים)\s+ב(?:תחום|ענף|מקצוע|עסק)|\d{1,2}\s*\+?\s*שנ(?:ה|ים)\s+(?:מתקנים|מטפלים|עובדים|אנחנו|של\s+(?:ני?סיון|עבודה|שירות))`,
        r`(?:פועלים|עובדים|מתקנים|מטפלים|קיימים|מכירים|יודעים|נמצאים|משרתים|בשטח|בתחום|בענף|במקצוע)(?:\s+[א-ת]+){0,3}\s+(?:כבר|מזה|יותר\s+מ|למעלה\s+מ)\s*(?!בן\s|בת\s)(?:\d+\s*|[א-ת]+\s+)?(?:שנים|שנה|עשור|עשורים)(?![א-ת])`,
        r`(?<![א-ת])מזה\s+(?!בן\s|בת\s)(?:\d+\s*|[א-ת]+\s+){0,2}(?:שנים|שנה|עשור|עשורים)(?![א-ת])|(?:בתחום|בענף|פועלים|עובדים|מתקנים|קיימים)(?:\s+[א-ת]+){0,2}\s+(?:מאז|משנות|משנת)(?![א-ת])`,
        r`(?:ארוך|רב)\s+שנים|דור\s+(?:שני|שלישי)\s+(?:ב|של)|עסק\s+משפחתי|ותיק(?:י|ים|ה|ות)?\s+(?:ה|ב)?(?:תחום|ענף|מקצוע|שוק)`,
        r`ותק\s+של|בעלי\s+ותק|(?<![א-ת])ו?ותק\s+(?:ו|רב|מקצועי|בתחום)|מוניטין`,
      ),
    },
    // CLAUDE.md §1 — no count of jobs or customers exists, and none may be added.
    {
      id: "counts",
      re: any(
        r`(?:\d{2,}|\d{1,3}(?:,\d{3})+|מאות|אלפי|רבבות|עשרות|(?<![א-ת])אלף|(?<![א-ת])מאה)\+?\s+(?:דוד|לקוח|תיקונ|בתים|בתי|משפחות|עבודות|התקנות|קריאות|פניות)`,
        r`(?:יותר\s+מ|מעל\s*|למעלה\s+מ)[־-]?\s*(?:\d[\d,]*|אלף|מאה|מאות|אלפי)\s*\+?\s*(?:דוד|לקוח|תיקונ|בתים|בתי|משפחות|עבודות|התקנות|קריאות|פניות|פרויקט|מקרים|ביקור)`,
        r`קהל\s+לקוחות|(?:טיפלנו|תיקנו|התקנו|החלפנו|שירתנו|ביקרנו|עזרנו)\s+(?:כבר\s+)?(?:ב|ל)?(?:המון|הרבה|אינספור|מאות|אלפי|עשרות|יותר\s+מ|מעל|\d)`,
        r`(?<![א-ת])(?:משפחות|בתים|בעלי\s+בתים|דודים|לקוחות)\s+רב(?:ים|ות)\s+(?:כבר\s+)?(?:בחר|סומ[כך]|נעזר|נהנ|מכיר|פונ|חזרו|תוקנו)`,
      ),
    },
    // CLAUDE.md §1 — no review, rating, rank or testimonial exists anywhere. "כוכב" not as an
    // asterisk ("בלי כוכביות" is the price page's promise).
    {
      id: "social-proof",
      re: any(
        r`ביקורות|ביקורת\s+(?:של|מ|מצוי[נן]|חיובי|טוב)|חוות\s+דעת|המלצות|המלצ(?:ה|ות)\s+(?:חמ|של\s+לקוח|מלקוח)|ממליצ`,
        r`דירוג|כוכב(?:ים)?(?![א-ת])|מרוצ(?:ים|ות|ה)|שביעות\s+רצון|בגוגל|\d[.,]\d\s*(?:\/\s*5|מתוך|כוכב|★)`,
        r`מספר\s*(?:1|אחת)(?!\d)|מס[׳'.]\s*1(?!\d)|מקום\s+(?:ה)?(?:ראשון|1)(?![א-ת\d])|הכי\s+(?:טוב|מומל[צץ]|זול|מבוק[שש])`,
        r`(?:ה)?מוביל(?:ים|ה|ות)?\s+ב(?:תחום|ענף|ישראל|ארץ|שוק|שירות)|החברה\s+המובילה|(?:ה)?מומל[צץ](?:ים|ת|ות)?\s+(?:ב(?:עיר|אזור|ארץ|ישראל|תחום|גוגל)|על\s+ידי)`,
        r`אחוז|סומכים\s+עלינו|(?:בחרו|בוחרים)\s+בנו|שם\s+טוב|בזכותנו|בעזרתנו|מדברים\s+עלינו|(?:שמעו|שומעים)\s+עלינו|מפה\s+לאוזן`,
        r`(?:תגובות|חוויות|משובים|משוב|פידבק)\s+(?:[א-ת]+\s+)?(?:חיובי|מצוינ|מעולה|נלהב|טוב)|פידבק|משוב|(?<![א-ת])[הולמשכב]?לקוח(?:ה|ות|ותינו|ותיו)?(?![א-ת])`,
      ),
    },
    // §1 areaServed + §3.6 — coverage and local presence are authored, not verified.
    {
      id: "coverage",
      re: any(
        r`[בלמ]כל\s+(?:רחבי\s+)?(?:הארץ|ישראל|המדינה|האזורים|הערים)|[בלמ]כל\s+רחבי|ארצי|(?<![א-ת])ב?פריסה\s+(?:ארצית|רחבה|מלאה|גדולה)|פריסת\s+(?:ה)?שירות`,
        r`צפון\s+(?:ועד|עד|ל)\s*ה?דרום|מדן\s+(?:ועד|עד)\s+אילת|(?:ו?עד|ל)\s+(?:ה)?(?:נגב|אילת|ערבה|מטולה|גליל|גולן|קריית\s+שמונה)(?![א-ת])`,
        r`(?<![א-ת])מה?(?:גליל|גולן|חרמון|מטולה|קריית\s+שמונה|אילת|נגב|ערבה)\s+(?:ו?עד|ל)`,
        r`באזור(?:ך|כם|\s+שלך|\s+שלכם)|בעיר(?:ך|כם|\s+שלך|\s+שלכם)|בסביב(?:תך|תכם|ה\s+שלך|ה\s+שלכם)|בשכונ(?:תך|תכם|ה\s+שלך|ה\s+שלכם)|קרוב(?:ים)?\s+(?:אלי|לבית)|לידך|לידכם`,
        r`(?:לכל|בכל)\s+(?:עיר|יישוב|ישוב|מקום|אזור|פינה|רחבי|גוש|ה?מרכז|ה?צפון|ה?דרום|ה?שרון|ה?שפלה|ה?קריות|הנגב|הגליל)(?![א-ת])|(?:מכל|בכל|לכל)\s+(?:ערי|כתובת)(?![א-ת])`,
        r`י?ישובים|פריפרי|סניפ|סניף|מכסים\s+את|את\s+כל\s+(?:ה)?(?:מרכז|צפון|דרום|שרון|שפלה|גוש\s+דן|הארץ|המדינה|ישראל)`,
        r`קצוות\s+(?:ה)?(?:ארץ|מדינה)|(?:מכל|בכל|לכל)\s+(?:ה)?(?:קצוות|פינות)`,
      ),
    },
    // §2 + §1 — no licence, insurance, certification, ח.פ., registered entity or standard.
    {
      id: "credentials",
      re: any(
        r`תעוד(?:ה|ות)\s+(?:מקצועי|הסמכה|מוכר)|בעלי\s+תעוד|הסמכ|הכשר(?:ה|ות)\s+(?:מקצועית|מוכרת|רשמית)|בעלי\s+הכשרה|עברו\s+הכשרה|מוכשר(?:ים|ת)?(?![א-ת])`,
        r`חברה\s+רשומה|רשו(?:מה|מים|ם)\s+(?:כחוק|ב(?:רשם|רשות|משרד))|עוסק\s+(?:מורשה|פטור|זעיר)|ח[״"']?פ\.?\s*\d|ח\.פ\.`,
        r`מאושר(?:ים|ת|ות)?\s+(?:על\s+ידי|ע[״"]י|מטעם|ב(?:משרד|מכון|רשות))|באישור\s+(?:משרד|מכון|רשות)|משרד\s+(?:העבודה|הכלכלה|האנרגיה)`,
        r`עומד(?:ים|ת)?\s+ב(?:כל\s+)?(?:ה)?(?:תק[נן]|דרישות)|לפי\s+כל\s+(?:ה)?תק[נן]|תקן\s+ישראלי|בתקן\s+(?:ה)?(?:ישראלי|מחייב|נגישות)|תקן\s+(?:ה)?נגישות`,
        r`(?:עבודה|עובדים|מתקינים|מתקנים)\s+(?:[א-ת]+\s+)?(?:לפי|בהתאם\s+ל)\s*(?:כל\s+)?(?:כללי|תקני|הוראות|דרישות)|כל\s+כללי\s+(?:ה)?בטיחות`,
        r`(?:עובדים|מתקינים|מתקנים|עבודה|התקנה|תיקון)\s+(?:[א-ת]+\s+)?לפי\s+(?:ה)?(?:תקן|תקנים|תקנות)`,
      ),
    },
    // §4.2 — no conformance claim without an audit ("לא בוצעה ביקורת ... מול ת״י 5568" stays).
    {
      id: "accessibility",
      re: any(
        r`נגיש(?:ות)?\s+(?:מלאה|לפי|בהתאם|ברמה|לכולם|לכל)|אתר\s+נגיש|נגישות\s+מלאה|מונגש|הונגש|הנגשה\s+(?:מלאה|לפי)`,
      ),
    },
    // §3.7 🔶 — the three city profiles (Rehovot's fixed-term tenants, green Kfar Saba,
    // Ra'anana's business park and residents from abroad) are reasoned, not sourced.
    {
      id: "city-profile",
      re: any(
        r`לתקופה\s+קצובה|בשכירות|דירה\s+שכורה|שוכר(?:ים|ות|י)\s+(?:דירות|דירה|לתקופה)`,
        r`עיר\s+ירוקה|(?:כפר\s+סבא|העיר)\s+הירוקה|עצים\s+בוגרים|פארק\s+עסקים|שהגיעו\s+מחו|עולים\s+(?:רבים|חדשים)|מחו[״"']ל|עיר\s+של\s+(?:עולים|מהגרים|חוקרים|סטודנטים|שוכרים|הייטק)`,
      ),
    },
    // Nothing confirms the parts or brands the business uses.
    {
      id: "parts-or-brands",
      re: any(
        r`(?:חלקי(?:ם)?|חלפים|חלקי\s+חילוף|רכיבים|ציוד|תרמוסטט|אלמנט|גוף\s+חימום)\s+(?:[א-ת]+\s+)?(?:מקורי|איכותי)|מקוריים\s+בלבד|רק\s+(?:חלקים\s+)?מקוריים`,
        r`(?:חלקים|חלפים|חלקי\s+חילוף|רכיבים)\s+(?:של\s+|מ)(?:ה)?יצרן|(?:של|מ)\s*היצרן\s+בלבד|כרומגן|אמקור|אריסטון|נציג(?:ים)?\s+(?:מורשה|רשמי)|יבוא[נן]|מותג(?:ים)?\s+(?:מוביל|מוכר|איכותי)|יצרנים\s+מובילים`,
      ),
    },
    // §3.2 / kit README rule 2 — no emergency or urgent-call framing. "מוקד" only as a word
    // ("הפעלה ממוקדת" is a register line); "לא דחוף" is reassurance, not urgency.
    {
      id: "emergency",
      re: any(
        r`(?<!לא\s)דחו(?:ף|פה|פים|פות)|בדחיפות|חי?רום|בהול|ניידת|ניידות|כונ[נן]|כוננות|תורן|תורנ(?:ים|ות)|SOS|דיחוי`,
        r`(?<![א-ת])[הלבו]?מוקד(?![א-ת])|קו\s+חם|בדרך\s+אלי(?:כם|ך)|(?:תקלה|מצב|מקרה|בעיה)\s+(?:[א-ת]+\s+)?קריטי`,
      ),
    },
  ],
  allowClaims: [],

  /**
   * The page a quoted sentence renders on, so a tip must link to the page that carries it (the
   * gate checks it). No content file here maps 1:1 to a page, so the lookup reads the sentence:
   * app/<route>/page.tsx → /<route>/; a guide in lib/guides.ts → /מדריכים/<slug>/; a service or
   * city entry in lib/content.ts → /services/<slug>/ or /locations/<slug>/. Anything that feeds
   * many pages (the homepage FAQ, the components) answers null. Only scripts/live/ calls this —
   * never the Next build, which only bundles this file through Live.tsx: the files are read from
   * this file's own directory (the repo root), never from a path the bundler would trace.
   *
   * The gate asks once per quote, with source = `<file> — ״<that one quote>״`. A quote may
   * itself carry gershayim (מע״מ, ת״א), so it is everything between the first ״ and the last
   * one; around an ellipsis the longest piece is looked up, the one least likely to occur
   * earlier in the file.
   */
  pageOfSource: (file, source) => {
    const app = /^app\/((?:[^/[\]]+\/)*)page\.tsx$/.exec(file);
    if (app) return `/${app[1]}`;
    if (file !== "lib/guides.ts" && file !== "lib/content.ts") return null;
    const one = /״(.+)״\s*$/.exec(String(source ?? ""));
    const pieces = one
      ? one[1]
          .split("…")
          .map((p) => p.trim())
          .filter(Boolean)
      : [];
    const quote = pieces.sort((a, b) => b.length - a.length)[0] ?? "";
    if (!quote) return null;
    const root = dirname(fileURLToPath(import.meta.url));
    const text = readFileSync(join(root, file), "utf8");
    const at = text.indexOf(quote);
    if (at < 0) return null; // the gate reports a missing sentence on its own
    const before = text.slice(0, at);
    if (file === "lib/guides.ts") {
      const slugs = [...before.matchAll(/^ {4}slug: "([a-z0-9-]+)",$/gm)];
      const slug = slugs.length ? slugs[slugs.length - 1][1] : null;
      return slug ? `/מדריכים/${slug}/` : null;
    }
    // lib/content.ts: only the per-service and per-city records render on one page each.
    const blocks = [...before.matchAll(/^export const (\w+)/gm)];
    const block = blocks.length ? blocks[blocks.length - 1][1] : "";
    const keys = [...before.matchAll(/^ {2}"?([a-z-]+)"?: \{$/gm)];
    const key = keys.length ? keys[keys.length - 1][1] : null;
    if (!key) return null;
    if (block === "serviceDepth") return `/services/${key}/`;
    if (block === "cityContent") return `/locations/${key}/`;
    return null;
  },
};
