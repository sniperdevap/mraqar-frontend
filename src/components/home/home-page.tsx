"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dynamic from "next/dynamic";
import { useTranslations, useLocale } from "@/hooks/use-locale";
import { Loader } from "../common/loader";
import { usePropertyTypes, useAreas } from "@/hooks/use-metadata";
import { useSearchAds } from "@/hooks/use-ads";
import { useAdStore } from "@/lib/store/ad-store";
import { useInView } from "react-intersection-observer";
import { Search, X, RotateCcw } from "lucide-react";

const MultiSelect = dynamic(() =>
  import("@/components/ui/multi-select").then((mod) => mod.MultiSelect),
);
const AdCard = dynamic(() =>
  import("@/components/ads/ad-card").then((mod) => mod.AdCard),
);
const HomeAdCard = dynamic(() =>
  import("./home-ad-card").then((mod) => mod.HomeAdCard),
);

export function HomePage() {
  const router = useRouter();
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const { locale, direction } = useLocale();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showStickySearchBar, setShowStickySearchBar] = useState(false);

  const [propertyType, setPropertyType] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const adsPerPage = 10;

  const { data: propertyTypesData, isLoading: propertyTypesLoading } =
    usePropertyTypes();
  const { data: areasData, isLoading: areasLoading } = useAreas();
  const {
    data: adsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: adsLoading,
  } = useSearchAds({}, adsPerPage);
  const { ref: prefetchRef, inView } = useInView({
    threshold: 0,
    rootMargin: "100px 0px",
  });

  const propertyTypes = propertyTypesData || [];
  const areas = areasData || [];
  const ads = adsData?.pages.flatMap((page) => page.ads) || [];
  const prefetchTriggerIndex = Math.max(
    0,
    ads.length - Math.ceil(adsPerPage / 2),
  );
  const isLoading = propertyTypesLoading || areasLoading;
  const [hasSetAdsForPage, setHasSetAdsForPage] = useState<number[]>([]);
  const { setAds } = useAdStore();

  useEffect(() => {
    if (adsData?.pages) {
      adsData.pages.forEach((page, index) => {
        if (!hasSetAdsForPage.includes(index) && page.ads.length > 0) {
          setAds(page.ads);
          setHasSetAdsForPage((prev) => [...prev, index]);
        }
      });
    }
  }, [adsData?.pages, hasSetAdsForPage, setAds]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const handleScroll = () => {
      const searchButton = document.getElementById("main-search-button");
      if (searchButton) {
        const rect = searchButton.getBoundingClientRect();
        // Show sticky header when the bottom of the search button is above the viewport
        setShowStickySearchBar(rect.bottom < 0);
      } else {
        setShowStickySearchBar(window.scrollY > 300);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (activeTab) params.set("purpose", activeTab);
    if (propertyType && propertyType !== "all")
      params.set("propertyType", propertyType);
    selectedAreas.forEach((area) => params.append("area", area));
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);

    const query = params.toString();
    router.push(query ? `/search?${query}` : "/search", { scroll: false });
    setIsFilterOpen(false);
  };

  const handleReset = () => {
    setActiveTab("");
    setPropertyType("");
    setSelectedAreas([]);
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] relative overflow-x-hidden bg-[#f8f9fa] md:bg-white">
      {showStickySearchBar && (
        <div
          className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm animate-slide-down"
          dir={direction}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/images/aqar-logo.png"
                alt="Logo"
                width={32}
                height={32}
                className="h-14 w-auto object-contain"
              />
              {/* <div className="flex flex-col">
                <span className="text-[11px] md:text-[13px] font-bold text-black uppercase leading-tight">{tCommon('buttons.search')}</span>
                <span className="text-[9px] md:text-[10px] font-semibold text-gray-500 capitalize leading-tight">
                  {t('latestListings.propertyInKuwait', { count: adsData?.pages[0]?.total || 0 })}
                </span>
              </div> */}
            </div>

            <button
              className="flex flex-col items-center justify-center text-black hover:text-gray-600 transition-transform active:scale-95"
              onClick={() => setIsFilterOpen(true)}
            >
              <Search size={20} className="mb-0.5 stroke-[2.5]" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {tCommon("buttons.search")}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Hero Header Section */}
      <section
        className="w-full pt-4 md:pt-4 px-4 sm:px-6 lg:px-8 max-w-lg mx-auto mb-4 relative z-10"
        dir={direction}
      >
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Logo */}
          <div className="mb-2">
            <Image
              src="/images/aqar-logo.png"
              alt="Logo"
              width={180}
              height={180}
              className="h-24 md:h-28 w-auto object-contain"
            />
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-[#333] text-center">
            {locale === "ar" ? "إبحث عن عقارك" : "Find Your Property"}
          </h1>

          {/* Search Form */}
          <div className="w-full space-y-4">
            {/* Area Search */}
            <div className="relative">
              <MultiSelect
                options={areas.map((a) => ({
                  label: locale === "ar" ? a.labelAr : a.label,
                  value: a._id,
                  governorate:
                    locale === "ar" ? a.governorateAr : a.governorate,
                }))}
                value={selectedAreas}
                onChange={setSelectedAreas}
                placeholder={
                  locale === "ar" ? "اكتب المنطقة للبحث" : "Type Area to Search"
                }
                className="!h-11 md:!h-12 bg-white border border-gray-200 rounded-full flex items-center px-4 text-gray-700 shadow-sm"
                disabled={isLoading}
                enableGrouping={true}
                dir={direction}
              />
            </div>

            {/* Property Type */}
            <Select
              value={propertyType}
              onValueChange={setPropertyType}
              disabled={isLoading}
              dir={direction}
            >
              <SelectTrigger className="!h-11 md:!h-12 bg-white border border-gray-200 rounded-full text-gray-700 shadow-sm">
                <SelectValue
                  placeholder={locale === "ar" ? "نوع العقار" : "Property Type"}
                />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {propertyTypes.map((type) => (
                  <SelectItem
                    key={type._id}
                    value={type._id}
                    className="cursor-pointer font-semibold uppercase text-[12px]"
                  >
                    {locale === "ar" ? type.labelAr || type.label : type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Purpose Tabs (Pills) */}
            <div className="bg-white p-1 h-11 md:h-12 w-full rounded-full border border-gray-200 flex shadow-sm">
              <button
                onClick={() => setActiveTab("rent")}
                className={`flex-1 h-full font-bold rounded-full transition-all text-[13px] ${
                  activeTab === "rent"
                    ? "bg-[#eef4fb] text-[#197aca]"
                    : "text-gray-500"
                }`}
              >
                {t("tabs.rent")}
              </button>
              <button
                onClick={() => setActiveTab("sale")}
                className={`flex-1 h-full font-bold rounded-full transition-all text-[13px] ${
                  activeTab === "sale"
                    ? "bg-[#eef4fb] text-[#197aca]"
                    : "text-gray-500"
                }`}
              >
                {t("tabs.sale")}
              </button>
              <button
                onClick={() => setActiveTab("exchange")}
                className={`flex-1 h-full font-bold rounded-full transition-all text-[13px] ${
                  activeTab === "exchange"
                    ? "bg-[#eef4fb] text-[#197aca]"
                    : "text-gray-500"
                }`}
              >
                {t("tabs.exchange")}
              </button>
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              className="rounded-full h-11 md:h-12 w-full bg-[#197aca] hover:bg-[#1565a8] text-white font-bold text-[16px] shadow-md transition-all active:scale-95"
            >
              {tCommon("buttons.search")}
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Ads Section */}
      <section className="mt-0 w-full pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {adsLoading ? (
            <div className="flex w-full items-center justify-center mt-10">
              <Loader />
            </div>
          ) : ads.length > 0 ? (
            <>
              <div className="mb-4">
                <h2 className="text-xl text-center md:text-xl font-bold text-black">
                  {t("latestListings.latestAds")}
                </h2>
              </div>
              <div className="flex flex-col gap-2">
                {ads.map((ad, index) => (
                  <div
                    key={ad._id}
                    ref={
                      hasNextPage && index === prefetchTriggerIndex
                        ? prefetchRef
                        : undefined
                    }
                  >
                    <HomeAdCard
                      ad={ad}
                      onClick={() => router.push(`/ads/${ad._id}`)}
                    />
                  </div>
                ))}
              </div>

              {isFetchingNextPage && (
                <div className="flex justify-center mt-8 py-2">
                  {isFetchingNextPage ? (
                    <Loader size="sm" />
                  ) : (
                    <div className="h-8" />
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg font-medium">
                {t("latestListings.noAds")}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
