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

  // The expanded menu sits inside the sticky header; lock body scroll while it is open so
  // the page cannot scroll away underneath it.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Disclosure pattern, not a dialog: the panel is in-flow directly after the toggle, so the
  // natural Tab order already walks into it and no focus trap applies. Escape closes and
  // returns focus to the toggle.
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape" && open) {
      setOpen(false);
      toggleRef.current?.focus();
    }
  }

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
    <header
      className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur"
      onKeyDown={onKeyDown}
    >
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
              carries no call affordance at all on phones, the device that actually dials. */}
          <a
            href={telHref}
            data-cta="header-call"
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
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </Container>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={cn("border-t border-gray-100 lg:hidden", open ? "block" : "hidden")}
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
            data-cta="header-call"
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
