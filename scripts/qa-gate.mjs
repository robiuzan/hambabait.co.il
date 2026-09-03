#!/usr/bin/env node
/**
 * qa-gate.mjs — output assertions over out/, run AFTER `npm run build`.
 *
 * The four npm scripts (lint, typecheck, format:check, build) prove the source compiles. They
 * prove nothing about what actually landed in out/. Every defect this file guards against
 * shipped green at least once: the doubled brand suffix on 24 of 33 pages, canonicals that
 * drifted out of byte-parity with the percent-escaped sitemap, pages with no JSON-LD at all,
 * and a build-time <lastmod> on 33 of the 45 sitemap URLs. Run it as the fifth gate:
 * `npm run qa:gate`.
 *
 * Reads only. Exits 0 when every assertion holds, 1 with a printed measured-vs-expected list
 * otherwise.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

// ---------------------------------------------------------------------------
// Thresholds. Update these — and only these — when the route count legitimately
// changes. Everything below is derived.
// ---------------------------------------------------------------------------

/** Directory the static export writes to (next.config.mjs -> output: "export"). */
const OUT_DIR = "out";

/** index.html files in out/. 45 indexable + /404/ + /תודה/. */
const EXPECTED_BUILT_PAGES = 47;

/** Pages that may be indexed: 8 static + 6 services + 18 locations + 13 guide routes. */
const EXPECTED_INDEXABLE = 45;

/** <loc> entries in sitemap.xml. Must equal EXPECTED_INDEXABLE — the sitemap is derived from
 *  the same data arrays, so a mismatch means a route was added without reaching app/sitemap.ts. */
const EXPECTED_SITEMAP_LOCS = 45;

/**
 * <lastmod> entries in sitemap.xml — one per guide, and nothing else. The other 33 URLs carry
 * no date because they have none: app/sitemap.ts used to stamp `new Date()` on them, which told
 * Google all 33 changed on every deploy and got the signal discounted site-wide, guides included.
 * Raise this only when a non-guide route gains a REAL editorial date, never to make a build
 * timestamp pass.
 */
const EXPECTED_SITEMAP_LASTMODS = 12;

/** A content date is date-only, so it serialises to midnight UTC. A build timestamp carries a
 *  wall-clock time. This is how the gate tells them apart even if the count happens to fit. */
const DATE_ONLY_LASTMOD = /T00:00:00\.000Z$/;

/** robots.txt must point at the sitemap. Nothing else in this gate reads robots.txt, so a
 *  wrong or missing Sitemap: line would otherwise ship green. */
const EXPECTED_ROBOTS_SITEMAP = "Sitemap: https://hambabait.co.il/sitemap.xml";

/**
 * Routes that legitimately carry NO canonical and NO JSON-LD. The 404 is noindex and has no
 * self URL to point at; /תודה/ is a noindex conversion destination deliberately kept out of
 * the sitemap. They are excluded from the canonical and JSON-LD counts, not counted as
 * failures — but they are still held to the one-H1 and unique-title bars.
 */
const NOINDEX_ROUTES = new Set(["/404/", "/תודה/"]);

/**
 * The brand suffix appended by the root `title.template` in app/layout.tsx. A page title that
 * contains it twice is the doubled-brand regression ("… | חם בבית | חם בבית"), which happens
 * when a route's own `title` re-appends the brand the template already adds.
 */
const BRAND_SUFFIX = " | חם בבית";

/** Schema properties this site must never emit. No reviews exist, no rating exists,
 *  foundedYear is null in the manifest, and the warranty terms are unconfirmed. */
const BANNED_SCHEMA_PROPS = [
  "aggregateRating",
  "reviewCount",
  "ratingValue",
  "foundingDate",
  "warrantyPromise",
];

/** This site has no search. A SearchAction would advertise a feature that does not exist. */
const BANNED_SCHEMA_ACTIONS = ["SearchAction", "potentialAction"];

/** The two script ids in app/layout.tsx. The Consent Mode default must run before the
 *  container loads, or the container starts unconsented and the default arrives too late. */
const CONSENT_MARKER = 'id="consent-default"';
const GTM_MARKER = 'id="gtm-init"';

