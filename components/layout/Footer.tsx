import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { siteConfig, telHref, services, locations } from "@/lib/site-config";
import { Container } from "@/components/ui/Container";

// Read once at module scope, from the build clock. This is a Server Component in a static
// export, so the value is baked into the HTML at build time — it never varies per request and
// cannot cause a hydration mismatch. Evaluating it here rather than per render keeps a single
// build internally consistent even if it straddles midnight on 31/12. The copyright is
// therefore correct as of the last build: any rebuild within the year fixes it, where the
// previous hardcoded 2026 would have gone silently wrong on 01/01/2027.
const year = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="bg-primary text-white/90">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand + contact */}
        <div>
          <p className="font-heading text-2xl font-extrabold text-white">
            {siteConfig.name}
          </p>
          <p className="mt-3 text-sm text-white/70">{siteConfig.tagline}</p>
          <ul className="mt-5 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-accent-400" aria-hidden />
              <a
                href={telHref}
                data-cta="footer-call"
                className="hover:text-white"
                dir="ltr"
              >
                {siteConfig.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-accent-400" aria-hidden />
              <a
                href={`mailto:${siteConfig.email}`}
                data-cta="footer-email"
                className="hover:text-white"
                dir="ltr"
              >
                {siteConfig.email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent-400" aria-hidden />
              <span>{siteConfig.serviceArea}</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-accent-400" aria-hidden />
              <span>
                {siteConfig.hours.weekday}
                <br />
                {siteConfig.hours.friday}
              </span>
            </li>
          </ul>
        </div>

        {/* Services */}
        <nav aria-label="שירותים">
          <p className="font-semibold text-white">השירותים שלנו</p>
          <ul className="mt-4 space-y-2 text-sm">
            {services.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="inline-block py-1 text-white/70 hover:text-white"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Areas */}
        <nav aria-label="אזורי שירות">
          <p className="font-semibold text-white">אזורי שירות</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {/* All 18 — a .slice(0, 12) here left six cities reachable in one click only from
              the homepage. The footer is the orphan-insurance surface; it must be complete. */}
            {locations.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/locations/${c.slug}`}
                  className="inline-block py-1 text-white/70 hover:text-white"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Quick links + legal */}
        <nav aria-label="קישורים">
          <p className="font-semibold text-white">קישורים</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link
                href="/שירותים"
                className="inline-block py-1 text-white/70 hover:text-white"
              >
                השירותים שלנו
              </Link>
            </li>
            <li>
              <Link
                href="/איזורי-שירות"
                className="inline-block py-1 text-white/70 hover:text-white"
              >
                אזורי שירות
              </Link>
            </li>
            <li>
              <Link
                href="/מדריכים"
                className="inline-block py-1 text-white/70 hover:text-white"
              >
                מדריכים
              </Link>
            </li>
            <li>
              <Link
                href="/מחירון"
                className="inline-block py-1 text-white/70 hover:text-white"
              >
                מחירון
              </Link>
            </li>
            <li>
              <Link
                href="/אודות"
                className="inline-block py-1 text-white/70 hover:text-white"
              >
                אודות
              </Link>
            </li>
            <li>
              <Link
                href="/צור-קשר"
                className="inline-block py-1 text-white/70 hover:text-white"
              >
                צור קשר
              </Link>
            </li>
            <li>
              <Link
                href="/מדיניות-פרטיות"
                className="inline-block py-1 text-white/70 hover:text-white"
              >
                מדיניות פרטיות
              </Link>
            </li>
            <li>
              <Link
                href="/הצהרת-נגישות"
                className="inline-block py-1 text-white/70 hover:text-white"
              >
                הצהרת נגישות
              </Link>
            </li>
          </ul>
        </nav>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/60 sm:flex-row">
          <p>
            © {year} {siteConfig.name}. כל הזכויות שמורות.
          </p>
          <p>תיקון דודים · שירות בכל הארץ</p>
        </Container>
      </div>
    </footer>
  );
}
