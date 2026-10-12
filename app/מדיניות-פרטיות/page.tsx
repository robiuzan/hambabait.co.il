import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { FinalCta } from "@/components/marketing/FinalCta";

export const metadata: Metadata = {
  alternates: { canonical: "/מדיניות-פרטיות/" },
  title: "מדיניות פרטיות",
  description: "מדיניות הפרטיות של אתר חם בבית — איזה מידע נאסף, לאן הוא מגיע ולמה.",
};

/**
 * This page is a factual description of the site's ACTUAL data flow — the Web3Forms lead
 * delivery, the GTM/Google analytics loader and the WhatsApp hand-off are all real and all
 * named below. The previous version claimed details are not passed to third parties while
 * every lead transited api.web3forms.com; per CLAUDE.md golden rule 8, the wording must
 * track the code. If a processor is added or removed, update this page in the same change.
 */
// 11/10/2026: the fleet live-kit (CLAUDE.md §13) — the status-switch read from imgquarry.com and
// the browser-storage values public/assets/live.js keeps (ls-dlg-<line>, ls-pv, ls-status).
const updated = "11/10/2026"; // dd/mm/yyyy — bump when the data flow changes.

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        title="מדיניות פרטיות"
        crumbs={[{ label: "בית", href: "/" }, { label: "מדיניות פרטיות" }]}
        currentPath="/מדיניות-פרטיות/"
      />
      <Section tone="white">
        <div className="mx-auto max-w-3xl space-y-4 text-gray-700">
          <p>
            אנו ב{siteConfig.name} מכבדים את פרטיותכם. עמוד זה מסביר בשקיפות איזה מידע
            נאסף באתר, לאן הוא מגיע ולאיזו מטרה.
          </p>
          <p className="text-sm text-gray-500">עדכון אחרון: {updated}</p>

          <h2 className="font-heading text-lg font-bold text-primary">
            איזה מידע אנו אוספים
          </h2>
          <p>
            <strong>פרטים שאתם מוסרים ביוזמתכם:</strong> שם, מספר טלפון, השירות המבוקש
            ותיאור הבעיה — כאשר אתם שולחים את טופס יצירת הקשר, מתקשרים אלינו או פונים
            בוואטסאפ.
          </p>
          <p>
            <strong>נתוני שימוש:</strong> האתר אוסף נתוני שימוש סטטיסטיים (עמודים שנצפו,
            לחיצות על כפתורי התקשרות, הצגה וסגירה של הודעות עונתיות) לצורך שיפור האתר
            והשירות. נתונים אלה אינם כוללים את הפרטים שמסרתם בטופס.
          </p>

          <h2 className="font-heading text-lg font-bold text-primary">
            לאן המידע מגיע — צדדים שלישיים
          </h2>
          <ul className="list-disc space-y-2 ps-5">
            <li>
              <strong>Web3Forms</strong> — פניות מטופס יצירת הקשר נשלחות באמצעות שירות
              Web3Forms, שמעביר אלינו את תוכן הפנייה בדוא״ל.
            </li>
            <li>
              <strong>Google (Tag Manager / Analytics)</strong> — האתר משתמש בכלי מדידה של
              Google לצורכי סטטיסטיקה. כלים אלה עשויים לעשות שימוש בעוגיות (Cookies).
            </li>
            <li>
              <strong>WhatsApp (חברת Meta)</strong> — אם בחרתם לפנות אלינו בוואטסאפ, או אם
              שליחת הטופס נכשלה ובחרתם לשלוח את הפרטים בוואטסאפ במקום, תוכן הפנייה עובר
              דרך שירות WhatsApp.
            </li>
            {/* public/assets/live.js reads https://imgquarry.com/status/fleet.json once per page
                load, credentials omitted — the fleet status switch (CLAUDE.md §13). */}
            <li>
              <strong>
                שרת ההגדרות של האתר (<span dir="ltr">imgquarry.com</span>)
              </strong>{" "}
              — בכל טעינת עמוד הדפדפן קורא משם קובץ הגדרות קטן, שקובע אם ואילו הודעות
              יוצגו בפס ההודעות שבראש האתר. הבקשה אינה כוללת עוגיות או פרטים שמסרתם; כמו
              כל בקשה באינטרנט, השרת מקבל את כתובת הרשת של המכשיר ואת סוג הדפדפן.
            </li>
          </ul>
          <p>
            איננו מוכרים את פרטיכם, ואיננו מעבירים אותם לגורמים נוספים מעבר למפורט לעיל.
          </p>

          <h2 className="font-heading text-lg font-bold text-primary">
            שימוש במידע ושמירתו
          </h2>
          <p>
            הפרטים שמסרתם משמשים למענה לפנייה, לתיאום הגעת טכנאי ולמתן הצעת מחיר. פרטי
            פנייה נשמרים כל עוד הם דרושים לטיפול בפנייה ולמעקב סביר אחריה.
          </p>

          <h2 className="font-heading text-lg font-bold text-primary">
            עוגיות (Cookies)
          </h2>
          {/* Kept accurate on purpose: the site now ships Consent Mode v2 with everything
              denied by default, so the policy has to say that rather than imply tracking
              starts on arrival. If the consent behaviour changes, this paragraph changes
              in the same commit. */}
          <p>
            האתר עושה שימוש בעוגיות לצורכי מדידה וסטטיסטיקה באמצעות כלי Google.{" "}
            <strong>כברירת מחדל המדידה מושבתת</strong> עד שתאשרו אותה: בכניסה הראשונה תוצג
            הודעה שבה אפשר לבחור לאשר מדידה או להמשיך בלעדיה. הבחירה נשמרת בדפדפן שלכם
            בלבד.
          </p>
          <p>
            כדי לשנות את הבחירה, נקו את נתוני האתר בהגדרות הדפדפן וההודעה תוצג שוב. בכל
            מקרה ניתן גם לחסום או למחוק עוגיות בהגדרות הדפדפן — האתר ימשיך לעבוד כרגיל.
          </p>
          {/* Kept accurate on purpose, like the paragraph above: these are the values
              public/assets/live.js stores (ls-dlg-<line> and ls-status in localStorage, ls-pv in
              sessionStorage). If live.js stores anything else, this paragraph changes with it. */}
          <p>
            בנוסף, האתר שומר באחסון המקומי של הדפדפן כמה ערכים טכניים, שאינם עוגיות ואינם
            נשלחים לשום מקום: מתי הוצגה לכם הודעה עונתית, כדי שלא תוצג שוב בשבועיים
            הקרובים; כמה עמודים צפיתם בביקור הנוכחי, שנמחק כשסוגרים את הלשונית; ולפעמים גם
            את מצב ההודעות שנקבע לאתר, שתוקפו עד חצי שעה. ניקוי נתוני האתר בהגדרות הדפדפן
            מוחק גם אותם.
          </p>

          <h2 className="font-heading text-lg font-bold text-primary">הזכויות שלכם</h2>
          <p>
            תוכלו לפנות אלינו בכל עת כדי לעיין בפרטים שמסרתם, לתקן אותם או לבקש את מחיקתם.
          </p>

          <h2 className="font-heading text-lg font-bold text-primary">יצירת קשר</h2>
          <p>
            בכל שאלה בנושא פרטיות ניתן לפנות אלינו בטלפון{" "}
            <span dir="ltr">{siteConfig.phone}</span> או בדוא״ל{" "}
            <span dir="ltr">{siteConfig.email}</span>.
          </p>
        </div>
      </Section>
      <FinalCta />
    </>
  );
}