// ---------------------------------------------------------------------------
// Failure collection
// ---------------------------------------------------------------------------

const failures = [];
const passed = [];

/** @param {string} name @param {boolean} ok @param {string} [detail] */
function assert(name, ok, detail = "") {
  if (ok) passed.push(name);
  else failures.push(detail ? `${name}\n      ${detail}` : name);
}

/** Formats a measured-vs-expected line. */
function counted(measured, expected) {
  return `measured ${measured}, expected ${expected}`;
}

/** Caps a list so one broken build does not print a thousand lines. */
function sample(items, limit = 8) {
  const shown = items.slice(0, limit).join("\n      ");
  return items.length > limit
    ? `${shown}\n      …and ${items.length - limit} more`
    : shown;
}

// ---------------------------------------------------------------------------
// Load out/
// ---------------------------------------------------------------------------

if (!fs.existsSync(OUT_DIR)) {
  console.error(`qa-gate: ${OUT_DIR}/ does not exist. Run \`npm run build\` first.`);
  process.exit(1);
}

/** @param {string} dir @param {string[]} acc */
function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith(".html")) acc.push(full);
  }
  return acc;
}

const allHtmlFiles = walk(OUT_DIR).sort();

/**
 * The page set is the index.html files only. out/404.html is a byte-identical twin of
 * out/404/index.html (Next writes both so the host can serve either); counting it would make
 * the 404 look like a duplicate title. Scans that look for banned STRINGS still sweep every
 * .html file, twin included.
 */
const pages = allHtmlFiles
  .filter((f) => path.basename(f) === "index.html")
  .map((file) => {
    const html = fs.readFileSync(file, "utf8");
    const rel = path.relative(OUT_DIR, file).split(path.sep).slice(0, -1).join("/");
    return {
      file,
      route: rel ? `/${rel}/` : "/",
      html,
      title: html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? null,
      description: html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? null,
      canonical: html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? null,
      h1Count: (html.match(/<h1[\s>]/g) || []).length,
      jsonLdBlocks: [
        ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g),
      ].map((m) => m[1]),
    };
  });

const indexable = pages.filter((p) => !NOINDEX_ROUTES.has(p.route));

// ---------------------------------------------------------------------------
// 1. Route counts
// ---------------------------------------------------------------------------

assert(
  "built page count",
  pages.length === EXPECTED_BUILT_PAGES,
  counted(pages.length, EXPECTED_BUILT_PAGES),
);

assert(
  "indexable page count",
  indexable.length === EXPECTED_INDEXABLE,
  `${counted(indexable.length, EXPECTED_INDEXABLE)} (excluded: ${[...NOINDEX_ROUTES].join(", ")})`,
);

// Guards the exclusion list itself: if /תודה/ is renamed, the count above still passes by
// accident while the route silently rejoins the indexable set.
const missingNoindex = [...NOINDEX_ROUTES].filter(
  (r) => !pages.some((p) => p.route === r),
);
assert(
  "noindex routes present",
  missingNoindex.length === 0,
  `NOINDEX_ROUTES entries not found in out/: ${missingNoindex.join(", ")}`,
);

// ---------------------------------------------------------------------------
// 2. JSON-LD and canonical coverage
// ---------------------------------------------------------------------------

const withJsonLd = indexable.filter((p) => p.jsonLdBlocks.length > 0);
assert(
  "JSON-LD coverage",
  withJsonLd.length === EXPECTED_INDEXABLE,
  `${counted(withJsonLd.length, EXPECTED_INDEXABLE)}\n      bare: ${sample(
    indexable.filter((p) => p.jsonLdBlocks.length === 0).map((p) => p.route),
  )}`,
);

const withCanonical = indexable.filter((p) => p.canonical);
assert(
  "canonical coverage",
  withCanonical.length === EXPECTED_INDEXABLE,
  `${counted(withCanonical.length, EXPECTED_INDEXABLE)}\n      missing: ${sample(
    indexable.filter((p) => !p.canonical).map((p) => p.route),
  )}`,
);

