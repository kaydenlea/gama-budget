import { siteCopy } from "../content/site-copy";
import { HeroWaitlistForm } from "./HeroWaitlistForm";
import { MockupPreviewPhone, ProductHeroVisual } from "./ProductVisuals";
import { Reveal } from "./Reveal";
import { ScrollFeatureShowcase } from "./ScrollFeatureShowcase";
import { TrustFeatureCarousel } from "./TrustFeatureCarousel";

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type HomeSignatureFeatureCard = (typeof siteCopy.home.signatureFeatures.cards)[number];

function InstitutionLogo({ name }: { name: string }) {
  const initialsByName: Record<string, string> = {
    "American Express": "AX",
    "Bank of America": "BA",
    "Capital One": "CO",
    Chase: "CH",
    Citi: "CI",
    Discover: "DI",
    "U.S. Bank": "US",
    "Wells Fargo": "WF"
  };

  return (
    <span aria-hidden="true" className="hero-home-bank-logo">
      {initialsByName[name] ?? name.slice(0, 2).toUpperCase()}
    </span>
  );
}

function SignatureCardIcon({ icon }: { icon: HomeSignatureFeatureCard["icon"] }) {
  if (icon === "timeline") {
    return (
      <svg aria-hidden="true" className="home-signature-card-icon-svg" viewBox="0 0 20 20">
        <path d="M4.4 5.1H15.6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" />
        <path d="M4.4 10H11.1" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" />
        <path d="M4.4 14.9H13.6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" />
        <circle cx="13.9" cy="10" r="1.3" fill="currentColor" />
      </svg>
    );
  }

  if (icon === "map") {
    return (
      <svg aria-hidden="true" className="home-signature-card-icon-svg" viewBox="0 0 20 20">
        <path
          d="M10 17C12.7 13.8 14.5 11.5 14.5 8.9C14.5 6.4 12.5 4.4 10 4.4C7.5 4.4 5.5 6.4 5.5 8.9C5.5 11.5 7.3 13.8 10 17Z"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.55"
        />
        <circle cx="10" cy="8.8" r="1.5" fill="currentColor" />
      </svg>
    );
  }

  if (icon === "share") {
    return (
      <svg aria-hidden="true" className="home-signature-card-icon-svg" viewBox="0 0 20 20">
        <path
          d="M7.4 10.1H12.6"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.55"
        />
        <path
          d="M11.1 6.6L14.6 10.1L11.1 13.6"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.55"
        />
        <path
          d="M5.7 15.2C4.8 15.2 4.1 14.5 4.1 13.6V6.4C4.1 5.5 4.8 4.8 5.7 4.8H8.6"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.55"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="home-signature-card-icon-svg" viewBox="0 0 20 20">
      <path d="M5.2 5.4H14.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" />
      <path d="M5.2 10H12.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" />
      <path d="M5.2 14.6H10.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" />
      <path d="M13 13.5L14.7 15.2L16.8 12.7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.55" />
    </svg>
  );
}

async function SignatureFeatureCard({ card }: { card: HomeSignatureFeatureCard }) {
  const crop = card.id === "overview-timeline" ? "events" : card.id === "receipt-recap" ? "eventDetails" : undefined;

  return (
    <Reveal className="home-visual-reveal" delayMs={60}>
      <article
        className={joinClasses(
          "home-signature-card",
          `home-signature-card-${card.id}`
        )}
      >
        <div className="home-signature-card-device-window">
          <MockupPreviewPhone
            className={joinClasses("home-signature-card-phone", `home-signature-card-phone-${card.id}`)}
            preview={card.previewSlug}
            priority
            {...(crop ? { crop } : {})}
          />
        </div>

        <div className="home-signature-card-copy">
          <span className="home-signature-card-icon" aria-hidden="true">
            <SignatureCardIcon icon={card.icon} />
          </span>
          <div className="home-signature-card-text">
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export async function LandingPage() {
  const marqueeInstitutionSets = Array.from({ length: 3 }, (_, index) => ({
    id: `set-${index}`,
    institutions: siteCopy.home.connectMarquee.institutions
  }));

  return (
    <main id="main-content" className="landing-page flex flex-col gap-10 pb-12 md:gap-16 md:pb-18">
      <Reveal>
        <section className="hero-freeform hero-home">
          <div className="hero-freeform-inner">
            <div className="hero-home-copy">
              <span className="site-kicker">{siteCopy.home.hero.eyebrow}</span>
              <h1 className="hero-home-title">{siteCopy.home.hero.title}</h1>
              <p className="hero-home-body">{siteCopy.home.hero.body}</p>

            <div className="hero-home-cta">
                <div className="hero-email-panel">
                  <HeroWaitlistForm ctaLabel={siteCopy.home.hero.primaryCta.label} />
                </div>
              </div>
            </div>

            <Reveal className="hero-home-visual home-visual-reveal" delayMs={90}>
              <ProductHeroVisual />
            </Reveal>
          </div>

          <div className="hero-home-marquee-shell">
            <div className="site-shell hero-home-marquee-inner">
              <p className="hero-home-marquee-label">{siteCopy.home.connectMarquee.label}</p>
              <div className="hero-home-marquee" aria-label="Supported account connections">
                <div className="hero-home-marquee-track">
                  {marqueeInstitutionSets.map((set, setIndex) => (
                    <div
                      key={set.id}
                      className="hero-home-marquee-set"
                      aria-hidden={setIndex > 0}
                    >
                      {set.institutions.map((institution) => (
                        <div
                          key={`${set.id}-${institution.name}`}
                          className="hero-home-marquee-item"
                          aria-label={`${institution.name} ${institution.descriptor}`}
                        >
                          <InstitutionLogo name={institution.name} />
                          <strong>{institution.name}</strong>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <section className="home-signature-band" aria-labelledby="home-signature-title" data-nav-theme="dark">
        <div className="site-shell home-signature-shell">
          <div className="home-signature-heading">
            <span className="home-dark-kicker">{siteCopy.home.signatureFeatures.eyebrow}</span>
            <h2 className="home-section-title home-section-title-dark" id="home-signature-title">
              {siteCopy.home.signatureFeatures.title}
            </h2>
            <p className="home-section-body home-section-body-dark">{siteCopy.home.signatureFeatures.body}</p>
          </div>

          <div className="home-signature-grid">
            {siteCopy.home.signatureFeatures.cards.map((card) => (
              <SignatureFeatureCard key={card.id} card={card} />
            ))}
          </div>
        </div>
      </section>

      <ScrollFeatureShowcase
        steps={siteCopy.home.walkthrough.steps}
      />

      <section className="home-trust-band" aria-labelledby="home-trust-title" data-nav-theme="dark">
        <div className="site-shell home-trust-shell">
          <div className="home-trust-copy">
            <span className="home-dark-kicker">{siteCopy.home.trustBridge.eyebrow}</span>
            <h2 className="home-section-title home-section-title-dark" id="home-trust-title">
              {siteCopy.home.trustBridge.title}
            </h2>
            {siteCopy.home.trustBridge.body ? (
              <p className="home-section-body home-section-body-dark">{siteCopy.home.trustBridge.body}</p>
            ) : null}
          </div>

          <div className="home-trust-stage">
            <TrustFeatureCarousel slides={siteCopy.home.trustBridge.slides} />
          </div>
        </div>
      </section>
    </main>
  );
}
