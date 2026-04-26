"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Home,
  MapPin,
  User as UserIcon,
  Plus,
  Bell,
  LogOut,
  LogIn,
  ChevronLeft,
  Heart,
  Menu,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";
import { useTranslations, useLocale } from "@/hooks/use-locale";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UserSubscription } from "@/lib/api/subscription-plan";
import { User } from "@/types/auth";
import { getUnreadNotificationCount } from "@/lib/api/account";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuthStore();
  const t = useTranslations("common");

  const { direction } = useLocale();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const initialHeight = window.innerHeight;

    const handleResize = () => {
      // When the keyboard opens, the visual viewport height shrinks significantly
      const heightDiff = initialHeight - viewport.height;
      setIsKeyboardOpen(heightDiff > 100);
    };

    viewport.addEventListener("resize", handleResize);

    return () => {
      viewport.removeEventListener("resize", handleResize);
    };
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch {
      // silently fail
    }
  }, [isAuthenticated]);

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

  const handleCreateAdClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/auth/signin");
      return;
    }

    try {
      await useAuthStore.getState().refreshSubscriptions();

      const latestUser = useAuthStore.getState().user;
      console.log("Latest user data after refresh:", latestUser);
      const subs = (latestUser as User)?.subscriptions || [];
      const hasActiveSubWithCredits = subs.some(
        (sub: UserSubscription) => sub.credits > 0,
      );

      if (hasActiveSubWithCredits) {
        router.push("/ads/create");
      } else {
        toast.info(t("ads.subscriptionRequired"));
        router.push("/plans");
      }
    } catch (error) {
      toast.error(t("messages.error"));
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav
        className={cn(
          "hidden lg:flex items-center px-12 py-2 bg-white  border-b border-gray-200 sticky top-0 z-50",
          !showStandardNav && "lg:hidden",
        )}
      >
        <div className="flex-shrink-0">
          <Link href="/">
            <Image
              src="/images/aqar-logo.png"
              alt="Mr aqar Logo"
              width={100}
              height={40}
              className="h-16 w-auto"
            />
          </Link>
        </div>

        <div className="flex-1 flex justify-center items-center gap-8 text-[15px] font-medium">
          <Link
            href="/"
            className="text-gray-900 hover:text-primary transition-colors px-2"
          >
            {t("nav.home")}
          </Link>
          <Link
            href="/offices"
            className="text-gray-900 hover:text-primary transition-colors px-2"
          >
            {t("nav.offices")}
          </Link>
          <Link
            href="/plans"
            className="text-gray-900 hover:text-primary transition-colors px-2"
          >
            {t("nav.plans")}
          </Link>
          <Link
            href="/account"
            className="text-gray-900 hover:text-primary transition-colors px-2"
          >
            {t("nav.account")}
          </Link>
          <LanguageSwitcher />

          <Button
            variant="outline"
            className="border-gray-200 text-gray-900 hover:bg-gray-50 hover:text-primary rounded-xl px-6 py-2 h-10 text-sm font-semibold ml-4"
            onClick={handleCreateAdClick}
          >
            + {t("nav.addFreeAd")}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {pathname === "/" && (
            <button
              onClick={() => router.push("/notifications")}
              className="p-2 text-gray-900 hover:text-primary transition-colors relative cursor-pointer"
            >
              <Bell size={24} strokeWidth={1.5} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          )}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              title={t("nav.logout")}
            >
              <LogOut size={24} strokeWidth={1.5} />
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
              <button onClick={() => router.push('/auth/signin')} className="p-2 text-gray-900 hover:text-primary transition-colors cursor-pointer" title={t('nav.login')}>
                {t('nav.login')}
              </button>
            ))} */}
        </div>
      </nav>

      {/* Mobile Top Navbar */}
      {showStandardNav && (
        <nav className="lg:hidden flex items-center justify-between px-4 py-3 bg-white  border-b border-gray-200 sticky top-0 z-50 h-20">
          <div className="flex justify-between w-full" dir="ltr">
            {isAdDetailPage || isSearchPage ? (
              <button
                onClick={() => router.push("/")}
                className="p-2 text-gray-700 hover:text-primary transition-colors cursor-pointer"
              >
                <ChevronLeft size={28} />
              </button>
            ) : null}
            <div className="flex-shrink-0">
              <Link href="/">
                <Image
                  src="/images/aqar-logo.png"
                  alt="Mr aqar Logo"
                  width={100}
                  height={40}
                  className="h-16 w-auto"
                />
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* {isAuthenticated && isAdDetailPage && adFavoriteState && !adFavoriteState.isLoading && (
              <button onClick={handleMobileFavoriteToggle} disabled={adFavoriteState.isFavoriteLoading} className="p-2 transition-colors cursor-pointer">
                <Heart size={24} strokeWidth={1.5} className={adFavoriteState.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-900'} />
              </button>
            )} */}
            {pathname === "/" && (
              <button
                onClick={() => router.push("/notifications")}
                className="p-2 text-gray-900 transition-colors relative cursor-pointer"
              >
                <Bell size={24} strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            )}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="hidden md:flex lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                title={t("nav.logout")}
              >
                <LogOut size={24} strokeWidth={1.5} />
              </button>
            )}
            {/* <>
              {pathname === '/' &&
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
                  <button onClick={() => router.push('/auth/signin')} className="p-2 text-gray-900 transition-colors cursor-pointer" title={t('nav.login')}>
                    <LogIn size={24} strokeWidth={1.5} />
                  </button>
                ))}
            </> */}
            {pathname.startsWith("/auth") && (
              <Link
                href="https://wa.me/96590078005"
                target="_blank"
                className="flex flex-col items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="">
                  <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="#25D366"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs sm:text-sm">
                    {t("plan.forHelpContactUs")}
                  </span>
                </div>
              </Link>
            )}
          </div>
        </nav>
      )}

      {/* Specialized Mobile Header for Create Listing */}
      {isSpecialRoute && (
        <nav className=" flex items-center px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-50 h-16">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-gray-700 hover:text-primary transition-colors cursor-pointer"
          >
            <ChevronLeft
              size={28}
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
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg flex items-center justify-around py-2 px-4 z-50 rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.06)] h-[4.5rem] border-t border-gray-100/50">
          {[
            { href: "/", icon: Home, label: t("nav.home") },
            { href: "/offices", icon: MapPin, label: t("nav.offices") },
            { isCentral: true },
            { href: "/account", icon: UserIcon, label: t("nav.myAccount") },
            { href: "/menu", icon: Menu, label: t("nav.menu") },
          ].map((item, idx) => {
            if (item.isCentral) {
              return (
                <div
                  key="central"
                  className="flex items-center justify-center -translate-y-[3px]"
                >
                  <motion.button
                    onClick={handleCreateAdClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    className="focus:outline-none group"
                  >
                    <div className="flex items-center justify-center w-[44px] h-[44px] rounded-full border border-primary/50 bg-primary/10 cursor-pointer transition-all duration-300">
                      <div className="flex items-center justify-center w-[36px] h-[36px] bg-white rounded-full shadow-sm">
                        <Plus
                          size={24}
                          strokeWidth={2}
                          className="text-gray-900"
                        />
                      </div>
                    </div>
                  </motion.button>
                </div>
              );
            }

            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href || "menu"}
                href={item.href || "/menu"}
                prefetch={true}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 py-1 px-3 rounded-2xl transition-all duration-300",
                  isActive
                    ? "text-primary-blue"
                    : "text-[#555555] hover:text-[#555555]",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 "
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                <motion.div
                  animate={
                    isActive ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }
                  }
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="z-10"
                >
                  {Icon ? (
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  ) : null}
                </motion.div>
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
