"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Phone } from "lucide-react";
import { useLocale, useTranslations } from "@/hooks/use-locale";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader } from "../common/loader";
import dynamic from "next/dynamic";
import { useInView } from "react-intersection-observer";

const HomeAdCard = dynamic(() =>
  import("@/components/home/home-ad-card").then((mod) => mod.HomeAdCard),
);
const MultiSelect = dynamic(() =>
  import("@/components/ui/multi-select").then((mod) => mod.MultiSelect),
);
const ShareDialog = dynamic(() =>
  import("../common/share-dialog").then((mod) => mod.ShareDialog),
);
import { formatDisplayPhone } from "@/lib/utils";
import { usePropertyTypes, useAreas } from "@/hooks/use-metadata";
import { useInfiniteOfficeById } from "@/hooks/use-offices";

interface OfficeDetailPageProps {
  officeId: string;
}

export function OfficeDetailPage({ officeId }: OfficeDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const t = useTranslations("office");
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Local filter state for the inline search bar
  const [localFilters, setLocalFilters] = useState({
    purpose: searchParams.get("purpose") || "",
    propertyType: searchParams.get("propertyType") || "",
    area: searchParams.getAll("area") || ([] as string[]),
  });

  const adsPerPage = 12;

  const area = searchParams.getAll("area");
  const filters = {
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

  const { data: propertyTypesData } = usePropertyTypes();
  const { data: areasData } = useAreas();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteOfficeById(officeId, {
      limit: adsPerPage,
      purpose: filters.purpose,
      propertyType: filters.propertyType,
      area: filters.area,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
    });
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: "300px 0px",
  });

  const propertyTypes = propertyTypesData || [];
  const areas = areasData || [];
  const officeData = data?.pages?.[0];
  const ads = data?.pages?.flatMap((page) => page.ads) || [];

  // Sync local filters with URL when URL changes
  useEffect(() => {
    setLocalFilters({
      purpose: searchParams.get("purpose") || "",
      propertyType: searchParams.get("propertyType") || "",
      area: searchParams.getAll("area") || [],
    });
  }, [searchParams]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (localFilters.purpose) {
      params.set("purpose", localFilters.purpose);
    }

    if (localFilters.propertyType) {
      params.set("propertyType", localFilters.propertyType);
    }

    if (localFilters.area && localFilters.area.length > 0) {
      localFilters.area.forEach((a) => params.append("area", a));
    }

    router.push(`/offices/${officeId}?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setLocalFilters({
      purpose: "",
      propertyType: "",
      area: [],
    });
    router.push(`/offices/${officeId}`);
  };

  const getImageUrl = () => {
    if (officeData?.office.avatar) {
      return `${process.env.NEXT_PUBLIC_IMAGE_HOST}/${officeData.office.avatar}`;
    }
    return "/images/aqar-new-logo.png";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <Loader />
      </div>
    );
  }

  if (!officeData || !officeData.office) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white pb-12">
      {/* Minimalist Office Header */}
      <div className="w-full bg-[#f8f9fa] pt-8 pb-6 border-b border-gray-100 flex flex-col items-center text-center px-4">
        <div className="relative w-44 h-40 sm:w-64 sm:h-60 rounded-sm overflow-hidden mb-4 bg-[#f8f9fa]">
          <Image
            src={getImageUrl()}
            alt={officeData.office.name}
            fill
            className="object-cover"
          />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          {officeData.office.name}
        </h1>

        {/* Social & Contact Actions */}
        <div className="flex flex-wrap justify-center gap-3 mb-4">
          {officeData.office.phoneNumber && (
            <a
              href={`tel:${officeData.office.phoneNumber}`}
              className="flex items-center gap-1.5 text-[#9a090e] font-bold text-sm hover:underline"
            >
              <Phone size={14} fill="currentColor" className="stroke-none" />
              <span dir="ltr">
                {formatDisplayPhone(officeData.office.phoneNumber)}
              </span>
            </a>
          )}
          <div className="flex items-center gap-3">
            {/* WhatsApp */}
            <a
              href={(function () {
                const phone = officeData.office.phoneNumber || "";
                let p = phone.replace(/[^0-9]/g, "");
                if (!p.startsWith("965")) p = "965" + p;
                return `https://wa.me/${p}`;
              })()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-blue hover:text-[#25D366] transition-colors"
            >
              <svg
                stroke="currentColor"
                fill="currentColor"
                stroke-width="0"
                viewBox="0 0 448 512"
                height="18"
                width="18"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path>
              </svg>
            </a>
            {/* Instagram */}
            {officeData.office.instagram && (
              <a
                href={officeData.office.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-blue hover:text-[#E1306C] transition-colors"
              >
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  stroke-width="0"
                  viewBox="0 0 256 256"
                  height="20"
                  width="20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z"></path>
                </svg>
              </a>
            )}
            {/* Share */}
            <button
              onClick={() => setIsShareOpen(true)}
              className="text-primary-blue hover:text-[#001b3d] transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Search Bar - EXACT Homepage Style */}
        <div className="w-full mb-10">
          <Tabs
            value={localFilters.purpose}
            onValueChange={(val: string) =>
              setLocalFilters((prev) => ({ ...prev, purpose: val }))
            }
            className="w-full"
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            <div className="flex justify-center mb-4 md:mb-6">
              <TabsList className="bg-transparent flex gap-2 h-auto p-0 w-full max-w-xl">
                <TabsTrigger
                  value="rent"
                  className="flex-1 h-9 md:h-12 bg-[#e0e0e0] text-primary-blue border border-[#ced4da] font-semibold rounded-sm data-[state=active]:bg-[#9a090e] data-[state=active]:!text-white transition-all uppercase text-[11px]"
                >
                  {t("forRent")}
                </TabsTrigger>
                <TabsTrigger
                  value="sale"
                  className="flex-1 h-9 md:h-12 bg-[#e0e0e0] text-primary-blue border border-[#ced4da] font-semibold rounded-sm data-[state=active]:bg-[#9a090e] data-[state=active]:!text-white transition-all uppercase text-[11px]"
                >
                  {t("forSale")}
                </TabsTrigger>
                <TabsTrigger
                  value="exchange"
                  className="flex-1 h-9 md:h-12 bg-[#e0e0e0] text-primary-blue border border-[#ced4da] font-semibold rounded-sm data-[state=active]:bg-[#9a090e] data-[state=active]:!text-white transition-all uppercase text-[11px]"
                >
                  {t("exchange")}
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex flex-col gap-2 md:gap-4">
              {/* Top Row: Area and Property Type */}
              <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 md:gap-4 w-full">
                <div className="w-full lg:flex-1">
                  <MultiSelect
                    options={areas.map((a) => ({
                      label: locale === "ar" ? a.labelAr || a.label : a.label,
                      value: String(a.id),
                      governorate:
                        locale === "ar"
                          ? a.governorateAr || a.governorate
                          : a.governorate,
                    }))}
                    value={localFilters.area}
                    onChange={(val) =>
                      setLocalFilters((prev) => ({ ...prev, area: val }))
                    }
                    placeholder={t("selectArea")}
                    className="!h-auto min-h-[36px] md:!h-12 bg-[#e0e0e0] border-[#ced4da] rounded-sm font-medium flex items-center justify-center text-[#9a090e] placeholder:text-[#9a090e]/70 uppercase text-[11px]"
                    enableGrouping={true}
                    dir={locale === "ar" ? "rtl" : "ltr"}
                  />
                </div>

                <div className="w-full lg:flex-1">
                  <Select
                    value={localFilters.propertyType}
                    onValueChange={(val) =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        propertyType: val,
                      }))
                    }
                    dir={locale === "ar" ? "rtl" : "ltr"}
                  >
                    <SelectTrigger className="!h-9 md:!h-12 bg-[#e0e0e0] border-[#ced4da] rounded-sm text-[11px] font-medium text-[#9a090e] uppercase">
                      <SelectValue placeholder={t("propertyType")} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {propertyTypes.map((type) => (
                        <SelectItem
                          key={type.id}
                          value={String(type.id)}
                          className="cursor-pointer font-medium uppercase text-[11px]"
                        >
                          {locale === "ar"
                            ? type.labelAr || type.label
                            : type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full lg:flex-1 flex gap-2">
                  <Button
                    onClick={handleSearch}
                    className="rounded-sm h-9 md:h-12 flex-1 bg-[#9a090e] hover:bg-[#004d1d] text-white font-semibold uppercase text-sm border border-[#9a090e] transition-colors"
                  >
                    {t("search")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearFilters}
                    className="rounded-sm h-9 md:h-12 flex-1 border-[#ced4da] text-[#9a090e] font-semibold uppercase text-sm hover:bg-[#e0e0e0]"
                  >
                    {t("clearAllFilters")}
                  </Button>
                </div>
              </div>
            </div>
          </Tabs>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            {t("officeAds", { count: officeData.totalAds })}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-6 mb-8">
          {ads.map((ad) => (
            <HomeAdCard
              key={ad.id}
              ad={ad}
              onClick={() => router.push(`/ads/${ad.id}`)}
            />
          ))}
        </div>

        {(hasNextPage || isFetchingNextPage) && (
          <div ref={loadMoreRef} className="flex justify-center py-6">
            {isFetchingNextPage ? <Loader /> : <div className="h-8" />}
          </div>
        )}
      </div>
      <ShareDialog
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        url={typeof window !== "undefined" ? window.location.href : ""}
        title={officeData.office.name}
      />
    </div>
  );
}
