"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Headset, Phone, Play } from "lucide-react";
import { isAdDetailPath } from "@/lib/ad-url";
import { useLocale } from "@/hooks/use-locale";
import { usePropertyTypes } from "@/hooks/use-metadata";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";

const SUPPORT_PHONE = "+96590078005";
const SUPPORT_WHATSAPP = "https://wa.me/96590078005";
const APP_STORE = "https://apps.apple.com/kw/app/mr-aqar-%D9%85%D8%B3%D8%AA%D8%B1-%D8%B9%D9%82%D8%A7%D8%B1/id6786697649";
const PLAY_STORE = "https://play.google.com/store/apps/details?id=com.mraqar.app";

export function Footer() {
  const t = useTranslations("common.footer");
  const tNav = useTranslations("common.nav");
  const { locale, direction } = useLocale();
  const { data: propertyTypes } = usePropertyTypes();
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
    pathname.includes("/ads/") ||
    isAdDetailPath(pathname);

  if (isUploadPage) {
    return null;
  }

  const AppDownloadButtons = ({ className }: { className?: string }) => (
    <div className={`flex items-center gap-4 ${className || ""}`}>
      <Link
        href="https://apps.apple.com/kw/app/mr-aqar-%D9%85%D8%B3%D8%AA%D8%B1-%D8%B9%D9%82%D8%A7%D8%B1/id6786697649"
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
        href="https://play.google.com/store/apps/details?id=com.mraqar.app"
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

  const pageLinks = [
    { href: "/", label: tNav("home") },
    { href: "/search", label: t("browseProperties") },
    { href: "/search?purpose=sale", label: t("forSale") },
    { href: "/search?purpose=rent", label: t("forRent") },
    { href: "/search?purpose=exchange", label: t("forExchange") },
    { href: "/offices", label: tNav("offices") },
    { href: "/about", label: t("aboutUs") },
    { href: "/contact", label: t("contactUs") },
    { href: "/privacy", label: t("privacyPolicy") },
    { href: "/terms", label: t("termsAndConditions") },
    { href: "/copyright", label: t("copyrightNotice") },
  ];

  const heading = "mb-4 text-[15px] font-bold text-white";
  const linkClass = "text-[14.5px] text-white/70 transition-colors hover:text-white";
  const iconButton =
    "flex size-11 items-center justify-center rounded-xl bg-white/[0.08] text-white transition-colors hover:bg-white/[0.16]";
  const storeButton =
    "flex h-14 items-center gap-3 rounded-2xl bg-white/[0.08] px-4 text-white transition-colors hover:bg-white/[0.14]";

  return (
    <>
      <footer
        ref={footerRef}
        className="mt-auto bg-[#1d2738] text-white"
        dir={direction}
      >
        <div className="mx-auto max-w-6xl px-5 pt-10 pb-28 lg:px-8 lg:pt-14 lg:pb-8">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-x-10">
            {/* Brand */}
            <div className="col-span-2 lg:col-span-1">
              <Link href="/" className="inline-flex items-center gap-3" aria-label={t("brandName")}>
                <span className="flex size-12 items-center justify-center rounded-2xl bg-white p-1.5">
                  <Image src="/images/aqar-new-logo-sm.webp" alt="" width={40} height={27} className="h-auto w-10" />
                </span>
                <span className="text-xl font-bold">{t("brandName")}</span>
              </Link>
              <p className="mt-4 max-w-sm text-[14.5px] leading-7 text-white/70">{t("brandDescription")}</p>
              <div className="mt-5 flex gap-2.5">
                <a href={SUPPORT_WHATSAPP} target="_blank" rel="noopener noreferrer" className={iconButton} aria-label={t("whatsapp")}>
                  <WhatsAppIcon className="size-5" />
                </a>
                <a href={`tel:${SUPPORT_PHONE}`} className={iconButton} aria-label={t("call")}>
                  <Phone size={19} />
                </a>
              </div>
            </div>

            {/* Property types — internal links to each type's search page */}
            <nav aria-label={t("propertyTypes")}>
              <h2 className={heading}>{t("propertyTypes")}</h2>
              <ul className="space-y-3">
                {(propertyTypes || []).map((type) => (
                  <li key={type.id}>
                    <Link href={`/search?propertyType=${type.id}`} prefetch={false} className={linkClass}>
                      {locale === "ar" ? type.labelAr || type.label : type.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Site pages */}
            <nav aria-label={t("sitePages")}>
              <h2 className={heading}>{t("sitePages")}</h2>
              <ul className="space-y-3">
                {pageLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} prefetch={false} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* App + support */}
            <div className="col-span-2 lg:col-span-1">
              {showAppButtons && (
                <>
                  <h2 className={heading}>{t("getApp")}</h2>
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                    <a href={APP_STORE} target="_blank" rel="noopener noreferrer" className={storeButton}>
                      <Play size={16} className="shrink-0 fill-white" aria-hidden="true" />
                      <span className="leading-tight">
                        <span className="block text-[11.5px] text-white/70">{t("downloadOn")}</span>
                        <span className="block text-[15px] font-semibold">App Store</span>
                      </span>
                    </a>
                    <a href={PLAY_STORE} target="_blank" rel="noopener noreferrer" className={storeButton}>
                      <Play size={16} className="shrink-0 fill-white" aria-hidden="true" />
                      <span className="leading-tight">
                        <span className="block text-[11.5px] text-white/70">{t("downloadOn")}</span>
                        <span className="block text-[15px] font-semibold">Google Play</span>
                      </span>
                    </a>
                  </div>
                </>
              )}
              <a
                href={SUPPORT_WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3.5 transition-colors hover:bg-white/[0.06]"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#e11d1d] text-white">
                  <Headset size={19} />
                </span>
                <span className="leading-tight">
                  <span className="block text-[13px] text-white/70">{t("needHelp")}</span>
                  <span className="block text-[15px] font-semibold">{t("support")}</span>
                </span>
              </a>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-center text-[13px] text-white/60">
            © {t("allRightsReserved")}
          </div>
        </div>
      </footer>

      {showStickyBar && (
        <div className="hidden lg:flex fixed bottom-0 left-0 right-0 z-100 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] justify-center items-center">
          <AppDownloadButtons />
        </div>
      )}
    </>
  );
}
