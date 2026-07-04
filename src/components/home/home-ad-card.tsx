"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Clock, DollarSign, Play } from "lucide-react";
import { Ad, Media } from "@/types/ad";
import { useLocale, useTranslations } from "@/hooks/use-locale";
import { formatDistanceToNow } from "@/lib/utils/format";

const MyAdActions = dynamic(() =>
  import("./my-ad-actions").then((mod) => mod.MyAdActions),
);

interface HomeAdCardProps {
  ad: Ad;
  onClick?: () => void;
  variant?: "default" | "my-ad";
  onAction?: (action: "edit" | "refresh" | "view", ad: Ad) => void;
}

export function HomeAdCard({
  ad,
  onClick,
  variant = "default",
  onAction,
}: HomeAdCardProps) {
  const { locale, direction } = useLocale();
  const t = useTranslations("common.ads");

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
    if (!media.thumbnail) return "/images/aqar-new-logo.png";
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
      : getMediaUrl(firstMedia) || "/images/aqar-new-logo.png"
    : "/images/aqar-new-logo.png";

  const isFeatured = ad.isPremium || ad.premiumAd;
  const isVideo = firstMedia?.type === "video";

  const cardContent = (
    <>
      {isFeatured && (
        <span
          className={`absolute top-0 z-10 bg-[#e11d2b] text-white px-3 py-1 text-[11px] font-bold rounded-tr-2xl rounded-bl-lg shadow-sm ${
            direction === "rtl" ? "right-0" : "left-0"
          }`}
        >
          {locale === "ar" ? "مميز" : "Featured"}
        </span>
      )}

      <div className="w-full bg-[#f7eff1] border border-[#f3d9de] rounded-2xl overflow-hidden p-2.5">
        <div className="flex flex-row w-full items-start gap-2.5">
          <div className="relative w-[64px] h-[64px] shrink-0 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={displayUrl as string}
              alt={ad.description}
              fill
              className="object-cover"
              sizes="70px"
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
          </div>

          <div className="flex-1 flex flex-col min-w-0 min-h-[64px] justify-center">
            <h3 className="text-sm font-extrabold text-gray-900 line-clamp-1 leading-5 h-5">
              {locale === "ar"
                ? `${t(ad.purpose)} ${ad.propertyType?.labelAr || ad.propertyType?.label} في ${ad.area?.labelAr || ad.area?.label}`
                : `${t(ad.purpose)} ${ad.propertyType?.label} in ${ad.area?.label}`}
            </h3>

            <div className="flex items-center gap-3 mt-2 h-5">
              <div className="flex items-center gap-1.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#0d6b6c]/10 text-[#0d6b6c] shrink-0">
                  <DollarSign size={12} strokeWidth={2.5} aria-hidden="true" />
                </span>
                <span className="font-bold text-[#0d6b6c] text-[13px] leading-5">
                  {formatPrice(ad.price)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-700">
                <Clock size={14} className="text-gray-700" aria-hidden="true" />
                <span
                  className="text-[13px] font-medium leading-5"
                  suppressHydrationWarning
                >
                  {getTimeAgo(ad.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-700 line-clamp-2 leading-5 min-h-10 mt-1 font-normal">
          {ad.description}
        </p>
      </div>
    </>
  );

  const cardClasses =
    "relative block w-full cursor-pointer mb-3 hover:opacity-95 transition-opacity";

  if (variant === "default") {
    return (
      <Link
        href={`/ads/${ad.id}`}
        prefetch={false}
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
        href={`/ads/${ad.id}`}
        prefetch={false}
        onClick={onClick}
        className="block relative"
      >
        {cardContent}
      </Link>
      <MyAdActions ad={ad} onAction={onAction} />
    </div>
  );
}
