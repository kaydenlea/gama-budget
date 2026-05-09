"use client";

import { MetricChip } from "@gama/ui-web";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { siteCopy } from "../content/site-copy";
import { mockupPreviews, type MockupPreviewSlug } from "../content/mockup-previews";

type StoryScene = (typeof siteCopy.shared.storyScenes)[number];
type MockupPreviewCrop = "events" | "eventDetails" | "storiesSignature";
type PreviewMotionMode = "active" | "static";
type PreviewVariant = "framed" | "trust" | "walkthrough";
const PREVIEW_BUST = "20260508-06";
const PREVIEW_FADE_MS = 360;
const PREVIEW_READY_MESSAGE = "gama-preview-ready";

type PreviewFrameStatus = "active" | "incoming" | "outgoing";

type PreviewFrameState = {
  id: number;
  ready: boolean;
  src: string;
  status: PreviewFrameStatus;
};

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function PreviewFrameLayer({
  className,
  eager,
  frame,
  onHostLoad,
  onReady,
  title,
}: {
  className: string;
  eager: boolean;
  frame: PreviewFrameState;
  onHostLoad?: () => void;
  onReady: (id: number) => void;
  title: string;
}) {
  const hasMarkedReadyRef = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const loadFallbackIdRef = useRef<number | undefined>(undefined);
  const onHostLoadRef = useRef(onHostLoad);
  const onReadyRef = useRef(onReady);
  const readyToken = `preview-frame-${frame.id}`;

  onHostLoadRef.current = onHostLoad;
  onReadyRef.current = onReady;

  const markReady = useCallback(() => {
    if (hasMarkedReadyRef.current) {
      return;
    }

    hasMarkedReadyRef.current = true;
    onReadyRef.current(frame.id);
    onHostLoadRef.current?.();
  }, [frame.id]);

  useEffect(() => {
    hasMarkedReadyRef.current = false;

    loadFallbackIdRef.current = window.setTimeout(markReady, eager ? 4500 : 6500);

    return () => {
      if (loadFallbackIdRef.current !== undefined) {
        window.clearTimeout(loadFallbackIdRef.current);
      }
    };
  }, [eager, frame.id, frame.src, markReady]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) {
        return;
      }

      const data = event.data as { token?: string; type?: string } | null;

      if (data?.type !== PREVIEW_READY_MESSAGE || data.token !== readyToken) {
        return;
      }

      markReady();
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [markReady, readyToken]);

  return (
    <iframe
      ref={iframeRef}
      aria-label={title}
      className={joinClasses(
        className,
        "embedded-preview-frame-layer",
        frame.ready && frame.status !== "incoming" && "embedded-preview-frame-layer-visible",
        frame.status === "outgoing" && "embedded-preview-frame-layer-outgoing",
      )}
      data-preview-frame-status={frame.status}
      loading={eager ? "eager" : "lazy"}
      onLoad={() => {
        if (loadFallbackIdRef.current !== undefined) {
          window.clearTimeout(loadFallbackIdRef.current);
        }

        loadFallbackIdRef.current = window.setTimeout(markReady, eager ? 4500 : 6500);
      }}
      name={readyToken}
      sandbox="allow-scripts"
      scrolling="no"
      src={frame.src}
      tabIndex={-1}
      title={title}
    />
  );
}

export function PreviewFramePreloader({
  previewSlug,
  crop,
  motion = "active",
  variant,
}: {
  previewSlug: MockupPreviewSlug;
  crop?: MockupPreviewCrop;
  motion?: PreviewMotionMode;
  variant?: PreviewVariant;
}) {
  const src = useMemo(() => {
    const params = new URLSearchParams();

    if (crop) {
      params.set("crop", crop);
    }

    if (motion !== "active") {
      params.set("motion", motion);
    }

    if (variant) {
      params.set("variant", variant);
    }

    params.set("v", PREVIEW_BUST);
    return `/preview/${previewSlug}?${params.toString()}`;
  }, [crop, motion, previewSlug, variant]);

  return (
    <iframe
      aria-hidden="true"
      loading="eager"
      sandbox="allow-scripts"
      scrolling="no"
      src={src}
      tabIndex={-1}
      title={`Preload ${previewSlug}`}
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        opacity: 0,
        pointerEvents: "none",
        border: 0,
        inset: 0,
      }}
    />
  );
}

