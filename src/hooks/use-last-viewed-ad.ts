"use client";

import { useEffect, useState } from "react";

const KEY = "lastViewedAd";
export const LAST_VIEWED_ATTR = "data-last-viewed-ad";

if (typeof window !== "undefined") {
  const nav = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  if (nav && nav.type !== "back_forward") {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  }
}

export function markAdViewed(id: string | number) {
  try {
    sessionStorage.setItem(KEY, String(id));
  } catch {
    // private mode / storage disabled
  }
}

// ponytail: one id per session, so only the most recently opened ad is highlighted.
// Read after mount, never during render, so SSR markup stays identical.
export function useIsLastViewedAd(id: string | number | undefined) {
  const [isLastViewed, setIsLastViewed] = useState(false);

  useEffect(() => {
    if (id === undefined) return;
    try {
      setIsLastViewed(sessionStorage.getItem(KEY) === String(id));
    } catch {
      // ignore
    }
  }, [id]);

  // Bring the card back into view on back-navigation. Cards use content-visibility,
  // so their real height only settles after paint — hence the rAF.
  useEffect(() => {
    if (!isLastViewed) return;
    const frame = requestAnimationFrame(() => {
      document
        .querySelector(`[${LAST_VIEWED_ATTR}]`)
        ?.scrollIntoView({ block: "center" });
    });
    return () => cancelAnimationFrame(frame);
  }, [isLastViewed]);

  return isLastViewed;
}
