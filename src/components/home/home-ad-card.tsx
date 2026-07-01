"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Share2, Clock, Phone, MessageCircle } from "lucide-react";
import { Ad, Media } from "@/types/ad";
import { Card } from "@/components/ui/card";
import { useLocale, useTranslations } from "@/hooks/use-locale";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface HomeAdCardProps {
  ad: Ad;
  onClick?: () => void;
}

export function HomeAdCard({ ad, onClick }: HomeAdCardProps) {
  const { locale, direction } = useLocale();
  const t = useTranslations("common.ads");

  const formatPrice = (price: number) => {
    return `${Number(price).toLocaleString("en-US")}  د.ك`;
  };

  const getTimeAgo = (date: string) => {
    try {
      const locale_obj = locale === "ar" ? ar : enUS;
      const timeString = formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: locale_obj,
      });
      return timeString.replace("about ", "").replace("حوالي ", "");
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

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = ad.phoneNumber.replace(/\s/g, "");
    window.open(`https://wa.me/${phone}`, "_blank");
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${ad.phoneNumber}`;
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: ad.description,
        url: window.location.origin + `/ads/${ad.id}`,
      });
    }
  };

  return (
    <Link
      href={`/ads/${ad.id}`}
      className="block w-full bg-[#f9eef2] border border-gray-200 rounded-lg overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all h-[104px] cursor-pointer mb-3 p-2.5"
      onClick={onClick}
      dir={direction}
    >
      <div className="flex flex-row h-full w-full items-start gap-3">
        {/* Image Section (Left in LTR / Right in RTL) */}
        <div className="py-0.5 relative w-[60px] shrink-0 h-[60px] overflow-visible">
          <div className="relative w-full h-full rounded-md overflow-hidden">
            <Image
              src={displayUrl as string}
              alt={ad.description}
              fill
              className="object-cover"
              sizes="100px"
            />
          </div>
          {/* Featured Badge */}
          {(ad.isPremium || ad.premiumAd) && (
            <div
              className={`absolute -top-1.5 z-10 bg-[#d91d24] text-white px-1.5 py-0.5 text-[9px] font-bold shadow-sm
              after:content-[''] after:absolute after:top-full after:border-t-[3px] after:border-t-[#800a0e]
              ${
                direction === "rtl"
                  ? "right-[-3px] rounded-l-[3px] after:right-0 after:border-r-[3px] after:border-r-transparent"
                  : "left-[-3px] rounded-r-[3px] after:left-0 after:border-l-[3px] after:border-l-transparent"
              }`}
            >
              {locale === "ar" ? "مميز" : "Featured"}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-between h-full min-w-0 py-0.5">
          <div className="space-y-1">
            {/* Title */}
            <h3 className="text-sm font-bold text-gray-900 line-clamp-1 leading-tight">
              {locale === "ar"
                ? `${t(ad.purpose)} ${ad.propertyType?.labelAr || ad.propertyType?.label} في ${ad.area?.labelAr || ad.area?.label}`
                : `${t(ad.purpose)} ${ad.propertyType?.label} in ${ad.area?.label}`}
            </h3>

            {/* Price & Time ago */}
            <div className="flex items-center gap-4 text-xs my-1">
              <span className="font-bold text-[#197aca] text-sm">
                {formatPrice(ad.price)}
              </span>
              <div className="flex items-center gap-1 text-gray-500 font-semibold">
                <Clock size={12} className="text-gray-500" />
                <span className="text-[10px] font-semibold">
                  {getTimeAgo(ad.createdAt)}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-[13px] text-gray-500 line-clamp-2 leading-relaxed font-normal">
              {ad.description}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
