"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function ViewportMotionGate({
  children,
  className,
  pauseAnimationsWhenOutOfView = true,
  rootMargin = "20% 0px",
}: {
  children: ReactNode;
  className?: string;
  pauseAnimationsWhenOutOfView?: boolean;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsInView(Boolean(entry?.isIntersecting));
      },
      {
        rootMargin,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      className={joinClasses(className)}
      data-in-view={isInView ? "true" : "false"}
      data-pause-animations={pauseAnimationsWhenOutOfView ? "true" : "false"}
    >
      {children}
    </div>
  );
}
