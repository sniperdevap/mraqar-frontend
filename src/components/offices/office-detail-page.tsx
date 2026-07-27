"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Instagram, Phone, Search, Share2 } from "lucide-react";
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
import { useOfficeStore } from "@/lib/store/office-store";

interface OfficeDetailPageProps {
  officeId: string;
}

export function OfficeDetailPage({ officeId }: OfficeDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, direction } = useLocale();
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
  // Fall back to the office cached from the list so the header renders
  // instantly while the office's ads are still loading.
  const cachedOffice = useOfficeStore((s) => s.getOffice(officeId));
  const office = officeData?.office || cachedOffice;

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
    if (office?.avatar) {
      return `${process.env.NEXT_PUBLIC_IMAGE_HOST}/${office.avatar}`;
    }
    return "/images/aqar-new-logo.png";
  };

  // Only block on the loader when we have nothing to show yet — a cached
  // office header lets us render immediately while its ads load.
  if (isLoading && !office) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <Loader />
      </div>
    );
  }

  if (!office) {
    return null;
  }

  const whatsappHref = (() => {
    const digits = (office.phoneNumber || "").replace(/[^0-9]/g, "");
    return `https://wa.me/${digits.startsWith("965") ? digits : `965${digits}`}`;
  })();

  const iconButton =
    "w-11 h-11 rounded-xl border border-gray-200 bg-white text-gray-500 flex items-center justify-center transition-all active:scale-95";

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12" dir={direction}>
      {/* Office header — floating logo over a soft brand spotlight */}
      <section className="relative isolate overflow-hidden bg-white px-4 pt-8 pb-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-[300px]"
          style={{
            background:
              "radial-gradient(ellipse 65% 55% at 50% 0%, color-mix(in srgb, var(--color-brand-teal) 14%, transparent) 0%, transparent 72%)",
          }}
        />

        <div className="max-w-xl mx-auto flex flex-col items-center text-center">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-[0_6px_20px_rgba(0,0,0,0.08)]">
            <Image
              src={getImageUrl()}
              alt={office.name}
              fill
              sizes="128px"
              priority
              className="object-contain p-3"
            />
          </div>

          <h1 className="mt-4 text-xl sm:text-2xl font-bold tracking-tight text-[#1f2937]">
            {office.name}
          </h1>

          {office.description && (
            <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-500 line-clamp-3">
              {office.description}
            </p>
          )}

          {/* Contact & social actions */}
          <div className="mt-5 flex items-center justify-center gap-2.5">
            {office.phoneNumber && (
              <a
                href={`tel:${office.phoneNumber}`}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[#e11d1d] text-white text-sm font-medium transition-all hover:bg-[#b91616] hover:shadow-[0_6px_18px_rgba(225,29,29,0.25)] active:scale-[0.98]"
              >
                <Phone size={16} fill="currentColor" className="stroke-none" />
                <span dir="ltr">{formatDisplayPhone(office.phoneNumber)}</span>
              </a>
            )}

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className={`${iconButton} hover:text-[#25D366] hover:border-[#25D366]/40 hover:bg-[#25D366]/[0.06]`}
            >
              <svg
                viewBox="0 0 448 512"
                fill="currentColor"
                width="18"
                height="18"
                aria-hidden="true"
              >
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
              </svg>
            </a>

            {office.instagram && (
              <a
                href={office.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={`${iconButton} hover:text-[#E1306C] hover:border-[#E1306C]/40 hover:bg-[#E1306C]/[0.06]`}
              >
                <Instagram size={18} />
              </a>
            )}

            <button
              type="button"
              onClick={() => setIsShareOpen(true)}
              aria-label="Share"
              className={`${iconButton} hover:text-primary hover:border-primary/50 hover:bg-primary/[0.04]`}
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Filters — same floating card as the home search */}
        <div className="w-full space-y-3 p-4 sm:p-5 rounded-2xl border border-gray-100 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
          <Tabs
            value={localFilters.purpose}
            onValueChange={(val: string) =>
              setLocalFilters((prev) => ({ ...prev, purpose: val }))
            }
            className="w-full space-y-3"
            dir={direction}
          >
            <TabsList className="bg-gray-50 !h-11 md:!h-12 w-full rounded-xl p-1 border border-gray-200/70 grid grid-cols-3 gap-1">
              {[
                { value: "rent", label: t("forRent") },
                { value: "sale", label: t("forSale") },
                { value: "exchange", label: t("exchange") },
              ].map(({ value, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="h-full rounded-xl text-[15px] font-light text-gray-600 transition-colors hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:font-medium data-[state=active]:shadow-sm"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

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
              className="w-full min-h-11 md:min-h-12 h-auto py-1 px-4 bg-white border border-gray-200 rounded-xl flex items-center text-gray-700 transition-all hover:border-primary/50 hover:bg-primary/[0.03] focus-within:border-primary data-[state=open]:border-primary data-[state=open]:shadow-[0_4px_20px_rgba(225,29,29,0.15)] text-base font-medium"
              enableGrouping={true}
              dir={direction}
            />

            <Select
              value={localFilters.propertyType}
              onValueChange={(val) =>
                setLocalFilters((prev) => ({ ...prev, propertyType: val }))
              }
              dir={direction}
            >
              <SelectTrigger className="w-full !h-11 md:!h-12 px-4 bg-white border border-gray-200 rounded-xl text-gray-700 data-[placeholder]:!text-gray-400 data-[placeholder]:!font-normal transition-all hover:border-primary/50 hover:bg-primary/[0.03] focus:border-primary data-[state=open]:border-primary data-[state=open]:shadow-[0_4px_20px_rgba(225,29,29,0.15)] text-base font-medium">
                <SelectValue placeholder={t("propertyType")} />
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

            <div className="flex items-center gap-2 pt-1">
              <Button
                onClick={handleSearch}
                className="rounded-xl !h-11 md:!h-12 flex-1 bg-[#e11d1d] hover:bg-[#b91616] border-none text-white font-light text-base tracking-wide transition-all hover:shadow-[0_6px_18px_rgba(225,29,29,0.25)] active:scale-[0.98]"
              >
                <Search size={18} className="me-1.5" />
                {t("search")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClearFilters}
                className="rounded-xl !h-11 md:!h-12 px-4 bg-white border-gray-200 text-gray-600 font-light text-sm transition-colors hover:bg-gray-50 hover:text-gray-900"
              >
                {t("clearAllFilters")}
              </Button>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Office ads */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <h2 className="text-[17px] md:text-xl font-bold text-[#1f2937] mb-4">
          {t("officeAds", { count: officeData?.totalAds ?? 0 })}
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader />
          </div>
        ) : ads.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-12 text-center shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <p className="text-sm text-gray-500">{t("noAdsFound")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:gap-6 mb-8">
            {ads.map((ad) => (
              <HomeAdCard
                key={ad.id}
                ad={ad}
                onClick={() => router.push(`/ads/${ad.id}`)}
              />
            ))}
          </div>
        )}

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
        title={office.name}
      />
    </div>
  );
}
