"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const t = useTranslations("common.footer");
  const pathname = usePathname();

  // Default true so SSR/first paint reserve footer height; hide only in webviews.
  const [showAppButtons, setShowAppButtons] = useState(true);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const footerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const isIOSWebView = /iPhone|iPad|iPod/.test(ua) && !/Safari/.test(ua);
    const isAndroidWebView = /Android/.test(ua) && /wv/.test(ua);
    if (isIOSWebView || isAndroidWebView) {
      setShowAppButtons(false);
    }
  }, []);

  useEffect(() => {
    if (!footerRef.current || typeof IntersectionObserver === "undefined")
      return;

    const observer = new IntersectionObserver(
      (entries) => {
        setIsFooterVisible(entries.some((entry) => entry.isIntersecting));
      },
      { threshold: 0.25 },
    );

    observer.observe(footerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Hide footer on upload ad and edit ad pages
  const isUploadPage =
    pathname.includes("/ads/create") ||
    pathname.includes("/ads/edit") ||
    pathname.includes("/ads/");

  if (isUploadPage) {
    return null;
  }

  const AppDownloadButtons = ({ className }: { className?: string }) => (
    <div className={`flex items-center gap-4 ${className || ""}`}>
      <Link
        href="https://shorturl.at/pZS46"
        target="_blank"
        className="bg-black text-white px-4 py-2 rounded-md flex items-center gap-3 hover:bg-zinc-900 transition-colors w-fit border border-zinc-800"
      >
        <div className="flex flex-col items-start leading-tight flex-1">
          <span className="text-[10px] opacity-80">{t("downloadOn")}</span>
          <span className="text-sm font-bold whitespace-nowrap">
            {t("appStore")}
          </span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 333334 332780"
          shapeRendering="geometricPrecision"
          textRendering="geometricPrecision"
          imageRendering="optimizeQuality"
          fillRule="evenodd"
          clipRule="evenodd"
          className="w-8 h-8"
        >
          <path
            fill="#007aff"
            d="M67387 0h198559c37063 0 67387 30324 67387 67387v198005c0 37063-30324 67387-67387 67387H67387C30324 332779 0 302455 0 265392V67387C0 30324 30324 0 67387 0zm192804 188911c8471 0 15339 6868 15339 15339 0 8472-6868 15339-15339 15339h-13707l12369 21361c4186 7375 1601 16748-5774 20934-7376 4186-16748 1600-20933-5775l-21148-36520h-292l-18180-30679h707l-17948-30995 17460-31129 35974 62123h31472zM137016 91830c-4186-7376-1601-16748 5775-20934 7375-4186 16748-1601 20933 5774l3533 6102 3041-5232c4186-7375 13559-9960 20934-5774s9960 13559 5775 20933l-12043 20650 35 60-9218 15688-34881 59815h36634l17798 30678-71907 1-19809 34780c-4186 7375-13559 9960-20933 5774-7375-4186-9961-13558-5774-20934l11175-19619H73143c-8471 0-15339-6868-15339-15340 0-8471 6868-15339 15339-15339h32415l43922-75559-12464-21524z"
          />
        </svg>
      </Link>

      <Link
        href="https://play.google.com/store/apps/details?id=aqar.com"
        target="_blank"
        className="bg-black text-white px-4 py-2 rounded-md flex items-center gap-3 hover:bg-zinc-900 transition-colors w-fit border border-zinc-800"
      >
        <div className="flex flex-col items-start leading-tight flex-1">
          <span className="text-[10px] opacity-80">{t("downloadOn")}</span>
          <span className="text-sm font-bold whitespace-nowrap">
            {t("playStore")}
          </span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 466 511.98"
          shapeRendering="geometricPrecision"
          textRendering="geometricPrecision"
          imageRendering="optimizeQuality"
          fillRule="evenodd"
          clipRule="evenodd"
          className="w-8 h-8"
        >
          <g id="Layer_x0020_1">
            <path
              fill="#EA4335"
              fillRule="nonzero"
              d="M199.9 237.8l-198.5 232.37c7.22,24.57 30.16,41.81 55.8,41.81 11.16,0 20.93,-2.79 29.3,-8.37l0 0 244.16 -139.46 -130.76 -126.35z"
            />
            <path
              fill="#FBBC04"
              fillRule="nonzero"
              d="M433.91 205.1l0 0 -104.65 -60 -111.61 110.22 113.01 108.83 104.64 -58.6c18.14,-9.77 30.7,-29.3 30.7,-50.23 -1.4,-20.93 -13.95,-40.46 -32.09,-50.22z"
            />
            <path
              fill="#34A853"
              fillRule="nonzero"
              d="M199.42 273.45l129.85 -128.35 -241.37 -136.73c-8.37,-5.58 -19.54,-8.37 -30.7,-8.37 -26.5,0 -50.22,18.14 -55.8,41.86 0,0 0,0 0,0l198.02 231.59z"
            />
            <path
              fill="#4285F4"
              fillRule="nonzero"
              d="M1.39 41.86c-1.39,4.18 -1.39,9.77 -1.39,15.34l0 397.64c0,5.57 0,9.76 1.4,15.34l216.27 -214.86 -216.28 -213.46z"
            />
          </g>
        </svg>
      </Link>
    </div>
  );

  const showStickyBar = showAppButtons && !isFooterVisible;

  return (
    <>
      <footer
        ref={footerRef}
        className="bg-primary text-white py-4 px-3 mt-auto hidden lg:block"
      >
        <div className=" mx-auto flex flex-col xl:flex-row justify-between items-center gap-6 text-lg">
          <p className="whitespace-nowrap">{t("allRightsReserved")}</p>

          <div className="flex items-center gap-2 whitespace-nowrap">
            <Link href="/about" className="hover:underline">
              {t("aboutUs")}
            </Link>
            <span>|</span>
            <Link href="/terms" className="hover:underline">
              {t("termsAndConditions")}
            </Link>
            <span>|</span>
            <Link href="/privacy" className="hover:underline">
              {t("privacyPolicy")}
            </Link>
            <span>|</span>
            <Link href="/copyright" className="hover:underline">
              {t("copyrightNotice")}
            </Link>
            <span>|</span>
            <Link href="/contact" prefetch={false} className="hover:underline">
              {t("contactUs")}
            </Link>
          </div>
          {/* {showAppButtons && (
            <div className="flex flex-col md:flex-row items-center gap-4">
              <AppDownloadButtons />
            </div>
          )} */}
        </div>
      </footer>

      {/* Sticky Bottom Bar for Laptop and Tablet Browser */}
      {/* {showStickyBar && (
        <div className="hidden md:flex fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-sm border-t border-gray-100 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] justify-center items-center">
          <AppDownloadButtons />
        </div>
      )} */}
    </>
  );
}
