"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Search as SearchIcon,
  SlidersHorizontal,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";

import { useLocale } from "@/hooks/use-locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { usePropertyTypes, useAreas } from "@/hooks/use-metadata";
import { useSearchAds } from "@/hooks/use-ads";
import { useAdStore } from "@/lib/store/ad-store";
import { GetAdsParams } from "@/types/ad";

const HomeAdCard = dynamic(() =>
  import("../home/home-ad-card").then((mod) => mod.HomeAdCard),
);
const Loader = dynamic(() =>
  import("../common/loader").then((mod) => mod.Loader),
);

type ActivePopover = "area" | "purpose" | "propertyType" | "price" | null;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const buildSearchUrl = (filters: GetAdsParams) => {
  const params = new URLSearchParams();

  if (filters.purpose) {
    params.set("purpose", filters.purpose);
  }

  if (filters.propertyType) {
    params.set("propertyType", filters.propertyType);
  }

  if (filters.area && filters.area.length > 0) {
    const areaValues = Array.isArray(filters.area)
      ? filters.area
      : [filters.area];
    areaValues.forEach((area) => params.append("area", area));
  }

  if (filters.minPrice !== undefined) {
    params.set("minPrice", filters.minPrice.toString());
  }

  if (filters.maxPrice !== undefined) {
    params.set("maxPrice", filters.maxPrice.toString());
  }

  const query = params.toString();
  return query ? `/search?${query}` : "/search";
};

const getRoundedSliderMax = (value: number) => {
  if (value <= 1000) return 1000;
  if (value <= 5000) return Math.ceil(value / 250) * 250;
  if (value <= 50000) return Math.ceil(value / 1000) * 1000;
  return Math.ceil(value / 10000) * 10000;
};

