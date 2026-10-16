"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { PrefetchKind } from "next/dist/client/components/router-reducer/router-reducer-types";
const FULL: { kind: PrefetchKind } = { kind: "full" as PrefetchKind };

const PREFETCH_TTL_MS = 60_000;
const PREFETCH_BURST_SIZE = 2;
const queuedRoutes = new Set<string>();
const prefetchedAt = new Map<string, number>();
const queue: Array<{ route: string; run: () => void }> = [];
let queueScheduled = false;

const isFresh = (route: string) =>
  Date.now() - (prefetchedAt.get(route) || 0) < PREFETCH_TTL_MS;

// Viewport prefetches wait until the page has loaded and the browser has had
// a moment to settle, so they don't compete with the first screen for the
// network and main thread (they were adding ~150-300ms of blocking time on
// mid-range phones). Hover/touch prefetches (prefetchNow) are not delayed.
const SETTLE_AFTER_LOAD_MS = 1200;
let pageSettled = false;
let waitingForSettle = false;

const whenPageSettled = (run: () => void) => {
  if (pageSettled) return run();
  if (waitingForSettle) return;
  waitingForSettle = true;
  const settle = () =>
    window.setTimeout(() => {
      pageSettled = true;
      waitingForSettle = false;
      run();
    }, SETTLE_AFTER_LOAD_MS);
  if (document.readyState === "complete") settle();
  else window.addEventListener("load", settle, { once: true });
};

const scheduleQueue = () => {
  if (queueScheduled || queue.length === 0) return;
  if (!pageSettled) return whenPageSettled(scheduleQueue);
  queueScheduled = true;

  const flush = () => {
    queueScheduled = false;
    queue.splice(0, PREFETCH_BURST_SIZE).forEach(({ route, run }) => {
      queuedRoutes.delete(route);
      if (isFresh(route)) return;
      prefetchedAt.set(route, Date.now());
      run();
    });

    if (queue.length > 0) {
      window.setTimeout(scheduleQueue, 150);
    }
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(flush, { timeout: 500 });
  } else {
    globalThis.setTimeout(flush, 50);
  }
};

const enqueuePrefetch = (route: string, run: () => void) => {
  if (isFresh(route) || queuedRoutes.has(route)) return;
  queuedRoutes.add(route);
  queue.push({ route, run });
  scheduleQueue();
};

export function useRoutePrefetch(route: string, enabled = true) {
  const router = useRouter();
  const observerRef = useRef<IntersectionObserver | null>(null);

  const prefetchNow = useCallback(() => {
    if (!enabled || isFresh(route)) return;
    queuedRoutes.delete(route);
    prefetchedAt.set(route, Date.now());
    router.prefetch(route, FULL);
  }, [enabled, route, router]);

  const setPrefetchTarget = useCallback(
    (node: HTMLElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;

      if (!node || !enabled || typeof IntersectionObserver === "undefined") {
        return;
      }

      observerRef.current = new IntersectionObserver(
        entries => {
          if (!entries.some(entry => entry.isIntersecting)) return;
          enqueuePrefetch(route, () => router.prefetch(route, FULL));
          observerRef.current?.disconnect();
          observerRef.current = null;
        },
        { rootMargin: "200px 0px", threshold: 0 },
      );
      observerRef.current.observe(node);
    },
    [enabled, route, router],
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return { setPrefetchTarget, prefetchNow };
}
