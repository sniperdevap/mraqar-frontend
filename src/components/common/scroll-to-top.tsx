"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";

export function ScrollToTop() {
  const t = useTranslations("common.buttons");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      aria-label={t("scrollToTop")}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      // sits above the mobile bottom nav (4.5rem tall) on small screens
      className="fixed end-4 bottom-24 lg:bottom-8 z-50 w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center shadow-[0_6px_16px_rgba(5,110,114,0.35)] animate-fade-in transition-transform active:scale-90"
    >
      <ArrowUp size={22} strokeWidth={2.5} aria-hidden="true" />
    </button>
  );
}
