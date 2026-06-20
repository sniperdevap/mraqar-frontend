"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Slider } from "@/components/ui/slider";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import { useTranslations, useLocale } from "@/hooks/use-locale";
import { Loader } from "../common/loader";
import { usePropertyTypes, useAreas } from "@/hooks/use-metadata";
import { useSearchAds } from "@/hooks/use-ads";
import { useAdStore } from "@/lib/store/ad-store";
import { useInView } from "react-intersection-observer";
import { Search, X, RotateCcw, DollarSign } from "lucide-react";

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
  const [isPriceFilterOpen, setIsPriceFilterOpen] = useState(false);
  const [showStickySearchBar, setShowStickySearchBar] = useState(false);

  const [propertyType, setPropertyType] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [priceMinDraft, setPriceMinDraft] = useState("");
  const [priceMaxDraft, setPriceMaxDraft] = useState("");
  const [minSliderValue, setMinSliderValue] = useState(0);
  const [maxSliderValue, setMaxSliderValue] = useState(1000);

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

  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

  const getRoundedSliderMax = (value: number) => {
    if (value <= 1000) return 1000;
    if (value <= 5000) return Math.ceil(value / 250) * 250;
    if (value <= 50000) return Math.ceil(value / 1000) * 1000;
    return Math.ceil(value / 10000) * 10000;
  };

  const sliderMax = useMemo(() => {
    const knownMaxPrice = ads.reduce(
      (maxPrice, ad) => Math.max(maxPrice, ad.price || 0),
      0,
    );
    const parsedMax = maxPrice ? Number(maxPrice) : 0;
    return getRoundedSliderMax(
      Math.max(knownMaxPrice, parsedMax, 1000),
    );
  }, [ads, maxPrice]);

  useEffect(() => {
    const parsedMin = minPrice ? Number(minPrice) : 0;
    const parsedMax = maxPrice ? Number(maxPrice) : sliderMax;
    const clampedMin = clamp(
      Number.isFinite(parsedMin) ? parsedMin : 0,
      0,
      sliderMax,
    );
    const clampedMax = clamp(
      Number.isFinite(parsedMax) ? parsedMax : sliderMax,
      0,
      sliderMax,
    );
    const nextMin = Math.min(clampedMin, clampedMax);
    const nextMax = Math.max(clampedMin, clampedMax);

    setPriceMinDraft(minPrice || "");
    setPriceMaxDraft(maxPrice || "");
    setMinSliderValue(nextMin);
    setMaxSliderValue(nextMax);
  }, [minPrice, maxPrice, sliderMax]);

  useEffect(() => {
    if (!isPriceFilterOpen) {
      return;
    }

    const timer = setTimeout(() => {
      const rawMin = priceMinDraft.trim();
      const rawMax = priceMaxDraft.trim();
      const parsedMin = rawMin === "" ? 0 : Number(rawMin);
      const parsedMax = rawMax === "" ? sliderMax : Number(rawMax);

      if (
        (rawMin !== "" && Number.isNaN(parsedMin)) ||
        (rawMax !== "" && Number.isNaN(parsedMax))
      ) {
        return;
      }

      const clampedMin = clamp(parsedMin, 0, sliderMax);
      const clampedMax = clamp(parsedMax, 0, sliderMax);
      setMinSliderValue(Math.min(clampedMin, clampedMax));
      setMaxSliderValue(Math.max(clampedMin, clampedMax));
    }, 350);

    return () => clearTimeout(timer);
  }, [priceMinDraft, priceMaxDraft, sliderMax, isPriceFilterOpen]);

  const handlePriceSearch = () => {
    const rawMin = priceMinDraft.trim();
    const rawMax = priceMaxDraft.trim();
    const nextMinPrice = rawMin === "" ? "" : rawMin;
    const nextMaxPrice = rawMax === "" ? "" : rawMax;

    setMinPrice(nextMinPrice);
    setMaxPrice(nextMaxPrice);
    setIsPriceFilterOpen(false);

    handleFilterAndRedirect({
      minPrice: nextMinPrice,
      maxPrice: nextMaxPrice,
    });
  };

  const handleFilterAndRedirect = (updates: {
    purpose?: string;
    propertyType?: string;
    areas?: string[];
    minPrice?: string;
    maxPrice?: string;
  }) => {
    const finalPurpose = updates.purpose !== undefined ? updates.purpose : activeTab;
    const finalPropType = updates.propertyType !== undefined ? updates.propertyType : propertyType;
    const finalAreas = updates.areas !== undefined ? updates.areas : selectedAreas;
    const finalMinPrice = updates.minPrice !== undefined ? updates.minPrice : minPrice;
    const finalMaxPrice = updates.maxPrice !== undefined ? updates.maxPrice : maxPrice;

    const params = new URLSearchParams();
    if (finalPurpose) params.set("purpose", finalPurpose);
    if (finalPropType && finalPropType !== "all" && finalPropType !== "")
      params.set("propertyType", finalPropType);
    finalAreas.forEach((area) => params.append("area", area));
    if (finalMinPrice) params.set("minPrice", finalMinPrice);
    if (finalMaxPrice) params.set("maxPrice", finalMaxPrice);

    const query = params.toString();
    router.push(query ? `/search?${query}` : "/search", { scroll: false });
  };

  const handleSearch = () => {
    handleFilterAndRedirect({});
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
                src="/images/aqar-new-logo.png"
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
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Image
            src="/images/aqar-new-logo.png"
            alt="Logo"
            width={180}
            height={180}
            className="h-20 md:h-24 w-auto object-contain"
          />
        </div>

        <div className="flex flex-col items-center gap-6 w-full bg-white p-6 rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
          {/* Title */}
          <h1 className="text-xl md:text-2xl font-bold text-[#1f2937] text-center">
            Find Your Perfect Property
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
                onChange={(val) => {
                  setSelectedAreas(val);
                }}
                placeholder={
                  locale === "ar" ? "اختر المنطقة" : "Select Region"
                }
                className="w-full min-h-11 md:min-h-14 h-auto py-1.5 bg-white border border-gray-200 rounded-md flex items-center px-4 text-gray-700  transition-all focus-within:border-[#9a090e] text-[15px] font-medium"
                disabled={isLoading}
                enableGrouping={true}
                dir={direction}
              />
            </div>

            {/* Property Type */}
            <Select
              value={propertyType}
              onValueChange={(val) => {
                setPropertyType(val);
              }}
              disabled={isLoading}
              dir={direction}
            >
              <SelectTrigger className="w-full !h-11 md:!h-14 bg-white border border-gray-200 rounded-md text-gray-700 data-[placeholder]:!text-gray-400 transition-all focus:border-[#9a090e] text-[15px] font-medium px-4">
                <SelectValue
                  placeholder={locale === "ar" ? "اختر نوع العقار" : "Select Property Type"}
                />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {propertyTypes.map((type) => (
                  <SelectItem
                    key={type._id}
                    value={type._id}
                    className="cursor-pointer font-normal text-sm text-gray-800"
                  >
                    {locale === "ar" ? type.labelAr || type.label : type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Purpose Tabs (Pills) */}
            <div className="bg-white !h-11 md:!h-14 w-full rounded-md border border-gray-200 flex  items-center divide-x divide-gray-100" dir={direction}>
              <button
                onClick={() => {
                  setActiveTab("exchange");
                }}
                className={`flex-1 h-full font-medium  transition-all text-[15px] ${activeTab === "exchange"
                  ? "bg-primary text-white"
                  : "text-gray-500 hover:text-gray-700"
                  } ${direction === "rtl" ? "rounded-r-md border-l" : "rounded-l-md border-r"}`}
              >
                {locale === "ar" ? "للبدل" : "Exchange"}
              </button>
              <button
                onClick={() => {
                  setActiveTab("rent");
                }}
                className={`flex-1 h-full font-medium  transition-all text-[15px] ${activeTab === "rent"
                  ? "bg-primary text-white"
                  : "text-gray-500 hover:text-gray-700"
                  } ${direction === "rtl" ? "border-l" : "border-r"}`}
              >
                {locale === "ar" ? "للايجار" : "Rent"}
              </button>
              <button
                onClick={() => {
                  setActiveTab("sale");
                }}
                className={`flex-1 h-full font-medium transition-all text-[15px] ${activeTab === "sale"
                  ? "bg-primary text-white"
                  : "text-gray-500 hover:text-gray-700"
                  } ${direction === "rtl" ? "rounded-l-md" : "rounded-r-md"}`}
              >
                {locale === "ar" ? "للبيع" : "Sale"}
              </button>
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              className="rounded-md h-11 md:!h-14 w-full bg-[#9a090e] hover:bg-[#9a090e]/95 text-white font-medium text-[15px] transition-all active:scale-[0.98]"
            >
              {locale === "ar" ? "بحث" : "Search"}
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
              <div className="mb-6 flex items-center justify-center gap-2 cursor-pointer select-none" onClick={() => setIsPriceFilterOpen(true)}>
                <div className="w-8 h-8 rounded-full border-2 border-[#029a9d] bg-[#029a9d]/10 text-[#029a9d] flex items-center justify-center font-bold text-base shadow-sm hover:scale-105 active:scale-95 transition-all">
                  $
                </div>
                <h2 className="text-xl font-bold text-black tracking-tight hover:text-emerald-700 transition-colors">
                  Latest Listings
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

      <Dialog open={isPriceFilterOpen} onOpenChange={setIsPriceFilterOpen}>
        <DialogContent className="w-[calc(100%-2rem)] !max-w-[calc(100%-2rem)] sm:!max-w-sm rounded-[24px] bg-white !px-6 !py-6 md:!px-8 md:!py-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)]" dir={direction}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-center text-[#1f2937] mb-2">
              {locale === "ar" ? "اختر نطاق السعر" : "Select Price Range"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Price Header */}
            <div>
              <p className="text-[11px] font-bold text-[#8a97ab] uppercase tracking-wider mb-1">
                {locale === "ar" ? "نطاق السعر" : "Price Range"}
              </p>
              <div className="flex items-baseline gap-1 text-primary">
                <span className="text-lg font-bold">
                  {minSliderValue.toLocaleString(locale)}
                </span>
                <span className="text-sm font-semibold opacity-60">
                  {" "}
                  {locale === "ar" ? "د.ك" : "KD"}
                </span>
                <span className="mx-2 text-[#d1d5db]">―</span>
                <span className="text-lg font-bold">
                  {maxSliderValue.toLocaleString(locale)}
                </span>
                <span className="text-sm font-semibold opacity-60">
                  {" "}
                  {locale === "ar" ? "د.ك" : "KD"}
                </span>
              </div>
            </div>

            {/* Slider Area */}
            <div className="relative h-10 mb-2 flex items-center">
              <Slider
                min={0}
                max={sliderMax}
                step={1}
                value={[minSliderValue, maxSliderValue]}
                onValueChange={([nextMinRaw, nextMaxRaw]) => {
                  const nextMin = Math.min(
                    nextMinRaw ?? 0,
                    nextMaxRaw ?? sliderMax,
                  );
                  const nextMax = Math.max(
                    nextMaxRaw ?? sliderMax,
                    nextMinRaw ?? 0,
                  );
                  setMinSliderValue(nextMin);
                  setMaxSliderValue(nextMax);
                  setPriceMinDraft(String(nextMin));
                  setPriceMaxDraft(String(nextMax));
                }}
                onValueCommit={([nextMinRaw, nextMaxRaw]) => {
                  const nextMin = Math.min(
                    nextMinRaw ?? 0,
                    nextMaxRaw ?? sliderMax,
                  );
                  const nextMax = Math.max(
                    nextMaxRaw ?? sliderMax,
                    nextMinRaw ?? 0,
                  );
                  setMinSliderValue(nextMin);
                  setMaxSliderValue(nextMax);
                  setPriceMinDraft(String(nextMin));
                  setPriceMaxDraft(String(nextMax));
                }}
                aria-label="Price range"
              />
            </div>

            {/* Manual Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 text-start">
                <label className="text-[11px] font-bold text-[#8a97ab] uppercase ms-1">
                  {locale === "ar" ? "الحد الأدنى" : "Min Price"}
                </label>
                <Input
                  type="number"
                  min="0"
                  value={priceMinDraft}
                  onChange={(e) => setPriceMinDraft(e.target.value)}
                  placeholder="0"
                  className="h-11 rounded-md border shadow-none border-gray-200 bg-transparent px-4 text-base font-bold text-primary placeholder:text-[#cbd5e1] "
                />
              </div>

              <div className="space-y-1.5 text-start">
                <label className="text-[11px] font-bold text-[#8a97ab] uppercase ms-1">
                  {locale === "ar" ? "الحد الأقصى" : "Max Price"}
                </label>
                <Input
                  type="number"
                  min="0"
                  value={priceMaxDraft}
                  onChange={(e) => setPriceMaxDraft(e.target.value)}
                  placeholder={sliderMax.toString()}
                  className="h-11 rounded-md border border-gray-200 bg-transparent shadow-none px-4 text-base font-bold text-primary placeholder:text-[#cbd5e1] "
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-[#f1f5f9] pt-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  setPriceMinDraft("");
                  setPriceMaxDraft("");
                  setMinSliderValue(0);
                  setMaxSliderValue(sliderMax);
                }}
                className="text-sm font-bold text-[#94a3b8] transition-colors hover:text-[#ef4444]"
              >
                {locale === "ar" ? "إعادة تعيين" : "Reset"}
              </button>

              <Button
                onClick={handlePriceSearch}
                className="h-11 rounded-lg bg-primary px-8 text-sm font-bold text-white hover:bg-primary/90 shadow-sm transition-all active:scale-95"
              >
                {locale === "ar" ? "بحث" : "Search"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
