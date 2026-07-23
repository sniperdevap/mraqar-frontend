"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Clock, Eye, Play } from "lucide-react";
import { Ad, Media } from "@/types/ad";
import { useLocale, useTranslations } from "@/hooks/use-locale";
import { formatDistanceToNow } from "@/lib/utils/format";
import { useRoutePrefetch } from "@/hooks/use-route-prefetch";

const MyAdActions = dynamic(() =>
  import("./my-ad-actions").then((mod) => mod.MyAdActions),
);

interface HomeAdCardProps {
  ad: Ad;
  onClick?: () => void;
  variant?: "default" | "my-ad";
  onAction?: (action: "edit" | "refresh" | "view", ad: Ad) => void;
  priority?: boolean;
}

function HomeAdCardBase({
  ad,
  onClick,
  variant = "default",
  onAction,
  priority = false,
}: HomeAdCardProps) {
  const { locale, direction } = useLocale();
  const t = useTranslations("common.ads");
  const href = `/ads/${ad.id}`;
  const { setPrefetchTarget, prefetchNow } = useRoutePrefetch(href);

  const formatPrice = (price: number) => {
    return `${Number(price).toLocaleString("en-US")} ${locale === "ar" ? "دك" : "KD"}`;
  };

  const getTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(date, locale);
    } catch {
      return t("recently") || "recently";
    }
  };

  const getMediaUrl = (media: Media) => {
    if (!media) return null;
    if (media.url?.startsWith("http")) return media.url;
    const imageHost = (process.env.NEXT_PUBLIC_IMAGE_HOST || "").replace(
      /\/+$/,
      "",
    );
    const mediaPath = media.url?.replace(/^\/+/, "");
    return mediaPath ? `${imageHost}/${mediaPath}` : null;
  };

  const getThumbnailUrl = (media: Media) => {
    if (!media.thumbnail) return "/images/DefaultAdImage.jpeg";
    if (media.thumbnail.startsWith("http")) return media.thumbnail;
    const imageHost = (process.env.NEXT_PUBLIC_IMAGE_HOST || "").replace(
      /\/+$/,
      "",
    );
    return `${imageHost}/${media.thumbnail.replace(/^\/+/, "")}`;
  };

  const firstMedia = ad.media?.[0];
  const displayUrl = firstMedia
    ? firstMedia.type === "video"
      ? getThumbnailUrl(firstMedia)
      : getMediaUrl(firstMedia) || "/images/DefaultAdImage.jpeg"
    : "/images/DefaultAdImage.jpeg";

  const shortDescription =
    ad.description && ad.description.length > 75
      ? `${ad.description.slice(0, 75).trimEnd()}...`
      : ad.description;

  const isFeatured = ad.isPremium || ad.premiumAd;
  const isVideo = firstMedia?.type === "video";

  const cardContent = (
    <>
      {isFeatured && (
        <span
          className={`absolute top-2 z-10 bg-brand-gold text-white px-2 py-0.5 text-[9px] font-bold rounded-full shadow-sm ${
            direction === "rtl" ? "left-3" : "right-3"
          }`}
        >
          {locale === "ar" ? "مميز" : "Featured"}
        </span>
      )}

      <div className="w-full bg-card-mint rounded-2xl overflow-hidden p-3">
        <div className="flex flex-row w-full items-start gap-2.5">
          <div className="relative w-[75px] h-[75px] lg:w-[120px] lg:h-[120px] shrink-0 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={displayUrl as string}
              alt={ad.description}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 120px, 96px"
              priority={priority}
              loading={priority ? "eager" : "lazy"}
            />
            {isVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/90 shadow">
                  <Play
                    size={12}
                    className="text-gray-800 fill-gray-800 ms-0.5"
                  />
                </span>
              </div>
            )}
            {/* View count pill */}
            <div className="absolute top-1 right-1 md:top-1.5 md:right-1.5 z-10 flex items-center gap-0.5 sm:gap-1 bg-[#353e4b] text-white ps-1 pe-1.5 sm:ps-1.5 sm:pe-2 py-0.5 rounded-full text-[9px] sm:text-[10px] md:text-[11px] font-semibold leading-none shadow-sm">
              <Eye strokeWidth={2.5} className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" />
              <span>{ad.views || 0}</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0 min-h-[96px] lg:min-h-[120px] justify-center">
            <h3 className="text-base lg:text-xl font-medium text-gray-900 line-clamp-2 leading-6 lg:leading-8">
              {locale === "ar"
                ? `${t(ad.purpose)} ${ad.propertyType?.labelAr || ad.propertyType?.label} في ${ad.area?.labelAr || ad.area?.label}`
                : `${t(ad.purpose)} ${ad.propertyType?.label} in ${ad.area?.label}`}
            </h3>

            <div className="flex items-center gap-3 mt-2 h-5">
              <div className="flex items-center gap-1.5">
                <span className="flex items-center rounded-full text-brand-teal shrink-0">
                  <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="18" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M12.0049 22.0027C6.48204 22.0027 2.00488 17.5256 2.00488 12.0027C2.00488 6.4799 6.48204 2.00275 12.0049 2.00275C17.5277 2.00275 22.0049 6.4799 22.0049 12.0027C22.0049 17.5256 17.5277 22.0027 12.0049 22.0027ZM12.0049 20.0027C16.4232 20.0027 20.0049 16.421 20.0049 12.0027C20.0049 7.58447 16.4232 4.00275 12.0049 4.00275C7.5866 4.00275 4.00488 7.58447 4.00488 12.0027C4.00488 16.421 7.5866 20.0027 12.0049 20.0027ZM8.50488 14.0027H14.0049C14.281 14.0027 14.5049 13.7789 14.5049 13.5027C14.5049 13.2266 14.281 13.0027 14.0049 13.0027H10.0049C8.62417 13.0027 7.50488 11.8835 7.50488 10.5027C7.50488 9.12203 8.62417 8.00275 10.0049 8.00275H11.0049V6.00275H13.0049V8.00275H15.5049V10.0027H10.0049C9.72874 10.0027 9.50488 10.2266 9.50488 10.5027C9.50488 10.7789 9.72874 11.0027 10.0049 11.0027H14.0049C15.3856 11.0027 16.5049 12.122 16.5049 13.5027C16.5049 14.8835 15.3856 16.0027 14.0049 16.0027H13.0049V18.0027H11.0049V16.0027H8.50488V14.0027Z"></path></svg>
                </span>
                <span className="font-bold text-gray-900 text-[12px] leading-6">
                  {formatPrice(ad.price)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-700">
                <Clock size={14} className="text-brand-teal" aria-hidden="true" />
                <span
                  className="text-[12px] font-medium leading-5"
                  suppressHydrationWarning
                >
                  {getTimeAgo(ad.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 leading-5 min-h-10 mt-1 font-light">
          {shortDescription}
        </p>
      </div>
    </>
  );

  const cardClasses =
    "relative block w-full cursor-pointer mb-3 hover:opacity-95 transition-opacity cv-card";

  if (variant === "default") {
    return (
      <Link
        href={href}
        prefetch={false}
        ref={setPrefetchTarget}
        onMouseEnter={prefetchNow}
        onFocus={prefetchNow}
        onTouchStart={prefetchNow}
        className={cardClasses}
        onClick={onClick}
        dir={direction}
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div className="relative block w-full mb-3" dir={direction}>
      <Link
        href={href}
        prefetch={false}
        ref={setPrefetchTarget}
        onMouseEnter={prefetchNow}
        onFocus={prefetchNow}
        onTouchStart={prefetchNow}
        onClick={onClick}
        className="block relative"
      >
        {cardContent}
      </Link>
      <MyAdActions ad={ad} onAction={onAction} />
    </div>
  );
}

export const HomeAdCard = React.memo(HomeAdCardBase);
