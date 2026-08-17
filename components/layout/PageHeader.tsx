import Link from "next/link";
import { breadcrumbJsonLd, jsonLdScript } from "@ishub/site-kit/seo";
import { manifest } from "@/lib/site-config";
import { Container } from "@/components/ui/Container";

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Canonical form: leading slash, trailing slash (`trailingSlash: true`), and percent-escaped.
 * `encodeURI` matters for the Hebrew routes — Next escapes canonicals and app/sitemap.ts escapes
 * every `<loc>`, so a raw-UTF-8 breadcrumb `item` would be the only unescaped form of the same URL.
 */
function normalizePath(path: string): string {
  const withLead = path.startsWith("/") ? path : `/${path}`;
  return encodeURI(withLead.endsWith("/") ? withLead : `${withLead}/`);
}

/**
 * Inner-page hero band: breadcrumb + title + optional subtitle.
 *
 * Also emits the matching `BreadcrumbList` JSON-LD. The visible trail and the markup are built
 * from the SAME `crumbs` array, so they can never drift — Google requires them to correspond.
 * `currentPath` supplies the terminal crumb's URL (that crumb renders as plain text, so it has
 * no href of its own); pass the page's canonical path. Omit it and the markup is skipped rather
 * than emitted with a hole in it.
 */
export function PageHeader({
  title,
  subtitle,
  crumbs,
  currentPath,
}: {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
  currentPath?: string;
}) {
  const hasCrumbs = crumbs && crumbs.length > 0;

  // Every item needs a URL: intermediate crumbs use their href, the terminal one uses currentPath.
  const jsonLd =
    hasCrumbs && currentPath
      ? breadcrumbJsonLd(
          manifest,
          crumbs.map((c, i) => ({
            name: c.label,
            path: normalizePath(c.href ?? (i === crumbs.length - 1 ? currentPath : "/")),
          })),
        )
      : null;

  return (
    <div className="bg-primary text-white">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
        />
      )}
      <Container className="py-12 sm:py-16">
        {hasCrumbs && (
          <nav aria-label="פירורי לחם" className="mb-3">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/70">
              {crumbs.map((c, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  {c.href ? (
                    <Link href={c.href} className="hover:text-white">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="text-white/90" aria-current="page">
                      {c.label}
                    </span>
                  )}
                  {i < crumbs.length - 1 && <span aria-hidden>/</span>}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="font-heading text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-white/85">{subtitle}</p>}
      </Container>
    </div>
  );
}
