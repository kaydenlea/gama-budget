"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { mockupPreviews, type MockupPreviewSlug } from "../content/mockup-previews";
import { EmbeddedPreviewFrame } from "./ProductVisuals";

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
    <EmbeddedPreviewFrame
      className={joinClasses("home-walkthrough-preview-frame", isActive && "home-walkthrough-preview-frame-active")}
      previewSlug={previewSlug}
      title={`Gama ${previewSlug} walkthrough preview`}
    />
  );
}

function MobileWalkthroughPreviewPhone({ previewSlug }: { previewSlug: MockupPreviewSlug }) {
  return (
    <div className="device-shell device-shell-framed home-walkthrough-device-shell-mobile" aria-hidden="true">
      <div className="device-frame">
        <div className="device-screen-wrap" style={{ background: mockupPreviews[previewSlug].background }}>
          <EmbeddedPreviewFrame
            className="device-iframe"
            eager
            previewSlug={previewSlug}
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
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasPrimedDesktopPreviews] = useState(true);
  const regionRef = useRef<HTMLDivElement | null>(null);
  const activeIndexRef = useRef(0);
  const scrollProgressRef = useRef(0);
  const boundsRef = useRef({ top: 0, scrollableDistance: 1 });

  activeIndexRef.current = activeIndex;
  scrollProgressRef.current = scrollProgress;

  useEffect(() => {
    const desktopQuery = window.matchMedia(DESKTOP_BREAKPOINT_QUERY);

    const syncViewport = () => {
      setIsDesktopViewport(desktopQuery.matches);
    };

    syncViewport();
    desktopQuery.addEventListener("change", syncViewport);

    return () => {
      desktopQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  useEffect(() => {
    if (steps.length === 0) {
      return;
    }

    const desktopQuery = window.matchMedia(DESKTOP_BREAKPOINT_QUERY);
    let frame = 0;
    let resizeObserver: ResizeObserver | null = null;

    const measure = () => {
      const region = regionRef.current;

      if (!region) {
        return;
      }

      const rect = region.getBoundingClientRect();

      boundsRef.current = {
        top: window.scrollY + rect.top,
        scrollableDistance: Math.max(region.offsetHeight - window.innerHeight, 1),
      };
    };

    const updateDesktopStep = () => {
      if (!desktopQuery.matches) {
        return;
      }

      measure();
      const { top, scrollableDistance } = boundsRef.current;
      const consumed = Math.min(Math.max(window.scrollY - top, 0), scrollableDistance);
      const progress = consumed / scrollableDistance;
      const nextIndex = Math.min(steps.length - 1, Math.round(progress * Math.max(steps.length - 1, 1)));

      if (Math.abs(progress - scrollProgressRef.current) > 0.01) {
        setScrollProgress(progress);
      }

      if (nextIndex !== activeIndexRef.current) {
        setActiveIndex(nextIndex);
      }
    };

    const requestUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateDesktopStep);
    };

    const handleResize = () => {
      measure();
      requestUpdate();
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

    const viewportObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry?.isIntersecting) {
          measure();
          requestUpdate();
        }
      },
      { rootMargin: "200% 0px" }
    );

    const region = regionRef.current;

    if (region) {
      viewportObserver.observe(region);
      resizeObserver = new ResizeObserver(() => {
        measure();
        requestUpdate();
      });
      resizeObserver.observe(region);
    }

    measure();
    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", handleResize);
    desktopQuery.addEventListener("change", handleBreakpointChange);

    return () => {
      cancelAnimationFrame(frame);
      viewportObserver.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", handleResize);
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
        {isDesktopViewport ? (
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

                <div className="home-walkthrough-device-stage">
                  <div className="home-walkthrough-device-card">
                    <div className="home-walkthrough-device-viewport">
                      <div className="home-walkthrough-device-shell" aria-hidden="true">
                        {hasPrimedDesktopPreviews
                          ? steps.map((step, index) => (
                              <WalkthroughPreview
                                key={step.id}
                                isActive={index === activeIndex}
                                previewSlug={step.previewSlug}
                              />
                            ))
                          : (
                              <WalkthroughPreview
                                key={activeStep.id}
                                isActive
                                previewSlug={activeStep.previewSlug}
                              />
                            )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="home-walkthrough-mobile-list" role="list" aria-label="Product walkthrough steps">
            {steps.map((step) => (
              <article key={step.id} className="home-walkthrough-mobile-card" role="listitem">
                <div className="home-walkthrough-mobile-copy">
                  <span className="home-walkthrough-step-index">{step.stepLabel}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>

                <div className="home-walkthrough-mobile-device">
                  <div className="home-walkthrough-device-card home-walkthrough-device-card-mobile">
                    <div className="home-walkthrough-device-viewport home-walkthrough-device-viewport-mobile">
                      <MobileWalkthroughPreviewPhone previewSlug={step.previewSlug} />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
