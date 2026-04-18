import Link from "next/link";
import { MetricChip, SiteSection, SurfaceCard } from "@gama/ui-web";
import { siteCopy } from "../content/site-copy";

export function LandingPage() {
  return (
    <main id="main-content" className="site-shell flex flex-col gap-6 py-8 md:gap-8 md:py-12">
      <section className="site-panel overflow-hidden px-6 py-8 md:px-10 md:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="grid gap-6">
            <span className="site-kicker">{siteCopy.hero.eyebrow}</span>

            <div className="grid gap-5">
              <p className="max-w-[28rem] text-sm uppercase tracking-[0.24em] text-[var(--color-muted)]">
                {siteCopy.hero.kicker}
              </p>
              <h1 className="max-w-[12ch] text-5xl leading-[0.96] text-[var(--color-ink)] md:text-7xl">
                {siteCopy.hero.title}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[var(--color-muted)] md:text-lg">
                {siteCopy.hero.body}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link className="site-link" href={siteCopy.hero.primaryCta.href}>
                {siteCopy.hero.primaryCta.label}
              </Link>
              <Link className="site-link-secondary" href={siteCopy.hero.secondaryCta.href}>
                {siteCopy.hero.secondaryCta.label}
              </Link>
            </div>
          </div>

          <SurfaceCard tone="mist" className="border-white/70 bg-white/70">
            <div className="grid gap-4">
              <p className="text-sm uppercase tracking-[0.22em] text-[var(--color-teal)]">What the web lane is for</p>
              <h2 className="text-3xl text-[var(--color-ink)]">{siteCopy.content.title}</h2>
              <p className="text-sm leading-7 text-[var(--color-muted)] md:text-base">{siteCopy.content.body}</p>

              <div className="site-rule" />

              <div className="grid gap-3">
                {siteCopy.content.tracks.map((track) => (
                  <div
                    key={track.title}
                    className="rounded-[1.35rem] border border-[var(--color-line)]/75 bg-white/85 px-4 py-4"
                  >
                    <p className="text-base font-semibold text-[var(--color-ink)]">{track.title}</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">{track.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </SurfaceCard>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {siteCopy.hero.highlights.map((highlight) => (
            <MetricChip key={highlight.label} label={highlight.label} value={highlight.value} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SiteSection
          eyebrow="Why it feels different"
          title="Built around decisions, not bookkeeping homework."
          lede={siteCopy.differenceIntro}
        >
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {siteCopy.differencePillars.map((pillar) => (
              <SurfaceCard key={pillar.title} className="h-full">
                <h3 className="text-xl text-[var(--color-ink)]">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-muted)] md:text-base">{pillar.body}</p>
              </SurfaceCard>
            ))}
          </div>
        </SiteSection>

        <SurfaceCard tone="mist" className="h-full">
          <p className="text-sm uppercase tracking-[0.22em] text-[var(--color-teal)]">Waitlist readiness</p>
          <h2 className="mt-3 text-3xl text-[var(--color-ink)]">{siteCopy.waitlist.previewTitle}</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-muted)] md:text-base">{siteCopy.waitlist.previewBody}</p>

          <div className="mt-6 grid gap-3">
            {siteCopy.waitlist.intakeFields.map((field) => (
              <div
                key={field.label}
                className="rounded-[1.3rem] border border-[var(--color-line)]/70 bg-white/85 px-4 py-4"
              >
                <div className="text-sm font-semibold text-[var(--color-ink)]">{field.label}</div>
                <div className="mt-1 text-sm leading-6 text-[var(--color-muted)]">{field.note}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="site-link" href="/waitlist">
              Review the waitlist flow
            </Link>
            <Link className="site-link-secondary" href="/privacy">
              See the privacy stance
            </Link>
          </div>
        </SurfaceCard>
      </div>

      <SiteSection
        eyebrow="Real-life cases"
        title="The website should mirror the product thesis without pretending the app is already shipping everything."
        lede={siteCopy.scenarioIntro}
      >
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {siteCopy.scenarios.map((scenario) => (
            <SurfaceCard key={scenario.title} className="h-full">
              <p className="text-lg font-semibold text-[var(--color-ink)]">{scenario.title}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-muted)] md:text-base">{scenario.body}</p>
            </SurfaceCard>
          ))}
        </div>
      </SiteSection>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard>
          <p className="text-sm uppercase tracking-[0.22em] text-[var(--color-teal)]">Trust and disclosure</p>
          <h2 className="mt-3 text-3xl text-[var(--color-ink)]">{siteCopy.trust.title}</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-muted)] md:text-base">{siteCopy.trust.body}</p>

          <ul className="mt-6 grid gap-3 text-sm leading-7 text-[var(--color-muted)] md:text-base">
            {siteCopy.trust.points.map((point) => (
              <li key={point} className="rounded-[1.35rem] border border-[var(--color-line)]/70 bg-[var(--color-surface-strong)] px-4 py-4">
                {point}
              </li>
            ))}
          </ul>
        </SurfaceCard>

        <SurfaceCard tone="mist">
          <p className="text-sm uppercase tracking-[0.22em] text-[var(--color-teal)]">Next website phases</p>
          <h2 className="mt-3 text-3xl text-[var(--color-ink)]">{siteCopy.foundation.title}</h2>
          <div className="mt-5 grid gap-3">
            {siteCopy.foundation.phases.map((phase) => (
              <div
                key={phase.title}
                className="rounded-[1.35rem] border border-[var(--color-line)]/70 bg-white/85 px-4 py-4"
              >
                <p className="text-base font-semibold text-[var(--color-ink)]">{phase.title}</p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">{phase.body}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </main>
  );
}
