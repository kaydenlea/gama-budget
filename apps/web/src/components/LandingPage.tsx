import { siteCopy } from "../content/site-copy";
import { HeroWaitlistForm } from "./HeroWaitlistForm";
import { MockupPreviewPhone, ProductHeroVisual } from "./ProductVisuals";
import { ScrollFeatureShowcase } from "./ScrollFeatureShowcase";
import { TrustFeatureCarousel } from "./TrustFeatureCarousel";
import { ViewportMotionGate } from "./ViewportMotionGate";

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

function EventTimelineSignatureVisual() {
  const events = [
    {
      id: "date-night",
      accent: "orange",
      date: "Friday, Nov 3",
      title: "Date Night",
      category: "Leisure",
      total: "$185.50",
      marker: "\uD83C\uDF74",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA6L7nZ1OcDxaCoF2jFrNhkBztoURLP4wMjOk4CZJwP8rFlpEd7VeHIzxh8rvyCucy7tX_BghnLgPEEdC9cp2bawHjY8enAPdYSqF04c3YOzFxgVzqDcpYvAYKfqASwGywJibOUV6iURhfaExF2yDDnLhOEJMEGrkXDPgW4FB4DM_TKkZggTLORyUgdX4xn0G49HrsUaf4x-LGWlNOj93sy_QxoBbMCPpyQ4DccESj77vOUpVeZIYjyJYJc20KYy41JVG34ncReoZDI",
      imageAlt: "Restaurant interior",
      spends: [
        { icon: "\uD83C\uDF74", value: "$120.00" },
        { icon: "\uD83D\uDE97", value: "$25.50" }
      ]
    },
    {
      id: "japan-trip",
      accent: "blue",
      date: "Dec 12 - Dec 24",
      title: "Japan Trip",
      category: "Travel",
      total: "$2,450",
      marker: "\u2708\uFE0F",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD6JPiehLdolYJGnj_3S9vm0TiuSH93Pff3B7rkoK7LhAev1q22M0stGG7Zs8XzCEn5G5GXuR-_slA5rAPagyuIF6SytiIWlOqjPDNdiRH5o-9aAqA_uA3llcFKsAHSyC2xpNjz1hhgatxmRMFlLYM_BJdJ3wOG1fECOYQgpTF-vxfCwC4THF9khsJ_dECN6tw6tUiiH42I38c4kiYBBnSSjedG1QBOrFRXOAcasSDzoovxXAXOlgOtAIHuJ1Z_sPjYZCVLpwj9w7ji",
      imageAlt: "Mount Fuji",
      spends: [
        { icon: "\u2708\uFE0F", value: "$850.00" },
        { icon: "\uD83C\uDF63", value: "$400.00" }
      ]
    },
    {
      id: "monthly-rent",
      accent: "green",
      date: "Nov 01",
      title: "Monthly Rent",
      category: "Home",
      total: "$1,850",
      marker: "\uD83C\uDFE0",
      image:
        "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=900&q=80",
      imageAlt: "Apartment building interior",
      spends: [
        { icon: "\uD83C\uDFE0", value: "$1,850" },
        { icon: "\u26A1\uFE0F", value: "$124" }
      ]
    },
    {
      id: "market-run",
      accent: "green",
      date: "Jan 06",
      title: "Saturday Market",
      category: "Groceries",
      total: "$64.80",
      marker: "\uD83C\uDF3F",
      image:
        "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=900&q=80",
      imageAlt: "Farmers market produce",
      spends: [
        { icon: "\uD83E\uDD6C", value: "$38.20" },
        { icon: "\u2615", value: "$6.40" }
      ]
    }
  ] as const;

  return (
    <div className="home-signature-event-timeline" aria-hidden="true">
      <div className="home-signature-event-stage">
        <div className="home-signature-event-viewport">
          <div className="home-signature-event-plane">
          <div className="home-signature-event-list">
            <div className="home-signature-event-line" />
            {events.map((event) => (
              <div className="home-signature-event-item" key={event.id}>
                <span className={`home-signature-event-marker home-signature-event-marker-${event.accent}`}>
                  {event.marker}
                </span>
                <div className="home-signature-event-card">
                  <img alt={event.imageAlt} src={event.image} />
                  <div className="home-signature-event-card-body">
                    <div className="home-signature-event-meta">
                      <div className="home-signature-event-main">
                        <span className="home-signature-event-date">{event.date}</span>
                        <div className="home-signature-event-title-row">
                          <strong>{event.title}</strong>
                          <span className={`home-signature-event-chip home-signature-event-chip-${event.accent}`}>
                            {event.category}
                          </span>
                        </div>
                      </div>
                      <div className="home-signature-event-total">
                        <strong>{event.total}</strong>
                        <span>Total Spent</span>
                      </div>
                    </div>
                    <div className="home-signature-event-spends">
                      {event.spends.map((spend) => (
                        <span key={`${event.id}-${spend.value}`}>
                          <span className="home-signature-event-spend-icon" aria-hidden="true">
                            {spend.icon}
                          </span>
                          <strong>{spend.value}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

function PlaceContextSignatureVisual() {
  const popupActions = [
    { id: "share", label: "Share" },
    { id: "favorite", label: "Favorite" }
  ] as const;

  const locations = [
    {
      id: "flight",
      tone: "travel",
      title: "SFO Terminal A",
      category: "Travel",
      date: "NOV 11",
      amount: "$412.00",
      icon: "\u2708\uFE0F"
    },
    {
      id: "dining",
      tone: "dining",
      title: "Sushi Zen Ginza",
      category: "Dining",
      date: "NOV 14",
      amount: "$86.40",
      icon: "\uD83C\uDF71"
    },
    {
      id: "grocery",
      tone: "grocery",
      title: "Corner Market",
      category: "Groceries",
      date: "NOV 16",
      amount: "$42.18",
      icon: "\uD83D\uDED2"
    }
  ] as const;

  return (
    <div className="home-signature-map-visual" aria-hidden="true">
      <div className="home-signature-map-background">
        <div className="home-signature-map-background-camera">
          <svg className="home-signature-map-grid" viewBox="-220 -220 840 1240" preserveAspectRatio="xMidYMid slice">
            <path d="M -260 -80 L 700 80" fill="none" opacity="0.18" stroke="#CBD5E1" strokeWidth="5" />
            <path d="M -260 180 L 700 340" fill="none" opacity="0.26" stroke="#CBD5E1" strokeWidth="6" />
            <path d="M -260 600 L 700 720" fill="none" opacity="0.2" stroke="#CBD5E1" strokeWidth="5" />
            <path d="M -260 860 L 700 980" fill="none" opacity="0.18" stroke="#CBD5E1" strokeWidth="5" />
          </svg>
          <div className="home-signature-map-background-overlay" />
        </div>
      </div>
      <div className="home-signature-map-frame">
        <div className="home-signature-map-surface">
          <div className="home-signature-map-camera">
            <svg className="home-signature-map-grid" viewBox="-220 -220 840 1240" preserveAspectRatio="xMidYMid slice">
              <path d="M -260 -80 L 700 80" fill="none" opacity="0.2" stroke="#CBD5E1" strokeWidth="5" />
              <path d="M -260 180 L 700 340" fill="none" opacity="0.3" stroke="#CBD5E1" strokeWidth="6" />
              <path d="M -260 600 L 700 720" fill="none" opacity="0.24" stroke="#CBD5E1" strokeWidth="5" />
              <path d="M -260 860 L 700 980" fill="none" opacity="0.22" stroke="#CBD5E1" strokeWidth="5" />
            </svg>
            <div className="home-signature-map-overlay" />

            {locations.map((location) => (
              <div
                key={location.id}
                className={joinClasses(
                  "home-signature-map-location",
                  `home-signature-map-location-${location.id}`,
                  `home-signature-map-location-${location.tone}`
                )}
              >
                <div className="home-signature-map-popup">
                  <div className="home-signature-map-popup-head">
                    <div>
                      <strong>{location.title}</strong>
                      <div className="home-signature-map-popup-meta">
                        <span>{location.category}</span>
                        <span>{location.date}</span>
                      </div>
                    </div>
                    <span className="home-signature-map-popup-amount">{location.amount}</span>
                  </div>
                  <div className="home-signature-map-popup-actions">
                    {popupActions.map((action) => (
                      <span key={`${location.id}-${action.id}`}>
                        <span className={`home-signature-map-popup-action-icon home-signature-map-popup-action-icon-${action.id}`} aria-hidden="true">
                          {action.id === "share" ? (
                            <svg viewBox="0 0 20 20">
                              <path
                                d="M7.4 10.1H12.6M11.1 6.6L14.6 10.1L11.1 13.6M5.7 15.2C4.8 15.2 4.1 14.5 4.1 13.6V6.4C4.1 5.5 4.8 4.8 5.7 4.8H8.6"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.7"
                              />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 20 20">
                              <path
                                d="M10 15.7L8.9 14.7C5.2 11.3 3 9.2 3 6.6C3 4.7 4.5 3.2 6.4 3.2C7.5 3.2 8.6 3.7 9.3 4.6L10 5.4L10.7 4.6C11.4 3.7 12.5 3.2 13.6 3.2C15.5 3.2 17 4.7 17 6.6C17 9.2 14.8 11.3 11.1 14.7L10 15.7Z"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.6"
                              />
                            </svg>
                          )}
                        </span>
                        {action.label}
                      </span>
                    ))}
                  </div>
                  <div className="home-signature-map-popup-tail" />
                </div>

                <div className="home-signature-map-marker-wrap">
                  <span className="home-signature-map-click-pulse" />
                  <div className="home-signature-map-active-pin-ring">
                    <span className="home-signature-map-active-pin">
                      <span className="home-signature-map-active-pin-emoji">{location.icon}</span>
                    </span>
                  </div>
                  <span className="home-signature-map-selected">Selected</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

async function SignatureFeatureCard({ card }: { card: HomeSignatureFeatureCard }) {
  const cardId = card.id;
  const previewSlug = card.previewSlug;

  return (
    <article
      className={joinClasses(
        "home-signature-card",
        `home-signature-card-${card.id}`
      )}
    >
      <ViewportMotionGate className="home-signature-card-device-window" rootMargin="28% 0px">
        {cardId === "overview-timeline" ? (
          <EventTimelineSignatureVisual />
        ) : cardId === "map-context" ? (
          <PlaceContextSignatureVisual />
        ) : cardId === "money-stories" ? (
          <MockupPreviewPhone
            className={joinClasses("home-signature-card-phone", "home-signature-card-phone-money-stories")}
            preview={previewSlug}
          />
        ) : cardId === "receipt-recap" ? (
          <MockupPreviewPhone
            className={joinClasses(
              "home-signature-card-phone",
              "home-signature-card-phone-money-stories",
              "home-signature-card-phone-receipt-recap"
            )}
            preview={previewSlug}
            variant="framed"
          />
        ) : (
          <MockupPreviewPhone
            className={joinClasses("home-signature-card-phone", `home-signature-card-phone-${cardId}`)}
            preview={previewSlug}
          />
        )}
      </ViewportMotionGate>

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
  );
}

export async function LandingPage() {
  const marqueeInstitutionSets = Array.from({ length: 3 }, (_, index) => ({
    id: `set-${index}`,
    institutions: siteCopy.home.connectMarquee.institutions
  }));

  return (
    <main id="main-content" className="landing-page flex flex-col gap-10 pb-12 md:gap-16 md:pb-18">
      <section className="hero-freeform hero-home">
          <div className="hero-freeform-inner">
            <div className="hero-home-copy">
              <span className="site-kicker">{siteCopy.home.hero.eyebrow}</span>
              <h1 className="hero-home-title">{siteCopy.home.hero.title}</h1>
              <p className="hero-home-body">{siteCopy.home.hero.body}</p>

              <ViewportMotionGate className="hero-home-cta" rootMargin="40% 0px">
                <div id="hero-waitlist-cta">
                  <div className="hero-email-panel">
                    <HeroWaitlistForm ctaLabel={siteCopy.home.hero.primaryCta.label} />
                  </div>
                </div>
              </ViewportMotionGate>
            </div>

            <ViewportMotionGate className="hero-home-visual" rootMargin="35% 0px">
              <ProductHeroVisual />
            </ViewportMotionGate>
          </div>

          <ViewportMotionGate className="hero-home-marquee-shell" rootMargin="20% 0px">
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
          </ViewportMotionGate>
      </section>

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
