import Link from "next/link";
import { SiteContainer, SurfaceCard } from "@gama/ui-web";

export default function NotFound() {
  return (
    <main id="main-content" className="py-12 md:py-16">
      <SiteContainer>
        <SurfaceCard className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-teal)]">404</p>
          <h1 className="mt-3 text-4xl text-[var(--color-ink)] md:text-5xl">Page not found</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-muted)]">
            The page you requested does not exist or is no longer available. Return to the Gama home page.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="site-link" href="/">
              Return home
            </Link>
          </div>
        </SurfaceCard>
      </SiteContainer>
    </main>
  );
}
