/**
 * consent.ts — Consent Mode v2 wiring for a static export.
 *
 * ── The rule that makes or breaks this ────────────────────────────────────────
 * The consent DEFAULT must execute before the GTM container loads. Consent Mode
 * works by setting a default state that tags read when they fire; if the
 * container loads first, tags fire unconsented and the default arrives too late
 * to matter. That failure mode is the worst one available, because the page
 * *looks* compliant while behaving exactly as it did before.
 *
 * In app/layout.tsx the container script lives in <body>, so the default snippet
 * goes in <head> — scripts execute in document order, and <head> is unambiguous.
 *
 * ── What is NOT in this repo ──────────────────────────────────────────────────
 * Roughly half the work is container-side and belongs to the owner:
 *   1. Consent Mode must be enabled on the tags inside GTM-KWGGH438.
 *   2. Tags that need consent must be configured to wait for it.
 * A correct repo-side default with a container whose tags ignore consent state
 * still tracks everyone. See .claude/skills/consent-mode/SKILL.md.
 *
 * NOTE: GTM-KWGGH438 is shared across the Israeli fleet, so container changes
 * affect other sites. That makes it firmly an owner decision.
 *
 * ── Expected effect ───────────────────────────────────────────────────────────
 * Measured analytics WILL fall until visitors accept. That drop is consent
 * working, not a regression — do not "fix" it by weakening the default.
 */

/** localStorage key holding the visitor's choice. Static export has no server to remember it. */
export const CONSENT_STORAGE_KEY = "hb-consent";

export type ConsentChoice = "granted" | "denied";

/**
 * Inline <head> snippet. Sets everything to `denied`, then immediately re-grants if this
 * browser already stored a choice — so a returning visitor is neither re-asked nor
 * needlessly downgraded for the 500ms window.
 *
 * `functionality_storage` and `security_storage` stay granted: they cover things the site
 * needs to work at all, and neither is used for tracking.
 */
export const consentDefaultSnippet = `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments)}
gtag('consent','default',{
ad_storage:'denied',
ad_user_data:'denied',
ad_personalization:'denied',
analytics_storage:'denied',
functionality_storage:'granted',
security_storage:'granted',
wait_for_update:500
});
try{
var c=localStorage.getItem('${CONSENT_STORAGE_KEY}');
if(c==='granted'){gtag('consent','update',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'})}
}catch(e){}
`.trim();
