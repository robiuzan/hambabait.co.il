/**
 * GuideDiagram — inline SVG illustrations for the knowledge hub.
 *
 * Why SVG and not photography: these illustrate TECHNICAL reality, which needs no business
 * fact. A photo of a technician or a completed job would be a staffing claim rendered as an
 * image, and docs/business-facts.md §3.5 records that there is no evidence any technician
 * exists. See docs/media-assets.md §4.
 *
 * Why inline: zero network requests, so nothing here costs LCP. The site's largest
 * contentful paint is text and stays that way.
 *
 * Rules held to:
 *   - role="img" with a Hebrew <title>, referenced by aria-labelledby
 *   - real <text> elements, never text baked into a path
 *   - RTL-correct reading order — labels sit right of the shapes they name
 *   - @theme tokens via currentColor and CSS custom properties, never hardcoded brand hex
 *   - colour is never the sole carrier of meaning; every element is also labelled
 */

import type { GuideDiagramName } from "@/lib/guides";

const TITLES: Record<GuideDiagramName, string> = {
  "solar-system": "תרשים מערכת דוד שמש: קולט על הגג, מיכל מבודד וגוף חימום חשמלי לגיבוי",
  "leak-origin": "תרשים מקורות נזילה בדוד: חיבורים, ברז ביטחון וגוף המיכל",
  "anode-wear": "תרשים שחיקת אנודה: מוט שנאכל במקום דופן המיכל",
  "thermostat-vs-element": "תרשים החלטה: איך מבדילים בין תרמוסטט תקול לגוף חימום שרוף",
};

export function GuideDiagram({ name }: { name: GuideDiagramName }) {
  const titleId = `diagram-title-${name}`;
  return (
    <figure className="mt-8">
      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-gray-50 p-5">
        <svg
          role="img"
          aria-labelledby={titleId}
          viewBox="0 0 520 260"
          className="mx-auto h-auto w-full max-w-xl text-primary"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title id={titleId}>{TITLES[name]}</title>
          {name === "solar-system" && <SolarSystem />}
          {name === "leak-origin" && <LeakOrigin />}
          {name === "anode-wear" && <AnodeWear />}
          {name === "thermostat-vs-element" && <ThermostatVsElement />}
        </svg>
      </div>
      <figcaption className="mt-3 text-center text-sm text-gray-500">
        {TITLES[name]}
      </figcaption>
    </figure>
  );
}

/* Shared primitives. `currentColor` inherits the token colour set on the <svg>. */
const stroke = { stroke: "currentColor", fill: "none", strokeWidth: 2 } as const;
const label = {
  fill: "currentColor",
  fontSize: 13,
  fontWeight: 600,
  textAnchor: "middle",
} as const;
const sub = { fill: "#4b5563", fontSize: 11, textAnchor: "middle" } as const;

function SolarSystem() {
  return (
    <>
      {/* roof line */}
      <path d="M40 200 L260 130 L480 200" {...stroke} strokeWidth={2} />
      <text x={260} y={225} {...sub}>
        גג
      </text>

      {/* collector */}
      <rect x={90} y={120} width={110} height={44} rx={6} {...stroke} />
      <path
        d="M104 126 L104 158 M120 126 L120 158 M136 126 L136 158 M152 126 L152 158 M168 126 L168 158 M184 126 L184 158"
        {...stroke}
        strokeWidth={1.2}
      />
      <text x={145} y={108} {...label}>
        קולט
      </text>
      <text x={145} y={182} {...sub}>
        סופג קרינה
      </text>

      {/* tank */}
      <rect x={300} y={92} width={140} height={62} rx={14} {...stroke} />
      <text x={370} y={80} {...label}>
        מיכל מבודד
      </text>
      <text x={370} y={128} {...sub}>
        אוגר מים חמים
      </text>

      {/* electric element inside tank */}
      <path d="M410 138 l-8 0 l0 8 l-8 0 l0 -8 l-8 0" {...stroke} strokeWidth={2} />
      <text x={370} y={172} {...sub}>
        גוף חימום חשמלי — גיבוי
      </text>

      {/* natural circulation arrows: collector -> tank (hot up), tank -> collector (cold down) */}
      <path d="M200 130 L300 108" {...stroke} strokeWidth={2} />
      <polygon points="300,108 290,106 292,114" fill="currentColor" />
      <text x={250} y={100} {...sub}>
        חם עולה
      </text>

      <path d="M300 146 L200 158" {...stroke} strokeWidth={2} />
      <polygon points="200,158 210,160 208,152" fill="currentColor" />
      <text x={250} y={176} {...sub}>
        קר יורד
      </text>

      {/* sun */}
      <circle cx={70} cy={44} r={16} {...stroke} />
      <path
        d="M70 16 L70 6 M70 82 L70 72 M42 44 L32 44 M98 44 L108 44 M50 24 L44 18 M90 64 L96 70 M90 24 L96 18 M50 64 L44 70"
        {...stroke}
        strokeWidth={1.5}
      />
      <text x={70} y={104} {...sub}>
        שמש
      </text>
    </>
  );
}

