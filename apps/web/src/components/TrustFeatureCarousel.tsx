"use client";

import { useCallback, useEffect, useState } from "react";
import type { MockupPreviewSlug } from "../content/mockup-previews";
import { EmbeddedPreviewFrame } from "./ProductVisuals";

type TrustSlide = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  icon: "privacy" | "share" | "review" | "add";
  previewSlug: MockupPreviewSlug;
};

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function TrustIcon({ icon }: { icon: TrustSlide["icon"] }) {
  if (icon === "privacy") {
    return (
      <svg aria-hidden="true" className="home-trust-slide-icon-svg" viewBox="0 0 20 20">
        <path
          d="M10 2.9L15.2 5V9.9C15.2 13.3 13.1 16.3 10 17.6C6.9 16.3 4.8 13.3 4.8 9.9V5L10 2.9Z"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.55"
        />
        <path d="M8.2 9.6L9.5 10.9L12.3 8.1" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" />
      </svg>
    );
  }

  if (icon === "share") {
    return (
      <svg aria-hidden="true" className="home-trust-slide-icon-svg" viewBox="0 0 20 20">
        <path d="M6.2 10.1H13.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" />
        <path d="M10.8 6.2L14.7 10.1L10.8 14" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.55" />
        <path d="M5.3 14.9C4.6 14.9 4 14.3 4 13.6V6.4C4 5.7 4.6 5.1 5.3 5.1H8.1" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" />
      </svg>
    );
  }

  if (icon === "review") {
    return (
      <svg aria-hidden="true" className="home-trust-slide-icon-svg" viewBox="0 0 20 20">
        <path d="M5.2 5.4H14.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" />
        <path d="M5.2 9.4H11.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" />
        <path d="M5.2 13.4H10.6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" />
        <path d="M12.8 13.1L14.4 14.7L17 11.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.55" />
      </svg>
    );
  }

  if (icon === "add") {
    return (
      <svg aria-hidden="true" className="home-trust-slide-icon-svg" viewBox="0 0 20 20">
        <path
          d="M10 17C13.9 17 17 13.9 17 10C17 6.1 13.9 3 10 3C6.1 3 3 6.1 3 10C3 13.9 6.1 17 10 17Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.55"
        />
        <path d="M10 6.8V13.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" />
        <path d="M6.8 10H13.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="home-trust-slide-icon-svg" viewBox="0 0 20 20">
      <path d="M10 4.2V10.1L13.5 12.3" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.55" />
      <path
        d="M10 17C13.9 17 17 13.9 17 10C17 6.1 13.9 3 10 3C6.1 3 3 6.1 3 10C3 13.9 6.1 17 10 17Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.55"
      />
    </svg>
  );
}

export function TrustFeatureCarousel({ slides }: { slides: readonly TrustSlide[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

  const handleDisplayedPreviewChange = useCallback((previewSlug: MockupPreviewSlug) => {
    const nextDisplayedIndex = slides.findIndex((slide) => slide.previewSlug === previewSlug);

    if (nextDisplayedIndex >= 0) {
      setDisplayedIndex(nextDisplayedIndex);
    }
  }, [slides]);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    let timeoutId: number | undefined;
    let cancelled = false;

    const schedule = () => {
      timeoutId = window.setTimeout(() => {
        if (cancelled) return;
        setActiveIndex((current) => (current + 1) % slides.length);
        setAnimationKey((k) => k + 1);
        schedule();
      }, 5200);
    };

    schedule();

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && !cancelled) {
        if (timeoutId !== undefined) window.clearTimeout(timeoutId);
        schedule();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [slides.length]);

  if (slides.length === 0) {
    return null;
  }

  const activeSlide = (slides[activeIndex] ?? slides[0])!;
  const displayedSlide = (slides[displayedIndex] ?? activeSlide)!;

  return (
    <div className="home-trust-carousel" aria-label="Trust highlights">
      <div className="home-trust-carousel-tabs" aria-label="Trust features">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            aria-label={`Show ${slide.eyebrow}`}
            aria-pressed={index === activeIndex}
            className={joinClasses("home-trust-carousel-tab", index === activeIndex && "home-trust-carousel-tab-active")}
            onClick={() => { setActiveIndex(index); setAnimationKey((k) => k + 1); }}
            type="button"
          >
            {index === activeIndex && (
              <span key={animationKey} className="home-trust-carousel-tab-progress" aria-hidden="true" />
            )}
            <span className="home-trust-carousel-tab-icon">
              <TrustIcon icon={slide.icon} />
            </span>
            <span>{slide.eyebrow}</span>
          </button>
        ))}
      </div>

      <div className="home-trust-carousel-stage">
        <div className="home-trust-slide home-trust-slide-active">
          <div key={displayedSlide.id} className="home-trust-slide-copy">
            <div className="home-trust-slide-eyebrow-row">
              <span className="home-trust-slide-icon">
                <TrustIcon icon={displayedSlide.icon} />
              </span>
              <span className="home-trust-slide-kicker">{displayedSlide.eyebrow}</span>
            </div>
            <h3>{displayedSlide.title}</h3>
            <p>{displayedSlide.body}</p>
          </div>

          <div className="home-trust-slide-device-wrap" aria-hidden="true">
            <div className="home-walkthrough-device-card home-trust-slide-device-card">
              <div className="home-walkthrough-device-viewport home-trust-slide-device-viewport">
                <div className="home-walkthrough-device-shell">
                  <div className="home-walkthrough-preview-mask">
                    <EmbeddedPreviewFrame
                      className="home-walkthrough-preview-frame home-walkthrough-preview-frame-active home-trust-preview-frame"
                      onActivePreviewChange={handleDisplayedPreviewChange}
                      previewSlug={activeSlide.previewSlug}
                      title={`Gama ${activeSlide.previewSlug} trust preview`}
                      variant="trust"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
