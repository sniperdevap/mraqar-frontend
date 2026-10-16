"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  MapPin,
  User as UserIcon,
  Plus,
  Bell,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";
import { useTranslations, useLocale } from "@/hooks/use-locale";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { cn } from "@/lib/utils";
import { getUnreadNotificationCount } from "@/lib/api/account";
import { isAdDetailPath } from "@/lib/ad-url";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuthStore();
  const t = useTranslations("common");

  const { direction } = useLocale();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const showAuthUi = hasMounted && isAuthenticated;

  // Public Links use Next's viewport-aware prefetching. Only warm protected
  // button destinations after auth has hydrated, and only while the browser is
  // idle so current-page data and images keep network priority.
  useEffect(() => {
    if (!hasMounted) return;

    const hasAuthCookie = document.cookie
      .split(";")
      .some(cookie => cookie.trim().startsWith("auth-token="));
    const routes = isAuthenticated && hasAuthCookie
      ? ["/account", "/notifications", "/ads/create"]
      : ["/auth/signin"];
    const warmRoutes = () => routes.forEach(route => router.prefetch(route));

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(warmRoutes, { timeout: 1500 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = globalThis.setTimeout(warmRoutes, 500);
    return () => globalThis.clearTimeout(timeoutId);
  }, [hasMounted, isAuthenticated, router]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const initialHeight = window.innerHeight;

    const handleResize = () => {
      const el = document.activeElement;
      const isTyping =
        !!el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          (el as HTMLElement).isContentEditable);
      const heightDiff = initialHeight - viewport.height;
      setIsKeyboardOpen(isTyping && heightDiff > 150);
    };

    viewport.addEventListener("resize", handleResize);

    return () => {
      viewport.removeEventListener("resize", handleResize);
    };
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    if (!showAuthUi) return;
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch {
      // silently fail
    }
  }, [showAuthUi]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Check if current route should hide navbars
  const isSpecialRoute =
    pathname === "/ads/create" ||
    (pathname?.startsWith("/ads/edit/") && pathname?.split("/").length === 4);
  // (pathname?.startsWith('/ads/') && pathname?.split('/').length === 3 && pathname?.split('/')[2] !== 'create') ||
  // (pathname?.startsWith('/offices/') && pathname?.split('/').length === 3);

  // Hide bottom navbar on ad detail pages
  const isAdDetailPage = isAdDetailPath(pathname);
  const isSearchPage = pathname === "/search";
  const showStandardNav = !isSpecialRoute;
  const showTopNavbar = showStandardNav;

  // Favorite state for ad detail page heart button in mobile navbar
  const [adFavoriteState, setAdFavoriteState] = useState<{
    isFavorite: boolean;
    isFavoriteLoading: boolean;
    isOwner: boolean;
    isLoading?: boolean;
  } | null>(null);

  useEffect(() => {
    const handleFavoriteState = (e: Event) => {
      const customEvent = e as CustomEvent;
      setAdFavoriteState(customEvent.detail);
    };

    window.addEventListener("ad-favorite-state", handleFavoriteState);
    return () => {
      window.removeEventListener("ad-favorite-state", handleFavoriteState);
      setAdFavoriteState(null);
    };
  }, [pathname]);

  const handleMobileFavoriteToggle = () => {
    window.dispatchEvent(new CustomEvent("ad-toggle-favorite"));
  };

  const getHeaderTitle = () => {
    if (pathname === "/ads/create") return t("ads.createListing");
    if (pathname?.startsWith("/ads/edit/")) return t("ads.editAd");
    if (pathname?.startsWith("/offices/")) return t("ads.officeDetails");
    if (isAdDetailPath(pathname)) return t("ads.adDetails");
    return "";
  };

  const getCreateAdHref = () => (isAuthenticated ? "/ads/create" : "/auth/signin");

  const prefetchCreateAd = () => router.prefetch(getCreateAdHref());
  const prefetchNotifications = () => {
    const hasAuthCookie = document.cookie
      .split(";")
      .some(cookie => cookie.trim().startsWith("auth-token="));
    if (isAuthenticated && hasAuthCookie) router.prefetch("/notifications");
  };

  const handleCreateAdClick = () => {
    router.push(getCreateAdHref());
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const pathnameWithoutLocale = pathname?.replace(/^\/(en|ar)/, "") || "/";
  const isHomePage = pathnameWithoutLocale === "/" || pathnameWithoutLocale === "";

  const handleHomeNavClick = (e: React.MouseEvent) => {
    if (isHomePage) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Desktop Navbar */}
      {showTopNavbar && (
        <nav className="hidden lg:flex items-center py-2 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-[0_1px_12px_rgba(16,24,40,0.06)] sticky top-0 z-50 min-h-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center">
          <div className="flex-shrink-0 w-20 h-13">
            <Link href="/" className="block w-20 h-13">
              <Image
                src="/images/aqar-new-logo-nav.webp"
                alt="Mr aqar"
                width={80}
                height={52}
                priority
                unoptimized
                className="object-contain"
                style={{ width: 80, height: 52 }}
              />
            </Link>
          </div>

          <div className="flex-1 flex justify-center items-center gap-8 text-[15px] font-medium">
            <Link
              href="/"
              className="text-gray-900 hover:text-gray-600 transition-colors px-2"
            >
              {t("nav.home")}
            </Link>
            <Link
              href="/offices"
              className="text-gray-900 hover:text-gray-600 transition-colors px-2"
            >
              {t("nav.offices")}
            </Link>
            <Link
              href="/plans"
              className="text-gray-900 hover:text-gray-600 transition-colors px-2"
            >
              {t("nav.plans")}
            </Link>
            <Link
              href="/account"
              className="text-gray-900 hover:text-gray-600 transition-colors px-2"
            >
              {t("nav.account")}
            </Link>
            <LanguageSwitcher />

            <Button
              variant="outline"
              className="ml-4 border-gray-200 text-gray-900 hover:bg-gray-50 hover:text-primary rounded-xl px-6 py-2 h-10 text-sm font-semibold"
              onClick={handleCreateAdClick}
              onMouseEnter={prefetchCreateAd}
              onFocus={prefetchCreateAd}
              onTouchStart={prefetchCreateAd}
            >
              + {t("nav.addFreeAd")}
            </Button>
          </div>

          <div className="flex items-center gap-4">
            {pathname === "/" && (
              <button
                type="button"
                onClick={() => router.push("/notifications")}
                onMouseEnter={prefetchNotifications}
                onFocus={prefetchNotifications}
                aria-label={t("notifications.title")}
                className="p-2 text-gray-900 hover:text-gray-600 transition-colors relative cursor-pointer"
              >
                <Bell size={24} strokeWidth={1.5} aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            )}
            {showAuthUi && (
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                aria-label={t("nav.logout")}
                title={t("nav.logout")}
              >
                <LogOut size={24} strokeWidth={1.5} aria-hidden="true" />
              </button>
            )}
            {/* {pathname === '/' &&
            (isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  window.location.href = '/';
                }}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                title={t('nav.logout')}
              >
                <LogOut size={24} strokeWidth={1.5} />
              </button>
            ) : (
              <button onClick={() => router.push('/auth/signin')} className="p-2 text-gray-900 hover:text-gray-600 transition-colors cursor-pointer" title={t('nav.login')}>
                {t('nav.login')}
              </button>
            ))} */}
          </div>
          </div>
        </nav>
      )}

      {/* Mobile Top Navbar */}
      {showTopNavbar && (
        <nav className="lg:hidden flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-[0_1px_12px_rgba(16,24,40,0.06)] sticky top-0 z-50 h-20">
          {(pathname === '/' || pathname?.replace(/^\/(en|ar)/, '') === '/' || pathname?.replace(/^\/(en|ar)/, '') === '') ? (
            <div className="flex items-center justify-between w-full h-full" dir="ltr">
              {/* Left: Logo */}
              <div className="flex-shrink-0 w-20 h-13">
                <Link href="/" className="block w-20 h-13">
                  <Image
                    src="/images/aqar-new-logo-nav.webp"
                    alt="Mr aqar"
                    width={80}
                    height={52}
                    priority
                    unoptimized
                    className="object-contain"
                    style={{ width: 80, height: 52 }}
                  />
                </Link>
              </div>

              {/* Right side items: Favorites and Notification Bell */}
              <div className="flex items-center gap-6">
                {/* Bell Icon */}
                <button
                  onClick={() => router.push("/notifications")}
                  onMouseEnter={prefetchNotifications}
                  onFocus={prefetchNotifications}
                  aria-label={t("notifications.title")}
                  className="p-2 text-gray-900 hover:text-gray-600 transition-colors relative cursor-pointer flex items-center justify-center"
                >
                  <Bell size={24} strokeWidth={1.8} aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          ) : isAdDetailPage ? (
            <div className="flex items-center justify-between w-full h-full" dir="ltr">
              {/* Left: Red Back Arrow */}
              <button
                onClick={() => router.push("/")}
                aria-label={t("buttons.back")}
                className="p-2 text-[#e11d1d] hover:text-[#7f070b] transition-colors cursor-pointer flex items-center justify-center"
              >
                <ChevronLeft size={32} strokeWidth={2.5} aria-hidden="true" />
              </button>

              {/* Middle: Logo */}
              <div className="flex-shrink-0 w-20 h-13">
                <Link href="/" className="block w-20 h-13">
                  <Image
                    src="/images/aqar-new-logo-nav.webp"
                    alt="Mr aqar"
                    width={80}
                    height={52}
                    unoptimized
                    className="object-contain"
                    style={{ width: 80, height: 52 }}
                  />
                </Link>
              </div>

              {/* Right: spacer to keep the logo centered */}
              <div className="w-12 h-12" aria-hidden="true" />
            </div>
          ) : (
            <>
              <div className="flex justify-between w-full" dir="ltr">
                {isSearchPage ? (
                  <button
                    onClick={() => router.push("/")}
                    aria-label={t("buttons.back")}
                    className="p-2 text-gray-700 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={28} aria-hidden="true" />
                  </button>
                ) : null}
                <div className="flex-shrink-0 flex items-center justify-center w-full">
                  <Link href="/" className="block w-20 h-13">
                    <Image
                      src="/images/aqar-new-logo-nav.webp"
                      alt="Mr aqar"
                      width={80}
                      height={52}
                      unoptimized
                      className="object-contain"
                      style={{ width: 80, height: 52 }}
                    />
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {showAuthUi && (
                  <button
                    onClick={handleLogout}
                    className="hidden md:flex lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                    aria-label={t("nav.logout")}
                    title={t("nav.logout")}
                  >
                    <LogOut size={24} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                )}
              </div>
            </>
          )}
        </nav>
      )}

      {/* Specialized Mobile Header for Create Listing */}
      {isSpecialRoute && (
        <nav className=" flex items-center px-4 py-3 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-[0_1px_12px_rgba(16,24,40,0.06)] sticky top-0 z-50 h-16">
          <button
            onClick={() => router.back()}
            aria-label={t("buttons.back")}
            className="p-2 -ml-2 text-gray-700 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <ChevronLeft
              size={28}
              aria-hidden="true"
              className={direction === "rtl" ? "rotate-180" : ""}
            />
          </button>
          <div className="flex-1 flex justify-center">
            <h1 className="text-lg font-bold text-gray-900 pr-10">
              {getHeaderTitle()}
            </h1>
          </div>
        </nav>
      )}

      {/* Mobile Bottom Navbar */}
      {showStandardNav && !isAdDetailPage && !isKeyboardOpen && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 grid grid-cols-5 items-center px-2 pt-1 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] min-h-[4.5rem] z-50 bg-white rounded-t-[28px] shadow-[0_-8px_28px_rgba(0,0,0,0.16),0_-2px_6px_rgba(0,0,0,0.08)] [transform:translateZ(0)]">
          {[
            { href: "/", icon: Home, label: t("nav.home") },
            { href: "/offices", icon: MapPin, label: t("nav.offices") },
            { isCentral: true },
            { href: "/account", icon: UserIcon, label: t("nav.myAccount") },
            { href: "/menu", icon: Menu, label: t("nav.menu") },
          ].map((item) => {
            if (item.isCentral) {
              return (
                <div
                  key="central"
                  className="w-full flex items-center justify-center"
                >
                  <button
                    type="button"
                    onClick={handleCreateAdClick}
                    onMouseEnter={prefetchCreateAd}
                    onFocus={prefetchCreateAd}
                    onTouchStart={prefetchCreateAd}
                    aria-label={t("nav.addFreeAd")}
                    className="-translate-y-2.5 touch-manipulation focus:outline-none"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary shadow-[0_4px_12px_rgba(0,0,0,0.13)] cursor-pointer transition-transform duration-150 active:scale-95">
                      <Plus
                        size={22}
                        strokeWidth={2.75}
                        className="text-white"
                        aria-hidden="true"
                      />
                    </div>
                  </button>
                </div>
              );
            }

            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href || "menu"}
                href={item.href || "/menu"}
                onClick={item.href === "/" ? handleHomeNavClick : undefined}
                className={cn(
                  "touch-manipulation w-full flex flex-col items-center justify-center rounded-2xl transition-colors duration-150",
                  isActive ? "text-primary-dark" : "text-[#3A3A3A]",
                )}
              >
                <div
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-2xl px-3.5 py-1.5 transition-all duration-200 active:scale-90",
                    isActive && "scale-110 bg-primary/10",
                  )}
                >
                  {Icon ? (
                    <Icon size={22} strokeWidth={isActive ? 2 : 1.75} />
                  ) : null}
                  <span className="text-[10px] leading-none font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