export function EmbeddedPreviewFrame({
  className,
  previewSlug,
  title,
  crop,
  eager = false,
  motion = "active",
  onLoad,
  onActivePreviewChange,
  rootMargin = "65% 0px",
  suspendWhenOffscreen = true,
  variant,
}: {
  className: string;
  previewSlug: MockupPreviewSlug;
  title: string;
  crop?: MockupPreviewCrop;
  eager?: boolean;
  motion?: PreviewMotionMode;
  onLoad?: () => void;
  onActivePreviewChange?: (previewSlug: MockupPreviewSlug) => void;
  rootMargin?: string;
  suspendWhenOffscreen?: boolean;
  variant?: PreviewVariant;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const nextFrameIdRef = useRef(1);
  const lastNotifiedReadySrcRef = useRef<string | null>(null);
  const [isNearViewport, setIsNearViewport] = useState(eager || !suspendWhenOffscreen);
  const src = useMemo(() => {
    const params = new URLSearchParams();

    if (crop) {
      params.set("crop", crop);
    }

    if (motion !== "active") {
      params.set("motion", motion);
    }

    if (variant) {
      params.set("variant", variant);
    }

    params.set("v", PREVIEW_BUST);
    return `/preview/${previewSlug}?${params.toString()}`;
  }, [crop, motion, previewSlug, variant]);
  const [frames, setFrames] = useState<PreviewFrameState[]>([
    {
      id: 0,
      ready: false,
      src,
      status: "active",
    },
  ]);
  const hasReadyFrame = frames.some((frame) => frame.ready && frame.status === "active");

  useEffect(() => {
    const activeReadyFrame = frames.find((frame) => frame.ready && frame.status === "active");

    if (activeReadyFrame?.src === src) {
      onActivePreviewChange?.(previewSlug);
    }
  }, [frames, onActivePreviewChange, previewSlug, src]);

  useEffect(() => {
    const activeReadyFrame = frames.find((frame) => frame.ready && frame.status === "active");

    if (!activeReadyFrame || activeReadyFrame.src !== src) {
      return;
    }

    if (lastNotifiedReadySrcRef.current === activeReadyFrame.src) {
      return;
    }

    lastNotifiedReadySrcRef.current = activeReadyFrame.src;
    onLoad?.();
  }, [frames, onLoad, src]);

  useEffect(() => {
    if (!suspendWhenOffscreen || eager) {
      setIsNearViewport(true);
      return;
    }

    const node = hostRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry?.isIntersecting) {
          setIsNearViewport(true);
        }
      },
      { rootMargin }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [eager, rootMargin, suspendWhenOffscreen]);

  useEffect(() => {
    setFrames((currentFrames) => {
      const activeFrame = currentFrames.find((frame) => frame.status === "active");

      if (
        activeFrame?.src === src ||
        currentFrames.some((frame) => frame.src === src && frame.status === "incoming")
      ) {
        return currentFrames;
      }

      return [
        ...currentFrames.filter((frame) => frame.status === "active"),
        {
          id: nextFrameIdRef.current++,
          ready: false,
          src,
          status: "incoming",
        },
      ];
    });
  }, [src]);

  useEffect(() => {
    if (isNearViewport || !suspendWhenOffscreen) {
      return;
    }

    setFrames([
      {
        id: nextFrameIdRef.current++,
        ready: false,
        src,
        status: "active",
      },
    ]);
  }, [isNearViewport, src, suspendWhenOffscreen]);

  useEffect(() => {
    if (!frames.some((frame) => frame.status === "outgoing")) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFrames((currentFrames) =>
        currentFrames.filter((frame) => frame.status !== "outgoing"),
      );
    }, PREVIEW_FADE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [frames]);

  const handleFrameReady = useCallback((id: number) => {
    setFrames((currentFrames) => {
      const readyFrame = currentFrames.find((frame) => frame.id === id);

      if (!readyFrame) {
        return currentFrames;
      }

      if (readyFrame.status === "incoming") {
        return currentFrames.map((frame) => {
          if (frame.id === id) {
            return { ...frame, ready: true, status: "active" };
          }

          if (frame.status === "active") {
            return { ...frame, status: "outgoing" };
          }

          return frame;
        });
      }

      return currentFrames.map((frame) =>
        frame.id === id ? { ...frame, ready: true } : frame,
      );
    });
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="embedded-preview-host"
      data-preview-mounted={isNearViewport ? "true" : "false"}
      data-preview-ready={hasReadyFrame ? "true" : "false"}
    >
      {isNearViewport ? (
        frames.map((frame) => (
          <PreviewFrameLayer
            key={frame.id}
            className={className}
            eager={eager}
            frame={frame}
            onReady={handleFrameReady}
            title={title}
          />
        ))
      ) : (
        <div
          aria-label={title}
          className={className}
          data-preview-placeholder="true"
          role="img"
          style={{ background: "transparent" }}
        />
      )}
    </div>
  );
}

function DeviceShell({
  className,
  crop,
  eager = false,
  onLoad,
  overlay,
  preview = "overview-screen",
  variant
}: {
  className?: string;
  crop?: MockupPreviewCrop;
  eager?: boolean;
  onLoad?: () => void;
  overlay?: ReactNode;
  preview?: MockupPreviewSlug;
  variant?: PreviewVariant;
}) {
  return (
    <div className={joinClasses("device-shell device-shell-framed", className)}>
      <div className="device-frame">
        <div
          className="device-screen-wrap"
          style={{ background: mockupPreviews[preview].background }}
        >
          <EmbeddedPreviewFrame
            className="device-iframe"
            eager={eager}
            previewSlug={preview}
            title={`Gama ${preview} preview`}
            {...(onLoad ? { onLoad } : {})}
            {...(crop ? { crop } : {})}
            {...(variant ? { variant } : {})}
          />
          {overlay}
        </div>
      </div>
    </div>
  );
}

export function MockupPreviewPhone({
  className,
  crop,
  preview,
  variant,
}: {
  className?: string;
  crop?: MockupPreviewCrop;
  preview: MockupPreviewSlug;
  variant?: PreviewVariant;
}) {
  return (
    <DeviceShell
      className={className ?? ""}
      preview={preview}
      {...(crop ? { crop } : {})}
      {...(variant ? { variant } : {})}
    />
  );
}

export function MockupPreviewSurface({
  className,
  crop,
  preview,
}: {
  className?: string;
  crop?: MockupPreviewCrop;
  preview: MockupPreviewSlug;
}) {
  return (
    <div
      className={joinClasses("mockup-surface", className)}
      style={{ background: mockupPreviews[preview].background }}
    >
      <EmbeddedPreviewFrame
        className="mockup-surface-frame"
        previewSlug={preview}
        title={`Gama ${preview} surface preview`}
        {...(crop ? { crop } : {})}
      />
    </div>
  );
}

function MiniInsightCard({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="mini-insight-card">
      <span className="mini-insight-eyebrow">{eyebrow}</span>
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}

function StorySceneFrame({ scene }: { scene: StoryScene }) {
  if (scene.id === "clarity") {
    return (
      <div className="story-visual-card">
        <div className="story-visual-stage">
          <DeviceShell className="story-visual-phone" preview={scene.previewSlug} />
          <div className="story-visual-floating story-visual-floating-left">
            <MiniInsightCard
              eyebrow="Safe-to-Spend"
              title="$86 today"
              body="Bills, shared context, and buffer protection stay visible."
            />
          </div>
          <div className="story-visual-floating story-visual-floating-right">
            <MiniInsightCard
              eyebrow="Forward look"
              title="Rent in 2 days"
              body="$1,240 reserved with no surprise drop this week."
            />
          </div>
        </div>
      </div>
    );
  }

  if (scene.id === "events") {
    return (
      <div className="story-visual-card story-visual-card-events">
        <div className="receipt-preview">
          <div className="receipt-preview-head">
            <span className="mini-insight-eyebrow">Weekend receipt</span>
            <strong>$428 total</strong>
          </div>
          <div className="receipt-preview-list">
            <div>
              <span>Lodging</span>
              <strong>$220</strong>
            </div>
            <div>
              <span>Dinner</span>
              <strong>$96</strong>
            </div>
            <div>
              <span>Coffee stops</span>
              <strong>$44</strong>
            </div>
            <div>
              <span>Shared ride</span>
              <strong>$68</strong>
            </div>
          </div>
          <div className="receipt-preview-foot">Curated before sharing</div>
        </div>
        <DeviceShell className="story-visual-side-phone" preview={scene.previewSlug} />
      </div>
    );
  }

  return (
    <div className="story-visual-card story-visual-card-shared">
      <div className="shared-rail-card">
        <div className="shared-rail-head">
          <div>
            <span className="mini-insight-eyebrow">Shared context</span>
            <strong>On</strong>
          </div>
          <div className="shared-toggle" aria-hidden="true">
            <span />
          </div>
        </div>
        <div className="shared-rail-grid">
          <MiniInsightCard
            eyebrow="Fronted dinner"
            title="$128"
            body="Awaiting reimbursement, not counted like overspend."
          />
          <MiniInsightCard
            eyebrow="Personal spend"
            title="$42"
            body="Private autonomy stays explicit in shared views."
          />
        </div>
      </div>
      <DeviceShell
        className="story-visual-side-phone story-visual-side-phone-raised"
        preview={scene.previewSlug}
      />
    </div>
  );
}

const CHIP_MOTION: Record<string, { endAngle: number; fadeStart: number; fromX: number; fromY: number; startAngle: number; startScale: number }> = {
  "premium-context-chip-safe":  { endAngle: -12, fadeStart: 0,     fromX:  3.8, fromY:  2.8, startAngle:  24, startScale: 0.76 },
  "premium-context-chip-rent":  { endAngle:  13, fadeStart: 0,     fromX: -3.8, fromY:  2.5, startAngle: -24, startScale: 0.77 },
  "premium-context-chip-trip":  { endAngle:   8, fadeStart: 0.02,  fromX: -3.1, fromY:  1.7, startAngle: -17, startScale: 0.80 },
  "premium-context-chip-date":  { endAngle:  -9, fadeStart: 0.015, fromX:  3.2, fromY: -2.4, startAngle:  16, startScale: 0.79 },
  "premium-context-chip-bills": { endAngle:  -6, fadeStart: 0.03,  fromX:  2.9, fromY: -2.0, startAngle:  14, startScale: 0.82 },
  "premium-context-chip-sync":  { endAngle:  10, fadeStart: 0.025, fromX: -3.0, fromY: -2.3, startAngle: -18, startScale: 0.82 },
};

export function ProductHeroVisual({ compact = false }: { compact?: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const boundsRef = useRef({ start: 0, distance: 1 });
  const isNearViewportRef = useRef(true);
  const chipRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    let frame = 0;
    let resizeObserver: ResizeObserver | null = null;

    const measure = () => {
      const rect = node.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const absoluteTop = window.scrollY + rect.top;
      const start = Math.max(absoluteTop - viewportHeight * 0.28, 0);
      const end = absoluteTop + rect.height * 0.34;

      boundsRef.current = {
        start,
        distance: Math.max(end - start, 1),
      };
    };

    const update = () => {
      if (!isNearViewportRef.current) {
        return;
      }

      const { start, distance } = boundsRef.current;
      const progress = Math.min(Math.max(((window.scrollY - start) / distance) * 1.32, 0), 1);
      const easedProgress = progress * progress * (3 - 2 * progress);
      const isNarrowStacked = window.innerWidth <= 1119;

      for (const chip of chipRefs.current) {
        if (!chip) {
          continue;
        }

        const chipClassName = chip.dataset.chip;

        if (!chipClassName) {
          continue;
        }

        const motion = CHIP_MOTION[chipClassName] ?? {
          endAngle: 0,
          fadeStart: 0,
          fromX: 0,
          fromY: 0,
          startAngle: 0,
          startScale: 1,
        };
        const revealFloor = isNarrowStacked ? 0.52 : 0.34;
        const reveal =
          easedProgress <= motion.fadeStart
            ? revealFloor
            : Math.min(
                1,
                revealFloor +
                  ((easedProgress - motion.fadeStart) / (1 - motion.fadeStart)) * (1 - revealFloor),
              );
        const angle = motion.endAngle + (motion.startAngle - motion.endAngle) * (1 - reveal);

        chip.style.opacity = `${reveal}`;
        chip.style.transform = `translate3d(${(1 - reveal) * motion.fromX}rem, ${(1 - reveal) * motion.fromY}rem, 0) rotate(${angle}deg) scale(${motion.startScale + (1 - motion.startScale) * reveal})`;
      }
    };

    const requestUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    const handleResize = () => {
      measure();
      requestUpdate();
    };

    const viewportObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        isNearViewportRef.current = Boolean(entry?.isIntersecting);

        if (entry?.isIntersecting) {
          measure();
          requestUpdate();
        }
      },
      {
        rootMargin: "35% 0px",
      }
    );

    resizeObserver = new ResizeObserver(() => {
      measure();
      requestUpdate();
    });

    measure();
    requestUpdate();
    viewportObserver.observe(node);
    resizeObserver.observe(node);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frame);
      viewportObserver.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", handleResize);
    };
  }, [ready]);

  return (
    <div
      ref={ref}
      className={joinClasses(
        "premium-hero-visual",
        compact && "premium-hero-visual-compact",
        ready ? "premium-hero-visual-ready" : "premium-hero-visual-loading",
      )}
    >
      {ready ? (
        <>
      <HeroContextChip
        accentClassName="premium-context-chip-icon-safe"
        chipClassName="premium-context-chip-safe"
        detail="SAFE"
        icon="🛡"
        registerRef={(element) => {
          chipRefs.current[0] = element;
        }}
        title="$86 today"
      />
      <HeroContextChip
        accentClassName="premium-context-chip-icon-rent"
        chipClassName="premium-context-chip-rent"
        detail="RESERVED"
        icon="🏠"
        registerRef={(element) => {
          chipRefs.current[1] = element;
        }}
        title="Rent Fri"
      />
      <HeroContextChip
        accentClassName="premium-context-chip-icon-date"
        chipClassName="premium-context-chip-date"
        detail="COVERED"
        icon="🍜"
        registerRef={(element) => {
          chipRefs.current[2] = element;
        }}
        title="Date night"
      />
      <HeroContextChip
        accentClassName="premium-context-chip-icon-sync"
        chipClassName="premium-context-chip-sync"
        detail="SYNCED"
        icon="🔗"
        registerRef={(element) => {
          chipRefs.current[3] = element;
        }}
        title="3 accounts"
      />
      <HeroContextChip
        accentClassName="premium-context-chip-icon-trip"
        chipClassName="premium-context-chip-trip"
        detail="Forward view"
        icon="\u2708\uFE0F"
        registerRef={(element) => {
          chipRefs.current[4] = element;
        }}
        title="Trip week"
      />
      <HeroContextChip
        accentClassName="premium-context-chip-icon-bills"
        chipClassName="premium-context-chip-bills"
        detail="Bills ready"
        icon="\uD83D\uDCC5"
        registerRef={(element) => {
          chipRefs.current[5] = element;
        }}
        title="Loaded"
      />
        </>
      ) : null}

      <DeviceShell
        className="premium-hero-device"
        eager
        onLoad={() => setReady(true)}
        preview="overview-screen"
        variant="framed"
      />
    </div>
  );
}

