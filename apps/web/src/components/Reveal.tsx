"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function Reveal({
  children,
  className,
  delayMs = 0
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const rect = node.getBoundingClientRect();
    const isInitiallyNearViewport = rect.top <= viewportHeight * 0.92 && rect.bottom >= 0;

    if (isInitiallyNearViewport || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    setIsVisible(false);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.01
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={joinClasses("reveal", isVisible && "reveal-visible", className)}
      style={{ "--reveal-delay": `${delayMs}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
