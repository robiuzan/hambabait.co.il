"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, X } from "lucide-react";
import { siteConfig, telHref } from "@/lib/site-config";
import { navItems } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/** Trailing-slash- and percent-encoding-tolerant path equality for aria-current. */
function isActivePath(pathname: string, href: string): boolean {
  const norm = (s: string) => {
    try {
      return decodeURIComponent(s).replace(/\/+$/, "") || "/";
    } catch {
      return s.replace(/\/+$/, "") || "/";
    }
  };
  return norm(pathname) === norm(href);
}

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Disclosure pattern, not a dialog: the panel is in-flow directly after the toggle, so the
  // natural Tab order already walks into it and no focus trap applies.
  //
  // Everything that may only be live while the panel is open lives in this one effect, so it
  // all tears down together:
  //   • Body scroll lock — the page must not scroll away underneath the panel. This is only
  //     safe because the panel is now its own scroll container (max-h + overflow-y-auto
  //     below); without that, a 320×256 viewport (400% zoom) locked the body around a ~445px
  //     panel and the lower menu items and the call button were unreachable.
  //   • Escape is bound to `document`, not to the <header>: an element handler only fires
  //     while focus is inside that element, so Escape did nothing once focus left the header.
  //     Closing returns focus to the toggle.
  //   • The lg breakpoint — the panel is hidden by `lg:hidden` while `open` stays true, so
  //     resizing past 1024px with the menu open left the body scroll-locked with no visible
  //     control to unlock it.
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    // 64rem is the Tailwind `lg` breakpoint — the exact width at which `lg:hidden` takes the
    // panel and the toggle away.
    const mql = window.matchMedia("(min-width: 64rem)");
    const onBreakpoint = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mql.addEventListener("change", onBreakpoint);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
      mql.removeEventListener("change", onBreakpoint);
    };
  }, [open]);

  const desktopLink = (href: string) =>
    cn(
      "text-sm font-medium transition-colors hover:text-primary",
      isActivePath(pathname, href) ? "font-semibold text-primary" : "text-gray-700",
    );

  const mobileLink = (href: string) =>
    cn(
      "block rounded-lg px-2 py-2.5 text-base font-medium hover:bg-gray-50 hover:text-primary",
      isActivePath(pathname, href)
        ? "bg-gray-50 font-semibold text-primary"
        : "text-gray-700",
    );

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="font-heading text-2xl font-extrabold text-primary"
          aria-label={`${siteConfig.name} — דף הבית`}
        >
          {siteConfig.name}
        </Link>

        {/* Desktop nav */}
        <nav aria-label="ראשי" className="hidden lg:block">
          <ul className="flex items-center gap-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={desktopLink(item.href)}
                  aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            href={telHref}
            data-cta="header-call"
            variant="accent"
            className="hidden sm:inline-flex"
          >
            <Phone className="h-4 w-4" aria-hidden />
            <span dir="ltr">{siteConfig.phone}</span>
          </Button>

          {/* Under 640px the full phone Button is hidden — without this icon link the header
              carries no call affordance at all on phones, the device that actually dials.
              Its own data-cta: sharing "header-call" with the bar button collapsed a
              phone-only placement and a desktop-only one into a single unreadable metric. */}
          <a
            href={telHref}
            data-cta="header-call-icon"
            aria-label={`חיוג אל ${siteConfig.name}: ${siteConfig.phone}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground sm:hidden"
          >
            <Phone className="h-5 w-5" aria-hidden />
          </a>

          <button
            ref={toggleRef}
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-primary lg:hidden"
            aria-label={open ? "סגירת תפריט" : "פתיחת תפריט"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {/* aria-hidden like every other icon on the site: the button's accessible name
                comes from aria-label, and the glyph would otherwise be announced twice. */}
            {open ? (
              <X className="h-6 w-6" aria-hidden />
            ) : (
              <Menu className="h-6 w-6" aria-hidden />
            )}
          </button>
        </div>
      </Container>

      {/* Mobile menu. The panel is its own scroll container because the body is locked while
          it is open: 100vh minus the h-16 (4rem) header bar is exactly the room it has, and
          overscroll-contain keeps the scroll chain from leaking to the locked page. */}
      <div
        id="mobile-menu"
        className={cn(
          "max-h-[calc(100vh-4rem)] overflow-y-auto overscroll-contain border-t border-gray-100 lg:hidden",
          open ? "block" : "hidden",
        )}
        // While the menu is open the seasonal card (public/assets/live.js) never opens over it.
        data-live-block={open ? "" : undefined}
      >
        <Container className="py-4">
          <nav aria-label="ראשי נייד">
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={mobileLink(item.href)}
                    aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Button
            href={telHref}
            data-cta="mobile-menu-call"
            variant="accent"
            size="lg"
            className="mt-3 w-full"
          >
            <Phone className="h-5 w-5" aria-hidden />
            חייגו עכשיו: <span dir="ltr">{siteConfig.phone}</span>
          </Button>
        </Container>
      </div>
    </header>
  );
}
