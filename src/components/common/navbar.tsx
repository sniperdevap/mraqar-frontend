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
  Heart,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";
import { useTranslations, useLocale } from "@/hooks/use-locale";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { cn } from "@/lib/utils";
import { getUnreadNotificationCount } from "@/lib/api/account";

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
  const isAdDetailPage =
    pathname?.startsWith("/ads/") &&
    pathname?.split("/").length === 3 &&
    pathname?.split("/")[2] !== "create";
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
    if (pathname?.startsWith("/ads/")) return t("ads.adDetails");
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
                {/* Favorites button */}
                <Link
                  href="/account?tab=favourites"
                  className="flex flex-col items-center justify-center text-[#555] hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <Heart size={22} className="text-gray-900" strokeWidth={1.8} />
                  <span className="text-[10px] font-bold mt-1 text-[#333]">Favorites</span>
                </Link>

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

              {/* Right: Heart (Toggle Favorites) */}
              <div className="flex items-center justify-center w-12 h-12">
                <button
                  onClick={handleMobileFavoriteToggle}
                  disabled={adFavoriteState?.isFavoriteLoading}
                  aria-label={adFavoriteState?.isFavorite ? t("ads.ariaRemoveFromFavorites") : t("ads.ariaAddToFavorites")}
                  className="p-2 text-gray-900 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <Heart
                    size={26}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    className={adFavoriteState?.isFavorite ? "fill-gray-900 text-gray-900" : "text-gray-900"}
                  />
                </button>
              </div>
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
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg flex items-center justify-around py-2 px-4 z-50 rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.06)] h-[4.5rem] border-t border-gray-100/50 pb-[env(safe-area-inset-bottom)] [transform:translateZ(0)] will-change-auto">
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
                  className="relative flex items-center justify-center w-16 h-full"
                >
                  <button
                    type="button"
                    onClick={handleCreateAdClick}
                    onMouseEnter={prefetchCreateAd}
                    onFocus={prefetchCreateAd}
                    onTouchStart={prefetchCreateAd}
                    aria-label={t("nav.addFreeAd")}
                    className="absolute -top-[34px] focus:outline-none z-50 transition-transform duration-200 hover:scale-[1.08] active:scale-90"
                  >
                    <div className="flex items-center justify-center w-[50px] h-[50px] rounded-full bg-primary shadow-[0_8px_16px_rgba(225,29,29,0.3)] cursor-pointer transition-all duration-300 hover:shadow-[0_8px_20px_rgba(225,29,29,0.45)]">
                      <Plus
                        size={26}
                        strokeWidth={3.5}
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
                className={cn(
                  "relative flex flex-col items-center gap-1.5 py-1.5 rounded-2xl transition-all duration-300",
                  isActive
                    ? "text-primary-blue bg-primary/10 px-4"
                    : "text-[#555555] hover:text-[#555555] px-3",
                )}
              >
                <div
                  className={cn(
                    "z-10 transition-transform duration-200 active:scale-90",
                    isActive && "scale-110 -translate-y-0.5",
                  )}
                >
                  {Icon ? (
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  ) : null}
                </div>
                <span
                  className={cn(
                    "text-[10px] z-10 font-bold transition-all duration-300",
                    isActive
                      ? "text-primary-blue opacity-100"
                      : "text-[#555555]",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
