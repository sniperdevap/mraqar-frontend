"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { usePropertyTypes, useAreas } from "@/hooks/use-metadata";
import { useSearchAds } from "@/hooks/use-ads";
import { useAdStore } from "@/lib/store/ad-store";
import Link from "next/link";
import { Search } from "lucide-react";
import { HomeAdCard } from "./home-ad-card";
import { MultiSelect } from "@/components/ui/multi-select";

const PriceFilterDialog = dynamic(
  () =>
    import("./price-filter-dialog").then((mod) => mod.PriceFilterDialog),
  { ssr: false },
);

/**
 * A/B flag: transaction type (rent/sale/exchange) first, before region and
 * property type — an early micro-commitment before the heavier choices.
 * Flip to false to restore the original region -> type -> purpose order.
 */
const SEARCH_PURPOSE_FIRST =
  process.env.NEXT_PUBLIC_SEARCH_PURPOSE_FIRST !== "false";

export function HomePage() {
  const router = useRouter();
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const { locale, direction } = useLocale();

  const [isPriceFilterOpen, setIsPriceFilterOpen] = useState(false);

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
  // ponytail: home shows the first page only — "show more" hands off to /search
  // instead of infinite-scrolling the whole catalogue here.
  const { data: adsData, isLoading: adsLoading } = useSearchAds({}, adsPerPage);

  const propertyTypes = propertyTypesData || [];
  const areas = areasData || [];
  const ads = useMemo(
    () => adsData?.pages.flatMap((page) => page.ads) ?? [],
    [adsData?.pages],
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

  const purposeTabs = (
    <>
          {/* Purpose Tabs — sliding segmented control */}
          <div
            className="bg-gray-50 !h-11 md:!h-12 w-full rounded-xl p-1 border border-gray-200/70"
            dir={direction}
          >
            <div className="relative h-full flex items-center">
              <div
                className="absolute top-0 bottom-0 w-1/3 rounded-xl bg-white shadow-sm transition-all duration-300 ease-out"
                style={{
                  insetInlineStart:
                    activeTab === "exchange"
                      ? "0%"
                      : activeTab === "rent"
                        ? "33.333%"
                        : activeTab === "sale"
                          ? "66.666%"
                          : "0%",
                  opacity: activeTab ? 1 : 0,
                }}
              />
              {[
                { key: "exchange", label: t("tabs.exchange") },
                { key: "rent", label: t("tabs.rent") },
                { key: "sale", label: t("tabs.sale") },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`relative z-10 flex-1 h-full flex items-center justify-center rounded-xl font-light transition-colors text-[15px] ${activeTab === key
                      ? "text-gray-900 font-medium"
                      : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

    </>
  );

  const areaField = (
    <>
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
              className="w-full min-h-11 md:min-h-12 h-auto py-1 px-4 bg-white border border-gray-200 rounded-xl flex items-center text-gray-700 transition-all hover:border-primary/50 hover:bg-primary/[0.03] focus-within:border-primary data-[state=open]:border-primary data-[state=open]:shadow-[0_4px_20px_rgba(225,29,29,0.15)] text-base font-medium"
              disabled={isLoading}
              enableGrouping={true}
              dir={direction}
            />
          </div>

    </>
  );

  const propertyTypeField = (
    <>
          {/* Property Type */}
          <div className="relative">
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
                className="w-full !h-11 md:!h-12 px-4 bg-white border border-gray-200 rounded-xl text-gray-700 data-[placeholder]:!text-gray-400 data-[placeholder]:!font-normal transition-all hover:border-primary/50 hover:bg-primary/[0.03] focus:border-primary data-[state=open]:border-primary data-[state=open]:shadow-[0_4px_20px_rgba(225,29,29,0.15)] text-base font-medium"
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
                    className="cursor-pointer font-normal text-base text-gray-800"
                  >
                    {locale === "ar" ? type.labelAr || type.label : type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>


    </>
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] relative overflow-x-hidden bg-[#f8f9fa] md:bg-white">

      {/* Hero Header Section */}
      <section
        className="w-full pt-4 md:pt-4 px-4 sm:px-4 lg:px-4 max-w-xl mx-auto mb-4 relative z-30 isolate"
        dir={direction}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-8 -top-12 -z-10 h-[320px] overflow-hidden select-none"
          style={{ transform: direction === "rtl" ? "scaleX(-1)" : undefined }}
        >
          <div
            className="h-full w-full"
            style={{
              background: [
                // broad soft spotlight behind the logo/title
                "radial-gradient(ellipse 70% 55% at 50% 0%, color-mix(in srgb, var(--color-brand-teal) 16%, transparent) 0%, transparent 72%)",
                // tighter, brighter core
                "radial-gradient(ellipse 32% 26% at 50% 4%, color-mix(in srgb, var(--color-brand-teal) 14%, transparent) 0%, transparent 65%)",
                // off-centre streak that keeps it from reading as a perfect circle
                "radial-gradient(ellipse 38% 22% at 74% 10%, color-mix(in srgb, var(--color-brand-teal) 9%, transparent) 0%, transparent 60%)",
              ].join(", "),
              filter: "blur(6px)",
            }}
          />
        </div>
        {/* LCP image: fixed box reserves space before decode (avoids CLS). */}
        <div
          className="flex justify-center mb-4 mx-auto"
          style={{ width: 132, height: 88 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/aqar-new-logo-hero.webp"
            alt="Mr aqar"
            width={132}
            height={88}
            fetchPriority="high"
            decoding="async"
            className="object-contain"
            style={{ width: 132, height: 88 }}
          />
        </div>

        {/* Title sits outside any card, floating over the page */}
        <h1 className="text-[22px] md:text-2xl font-bold tracking-tight text-[#1f2937] text-center mb-5">
          {t("hero.title")}
        </h1>

        {/* Search Form */}
        <div className="w-full space-y-4 p-5 sm:p-6 rounded-2xl border border-gray-100 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
          {SEARCH_PURPOSE_FIRST ? (
            <>
              {purposeTabs}
              {areaField}
              {propertyTypeField}
            </>
          ) : (
            <>
              {areaField}
              {propertyTypeField}
              {purposeTabs}
            </>
          )}

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            className="rounded-xl !h-11 md:!h-12 w-full mt-5 bg-[#e11d1d] hover:bg-[#b91616] border-none text-white font-light text-base tracking-wide transition-all hover:shadow-[0_6px_18px_rgba(225,29,29,0.25)] active:scale-[0.98]"
          >
            <Search size={18} className="me-1.5" />
            {tCommon("buttons.search")}
          </Button>
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
            <h2 className="text-xl font-bold text-black tracking-tight group-hover:text-gray-600 transition-colors">
              {t("latestListings.title")}
            </h2>
          </button>

          {adsLoading ? (
            <div className="flex flex-col gap-2.5" aria-busy="true" aria-label="Loading">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="w-full bg-card-mint rounded-2xl overflow-hidden p-2.5 animate-pulse"
                >
                  <div className="flex flex-row w-full items-start gap-2.5">
                    <div className="w-[75px] h-[75px] shrink-0 rounded-lg bg-[#d7e6e8]" />
                    <div className="flex-1 flex flex-col min-w-0 min-h-[96px] justify-center gap-2">
                      <div className="h-5 w-3/4 rounded bg-[#d7e6e8]" />
                      <div className="h-5 w-1/2 rounded bg-[#d7e6e8]" />
                    </div>
                  </div>
                  <div className="mt-1 space-y-1.5">
                    <div className="h-5 w-full rounded bg-[#d7e6e8]" />
                    <div className="h-5 w-5/6 rounded bg-[#d7e6e8]" />
                  </div>
                </div>
              ))}
            </div>
          ) : ads.length > 0 ? (
            <>
              <div className="flex flex-col gap-2.5">
                {ads.map((ad, index) => (
                  <HomeAdCard key={ad.id} ad={ad} priority={index < 4} />
                ))}
              </div>

              <Link
                href={`/${locale}/search`}
                className="mt-4 flex h-12 w-full items-center justify-center rounded-full border border-primary bg-white text-base font-semibold text-[#e11d1d] transition-colors hover:bg-primary/5"
              >
                {t("latestListings.showMore")}
              </Link>
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
