import Link from "next/link";
import { SiteContainer } from "@pocketcurb/ui-web";
import { siteCopy } from "../content/site-copy";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-line)]/65 bg-[rgba(250,247,240,0.82)] py-4 backdrop-blur-xl">
      <SiteContainer className="flex items-center justify-between gap-4">
        <Link className="flex items-center gap-3" href="/">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-ink)] text-sm font-semibold text-white">
            PC
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-teal)]">PocketCurb</div>
            <div className="text-xs text-[var(--color-muted)]">Landing, waitlist, and future SEO lane</div>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-3 text-sm font-medium text-[var(--color-ink)]">
          {siteCopy.navigation.map((link) => (
            <Link key={link.href} className="rounded-full px-3 py-2 transition-colors hover:bg-white/80" href={link.href}>
              {link.label}
            </Link>
          ))}
          <Link className="site-link" href="/waitlist">
            {siteCopy.hero.primaryCta.label}
          </Link>
        </nav>
      </SiteContainer>
    </header>
  );
}
