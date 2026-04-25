"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { mockupPreviews, type MockupPreviewSlug } from "../content/mockup-previews";
import { Reveal } from "./Reveal";

type ShowcaseStep = {
  id: string;
  stepLabel: string;
  eyebrow: string;
  title: string;
  body: string;
  previewSlug: MockupPreviewSlug;
  highlights: readonly string[];
};

const DESKTOP_BREAKPOINT_QUERY = "(min-width: 960px)";

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function WalkthroughPreview({
  isActive,
  previewSlug
}: {
  isActive?: boolean;
  previewSlug: MockupPreviewSlug;
}) {
  return (
    <iframe
      className={joinClasses("home-walkthrough-preview-frame", isActive && "home-walkthrough-preview-frame-active")}
      loading="eager"
      sandbox=""
      scrolling="no"
      src={`/preview/${previewSlug}`}
      tabIndex={-1}
      title={`Gama ${previewSlug} walkthrough preview`}
    />
  );
}

function MobileWalkthroughPreviewPhone({ previewSlug }: { previewSlug: MockupPreviewSlug }) {
  return (
    <div className="device-shell device-shell-framed home-walkthrough-device-shell-mobile" aria-hidden="true">
      <div className="device-frame">
        <div className="device-screen-wrap" style={{ background: mockupPreviews[previewSlug].background }}>
          <iframe
            className="device-iframe"
            loading="eager"
            sandbox=""
            scrolling="no"
            src={`/preview/${previewSlug}`}
            tabIndex={-1}
            title={`Gama ${previewSlug} mobile walkthrough preview`}
          />
        </div>
      </div>
    </div>
  );
}

export function ScrollFeatureShowcase({
  steps
}: {
  steps: readonly ShowcaseStep[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const regionRef = useRef<HTMLDivElement | null>(null);
  const activeIndexRef = useRef(0);

  activeIndexRef.current = activeIndex;

  useEffect(() => {
    if (steps.length === 0) {
      return;
    }

    const desktopQuery = window.matchMedia(DESKTOP_BREAKPOINT_QUERY);
    let frame = 0;

    const updateDesktopStep = () => {
      const region = regionRef.current;

      if (!region || !desktopQuery.matches) {
        return;
      }

      const rect = region.getBoundingClientRect();
      const scrollableDistance = Math.max(region.offsetHeight - window.innerHeight, 1);
      const consumed = Math.min(Math.max(-rect.top, 0), scrollableDistance);
      const progress = consumed / scrollableDistance;
      const nextIndex = Math.min(steps.length - 1, Math.round(progress * Math.max(steps.length - 1, 1)));

      setScrollProgress(progress);

      if (nextIndex !== activeIndexRef.current) {
        setActiveIndex(nextIndex);
      }
    };

    const requestUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateDesktopStep);
    };

    const handleBreakpointChange = () => {
      if (!desktopQuery.matches) {
        if (activeIndexRef.current !== 0) {
          setActiveIndex(0);
        }

        setScrollProgress(0);
      }

      requestUpdate();
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    desktopQuery.addEventListener("change", handleBreakpointChange);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      desktopQuery.removeEventListener("change", handleBreakpointChange);
    };
  }, [steps.length]);

  if (steps.length === 0) {
    return null;
  }

  const activeStep = (steps[activeIndex] ?? steps[0])!;
  const desktopStepCount = Math.max(steps.length - 1, 0);
  const progressDisplay = `${activeIndex + 1}/${steps.length}`;

  return (
    <section className="home-walkthrough-band" aria-label="Product walkthrough">
      <div className="site-shell home-walkthrough-shell">
        <div
          ref={regionRef}
          className="home-walkthrough-desktop-region"
          style={{ "--walkthrough-step-count": desktopStepCount } as CSSProperties}
        >
          <div className="home-walkthrough-desktop-sticky">
            <div className="home-walkthrough-desktop-layout">
              <div className="home-walkthrough-copy-stage">
                <div className="home-walkthrough-copy-panel">
                  <div className="home-walkthrough-progress-meta" aria-label="Walkthrough progress">
                    <div className="home-walkthrough-progress-head">
                      <span className="home-walkthrough-progress-count">{progressDisplay}</span>
                      <span className="home-walkthrough-progress-title">{activeStep.eyebrow}</span>
                    </div>
                    <div className="home-walkthrough-progress-track" aria-hidden="true">
                      <span
                        className="home-walkthrough-progress-fill"
                        style={{ transform: `scaleX(${scrollProgress})` }}
                      />
                    </div>
                  </div>

                  <article key={activeStep.id} className="home-walkthrough-copy-card" aria-live="polite">
                    <span className="home-walkthrough-step-index">{activeStep.stepLabel}</span>
                    <h3>{activeStep.title}</h3>
                    <p>{activeStep.body}</p>

                    <ul className="home-walkthrough-step-highlights">
                      {activeStep.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                  </article>
                </div>
              </div>

              <Reveal className="home-walkthrough-device-stage home-visual-reveal" delayMs={100}>
                <div className="home-walkthrough-device-card">
                  <div className="home-walkthrough-device-viewport">
                    <div className="home-walkthrough-device-shell" aria-hidden="true">
                      {steps.map((step, index) => (
                        <WalkthroughPreview key={step.id} isActive={index === activeIndex} previewSlug={step.previewSlug} />
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        <div className="home-walkthrough-mobile-list" role="list" aria-label="Product walkthrough steps">
          {steps.map((step) => (
            <article key={step.id} className="home-walkthrough-mobile-card" role="listitem">
              <div className="home-walkthrough-mobile-copy">
                <span className="home-walkthrough-step-index">{step.stepLabel}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>

              <Reveal className="home-walkthrough-mobile-device home-visual-reveal" delayMs={80}>
                <div className="home-walkthrough-device-card home-walkthrough-device-card-mobile">
                  <div className="home-walkthrough-device-viewport home-walkthrough-device-viewport-mobile">
                    <MobileWalkthroughPreviewPhone previewSlug={step.previewSlug} />
                  </div>
                </div>
              </Reveal>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