// ---------------------------------------------------------------------------
// 3. Titles and descriptions
// ---------------------------------------------------------------------------

const doubledBrand = pages.filter(
  (p) => p.title && p.title.split(BRAND_SUFFIX).length - 1 > 1,
);
assert(
  "no doubled brand suffix in <title>",
  doubledBrand.length === 0,
  `${doubledBrand.length} page(s) append "${BRAND_SUFFIX.trim()}" twice:\n      ${sample(
    doubledBrand.map((p) => `${p.route} -> ${p.title}`),
  )}`,
);

const missingTitle = pages.filter((p) => !p.title);
assert(
  "every page has a <title>",
  missingTitle.length === 0,
  `missing: ${sample(missingTitle.map((p) => p.route))}`,
);

/** @param {(p: typeof pages[number]) => string | null} pick */
function duplicatesBy(pick) {
  const seen = new Map();
  for (const p of pages) {
    const key = pick(p);
    if (!key) continue;
    if (!seen.has(key)) seen.set(key, []);
    seen.get(key).push(p.route);
  }
  return [...seen].filter(([, routes]) => routes.length > 1);
}

const dupTitles = duplicatesBy((p) => p.title);
assert(
  "unique <title> across pages",
  dupTitles.length === 0,
  sample(dupTitles.map(([t, routes]) => `"${t}" on ${routes.join(", ")}`)),
);

const dupDescriptions = duplicatesBy((p) => p.description);
assert(
  "unique meta description across pages",
  dupDescriptions.length === 0,
  sample(
    dupDescriptions.map(([d, routes]) => `"${d.slice(0, 60)}…" on ${routes.join(", ")}`),
  ),
);

// ---------------------------------------------------------------------------
// 4. One H1 per page
// ---------------------------------------------------------------------------

const badH1 = pages.filter((p) => p.h1Count !== 1);
assert(
  "exactly one <h1> per page",
  badH1.length === 0,
  sample(badH1.map((p) => `${p.route} has ${p.h1Count}`)),
);

// ---------------------------------------------------------------------------
// 5. Canonical <-> sitemap parity, byte-identical
// ---------------------------------------------------------------------------
// Nine routes under app/ are Hebrew directories; eight of them reach the sitemap (/תודה/ is
// deliberately out). app/sitemap.ts runs every loc through encodeURI and Next percent-escapes
// canonicals automatically, so the two strings must match byte for byte. A raw-UTF-8 Hebrew URL
// on either side is the failure this catches.

