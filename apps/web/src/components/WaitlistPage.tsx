import Link from "next/link";
import { MetricChip, SiteSection, SurfaceCard } from "@gama/ui-web";
import { siteCopy } from "../content/site-copy";
import { sitePages } from "../lib/site-config";
import { Breadcrumbs } from "./Breadcrumbs";

export function WaitlistPage() {
  return (
    <main id="main-content" className="site-shell flex flex-col gap-6 py-8 md:py-12">
      <Breadcrumbs page={sitePages.waitlist} />

      <SiteSection eyebrow="Waitlist plan" title={siteCopy.waitlist.title} lede={siteCopy.waitlist.body}>
        <div className="mt-6 flex flex-wrap gap-3">
          {siteCopy.waitlist.badges.map((badge) => (
            <MetricChip key={badge.label} label={badge.label} value={badge.value} />
          ))}
        </div>
      </SiteSection>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <SurfaceCard>
          <h2 className="text-2xl font-semibold text-[var(--color-ink)]">What the future intake will ask</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {siteCopy.waitlist.intakeFields.map((field) => (
              <div
                key={field.label}
                className="rounded-[1.4rem] border border-[var(--color-line)]/70 bg-[var(--color-surface-strong)] px-4 py-4"
              >
                <p className="text-base font-semibold text-[var(--color-ink)]">{field.label}</p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">{field.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[1.6rem] border border-dashed border-[var(--color-line-strong)] bg-white/80 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-teal)]">Not live yet</p>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted)] md:text-base">{siteCopy.waitlist.readinessNote}</p>
          </div>
        </SurfaceCard>

        <SurfaceCard tone="mist">
          <h2 className="text-2xl font-semibold text-[var(--color-ink)]">Expected follow-up behavior</h2>
          <ul className="mt-5 grid gap-3 text-sm leading-7 text-[var(--color-muted)] md:text-base">
            {siteCopy.waitlist.expectations.map((expectation) => (
              <li
                key={expectation}
                className="rounded-[1.35rem] border border-[var(--color-line)]/70 bg-white/85 px-4 py-4"
              >
                {expectation}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="site-link-secondary" href="/">
              Back to the landing page
            </Link>
            <Link className="site-link" href="/privacy">
              Review the privacy stance
            </Link>
          </div>
        </SurfaceCard>
      </div>
    </main>
  );
}
