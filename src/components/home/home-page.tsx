"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
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
import { Search } from "lucide-react";
import { HomeAdCard } from "./home-ad-card";
import { MultiSelect } from "@/components/ui/multi-select";

const PriceFilterDialog = dynamic(
  () =>
    import("./price-filter-dialog").then((mod) => mod.PriceFilterDialog),
  { ssr: false },
);

export function HomePage() {
  const router = useRouter();
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const { locale, direction } = useLocale();

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
    return getRoundedSliderMax(Math.max(knownMaxPrice, parsedMax, 1000));
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
    const finalPurpose =
      updates.purpose !== undefined ? updates.purpose : activeTab;
    const finalPropType =
      updates.propertyType !== undefined ? updates.propertyType : propertyType;
    const finalAreas =
      updates.areas !== undefined ? updates.areas : selectedAreas;
    const finalMinPrice =
      updates.minPrice !== undefined ? updates.minPrice : minPrice;
    const finalMaxPrice =
      updates.maxPrice !== undefined ? updates.maxPrice : maxPrice;

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
                src="/images/aqar-new-logo-sm.webp"
                alt="Mr aqar Logo"
                width={84}
                height={56}
                priority
                className="h-14 w-[84px] object-contain"
                style={{ width: 84, height: 56 }}
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
              onClick={() => router.push("/search")}
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
        className="w-full pt-4 md:pt-4 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto mb-4 relative z-10"
        dir={direction}
      >
        {/* LCP image: fixed box reserves space before decode (avoids CLS). */}
        <div
          className="flex justify-center mb-4 mx-auto"
          style={{ width: 168, height: 112 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/aqar-new-logo-hero.webp"
            alt="Mr aqar Logo"
            width={168}
            height={112}
            fetchPriority="high"
            decoding="async"
            className="object-contain"
            style={{ width: 168, height: 112 }}
          />
        </div>

        <div className="flex flex-col items-center gap-6 w-full bg-white p-6 rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
          {/* Title */}
          <h1 className="text-xl md:text-xl font-bold text-[#1f2937] text-center">
            {t("hero.title")}
          </h1>

          {/* Search Form */}
          <div className="w-full space-y-4">
            {/* Area Search */}
            <div className="relative">
              <MultiSelect
                options={areas.map((a) => ({
                  label: locale === "ar" ? a.labelAr : a.label,
                  value: String(a.id),
                  governorate:
                    locale === "ar" ? a.governorateAr : a.governorate,
                }))}
                value={selectedAreas}
                onChange={(val) => {
                  setSelectedAreas(val);
                }}
                placeholder={t("search.areaPlaceholder")}
                className="w-full min-h-10 md:min-h-11 h-auto py-1 bg-white border border-gray-300 rounded-md flex items-center px-3 text-gray-700  transition-all focus-within:border-[#9a090e] text-sm font-medium"
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
              <SelectTrigger
                aria-label={t("search.propertyTypePlaceholder")}
                className="w-full !h-10 md:!h-11 bg-white border border-gray-300 rounded-md text-gray-700 data-[placeholder]:!text-gray-500 transition-all focus:border-[#9a090e] text-sm font-medium px-3"
              >
                <SelectValue
                  placeholder={t("search.propertyTypePlaceholder")}
                />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {propertyTypes.map((type) => (
                  <SelectItem
                    key={type.id}
                    value={String(type.id)}
                    className="cursor-pointer font-normal text-sm text-gray-800"
                  >
                    {locale === "ar" ? type.labelAr || type.label : type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Purpose Tabs (Pills) */}
            <div className="bg-white !h-10 md:!h-11 w-full rounded-md border border-gray-300 flex  items-center divide-x divide-gray-100" dir={direction}>
              <button
                onClick={() => {
                  setActiveTab("exchange");
                }}
                className={`flex-1 h-full font-medium  transition-all text-sm ${activeTab === "exchange"
                  ? "bg-primary text-white"
                  : "text-gray-500 hover:text-gray-700"
                  } ${direction === "rtl" ? "rounded-r-md border-l" : "rounded-l-md border-r"}`}
              >
                {t("tabs.exchange")}
              </button>
              <button
                onClick={() => {
                  setActiveTab("rent");
                }}
                className={`flex-1 h-full font-medium  transition-all text-sm ${activeTab === "rent"
                  ? "bg-primary text-white"
                  : "text-gray-500 hover:text-gray-700"
                  } ${direction === "rtl" ? "border-l" : "border-r"}`}
              >
                {t("tabs.rent")}
              </button>
              <button
                onClick={() => {
                  setActiveTab("sale");
                }}
                className={`flex-1 h-full font-medium transition-all text-sm ${activeTab === "sale"
                  ? "bg-primary text-white"
                  : "text-gray-500 hover:text-gray-700"
                  } ${direction === "rtl" ? "rounded-l-md" : "rounded-r-md"}`}
              >
                {t("tabs.sale")}
              </button>
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              className="rounded-xl !h-10 md:!h-11 w-full mt-2 bg-[#9a090e] hover:bg-[#9a090e]/95 border-none text-white font-medium text-sm shadow-[0_2px_4px_rgba(154,9,14,0.2)] transition-all active:scale-[0.98]"
            >
              {tCommon("buttons.search")}
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Ads Section */}
      <section className="mt-0 w-full pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header always rendered so it does not pop in after ads load (CLS). */}
          <button
            type="button"
            onClick={() => setIsPriceFilterOpen(true)}
            aria-label={`${t("latestListings.title")}: ${t("search.selectPriceRange")}`}
            className="group mb-6 flex items-center justify-center gap-2 select-none mx-auto min-h-7"
          >
            {/* <span className="border-[#169899] text-[#169899] flex items-center justify-center font-bold text-base group-hover:scale-105 group-active:scale-95 transition-all duration-200">
               <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M12.0049 22.0027C6.48204 22.0027 2.00488 17.5256 2.00488 12.0027C2.00488 6.4799 6.48204 2.00275 12.0049 2.00275C17.5277 2.00275 22.0049 6.4799 22.0049 12.0027C22.0049 17.5256 17.5277 22.0027 12.0049 22.0027ZM12.0049 20.0027C16.4232 20.0027 20.0049 16.421 20.0049 12.0027C20.0049 7.58447 16.4232 4.00275 12.0049 4.00275C7.5866 4.00275 4.00488 7.58447 4.00488 12.0027C4.00488 16.421 7.5866 20.0027 12.0049 20.0027ZM8.50488 14.0027H14.0049C14.281 14.0027 14.5049 13.7789 14.5049 13.5027C14.5049 13.2266 14.281 13.0027 14.0049 13.0027H10.0049C8.62417 13.0027 7.50488 11.8835 7.50488 10.5027C7.50488 9.12203 8.62417 8.00275 10.0049 8.00275H11.0049V6.00275H13.0049V8.00275H15.5049V10.0027H10.0049C9.72874 10.0027 9.50488 10.2266 9.50488 10.5027C9.50488 10.7789 9.72874 11.0027 10.0049 11.0027H14.0049C15.3856 11.0027 16.5049 12.122 16.5049 13.5027C16.5049 14.8835 15.3856 16.0027 14.0049 16.0027H13.0049V18.0027H11.0049V16.0027H8.50488V14.0027Z"></path></svg>
            </span> */}
            <h2 className="text-xl font-bold text-black tracking-tight group-hover:text-[#169899] transition-colors">
              {t("latestListings.title")}
            </h2>
          </button>

          {adsLoading ? (
            <div className="flex flex-col gap-2.5" aria-busy="true" aria-label="Loading">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="w-full bg-[#f7eff1] border border-[#f3d9de] rounded-2xl overflow-hidden p-2.5 animate-pulse"
                >
                  <div className="flex flex-row w-full items-start gap-2.5">
                    <div className="w-[64px] h-[64px] shrink-0 rounded-lg bg-[#efdee2]" />
                    <div className="flex-1 flex flex-col min-w-0 min-h-[64px] justify-center gap-2">
                      <div className="h-5 w-3/4 rounded bg-[#efdee2]" />
                      <div className="h-5 w-1/2 rounded bg-[#efdee2]" />
                    </div>
                  </div>
                  <div className="mt-1 space-y-1.5">
                    <div className="h-5 w-full rounded bg-[#efdee2]" />
                    <div className="h-5 w-5/6 rounded bg-[#efdee2]" />
                  </div>
                </div>
              ))}
            </div>
          ) : ads.length > 0 ? (
            <>
              <div className="flex flex-col gap-2.5">
                {ads.map((ad, index) => (
                  <div
                    key={ad.id}
                    ref={
                      hasNextPage && index === prefetchTriggerIndex
                        ? prefetchRef
                        : undefined
                    }
                  >
                    <HomeAdCard ad={ad} />
                  </div>
                ))}
              </div>

              {isFetchingNextPage && (
                <div className="flex justify-center mt-8 py-2">
                  <Loader size="sm" />
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

      {isPriceFilterOpen && (
        <PriceFilterDialog
          open={isPriceFilterOpen}
          onOpenChange={setIsPriceFilterOpen}
          direction={direction}
          locale={locale}
          sliderMax={sliderMax}
          minSliderValue={minSliderValue}
          maxSliderValue={maxSliderValue}
          priceMinDraft={priceMinDraft}
          priceMaxDraft={priceMaxDraft}
          onMinSliderChange={setMinSliderValue}
          onMaxSliderChange={setMaxSliderValue}
          onPriceMinDraftChange={setPriceMinDraft}
          onPriceMaxDraftChange={setPriceMaxDraft}
          onReset={() => {
            setPriceMinDraft("");
            setPriceMaxDraft("");
            setMinSliderValue(0);
            setMaxSliderValue(sliderMax);
          }}
          onSearch={handlePriceSearch}
          labels={{
            title: t("search.selectPriceRange"),
            priceRangeLabel: t("search.priceRangeLabel"),
            currency: tCommon("currency"),
            minPriceLabel: t("search.minPriceLabel"),
            maxPriceLabel: t("search.maxPriceLabel"),
            reset: t("search.reset"),
            search: tCommon("buttons.search"),
          }}
        />
      )}
    </div>
  );
}
