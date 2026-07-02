"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Share2, Clock, Phone, MessageCircle, Play, DollarSign } from "lucide-react";
import { Ad, Media } from "@/types/ad";
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
    return `${Number(price).toLocaleString("en-US")} ${locale === "ar" ? "دك" : "KD"}`;
  };

  const getTimeAgo = (date: string) => {
    try {
      const locale_obj = locale === "ar" ? ar : enUS;
      const timeString = formatDistanceToNow(new Date(date), {
        addSuffix: false,
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


  const isFeatured = ad.isPremium || ad.premiumAd;
  const isVideo = firstMedia?.type === "video";

  return (
    <Link
      href={`/ads/${ad.id}`}
      className="relative block w-full cursor-pointer"
      onClick={onClick}
      dir={direction}
    >
      {/* Featured Badge - corner ribbon */}
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
          {/* Image Section (Left in LTR / Right in RTL) */}
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
                  <Play size={12} className="text-gray-800 fill-gray-800 ms-0.5" />
                </span>
              </div>
            )}
          </div>

          {/* Title + Price/Time (constrained beside the image) */}
          <div className="flex-1 flex flex-col min-w-0">
            <h3 className="text-base font-extrabold text-gray-900 line-clamp-1 leading-snug">
              {locale === "ar"
                ? `${t(ad.purpose)} ${ad.propertyType?.labelAr || ad.propertyType?.label} في ${ad.area?.labelAr || ad.area?.label}`
                : `${t(ad.purpose)} ${ad.propertyType?.label} in ${ad.area?.label}`}
            </h3>

            <div className="flex items-center gap-3 my-3">
              <div className="flex items-center gap-1.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#169899]/10 text-[#169899] shrink-0">
                  <DollarSign size={12} strokeWidth={2.5} />
                </span>
                <span className="font-bold text-[#169899] text-base">
                  {formatPrice(ad.price)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Clock size={14} className="text-gray-500" />
                <span className="text-[14px] font-medium">
                  {getTimeAgo(ad.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description - spans full card width below the image */}
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed font-normal">
          {ad.description}
        </p>
      </div>
    </Link>
  );
}
