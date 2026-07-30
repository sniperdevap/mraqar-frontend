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

let pendingId: string | null | undefined;

function takePendingId(): string | null {
  if (pendingId === undefined) {
    try {
      pendingId = sessionStorage.getItem(KEY);
      sessionStorage.removeItem(KEY);
    } catch {
      pendingId = null;
    }
  }
  return pendingId;
}

export function markAdViewed(id: string | number) {
  pendingId = undefined;
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
    if (takePendingId() === String(id)) {
      pendingId = null;
      setIsLastViewed(true);
    }
  }, [id]);

  // On back-navigation: start at the top of the list, then glide down to the
  // card, so the user sees where in the list it sits. The card is only queried
  // once it exists — cards use content-visibility, so heights settle after paint.
  useEffect(() => {
    if (!isLastViewed) return;

    window.scrollTo(0, 0);

    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    const deadline = Date.now() + 2500;
    let frame = 0;

    // Native `behavior: "smooth"` is aborted by the cards' `content-visibility`
    // reflow mid-animation, so ease in manually: each frame close a fraction of
    // the remaining distance, re-measured, which absorbs those layout shifts.
    const glideTo = (el: Element) => {
      const distance =
        el.getBoundingClientRect().top -
        (window.innerHeight - el.getBoundingClientRect().height) / 2;

      if (Math.abs(distance) < 2 || Date.now() > deadline) return;
      window.scrollBy(0, distance * 0.16);
      frame = requestAnimationFrame(() => glideTo(el));
    };

    const run = () => {
      const el = document.querySelector(`[${LAST_VIEWED_ATTR}]`);
      if (el) {
        if (smooth) glideTo(el);
        else el.scrollIntoView({ block: "center" });
        return;
      }
      if (Date.now() < deadline) frame = requestAnimationFrame(run);
    };
    frame = requestAnimationFrame(run);

    return () => cancelAnimationFrame(frame);
  }, [isLastViewed]);

  return isLastViewed;
}
