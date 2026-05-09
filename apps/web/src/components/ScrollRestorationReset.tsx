"use client";

import { useEffect, useLayoutEffect } from "react";

const RELOAD_SCROLL_STORAGE_KEY = "gama:web:reload-scroll";

function getScrollEntryKey() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function ScrollRestorationReset() {
  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const navigationEntries = window.performance.getEntriesByType("navigation");
    const firstNavigationEntry = navigationEntries[0];
    const isReloadNavigation =
      firstNavigationEntry !== undefined &&
      "type" in firstNavigationEntry &&
      (firstNavigationEntry as PerformanceNavigationTiming).type === "reload";

    if (!isReloadNavigation) {
      return;
    }

    const rawEntry = window.sessionStorage.getItem(RELOAD_SCROLL_STORAGE_KEY);

    if (!rawEntry) {
      return;
    }

    try {
      const parsed = JSON.parse(rawEntry) as { key?: string; x?: number; y?: number };

      if (parsed.key !== getScrollEntryKey()) {
        return;
      }

      const restore = () => {
        window.scrollTo(parsed.x ?? 0, parsed.y ?? 0);
      };

      restore();
      window.requestAnimationFrame(restore);
    } catch {
      window.sessionStorage.removeItem(RELOAD_SCROLL_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const persistScrollPosition = () => {
      window.sessionStorage.setItem(
        RELOAD_SCROLL_STORAGE_KEY,
        JSON.stringify({
          key: getScrollEntryKey(),
          x: window.scrollX,
          y: window.scrollY,
        }),
      );
    };

    window.addEventListener("pagehide", persistScrollPosition);
    window.addEventListener("beforeunload", persistScrollPosition);

    return () => {
      window.removeEventListener("pagehide", persistScrollPosition);
      window.removeEventListener("beforeunload", persistScrollPosition);
    };
  }, []);

  return null;
}
