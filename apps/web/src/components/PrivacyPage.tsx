import Link from "next/link";
import { SiteSection, SurfaceCard } from "@gama/ui-web";
import { siteCopy } from "../content/site-copy";
import { sitePages } from "../lib/site-config";
import { Breadcrumbs } from "./Breadcrumbs";
import { Reveal } from "./Reveal";

export function PrivacyPage() {
  return (
    <main id="main-content" className="site-shell flex flex-col gap-6 py-6 md:gap-8 md:py-10">
      <Breadcrumbs page={sitePages.privacy} />

      <Reveal>
        <section className="site-panel hero-frame">
        <div className="relative grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="relative z-[1]">
            <span className="site-kicker">{siteCopy.privacy.hero.eyebrow}</span>
            <h1 className="mt-5 max-w-[11ch] text-5xl leading-[0.94] text-[var(--color-ink)] md:text-7xl">
              {siteCopy.privacy.hero.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--color-muted)] md:text-lg">
              {siteCopy.privacy.hero.body}
            </p>
          </div>

          <div className="relative z-[1] grid gap-4 md:grid-cols-3 lg:grid-cols-1">
            {siteCopy.shared.trustPillars.map((pillar) => (
              <SurfaceCard key={pillar.title} className="h-full bg-white/74">
                <h2 className="text-2xl text-[var(--color-ink)]">{pillar.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--color-muted)] md:text-base">{pillar.body}</p>
              </SurfaceCard>
            ))}
          </div>
        </div>
        </section>
      </Reveal>

      <Reveal delayMs={80}>
        <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <SiteSection eyebrow="Boundaries" title={siteCopy.privacy.boundaries.title}>
          <ul className="mt-6 grid gap-3 text-sm leading-7 text-[var(--color-muted)] md:text-base">
            {siteCopy.privacy.boundaries.items.map((item) => (
              <li
                key={item}
                className="rounded-[1.4rem] border border-[var(--color-line)]/80 bg-white/80 px-4 py-4"
              >
                {item}
              </li>
            ))}
          </ul>
        </SiteSection>

        <SiteSection eyebrow="Launch discipline" title={siteCopy.privacy.minimization.title}>
          <ul className="mt-6 grid gap-3 text-sm leading-7 text-[var(--color-muted)] md:text-base">
            {siteCopy.privacy.minimization.items.map((item) => (
              <li
                key={item}
                className="rounded-[1.4rem] border border-[var(--color-line)]/80 bg-white/80 px-4 py-4"
              >
                {item}
              </li>
            ))}
          </ul>
        </SiteSection>
        </div>
      </Reveal>

      <Reveal delayMs={120}>
        <div className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
        <SurfaceCard>
          <p className="site-kicker">Shared visibility</p>
          <h2 className="mt-5 max-w-[14ch] text-4xl leading-[0.98] text-[var(--color-ink)]">
            {siteCopy.privacy.sharedContext.title}
          </h2>
          <ul className="mt-6 grid gap-3 text-sm leading-7 text-[var(--color-muted)] md:text-base">
            {siteCopy.privacy.sharedContext.items.map((item) => (
              <li
                key={item}
                className="rounded-[1.4rem] border border-[var(--color-line)]/80 bg-[var(--color-surface-strong)] px-4 py-4"
              >
                {item}
              </li>
            ))}
          </ul>
        </SurfaceCard>

        <SurfaceCard tone="mist">
          <p className="site-kicker">Current posture</p>
          <div className="mt-6 grid gap-4">
            {siteCopy.privacy.currentState.map((card) => (
              <div
                key={card.title}
                className="rounded-[1.5rem] border border-[var(--color-line)]/80 bg-white/82 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]"
              >
                {card.eyebrow ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-teal)]">
                    {card.eyebrow}
                  </p>
                ) : null}
                <h3 className="mt-3 text-2xl text-[var(--color-ink)]">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-muted)] md:text-base">{card.body}</p>
              </div>
            ))}
          </div>

          <div className="cta-stack mt-6">
            <Link className="site-link" href={siteCopy.privacy.primaryCta.href}>
              {siteCopy.privacy.primaryCta.label}
            </Link>
            <Link className="site-link-secondary" href={siteCopy.privacy.secondaryCta.href}>
              {siteCopy.privacy.secondaryCta.label}
            </Link>
          </div>
        </SurfaceCard>
        </div>
      </Reveal>
    </main>
  );
}
