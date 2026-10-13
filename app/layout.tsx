import type { Metadata, Viewport } from "next";
import { ogImageMeta } from "@ishub/site-kit";
import { Heebo, Rubik } from "next/font/google";
import { siteConfig, manifest } from "@/lib/site-config";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileCtaBar } from "@/components/layout/MobileCtaBar";
import { ConsentBanner } from "@/components/layout/ConsentBanner";
import { CONSENT_STORAGE_KEY, consentDefaultSnippet } from "@/lib/consent";
import { gtmHeadSnippet, gtmNoScriptSrc } from "@ishub/site-kit/analytics";
import { LiveDialogs, LiveHead, LiveTopBar } from "@/components/live/Live";
import { NextUrlHeaderFix } from "@/components/NextUrlHeaderFix";
import "./globals.css";
import "@/lib/live/live-core.css";

// Body font — Heebo (clean, legible Hebrew). Heading font — Rubik (modern Hebrew).
// Exposed as CSS variables consumed by the @theme block in app/globals.css
// (font-sans / font-heading). Tailwind v4 is CSS-first here — there is no tailwind.config.ts.
const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  variable: "--font-rubik",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.domain),
  // Homepage canonical. Every other route sets its own in page metadata, so nothing
  // inherits this — see the skyshade regression where a root canonical with no per-page
  // overrides made all 33 pages claim to be the homepage.
  alternates: { canonical: "/" },
  title: {
    default: `${siteConfig.name} – מומחים לתיקון דודים בכל הארץ`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.tagline,
  openGraph: {
    images: ogImageMeta(manifest.images),
    type: "website",
    locale: "he_IL",
    siteName: siteConfig.name,
  },
  // Search Console ownership. The manifest field existed for months with no `verification`
  // block to consume it, so setting it in the roster silently did nothing. Guarded on
  // presence — an empty verification meta is worse than none.
  ...(manifest.analytics?.googleSiteVerification
    ? {
        verification: {
          google: manifest.analytics.googleSiteVerification,
        },
      }
    : {}),
};

export const viewport: Viewport = {
  // Browser-chrome tint from the manifest (brand slate). Next emits <meta name="theme-color">.
  themeColor: manifest.brand?.themeColor ?? undefined,
};

/**
 * The seasonal card (public/assets/live.js) never opens while anything carries
 * `data-live-block`. The consent banner carries it — but the banner mounts only after hydration,
 * and on a slow phone that lands after the card's 4 s timer: the 2026-10-12 review opened the
 * card under a still-unmounted banner in 3 of 7 throttled runs. So the same mark goes on <html>
 * before first paint whenever the question is unanswered; ConsentBanner removes it on a choice.
 * Storage blocked: no mark, and live.js shows no card without storage anyway.
 */
const liveConsentBlock = `try{if(!localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)}))document.documentElement.setAttribute("data-live-block","")}catch(e){}`;

/** Shared GTM loader — inert (renders nothing) until analytics.gtmId is set in the manifest. */
const gtmHead = gtmHeadSnippet(manifest.analytics?.gtmId);
const gtmNoScript = gtmNoScriptSrc(manifest.analytics?.gtmId);

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${heebo.variable} ${rubik.variable}`}
      // The live head script sets data-live* on <html> before hydration (fleet live-kit).
      suppressHydrationWarning
    >
      <head>
        {/* The live surfaces (fleet live-kit, CLAUDE.md §13) decide the line before first
            paint — first in <head>. They push nothing to dataLayer from here; live.js is
            deferred, so its events always queue after the Consent Mode default below. */}
        <LiveHead />
        {/* Hebrew route paths would otherwise turn every link click into a full reload. */}
        <NextUrlHeaderFix />
        <script
          id="live-consent-block"
          dangerouslySetInnerHTML={{ __html: liveConsentBlock }}
        />
        {/* Consent Mode v2 default — everything denied until the visitor chooses.
            MUST stay ABOVE the container: the GTM loader below lives in <body>, and
            scripts run in document order, so a default emitted here is guaranteed to
            beat it. Move this after the loader and tags fire unconsented while the page
            still looks compliant. See lib/consent.ts. */}
        {gtmHead && (
          <script
            id="consent-default"
            dangerouslySetInnerHTML={{ __html: consentDefaultSnippet }}
          />
        )}
        {manifest.images?.mediaHost && (
          <link
            rel="preconnect"
            href={`https://${manifest.images.mediaHost}`}
            crossOrigin=""
          />
        )}
      </head>
      <body className="flex min-h-screen flex-col font-sans">
        {/* Keyboard users otherwise tab the whole header nav on every page. Visible on focus. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-primary focus:shadow-lg"
        >
          דילוג לתוכן הראשי
        </a>
        {/* Second in the DOM, not last. The banner is `fixed`, so its position on screen does
            not depend on where it sits in the markup — z-50 still stacks above the z-40 mobile
            CTA bar, and `bottom-16` still clears it. But as the last element in <body> it was
            ~100 tab stops from the top: a keyboard user had to traverse the entire page to
            answer it, and at 400% zoom it covered the viewport with unreachable controls.
            Consent logically precedes everything else, so it is reached first. */}
        <ConsentBanner />
        {gtmNoScript && (
          <noscript>
            <iframe
              src={gtmNoScript}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="gtm"
            />
          </noscript>
        )}
        {gtmHead && (
          <script id="gtm-init" dangerouslySetInnerHTML={{ __html: gtmHead }} />
        )}
        {/* The announcement bar: directly before the sticky header, NOT inside it — it scrolls
            away, so the header's h-16 maths (the mobile panel's calc(100vh-4rem), the service
            sidebar's top-24) hold once the page is scrolled. At the very top a visible line
            pushes the open mobile panel 35px past the fold (CLAUDE.md §13). */}
        <LiveTopBar />
        <Header />
        {/* tabIndex={-1} is what makes the skip link above actually work. Without it Safari
            (and other engines) move the URL fragment but leave focus in the header, so the
            next Tab returns to the nav the user just skipped. -1 keeps <main> out of the tab
            order while making it programmatically focusable; :focus-visible does not fire for
            programmatic focus, so no new ring appears for mouse users. */}
        <main id="main" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <Footer />
        {/* Spacer so the fixed mobile CTA bar never overlaps footer content. */}
        <div className="h-16 lg:hidden" aria-hidden />
        <MobileCtaBar />
        {/* The seasonal card (a closed native <dialog>), last in <body>. */}
        <LiveDialogs />
      </body>
    </html>
  );
}
