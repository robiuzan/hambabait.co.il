"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CONSENT_STORAGE_KEY, type ConsentChoice } from "@/lib/consent";

declare global {
  interface Window {
    /** Defined by the Consent Mode default snippet in <head> (app/layout.tsx). */
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Consent banner — the fifth client component on the site, and a justified one: it needs
 * state and localStorage, neither of which exists in a static export.
 *
 * Renders nothing until mounted. Reading localStorage during render would mismatch the
 * server-rendered HTML and blow up hydration, so the check happens in an effect and the
 * banner appears a beat later. That is also why it is `fixed` — appearing late must not
 * push content around and cost CLS.
 *
 * Positioned above the sticky mobile CTA bar so it never covers the call button: losing a
 * phone call to a cookie banner would be a poor trade on a site whose first conversion
 * goal is a call.
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(CONSENT_STORAGE_KEY)) setVisible(true);
    } catch {
      // Private mode or blocked storage: showing the banner every visit is the safe
      // failure, because it never silently upgrades anyone to granted.
      setVisible(true);
    }
  }, []);

  function choose(choice: ConsentChoice) {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, choice);
    } catch {
      // Nothing to persist. The update below still applies for this pageview.
    }
    if (choice === "granted") {
      window.gtag?.("consent", "update", {
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
        analytics_storage: "granted",
      });
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="הודעת עוגיות"
      className="fixed inset-x-0 bottom-16 z-50 border-t border-gray-200 bg-white shadow-lg lg:bottom-0"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-gray-700">
          אנחנו משתמשים בכלי מדידה של Google כדי להבין איך משתמשים באתר. אפשר להסכים או
          להמשיך בלי מדידה — האתר יעבוד במלואו כך או כך.{" "}
          <Link
            href="/מדיניות-פרטיות"
            className="font-semibold text-secondary hover:underline"
          >
            מדיניות הפרטיות
          </Link>
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="inline-flex min-h-11 items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            בלי מדידה
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="inline-flex min-h-11 items-center rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
          >
            מאשר/ת
          </button>
        </div>
      </div>
    </div>
  );
}
