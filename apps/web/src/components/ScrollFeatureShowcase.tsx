"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { mockupPreviews, type MockupPreviewSlug } from "../content/mockup-previews";
import { EmbeddedPreviewFrame, PreviewFramePreloader } from "./ProductVisuals";

type ShowcaseStep = {
  id: string;
  stepLabel: string;
  eyebrow: string;
  title: string;
  body: string;
  previewSlug: MockupPreviewSlug;
  highlights: readonly string[];
};

const DESKTOP_BREAKPOINT_QUERY = "(min-width: 920px)";

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function WalkthroughPreview({
  onReady,
  previewSlug
}: {
  onReady?: () => void;
  previewSlug: MockupPreviewSlug;
}) {
  return (
    <EmbeddedPreviewFrame
      className="home-walkthrough-preview-frame home-walkthrough-preview-frame-active"
      eager
      motion="static"
      {...(onReady ? { onLoad: onReady } : {})}
      previewSlug={previewSlug}
      suspendWhenOffscreen={false}
      title={`Gama ${previewSlug} walkthrough preview`}
      variant="walkthrough"
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
            motion="static"
            previewSlug={previewSlug}
            suspendWhenOffscreen={false}
            title={`Gama ${previewSlug} mobile walkthrough preview`}
            variant="walkthrough"
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
  const [allPreviewsReady, setAllPreviewsReady] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [outgoingIndex, setOutgoingIndex] = useState<number | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const regionRef = useRef<HTMLDivElement | null>(null);
  const activeIndexRef = useRef(0);
  const scrollProgressRef = useRef(0);
  const boundsRef = useRef({ top: 0, scrollableDistance: 1 });
  const ignoreScrollUntilRef = useRef(0);
  const awaitingManualActivationRef = useRef(false);
  const initialScrollYRef = useRef(0);
  const reloadProgressBaselineRef = useRef<number | null>(null);
  const desiredIndexRef = useRef(0);
  const readyIndicesRef = useRef<boolean[]>(steps.map(() => false));

  activeIndexRef.current = activeIndex;
  scrollProgressRef.current = scrollProgress;

  useEffect(() => {
    readyIndicesRef.current = steps.map(() => false);
    desiredIndexRef.current = 0;
    setAllPreviewsReady(false);
  }, [steps]);

  const commitActiveIndex = (nextIndex: number) => {
    if (nextIndex === activeIndexRef.current) {
      return;
    }

    setOutgoingIndex(activeIndexRef.current);
    setActiveIndex(nextIndex);
  };

  const handlePreviewReady = (index: number) => {
    if (readyIndicesRef.current[index]) {
      return;
    }

    readyIndicesRef.current[index] = true;

    if (readyIndicesRef.current.every(Boolean)) {
      setAllPreviewsReady(true);
    }

    if (desiredIndexRef.current === index) {
      commitActiveIndex(index);
    }
  };

  useEffect(() => {
    if (outgoingIndex === null) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setOutgoingIndex((current) => (current === outgoingIndex ? null : current));
    }, 160);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [outgoingIndex]);

  useEffect(() => {
    if (steps.length === 0) {
      return;
    }

    const desktopQuery = window.matchMedia(DESKTOP_BREAKPOINT_QUERY);
    let frame = 0;
    let resizeObserver: ResizeObserver | null = null;
    const navigationEntries = window.performance.getEntriesByType("navigation");
    const firstNavigationEntry = navigationEntries[0];
    const isReloadNavigation =
      firstNavigationEntry !== undefined &&
      "type" in firstNavigationEntry &&
      (firstNavigationEntry as PerformanceNavigationTiming).type === "reload";

    setActiveIndex(0);
    setOutgoingIndex(null);
    setScrollProgress(0);
    activeIndexRef.current = 0;
    scrollProgressRef.current = 0;
    desiredIndexRef.current = 0;
    ignoreScrollUntilRef.current = desktopQuery.matches ? Date.now() + 600 : 0;
    awaitingManualActivationRef.current = false;
    initialScrollYRef.current = window.scrollY;
    reloadProgressBaselineRef.current = null;

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

    const applyReloadDesktopState = () => {
      if (!desktopQuery.matches) {
        awaitingManualActivationRef.current = false;
        reloadProgressBaselineRef.current = null;
        return;
      }

      measure();

      const { top, scrollableDistance } = boundsRef.current;
      const end = top + scrollableDistance;
      const currentScrollY = window.scrollY;

      if (!isReloadNavigation) {
        return;
      }

      if (currentScrollY >= end - 2) {
        const lastIndex = Math.max(steps.length - 1, 0);
        setActiveIndex(lastIndex);
        setOutgoingIndex(null);
        setScrollProgress(1);
        activeIndexRef.current = lastIndex;
        scrollProgressRef.current = 1;
        desiredIndexRef.current = lastIndex;
        awaitingManualActivationRef.current = false;
        reloadProgressBaselineRef.current = null;
        return;
      }

      if (currentScrollY > top + 2) {
        setActiveIndex(0);
        setOutgoingIndex(null);
        setScrollProgress(0);
        activeIndexRef.current = 0;
        scrollProgressRef.current = 0;
        desiredIndexRef.current = 0;
        awaitingManualActivationRef.current = true;
        initialScrollYRef.current = currentScrollY;
      }
    };

    const updateDesktopStep = () => {
      const region = regionRef.current;

      if (!region || window.getComputedStyle(region).display === "none") {
        return;
      }

      if (!allPreviewsReady) {
        return;
      }

      measure();
      const { top, scrollableDistance } = boundsRef.current;
      let progressStart = top;
      let progressDistance = scrollableDistance;

      if (reloadProgressBaselineRef.current !== null) {
        if (window.scrollY <= top + 2) {
          reloadProgressBaselineRef.current = null;
        } else {
          progressStart = Math.max(top, reloadProgressBaselineRef.current);
          progressDistance = Math.max(scrollableDistance - (progressStart - top), 1);
        }
      }

      const consumed = Math.min(Math.max(window.scrollY - progressStart, 0), progressDistance);
      const progress = consumed / progressDistance;
      const nextIndex = Math.min(steps.length - 1, Math.floor(progress * Math.max(steps.length, 1)));
      desiredIndexRef.current = nextIndex;

      if (Math.abs(progress - scrollProgressRef.current) > 0.005) {
        setScrollProgress(progress);
      }

      if (allPreviewsReady && readyIndicesRef.current[nextIndex]) {
        commitActiveIndex(nextIndex);
      }
    };

    const requestUpdate = () => {
      if (Date.now() < ignoreScrollUntilRef.current) {
        return;
      }

      if (awaitingManualActivationRef.current) {
        return;
      }

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateDesktopStep);
    };

    const handleResize = () => {
      measure();
      requestUpdate();
    };

    const handleBreakpointChange = () => {
      if (!desktopQuery.matches) {
        awaitingManualActivationRef.current = false;
        reloadProgressBaselineRef.current = null;

        if (activeIndexRef.current !== 0) {
          setActiveIndex(0);
        }

        setScrollProgress(0);
      } else {
        applyReloadDesktopState();
      }

      requestUpdate();
    };

    const handleScroll = () => {
      if (awaitingManualActivationRef.current) {
        if (Math.abs(window.scrollY - initialScrollYRef.current) <= 2) {
          return;
        }

        awaitingManualActivationRef.current = false;
        reloadProgressBaselineRef.current = window.scrollY;
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
    applyReloadDesktopState();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    desktopQuery.addEventListener("change", handleBreakpointChange);

    return () => {
      cancelAnimationFrame(frame);
      viewportObserver.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      desktopQuery.removeEventListener("change", handleBreakpointChange);
    };
  }, [allPreviewsReady, steps.length]);

  if (steps.length === 0) {
    return null;
  }

  const activeStep = (steps[activeIndex] ?? steps[0])!;
  const desktopStepCount = Math.max(steps.length - 1, 0);
  const progressDisplay = `${activeIndex + 1}/${steps.length}`;
  return (
    <section className="home-walkthrough-band" aria-label="Product walkthrough">
      <div className="site-shell home-walkthrough-shell">
        <div aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", pointerEvents: "none" }}>
          {steps.map((step) => (
            <PreviewFramePreloader
              key={`preload-${step.id}`}
              motion="static"
              previewSlug={step.previewSlug}
              variant="walkthrough"
            />
          ))}
        </div>
        <div
          ref={regionRef}
          className="home-walkthrough-desktop-region"
          style={
            {
              "--walkthrough-progress-segments": steps.length,
              "--walkthrough-step-count": desktopStepCount,
              "--walkthrough-step-span": "92vh",
            } as CSSProperties
          }
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
                      {steps.map((step, index) => {
                        const segmentCount = Math.max(steps.length, 1);
                        const segmentFill = Math.min(Math.max(scrollProgress * segmentCount - index, 0), 1);
                        const isActive = segmentFill > 0;

                        return (
                          <span
                            key={step.id}
                            aria-hidden="true"
                            className={joinClasses(
                              "home-walkthrough-progress-segment",
                              isActive && "home-walkthrough-progress-segment-active",
                              index === activeIndex && "home-walkthrough-progress-segment-current",
                            )}
                          >
                            <span
                              className="home-walkthrough-progress-segment-fill"
                              style={{ transform: `scaleX(${segmentFill})` }}
                            />
                          </span>
                        );
                      })}
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
                      <div className="home-walkthrough-preview-mask">
                        {steps.map((step, index) => (
                          <div
                            key={step.id}
                            className={joinClasses(
                              "home-preview-layer",
                              index === activeIndex && "home-preview-layer-active",
                              index === outgoingIndex && "home-preview-layer-outgoing",
                            )}
                            style={{ background: mockupPreviews[step.previewSlug].background }}
                          >
                            <WalkthroughPreview onReady={() => handlePreviewReady(index)} previewSlug={step.previewSlug} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
      </div>
    </section>
  );
}