const sitemapPath = path.join(OUT_DIR, "sitemap.xml");
if (!fs.existsSync(sitemapPath)) {
  assert("sitemap.xml exists", false, `${sitemapPath} not found`);
} else {
  const sitemapXml = fs.readFileSync(sitemapPath, "utf8");
  const locs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  assert(
    "sitemap <loc> count",
    locs.length === EXPECTED_SITEMAP_LOCS,
    counted(locs.length, EXPECTED_SITEMAP_LOCS),
  );

  const canonicalSet = new Set(withCanonical.map((p) => p.canonical));
  const locSet = new Set(locs);

  const canonicalNotInSitemap = [...canonicalSet].filter((u) => !locSet.has(u));
  const locNotCanonical = [...locSet].filter((u) => !canonicalSet.has(u));
  assert(
    "canonical <-> sitemap parity (byte-identical)",
    canonicalNotInSitemap.length === 0 && locNotCanonical.length === 0,
    [
      canonicalNotInSitemap.length
        ? `canonical with no <loc>:\n      ${sample(canonicalNotInSitemap)}`
        : "",
      locNotCanonical.length
        ? `<loc> with no canonical:\n      ${sample(locNotCanonical)}`
        : "",
    ]
      .filter(Boolean)
      .join("\n      "),
  );

  assert(
    "no duplicate <loc> in sitemap",
    locSet.size === locs.length,
    counted(locSet.size, locs.length),
  );

  // Only the 12 guides carry a date. Anything else means a build timestamp came back.
  const lastmods = [...sitemapXml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(
    (m) => m[1],
  );

  assert(
    "sitemap <lastmod> count (guides only)",
    lastmods.length === EXPECTED_SITEMAP_LASTMODS,
    `${counted(lastmods.length, EXPECTED_SITEMAP_LASTMODS)} — a build timestamp is not a content date`,
  );

  const timestamped = lastmods.filter((d) => !DATE_ONLY_LASTMOD.test(d));
  assert(
    "every <lastmod> is a content date, not a build time",
    timestamped.length === 0,
    timestamped.length
      ? `${timestamped.length} carry a wall-clock time:\n      ${sample(timestamped)}`
      : `${lastmods.length} date-only`,
  );
}

// ---------------------------------------------------------------------------
// 5b. robots.txt points at the sitemap
// ---------------------------------------------------------------------------
// app/robots.ts builds the line from siteConfig.domain. If that field ever grows a trailing
// slash or the host changes, the sitemap reference breaks silently — nothing else here reads
// robots.txt, and the sitemap itself would still be perfectly valid.

const robotsPath = path.join(OUT_DIR, "robots.txt");
if (!fs.existsSync(robotsPath)) {
  assert("robots.txt exists", false, `${robotsPath} not found`);
} else {
  const robotsTxt = fs.readFileSync(robotsPath, "utf8");
  const hasSitemap = robotsTxt
    .split(/\r?\n/)
    .some((l) => l.trim() === EXPECTED_ROBOTS_SITEMAP);
  assert(
    "robots.txt names the sitemap",
    hasSitemap,
    hasSitemap
      ? EXPECTED_ROBOTS_SITEMAP
      : `expected "${EXPECTED_ROBOTS_SITEMAP}", found:\n      ${sample(
          robotsTxt.split(/\r?\n/).filter((l) => l.toLowerCase().startsWith("sitemap")),
        )}`,
  );
}

// ---------------------------------------------------------------------------
// 6. Banned schema
// ---------------------------------------------------------------------------
// String-scanned over every .html, not just the ld+json blocks: Next also serialises the
// JSON-LD into the React Flight payload, and a banned property must not survive there either.

for (const prop of BANNED_SCHEMA_PROPS) {
  const hits = allHtmlFiles.filter((f) => fs.readFileSync(f, "utf8").includes(prop));
  assert(
    `no "${prop}" anywhere`,
    hits.length === 0,
    `found in ${hits.length} file(s):\n      ${sample(hits.map((f) => path.relative(OUT_DIR, f)))}`,
  );
}

for (const token of BANNED_SCHEMA_ACTIONS) {
  const hits = allHtmlFiles.filter((f) => fs.readFileSync(f, "utf8").includes(token));
  assert(
    `no "${token}" anywhere (this site has no search)`,
    hits.length === 0,
    `found in ${hits.length} file(s):\n      ${sample(hits.map((f) => path.relative(OUT_DIR, f)))}`,
  );
}

// ---------------------------------------------------------------------------
// 7. JSON-LD graph: parseable, no priced Offer, WebSite on the homepage
// ---------------------------------------------------------------------------

/** Recursively yields every object node in a parsed JSON-LD value. */
function* nodes(value) {
  if (Array.isArray(value)) {
    for (const item of value) yield* nodes(item);
  } else if (value && typeof value === "object") {
    yield value;
    for (const item of Object.values(value)) yield* nodes(item);
  }
}

/** @param {unknown} node @param {string} type */
function isType(node, type) {
  const t = node?.["@type"];
  return t === type || (Array.isArray(t) && t.includes(type));
}

const unparseable = [];
const pricedOffers = [];

for (const page of pages) {
  for (const block of page.jsonLdBlocks) {
    let parsed;
    try {
      parsed = JSON.parse(block);
    } catch {
      unparseable.push(page.route);
      continue;
    }
    for (const node of nodes(parsed)) {
      // The business publishes no price table, so any figure attached to an Offer is invented.
      const priced =
        isType(node, "Offer") &&
        ("price" in node || "priceSpecification" in node || "lowPrice" in node);
      if (priced)
        pricedOffers.push(`${page.route} -> ${JSON.stringify(node).slice(0, 120)}`);
    }
  }
}

assert(
  "all JSON-LD blocks parse",
  unparseable.length === 0,
  `unparseable on: ${sample([...new Set(unparseable)])}`,
);

assert("no priced Offer node", pricedOffers.length === 0, sample(pricedOffers));

const homepage = pages.find((p) => p.route === "/");
let hasWebSite = false;
if (homepage) {
  for (const block of homepage.jsonLdBlocks) {
    try {
      for (const node of nodes(JSON.parse(block))) {
        if (isType(node, "WebSite")) hasWebSite = true;
      }
    } catch {
      /* already reported by the parse assertion above */
    }
  }
}
assert(
  "WebSite node on the homepage",
  hasWebSite,
  'out/index.html emits no JSON-LD node with "@type": "WebSite"',
);

// ---------------------------------------------------------------------------
// 8. Consent Mode default must precede the GTM container
// ---------------------------------------------------------------------------
// Order is the whole mechanism. If gtm-init runs first the container boots with no consent
// state and the denied-by-default signal arrives after the first hits have already gone out.

const homeHtml = homepage?.html ?? "";
const consentAt = homeHtml.indexOf(CONSENT_MARKER);
const gtmAt = homeHtml.indexOf(GTM_MARKER);
assert(
  "Consent Mode default precedes the GTM container",
  consentAt !== -1 && gtmAt !== -1 && consentAt < gtmAt,
  consentAt === -1
    ? `${CONSENT_MARKER} not found in out/index.html`
    : gtmAt === -1
      ? `${GTM_MARKER} not found in out/index.html`
      : `${CONSENT_MARKER} at ${consentAt}, ${GTM_MARKER} at ${gtmAt} — default must come first`,
);

// ---------------------------------------------------------------------------
// 9. Banned physical-direction Tailwind utilities
// ---------------------------------------------------------------------------
// CLAUDE.md §6: logical utilities only. The trap is false positives — "text-primary",
// "border-primary", "placeholder:text-gray-400" and "lucide-chevron-left" all contain a banned
// substring. So: read class attributes only, split into whole tokens, strip variant prefixes at
// bracket depth 0 (so "data-[state=open]:ml-2" reduces to "ml-2" while an arbitrary value like
// "bg-[url(data:...)]" is left alone), then match the base utility exactly.

/** Strips Tailwind variant prefixes, splitting only on ":" outside [] and (). */
function baseUtility(token) {
  let depth = 0;
  let lastTopLevelColon = -1;
  for (let i = 0; i < token.length; i++) {
    const c = token[i];
    if (c === "[" || c === "(") depth++;
    else if (c === "]" || c === ")") depth--;
    else if (c === ":" && depth === 0) lastTopLevelColon = i;
  }
  return lastTopLevelColon === -1 ? token : token.slice(lastTopLevelColon + 1);
}

const BANNED_UTILITY_PATTERNS = [
  /^-?(pl|pr|ml|mr)-/, // physical padding / margin, negative margins included
  /^-?(left|right)-/, // physical inset
  /^text-(left|right)$/, // physical text alignment
];

const utilityViolations = [];
for (const file of allHtmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const seen = new Set();
  for (const match of html.matchAll(/\sclass="([^"]*)"/g)) {
    for (const token of match[1].split(/\s+/)) {
      if (!token) continue;
      const base = baseUtility(token);
      if (BANNED_UTILITY_PATTERNS.some((re) => re.test(base)) && !seen.has(token)) {
        seen.add(token);
        utilityViolations.push(`${path.relative(OUT_DIR, file)} -> ${token}`);
      }
    }
  }
}
assert(
  "no physical-direction Tailwind utilities in the built HTML",
  utilityViolations.length === 0,
  sample(utilityViolations),
);

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

console.log(`qa-gate: ${passed.length} passed, ${failures.length} failed\n`);
for (const name of passed) console.log(`  PASS  ${name}`);

if (failures.length) {
  console.error("");
  for (const failure of failures) console.error(`  FAIL  ${failure}`);
  console.error(`\nqa-gate: ${failures.length} assertion(s) failed.`);
  process.exit(1);
}

console.log("\nqa-gate: all assertions passed.");
