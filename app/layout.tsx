import type { Metadata, Viewport } from "next";
import { ogImageMeta } from "@ishub/site-kit";
import { Heebo, Rubik } from "next/font/google";
import { siteConfig, manifest } from "@/lib/site-config";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileCtaBar } from "@/components/layout/MobileCtaBar";
import { ConsentBanner } from "@/components/layout/ConsentBanner";
import { consentDefaultSnippet } from "@/lib/consent";
import { gtmHeadSnippet, gtmNoScriptSrc } from "@ishub/site-kit/analytics";
import "./globals.css";

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

/** Shared GTM loader — inert (renders nothing) until analytics.gtmId is set in the manifest. */
const gtmHead = gtmHeadSnippet(manifest.analytics?.gtmId);
const gtmNoScript = gtmNoScriptSrc(manifest.analytics?.gtmId);

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${rubik.variable}`}>
      <head>
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
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        {/* Spacer so the fixed mobile CTA bar never overlaps footer content. */}
        <div className="h-16 lg:hidden" aria-hidden />
        <MobileCtaBar />
        <ConsentBanner />
      </body>
    </html>
  );
}
