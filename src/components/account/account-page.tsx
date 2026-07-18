"use client";

import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";

const loadProfileTab = () => import("./tabs/profile-tab");
const loadAdBalanceTab = () => import("./tabs/ad-balance-tab");
const loadWishlistTab = () => import("./tabs/wishlist-tab");
const loadMyAdsTab = () => import("./tabs/my-ads-tab");
const loadFavouritesTab = () => import("./tabs/favourites-tab");

const ProfileTab = dynamic(() => loadProfileTab().then((mod) => mod.ProfileTab));
const AdBalanceTab = dynamic(() =>
  loadAdBalanceTab().then((mod) => mod.AdBalanceTab),
);
const WishlistTab = dynamic(() =>
  loadWishlistTab().then((mod) => mod.WishlistTab),
);
const MyAdsTab = dynamic(() => loadMyAdsTab().then((mod) => mod.MyAdsTab));
const FavouritesTab = dynamic(() =>
  loadFavouritesTab().then((mod) => mod.FavouritesTab),
);
import { useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

const VALID_TABS = [
  "profile",
  "ad-balance",
  "my-ads",
  "wishlist",
  "favourites",
] as const;
type TabType = (typeof VALID_TABS)[number];

export function AccountPage() {
  const searchParams = useSearchParams();
  const tabsListRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("common.account");
  const tabParam = searchParams.get("tab") || "profile";
  const activeTab = VALID_TABS.includes(tabParam as TabType)
    ? tabParam
    : "profile";

  useEffect(() => {
    const warmInactiveTabs = () => {
      void Promise.allSettled([
        loadProfileTab(),
        loadAdBalanceTab(),
        loadWishlistTab(),
        loadMyAdsTab(),
        loadFavouritesTab(),
      ]);
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(warmInactiveTabs, {
        timeout: 2000,
      });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = globalThis.setTimeout(warmInactiveTabs, 1000);
    return () => globalThis.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (tabsListRef.current) {
      const activeTrigger = tabsListRef.current.querySelector(
        '[data-state="active"]',
      );
      if (activeTrigger) {
        activeTrigger.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeTab]);

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "profile") {
      params.delete("tab");
    } else {
      params.set("tab", value);
    }
    const queryString = params.toString();
    const nextUrl = `/account${queryString ? `?${queryString}` : ""}`;

    // Account tab content is already a local client boundary. Native history
    // keeps the URL/back button in sync without requesting a new RSC payload.
    window.history.pushState(null, "", nextUrl);
  };

  return (
    <div className="min-h-screen">
      <div className="w-full">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList
            ref={tabsListRef}
            className="w-full bg-transparent border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar h-auto rounded-none p-0"
          >
            <div className="flex md:grid w-full md:grid-cols-4 max-w-4xl mx-auto">
              <TabsTrigger
                value="profile"
                className="flex-1 min-w-[100px] md:min-w-0 rounded-none border-b-2 border-transparent data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary transition-all text-sm md:text-base py-3 px-4 text-gray-600 hover:text-gray-900 data-[state=active]:hover:text-white"
              >
                {t("profile")}
              </TabsTrigger>
              <TabsTrigger
                value="ad-balance"
                className="flex-1 min-w-[100px] md:min-w-0 rounded-none border-b-2 border-transparent data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary transition-all text-sm md:text-base py-3 px-4 text-gray-600 hover:text-gray-900 data-[state=active]:hover:text-white"
              >
                {t("adBalance")}
              </TabsTrigger>
              <TabsTrigger
                value="my-ads"
                className="flex-1 min-w-[100px] md:min-w-0 rounded-none border-b-2 border-transparent data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary transition-all text-sm md:text-base py-3 px-4 text-gray-600 hover:text-gray-900 data-[state=active]:hover:text-white"
              >
                {t("myAds")}
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="hidden">
                {t("wishlist")}
              </TabsTrigger>
              <TabsTrigger
                value="favourites"
                className="flex-1 min-w-[100px] md:min-w-0 rounded-none border-b-2 border-transparent data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary transition-all text-sm md:text-base py-3 px-4 text-gray-600 hover:text-gray-900 data-[state=active]:hover:text-white"
              >
                {t("favourites")}
              </TabsTrigger>
            </div>
          </TabsList>

          <TabsContent value="profile" className="mt-0 pb-6 ">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="ad-balance" className="mt-0 pb-6">
            <AdBalanceTab />
          </TabsContent>

          <TabsContent value="my-ads" className="mt-0 pb-6">
            <MyAdsTab />
          </TabsContent>

          <TabsContent value="wishlist" className="mt-0 pb-6">
            <WishlistTab />
          </TabsContent>

          <TabsContent value="favourites" className="mt-0 pb-6">
            <FavouritesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
