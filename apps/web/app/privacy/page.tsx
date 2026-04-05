import type { Metadata } from "next";
import Link from "next/link";
import { MetricChip, SiteSection, SurfaceCard } from "@pocketcurb/ui-web";
import { siteCopy } from "../../src/content/site-copy";
import { createPageMetadata } from "../../src/lib/site-metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy and Trust",
  description:
    "PocketCurb's web lane is built to explain the product honestly, prepare for privacy-safe growth, and keep trust ahead of conversion pressure.",
  path: "/privacy",
  keywords: ["PocketCurb privacy", "finance privacy", "privacy-first budgeting"]
});

export default function PrivacyPage() {
  return (
    <main className="site-shell flex flex-col gap-6 py-8 md:py-12">
      <SiteSection
        eyebrow="Privacy-first trust"
        title={siteCopy.privacy.title}
        lede={siteCopy.privacy.body}
      >
        <div className="mt-6 flex flex-wrap gap-3">
          {siteCopy.privacy.badges.map((badge) => (
            <MetricChip key={badge.label} label={badge.label} value={badge.value} />
          ))}
        </div>
      </SiteSection>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SurfaceCard>
          <h2 className="text-2xl font-semibold text-[var(--color-ink)]">How the website lane will behave</h2>
          <ul className="mt-6 grid gap-3 text-sm leading-7 text-[var(--color-muted)] md:text-base">
            {siteCopy.privacy.principles.map((principle) => (
              <li key={principle} className="rounded-[1.4rem] border border-[var(--color-line)]/80 bg-white/80 px-4 py-4">
                {principle}
              </li>
            ))}
          </ul>
        </SurfaceCard>

        <SurfaceCard tone="mist">
          <h2 className="text-2xl font-semibold text-[var(--color-ink)]">Current state of the web lane</h2>
          <div className="mt-5 grid gap-3 text-sm leading-7 text-[var(--color-muted)] md:text-base">
            {siteCopy.privacy.currentState.map((item) => (
              <p key={item} className="rounded-[1.4rem] border border-[var(--color-line)]/70 bg-white/85 px-4 py-4">
                {item}
              </p>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="site-link" href="/waitlist">
              See the waitlist plan
            </Link>
            <Link className="site-link-secondary" href="/">
              Back to the landing page
            </Link>
          </div>
        </SurfaceCard>
      </div>
    </main>
  );
}