function HeroContextChip({
  accentClassName,
  chipClassName,
  detail,
  icon,
  registerRef,
  title,
}: {
  accentClassName: string;
  chipClassName: string;
  detail: string;
  icon: string;
  registerRef: (element: HTMLDivElement | null) => void;
  title: string;
}) {
  const fallbackIconByChip: Record<string, string> = {
    "premium-context-chip-safe": "\uD83D\uDEE1",
    "premium-context-chip-rent": "\uD83C\uDFE0",
    "premium-context-chip-date": "\uD83C\uDF5C",
    "premium-context-chip-sync": "\uD83D\uDD17",
    "premium-context-chip-trip": "\u2708\uFE0F",
    "premium-context-chip-bills": "\uD83D\uDCC5",
  };
  const resolvedIcon = fallbackIconByChip[chipClassName] ?? icon;
  const style = {
    opacity: 0.34,
  } as CSSProperties;

  return (
    <div
      ref={registerRef}
      className={joinClasses("premium-context-chip", chipClassName)}
      data-chip={chipClassName}
      style={style}
    >
      <span
        className={joinClasses("premium-context-chip-icon", accentClassName)}
        aria-hidden="true"
      >
        {resolvedIcon}
      </span>
      <span className="premium-context-chip-copy">
        <strong>{title}</strong>
        <span>{detail}</span>
      </span>
    </div>
  );
}

export function StorySceneSection({
  scene,
  reverse = false,
}: {
  scene: StoryScene;
  reverse?: boolean;
}) {
  return (
    <section className={joinClasses("story-scene-grid", reverse && "story-scene-grid-reverse")}>
      <div className="story-copy">
        <p className="site-kicker">{scene.eyebrow}</p>
        <h3 className="mt-5 max-w-[14ch] text-4xl font-semibold leading-[0.95] text-[var(--color-ink)] md:text-5xl">
          {scene.title}
        </h3>
        <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--color-muted)] md:text-lg">
          {scene.body}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {scene.metrics.map((metric) => (
            <MetricChip key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </div>
      </div>
      <div className="story-visual-wrap">
        <StorySceneFrame scene={scene} />
      </div>
    </section>
  );
}

export function ProofStrip({ items }: { items: readonly { label: string; value: string }[] }) {
  return (
    <div className="proof-strip" role="list" aria-label="Core product proof points">
      {items.map((item) => (
        <div key={item.label} className="proof-strip-item" role="listitem">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}