export function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, direction } = useLocale();
  const t = useTranslations("common");
  const tSearch = useTranslations("common.search");
  const adsPerPage = 10;

  const [activePopover, setActivePopover] = useState<ActivePopover>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [areaQuery, setAreaQuery] = useState("");
  const [priceMinDraft, setPriceMinDraft] = useState("");
  const [priceMaxDraft, setPriceMaxDraft] = useState("");
  const [minSliderValue, setMinSliderValue] = useState(0);
  const [maxSliderValue, setMaxSliderValue] = useState(1000);
  const typingSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const filters = useMemo(() => {
    const area = searchParams.getAll("area");
    return {
      purpose: searchParams.get("purpose") || undefined,
      propertyType: searchParams.get("propertyType") || undefined,
      area: area.length ? area : undefined,
      minPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
    };
  }, [searchParams]);

  const { data: propertyTypesData } = usePropertyTypes();
  const { data: areasData } = useAreas();
  const {
    data: adsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: adsLoading,
  } = useSearchAds(filters, adsPerPage);
  const { ref: prefetchRef, inView } = useInView({
    threshold: 0,
    rootMargin: "100px 0px",
  });

  const propertyTypes = propertyTypesData || [];
  const areas = useMemo(() => areasData || [], [areasData]);
  const ads = useMemo(
    () => adsData?.pages.flatMap((page) => page.ads) || [],
    [adsData?.pages],
  );
  const prefetchTriggerIndex = Math.max(
    0,
    ads.length - Math.ceil(adsPerPage / 2),
  );

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
    setHasSetAdsForPage([]);
  }, [filters]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const sliderMax = useMemo(() => {
    const knownMaxPrice = ads.reduce(
      (maxPrice, ad) => Math.max(maxPrice, ad.price || 0),
      0,
    );
    return getRoundedSliderMax(
      Math.max(knownMaxPrice, filters.maxPrice || 0, 1000),
    );
  }, [ads, filters.maxPrice]);

  useEffect(() => {
    const parsedMin = filters.minPrice ?? 0;
    const parsedMax = filters.maxPrice ?? sliderMax;
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

    setPriceMinDraft(filters.minPrice?.toString() || "");
    setPriceMaxDraft(filters.maxPrice?.toString() || "");
    setMinSliderValue(nextMin);
    setMaxSliderValue(nextMax);
  }, [filters.minPrice, filters.maxPrice, sliderMax]);

  useEffect(() => {
    if (activePopover !== "price") {
      return;
    }

    if (typingSyncTimeoutRef.current) {
      clearTimeout(typingSyncTimeoutRef.current);
    }

    typingSyncTimeoutRef.current = setTimeout(() => {
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

    return () => {
      if (typingSyncTimeoutRef.current) {
        clearTimeout(typingSyncTimeoutRef.current);
      }
    };
  }, [priceMinDraft, priceMaxDraft, sliderMax, activePopover]);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (activePopover) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [activePopover]);

  const filteredAreas = useMemo(() => {
    const normalizedQuery = areaQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return areas;
    }

    return areas.filter((area) => {
      const areaLabel =
        locale === "ar" ? area.labelAr || area.label : area.label;
      const governorateLabel =
        locale === "ar"
          ? area.governorateAr || area.governorate
          : area.governorate;
      return `${areaLabel} ${governorateLabel}`
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [areas, areaQuery, locale]);

  const groupedFilteredAreas = useMemo(() => {
    const groups: Record<string, typeof areas> = {};
    filteredAreas.forEach((area) => {
      const g =
        (locale === "ar"
          ? area.governorateAr || area.governorate
          : area.governorate) || (locale === "ar" ? "أخرى" : "Other");
      if (!groups[g]) groups[g] = [];
      groups[g].push(area);
    });
    return groups;
  }, [filteredAreas, locale]);

  const selectedAreas = useMemo(() => {
    return (filters.area || [])
      .map((id) => areas.find((a) => String(a.id) === id))
      .filter(Boolean);
  }, [filters.area, areas]);

  const selectedPropertyType = filters.propertyType
    ? propertyTypes.find((type) => String(type.id) === filters.propertyType)
    : undefined;

  const areaLabel = locale === "ar" ? "ابحث عن منطقة" : "Type Area to Search";

  const propertyTypeLabel = selectedPropertyType
    ? locale === "ar"
      ? selectedPropertyType.labelAr || selectedPropertyType.label
      : selectedPropertyType.label
    : locale === "ar"
      ? "العقارات"
      : "Properties";
  const purposeLabel = filters.purpose
    ? t(`ads.${filters.purpose}`)
    : locale === "ar"
      ? "النوع"
      : "Type";
  const priceLabel =
    filters.minPrice !== undefined || filters.maxPrice !== undefined
      ? `${filters.minPrice !== undefined ? filters.minPrice.toLocaleString(locale) : "0"} ${t("currency")} - ${(filters.maxPrice ?? sliderMax).toLocaleString(locale)} ${t("currency")}`
      : locale === "ar"
        ? "السعر"
        : "Price";

  const hasActiveFilters = Boolean(
    filters.purpose ||
    filters.propertyType ||
    filters.area?.length ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined,
  );

  const applyFilters = (nextFilters: GetAdsParams, keepOpen = false) => {
    if (
      nextFilters.minPrice !== undefined &&
      nextFilters.maxPrice !== undefined &&
      nextFilters.minPrice > nextFilters.maxPrice
    ) {
      toast.error(t("ads.priceRangeError"));
      return;
    }

    const currentUrl = buildSearchUrl(filters);
    const nextUrl = buildSearchUrl(nextFilters);

    if (currentUrl !== nextUrl) {
      router.push(nextUrl);
    }

    if (!keepOpen) {
      setActivePopover(null);
    }
  };

  const applyPriceFilters = (
    nextMin: number | undefined,
    nextMax: number | undefined,
    keepOpen = true,
  ) => {
    applyFilters(
      {
        ...filters,
        minPrice: nextMin,
        maxPrice: nextMax,
      },
      keepOpen,
    );
  };

  const handleAreaSelect = (areaId: string) => {
    const currentAreas = filters.area || [];
    const isSelected = currentAreas.includes(areaId);

    const nextAreas = isSelected
      ? currentAreas.filter((id) => id !== areaId)
      : [...currentAreas, areaId];

    setAreaQuery("");
    applyFilters(
      {
        ...filters,
        area: nextAreas.length > 0 ? nextAreas : undefined,
      },
      false,
    );
  };

  const handlePurposeSelect = (
    purpose: NonNullable<GetAdsParams["purpose"]>,
  ) => {
    applyFilters({
      ...filters,
      purpose: filters.purpose === purpose ? undefined : purpose,
    });
  };

  const handlePropertyTypeSelect = (propertyTypeId: string) => {
    applyFilters({
      ...filters,
      propertyType:
        filters.propertyType === propertyTypeId ? undefined : propertyTypeId,
    });
  };

  const handlePriceSearch = () => {
    const rawMin = priceMinDraft.trim();
    const rawMax = priceMaxDraft.trim();
    const nextMinPrice = rawMin === "" ? undefined : Number(rawMin);
    const nextMaxPrice = rawMax === "" ? undefined : Number(rawMax);

    if (
      (nextMinPrice !== undefined && Number.isNaN(nextMinPrice)) ||
      (nextMaxPrice !== undefined && Number.isNaN(nextMaxPrice))
    ) {
      toast.error(t("messages.error"));
      return;
    }

    const safeMin =
      nextMinPrice === undefined
        ? undefined
        : clamp(nextMinPrice, 0, sliderMax);
    const safeMax =
      nextMaxPrice === undefined
        ? undefined
        : clamp(nextMaxPrice, 0, sliderMax);
    applyPriceFilters(safeMin, safeMax, false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white" dir={direction}>
      <div className="sticky top-0 z-50 bg-white ">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          {/* Area Search Modal Section */}
          <Popover
            open={activePopover === "area"}
            onOpenChange={(open) => setActivePopover(open ? "area" : null)}
          >
            <PopoverAnchor asChild>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePopover("area");
                  inputRef.current?.focus();
                }}
                className="rounded-md border border-[#d9e3f0] bg-white p-2 cursor-pointer"
              >
                <div className="flex min-h-9 w-full items-center gap-4 px-2">
                  <div className="flex flex-1 flex-wrap gap-1.5 min-w-0">
                    {selectedAreas.map((area) => {
                      if (!area) return null;
                      const label =
                        locale === "ar"
                          ? area.labelAr || area.label
                          : area.label;
                      return (
                        <div
                          key={area.id}
                          className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-2 py-1 text-xs font-bold text-primary border border-primary/20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>{label}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAreaSelect(String(area.id));
                            }}
                            className="rounded-full p-0.5 hover:bg-[#dbeafe] transition-colors"
                          >
                            <X size={12} className="stroke-[3]" />
                          </button>
                        </div>
                      );
                    })}
                    <input
                      ref={inputRef}
                      value={areaQuery}
                      onChange={(e) => {
                        setAreaQuery(e.target.value);
                        if (activePopover !== "area") setActivePopover("area");
                      }}
                      onFocus={() => setActivePopover("area")}
                      dir={direction}
                      placeholder={selectedAreas.length === 0 ? areaLabel : ""}
                      className="flex-1 min-w-[120px] bg-transparent outline-none text-base font-medium text-[#506076] placeholder:text-[#8a97ab] ms-1 text-start"
                    />
                  </div>

                  {/* <Image src="/images/aqar-new-logo.png" alt="User avatar" width={32} height={32} className="h-8 w-8 rounded-full border border-[#dbe6f3] object-cover shrink-0" /> */}
                </div>
              </div>
            </PopoverAnchor>

            <PopoverContent
              align="start"
              sideOffset={8}
              dir={direction}
              onOpenAutoFocus={(e) => e.preventDefault()}
              className="z-[60] w-[var(--radix-popover-trigger-width)] rounded-xl border border-[#dce7f4] bg-white py-3 px-0 shadow-[0_22px_60px_rgba(31,64,114,0.18)]"
            >
              <div className="space-y-3">
                <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                  {filteredAreas.length > 0 ? (
                    <div className="">
                      {Object.entries(groupedFilteredAreas).map(
                        ([group, opts]) => (
                          <div key={group} dir={direction}>
                            <div
                              className={cn(
                                "px-4 py-2 text-[11px] font-bold text-[#8a97ab] uppercase tracking-wider bg-[#f8fafc] sticky top-0 z-10 border-y border-[#f1f5f9] text-start",
                              )}
                            >
                              {group}
                            </div>
                            <div className="divide-y divide-[#f1f5f9]">
                              {opts.map((area) => {
                                const isSelected = filters.area?.includes(
                                  String(area.id),
                                );
                                const label =
                                  locale === "ar"
                                    ? area.labelAr || area.label
                                    : area.label;

                                return (
                                  <button
                                    key={area.id}
                                    type="button"
                                    onClick={() => handleAreaSelect(String(area.id))}
                                    className={cn(
                                      "flex w-full items-center justify-between px-4 py-3 text-sm transition-all hover:bg-primary/5",
                                      isSelected
                                        ? "bg-primary/10 text-primary"
                                        : "text-[#4b5563]",
                                    )}
                                  >
                                    <span className="flex-1 font-medium text-start">
                                      {label}
                                    </span>
                                    {isSelected && (
                                      <Check
                                        size={16}
                                        className="text-[#3b82f6]"
                                      />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="px-4 py-10 text-center">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f8fafc] text-[#8a97ab] mb-3">
                        <SearchIcon size={20} />
                      </div>
                      <p className="text-sm text-[#66758b]">
                        {t("messages.noData")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Purpose Filter Modal Section */}
            <Popover
              open={activePopover === "purpose"}
              onOpenChange={(open) => setActivePopover(open ? "purpose" : null)}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex h-[38px] items-center gap-2 rounded-md border border-[#d9e3f0] px-4 text-sm font-bold whitespace-nowrap transition-all ",
                    activePopover === "purpose" || filters.purpose
                      ? "bg-primary text-white shadow-none"
                      : "bg-white text-[#4b5563]",
                  )}
                >
                  {purposeLabel}
                  {activePopover === "purpose" ? (
                    <ChevronUp size={14} className="stroke-[3]" />
                  ) : (
                    <ChevronDown size={14} className="stroke-[3]" />
                  )}
                </button>
              </PopoverTrigger>

              <PopoverContent
                align={isMobile ? "center" : "start"}
                sideOffset={10}
                dir={direction}
                className="z-[60] w-screen sm:w-72 rounded-xl border-none sm:border sm:border-[#dce7f4] shadow-none sm:shadow-[0_22px_60px_rgba(31,64,114,0.18)] bg-transparent sm:bg-white p-0"
              >
                <div className="mx-4 sm:mx-0 p-1 sm:p-2 bg-white rounded-xl border border-[#dce7f4] sm:border-none shadow-[0_22px_60px_rgba(31,64,114,0.18)] sm:shadow-none">
                  <div className="space-y-2">
                    {(["rent", "sale", "exchange"] as const).map((option) => {
                      const isSelected = filters.purpose === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handlePurposeSelect(option)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-start transition-all",
                            isSelected
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-[#f9fafb] text-[#4b5563]",
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-4 w-4 items-center justify-center rounded-full border",
                              isSelected
                                ? "border-[#3b82f6] border-2"
                                : "border-[#d1d5db]",
                            )}
                          >
                            {isSelected && (
                              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                            )}
                          </span>
                          <span className="text-sm font-semibold capitalize">
                            {t(`ads.${option}`)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Property Type Filter Modal Section */}
            <Popover
              open={activePopover === "propertyType"}
              onOpenChange={(open) =>
                setActivePopover(open ? "propertyType" : null)
              }
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex h-[38px] items-center gap-2 rounded-md border border-[#d9e3f0] px-4 text-sm font-bold whitespace-nowrap transition-all ",
                    activePopover === "propertyType" || filters.propertyType
                      ? "bg-primary text-white shadow-none"
                      : "bg-white text-[#4b5563]",
                  )}
                >
                  <span className="max-w-32 truncate">{propertyTypeLabel}</span>
                  {activePopover === "propertyType" ? (
                    <ChevronUp size={14} className="stroke-[3]" />
                  ) : (
                    <ChevronDown size={14} className="stroke-[3]" />
                  )}
                </button>
              </PopoverTrigger>

              <PopoverContent
                align={isMobile ? "center" : "start"}
                sideOffset={10}
                dir={direction}
                className="z-[60] w-screen sm:w-80 border-none sm:border sm:border-[#dce7f4] bg-transparent sm:bg-white shadow-none sm:shadow-[0_22px_60px_rgba(31,64,114,0.18)] p-0"
              >
                <div className="mx-4 sm:mx-0 p-1 sm:p-2 bg-white rounded-xl border border-[#dce7f4] sm:border-none shadow-[0_22px_60px_rgba(31,64,114,0.18)] sm:shadow-none">
                  <div className="max-h-80 space-y-0 overflow-y-auto">
                    {propertyTypes.map((type) => {
                      const isSelected = filters.propertyType === String(type.id);
                      const label =
                        locale === "ar"
                          ? type.labelAr || type.label
                          : type.label;

                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => handlePropertyTypeSelect(String(type.id))}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-start transition-all",
                            isSelected
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-[#f9fafb] text-[#4b5563]",
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                              isSelected
                                ? "bg-primary border-[#3b82f6]"
                                : "bg-white border-[#d1d5db]",
                            )}
                          >
                            {isSelected && (
                              <Check
                                size={14}
                                className="text-white stroke-[3]"
                              />
                            )}
                          </span>
                          <span className="text-sm font-semibold">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Price Range Filter Modal Section */}
            <Popover
              open={activePopover === "price"}
              onOpenChange={(open) => setActivePopover(open ? "price" : null)}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex h-[38px] items-center gap-2 rounded-md border border-[#d9e3f0] px-4 text-sm font-bold whitespace-nowrap transition-all",
                    activePopover === "price" ||
                      filters.minPrice !== undefined ||
                      filters.maxPrice !== undefined
                      ? "bg-primary text-white shadow-none"
                      : "bg-white text-[#4b5563]",
                  )}
                >
                  <span className="max-w-36 truncate">{priceLabel}</span>
                  {activePopover === "price" ? (
                    <ChevronUp size={14} className="stroke-[3]" />
                  ) : (
                    <ChevronDown size={14} className="stroke-[3]" />
                  )}
                </button>
              </PopoverTrigger>

              <PopoverContent
                align={isMobile ? "center" : "start"}
                sideOffset={12}
                dir={direction}
                className="z-[60] w-screen sm:w-80 border-none sm:border sm:border-[#dce7f4] bg-transparent sm:bg-white shadow-none sm:shadow-[0_22px_60px_rgba(31,64,114,0.18)] p-0"
              >
                <div className="mx-4 sm:mx-0 bg-white rounded-xl border border-[#dce7f4] sm:border-none shadow-[0_22px_60px_rgba(31,64,114,0.18)] sm:shadow-none overflow-hidden">
                  <div className="p-4">
                    {/* Price Header */}
                    <div className="mb-2">
                      <p className="text-[11px] font-bold text-[#8a97ab] uppercase tracking-wider mb-1">
                        {tSearch("priceRange")}
                      </p>
                      <div className="flex items-baseline gap-1 text-primary">
                        <span className="text-lg font-bold">
                          {minSliderValue.toLocaleString(locale)}
                        </span>
                        <span className="text-sm font-semibold opacity-60">
                          {" "}
                          {t("currency")}
                        </span>
                        <span className="mx-2 text-[#d1d5db]">―</span>
                        <span className="text-lg font-bold">
                          {maxSliderValue.toLocaleString(locale)}
                        </span>
                        <span className="text-sm font-semibold opacity-60">
                          {" "}
                          {t("currency")}
                        </span>
                      </div>
                    </div>

                    {/* Slider Area */}
                    <div className="relative h-10 mb-2 px-1 flex items-center">
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
                          {tSearch("minPrice")}
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={priceMinDraft}
                          onChange={(e) => setPriceMinDraft(e.target.value)}
                          placeholder="0"
                          className="h-11 rounded-md border-none bg-[#f8fafc] px-4 text-base font-bold text-primary placeholder:text-[#cbd5e1] focus-visible:ring-1 focus-visible:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-1.5 text-start">
                        <label className="text-[11px] font-bold text-[#8a97ab] uppercase ms-1">
                          {tSearch("maxPrice")}
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={priceMaxDraft}
                          onChange={(e) => setPriceMaxDraft(e.target.value)}
                          placeholder={sliderMax.toString()}
                          className="h-11 rounded-md border-none bg-[#f8fafc] px-4 text-base font-bold text-primary placeholder:text-[#cbd5e1] focus-visible:ring-1 focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#f1f5f9] px-6 py-4 bg-[#fcfdfe] rounded-b-xl">
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
                      className="h-11 rounded-lg bg-primary px-8 text-sm font-bold text-white hover:bg-[#2563eb] shadow-sm shadow-[#3b82f6]/20 transition-all active:scale-95"
                    >
                      {locale === "ar" ? "بحث" : "Search"}
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setAreaQuery("");
                  setPriceMinDraft("");
                  setPriceMaxDraft("");
                  setMinSliderValue(0);
                  setMaxSliderValue(sliderMax);
                  applyFilters({});
                }}
                className="w-fit flex h-[38px] shrink-0 items-center gap-2 rounded-md bg-[#fee2e2] px-4 text-sm font-semibold text-[#ef4444] shadow-sm transition-all hover:bg-[#fecaca] whitespace-nowrap"
              >
                <SlidersHorizontal size={14} className="stroke-[3]" />
                {tSearch("clearAll")}
              </button>
            )}
          </div>

          <div className="mt-4">
            <h1 className="text-xl font-bold text-[#243449]">
              {tSearch("resultsTitle", {
                count: adsData?.pages[0]?.total || 0,
              })}
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-2 sm:px-6 lg:px-8">
        {adsLoading ? (
          <div className="grid grid-cols-1 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-[28px] bg-white shadow-[0_10px_35px_rgba(31,64,114,0.06)] animate-pulse"
              />
            ))}
          </div>
        ) : ads.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-0 mb-8">
              {ads.map((ad, index) => (
                <div
                  key={ad.id}
                  ref={
                    hasNextPage && index === prefetchTriggerIndex
                      ? prefetchRef
                      : undefined
                  }
                >
                  <HomeAdCard
                    ad={ad}
                    onClick={() => router.push(`/ads/${ad.id}`)}
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
          <div className="rounded-[30px] border border-[#dce7f4] bg-white px-6 py-12 text-center shadow-[0_18px_45px_rgba(31,64,114,0.08)]">
            <SearchIcon className="mx-auto mb-4 h-12 w-12 text-[#9aa8bb]" />
            <h3 className="mb-2 text-lg font-semibold text-[#243449]">
              {tSearch("noResults")}
            </h3>
            <p className="mb-6 text-[#66758b]">
              {tSearch("noResultsDescription")}
            </p>
            <Button
              onClick={() => setActivePopover("area")}
              variant="outline"
              className="mx-auto flex h-12 items-center gap-2 rounded-2xl border-[#d8e2ee] bg-white px-5 text-[#4f5f76] hover:bg-[#f7faff]"
            >
              <SearchIcon size={18} />
              {tSearch("adjustFilters")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