function LeakOrigin() {
  return (
    <>
      {/* tank body */}
      <rect x={190} y={60} width={140} height={140} rx={18} {...stroke} />
      <text x={260} y={44} {...label}>
        גוף המיכל
      </text>

      {/* 1. connections at top */}
      <circle cx={215} cy={60} r={7} {...stroke} />
      <circle cx={305} cy={60} r={7} {...stroke} />
      <text x={110} y={64} {...label}>
        חיבורים
      </text>
      <text x={110} y={82} {...sub}>
        אטם או רקורד
      </text>
      <text x={110} y={100} {...sub}>
        ← תיקון פשוט
      </text>
      <path d="M160 60 L206 60" {...stroke} strokeWidth={1.5} strokeDasharray="4 3" />

      {/* 2. safety valve */}
      <path d="M330 110 l26 0 l0 18 l-26 0 z" {...stroke} />
      <text x={430} y={106} {...label}>
        ברז ביטחון
      </text>
      <text x={430} y={124} {...sub}>
        טפטוף בחימום — תקין
      </text>
      <text x={430} y={142} {...sub}>
        טפטוף קבוע — לבדוק
      </text>
      <path d="M356 119 L378 119" {...stroke} strokeWidth={1.5} strokeDasharray="4 3" />

      {/* 3. corrosion on the shell */}
      <path d="M198 168 q10 -8 20 0 q10 8 20 0" {...stroke} strokeWidth={2.5} />
      <text x={110} y={182} {...label}>
        קורוזיה
      </text>
      <text x={110} y={200} {...sub}>
        מהמיכל עצמו
      </text>
      <text x={110} y={218} {...sub}>
        ← החלפה
      </text>
      <path d="M160 176 L194 172" {...stroke} strokeWidth={1.5} strokeDasharray="4 3" />

      {/* drip */}
      <path d="M260 200 L260 216" {...stroke} strokeWidth={1.5} />
      <circle cx={260} cy={224} r={5} {...stroke} />
    </>
  );
}

function AnodeWear() {
  return (
    <>
      {/* healthy tank */}
      <rect x={60} y={70} width={130} height={130} rx={16} {...stroke} />
      <rect
        x={116}
        y={86}
        width={18}
        height={92}
        rx={7}
        fill="currentColor"
        opacity={0.85}
      />
      <text x={125} y={56} {...label}>
        אנודה תקינה
      </text>
      <text x={125} y={222} {...sub}>
        המיכל מוגן
      </text>

      {/* arrow of time */}
      <path d="M215 135 L305 135" {...stroke} strokeWidth={2} />
      <polygon points="305,135 293,130 293,140" fill="currentColor" />
      <text x={260} y={122} {...sub}>
        לאורך זמן
      </text>

      {/* worn tank */}
      <rect x={330} y={70} width={130} height={130} rx={16} {...stroke} />
      <path
        d="M386 86 l6 14 l-8 12 l8 12 l-6 14"
        {...stroke}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <path d="M338 176 q10 -8 20 0 q10 8 20 0" {...stroke} strokeWidth={2.5} />
      <text x={395} y={56} {...label}>
        אנודה שנאכלה
      </text>
      <text x={395} y={222} {...sub}>
        הקורוזיה עוברת לדופן
      </text>
    </>
  );
}

function ThermostatVsElement() {
  return (
    <>
      <rect x={170} y={20} width={180} height={44} rx={10} {...stroke} />
      <text x={260} y={40} {...label}>
        אין מים חמים
      </text>
      <text x={260} y={56} {...sub}>
        אך יש חשמל לדוד
      </text>

      <path d="M260 64 L260 92" {...stroke} strokeWidth={2} />
      <path d="M150 92 L370 92" {...stroke} strokeWidth={2} />
      <path d="M150 92 L150 116 M370 92 L370 116" {...stroke} strokeWidth={2} />

      {/* left branch */}
      <rect x={60} y={116} width={180} height={50} rx={10} {...stroke} />
      <text x={150} y={138} {...label}>
        מעגל פתוח
      </text>
      <text x={150} y={156} {...sub}>
        הזרם אינו עובר כלל
      </text>
      <path d="M150 166 L150 190" {...stroke} strokeWidth={2} />
      <polygon points="150,190 145,180 155,180" fill="currentColor" />
      <text x={150} y={212} {...label}>
        גוף חימום שרוף
      </text>

      {/* right branch */}
      <rect x={280} y={116} width={180} height={50} rx={10} {...stroke} />
      <text x={370} y={138} {...label}>
        המעגל אינו נסגר
      </text>
      <text x={370} y={156} {...sub}>
        המתג אינו מגיב
      </text>
      <path d="M370 166 L370 190" {...stroke} strokeWidth={2} />
      <polygon points="370,190 365,180 375,180" fill="currentColor" />
      <text x={370} y={212} {...label}>
        תרמוסטט תקול
      </text>

      <text x={260} y={244} {...sub}>
        ההבחנה נעשית במדידה חשמלית, לא בניחוש
      </text>
    </>
  );
}
