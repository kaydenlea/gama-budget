import Link from "next/link";
import { MetricChip } from "@gama/ui-web";
import { siteCopy } from "../content/site-copy";
import { sitePages } from "../lib/site-config";
import { Breadcrumbs } from "./Breadcrumbs";
import { ProductHeroVisual } from "./ProductVisuals";
import { Reveal } from "./Reveal";
import { WaitlistSignupForm } from "./WaitlistSignupForm";

export function WaitlistPage() {
  const featureCards = siteCopy.waitlist.differentiators.slice(0, 3);

  return (
    <main id="main-content" className="site-shell waitlist-clean-page">
      <Breadcrumbs page={sitePages.waitlist} />

      <Reveal>
        <section className="waitlist-clean-hero">
          <div className="waitlist-clean-hero-copy">
            <span className="site-kicker">{siteCopy.waitlist.hero.eyebrow}</span>
            <div className="waitlist-clean-hero-text">
              <h1>
                {siteCopy.waitlist.hero.title}
              </h1>
              <p>
                {siteCopy.waitlist.hero.body}
              </p>
            </div>

            <div className="waitlist-clean-actions">
              <Link className="site-link" href={siteCopy.waitlist.hero.primaryCta.href}>
                {siteCopy.waitlist.hero.primaryCta.label}
              </Link>
              <Link className="site-link-secondary" href={siteCopy.waitlist.hero.secondaryCta.href}>
                {siteCopy.waitlist.hero.secondaryCta.label}
              </Link>
            </div>

            <div className="waitlist-clean-chip-row">
              {siteCopy.waitlist.hero.supporting.map((item) => (
                <MetricChip key={item.label} label={item.label} value={item.value} />
              ))}
            </div>
          </div>

          <div className="waitlist-clean-hero-visual">
            <ProductHeroVisual />
          </div>
        </section>
      </Reveal>

      <Reveal delayMs={70}>
        <section className="waitlist-clean-summary" aria-label="What early access includes">
          <div className="waitlist-clean-section-head">
            <span className="site-kicker">{siteCopy.waitlist.positioning.eyebrow}</span>
            <h2>{siteCopy.waitlist.positioning.title}</h2>
            <p>{siteCopy.waitlist.positioning.body}</p>
          </div>

          <div className="waitlist-clean-card-grid">
            {featureCards.map((card) => (
              <article key={card.title} className="waitlist-clean-card">
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal delayMs={100}>
        <section id="early-access" className="anchor-offset waitlist-clean-signup">
          <div className="early-access-copy">
            <p className="site-kicker">{siteCopy.waitlist.earlyAccess.eyebrow}</p>
            <h2 className="early-access-title">
              {siteCopy.waitlist.earlyAccess.title}
            </h2>
            <p className="early-access-body">
              {siteCopy.waitlist.earlyAccess.body}
            </p>

            <div className="waitlist-clean-points">
              {siteCopy.waitlist.earlyAccess.intakeFields.map((field) => (
                <span key={field.title}>{field.title}</span>
              ))}
            </div>
          </div>

          <WaitlistSignupForm expectations={siteCopy.waitlist.earlyAccess.expectations} />
        </section>
      </Reveal>

      <Reveal delayMs={130}>
        <section className="waitlist-clean-trust">
          <div className="waitlist-clean-trust-copy">
            <span className="site-kicker">{siteCopy.waitlist.trust.eyebrow}</span>
            <h2>{siteCopy.waitlist.trust.title}</h2>
            <p>{siteCopy.waitlist.trust.body}</p>
          </div>
          <Link className="site-link-secondary" href="/privacy">
            Review the trust stance
          </Link>
        </section>
      </Reveal>
    </main>
  );
}
