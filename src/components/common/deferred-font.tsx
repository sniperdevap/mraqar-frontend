"use client";

import { useEffect } from "react";

const FONT_READY_CLASS = "fonts-loaded";

/** Applies the webfont after idle so it stays off the critical request chain. */
export function DeferredFont() {
  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains(FONT_READY_CLASS)) return;

    const enable = () => root.classList.add(FONT_READY_CLASS);

    const win = window as Window & {
      requestIdleCallback?: (
        cb: () => void,
        opts?: { timeout: number },
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (win.requestIdleCallback) {
      const id = win.requestIdleCallback(enable, { timeout: 1500 });
      return () => win.cancelIdleCallback?.(id);
    }

    const id = window.setTimeout(enable, 1);
    return () => window.clearTimeout(id);
  }, []);

  return null;
}
