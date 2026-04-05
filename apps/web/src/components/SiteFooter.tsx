import Link from "next/link";
import { SiteContainer } from "@pocketcurb/ui-web";
import { siteCopy } from "../content/site-copy";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-line)]/70 bg-white/40 py-8">
      <SiteContainer className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-teal)]">PocketCurb</p>
          <p className="mt-2 text-sm leading-7 text-[var(--color-muted)] md:text-base">{siteCopy.footer.note}</p>
        </div>

        <nav className="flex flex-wrap gap-3 text-sm font-medium text-[var(--color-ink)]">
          {siteCopy.footer.links.map((link) => (
            <Link
              key={link.href}
              className="rounded-full border border-[var(--color-line)]/80 bg-white/80 px-4 py-2 transition-colors hover:bg-white"
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </SiteContainer>
    </footer>
  );
}
