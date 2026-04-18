import Link from "next/link";
import type { SitePageDefinition } from "../lib/site-config";

export function Breadcrumbs({ page }: { page: SitePageDefinition }) {
  if (page.breadcrumbs.length < 2) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-muted)]">
        {page.breadcrumbs.map((breadcrumb, index) => {
          const isCurrentPage = index === page.breadcrumbs.length - 1;

          return (
            <li key={breadcrumb.path} className="flex items-center gap-2">
              {index > 0 ? (
                <span aria-hidden="true" className="text-[var(--color-line-strong)]">
                  /
                </span>
              ) : null}
              {isCurrentPage ? (
                <span aria-current="page" className="font-medium text-[var(--color-ink)]">
                  {breadcrumb.label}
                </span>
              ) : (
                <Link className="site-crumb" href={breadcrumb.path}>
                  {breadcrumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
