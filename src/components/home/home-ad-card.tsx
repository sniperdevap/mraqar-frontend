"use client";

import React from "react";
import Image from "next/image";
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
    return `${process.env.NEXT_PUBLIC_IMAGE_HOST}/${media.url}`;
  };

  const firstMedia = ad.media?.[0];
  const displayUrl = firstMedia
    ? getMediaUrl(firstMedia)
    : "/images/card-placeholder-1.jpeg";

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
        url: window.location.origin + `/ads/${ad._id}`,
      });
    }
  };

  return (
    <div
      className="flex flex-col gap-2 mb-6 cursor-pointer"
      onClick={onClick}
      dir={direction}
    >
      {/* Brand Logo at the top of the card group */}
      <div className="flex justify-start mb-1">
        <Image
          src="/images/aqar-logo.png"
          alt="Logo"
          width={60}
          height={20}
          className="h-8 w-auto object-contain"
        />
      </div>

      {/* Main Card Container */}
      <Card className="relative border-t-2 border-l-2 border-r-2 border-b-0 border-[#197aca] shadow-none rounded-t-sm rounded-b-none bg-white">
        {/* Premium Badge */}
        {(ad.isPremium || ad.premiumAd) && (
          <div
            className={`absolute -top-2 z-20 bg-[#e11d48] text-white px-3 py-0.5 text-[10px] font-bold rounded-full shadow-md ${
              direction === "rtl" ? "left-2" : "right-2"
            }`}
          >
            {locale === "ar" ? "مميز" : "Premium"}
          </div>
        )}

        <div className="flex flex-row min-h-[150px] sm:min-h-[160px] h-auto">
          {/* Left: Image Section */}
          <div className="relative w-[40%] md:w-[25%] self-stretch">
            <Image
              src={displayUrl as string}
              alt={ad.description}
              fill
              className={`object-cover ${direction === "rtl" ? "rounded-r-[3px]" : "rounded-l-[3px]"}`}
            />
          </div>

          {/* Right: Content Section */}
          <div className="flex-1 px-3 pt-3 flex flex-col justify-start gap-3">
            <div className="space-y-1">
              <p className="text-[11px] text-gray-700 line-clamp-3 leading-relaxed font-medium">
                {ad.description}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-start gap-4">
                <button
                  onClick={handleShare}
                  className="text-gray-600 hover:text-black"
                >
                  <Share2 size={18} strokeWidth={2} />
                </button>
                <div className="flex items-center gap-1 text-gray-500">
                  <Clock size={16} />
                  <span className="text-[11px] font-medium">
                    {getTimeAgo(ad.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span
                    className="text-[13px] font-bold text-[#197aca] tracking-tight"
                    dir="ltr"
                  >
                    {ad.phoneNumber}
                    {ad.alternativePhoneNumber
                      ? ` / ${ad.alternativePhoneNumber}`
                      : ""}
                  </span>
                </div>
                <button
                  onClick={handleWhatsApp}
                  className="bg-[#25D366] text-white p-1.5 rounded-full hover:bg-green-600 transition-colors shadow-sm flex items-center justify-center"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </button>
              </div>

              {/* Office Info */}
              <div className="flex items-center justify-end gap-2 pt-1 min-w-0 mb-2">
                <span className="text-[11px] font-bold text-[#197aca] truncate max-w-[120px]">
                  {ad.user?.name ||
                    (locale === "ar" ? "شركة عقارية" : "Real Estate Co")}
                </span>
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100 shadow-inner">
                  {ad.user?.avatar ? (
                    <Image
                      src={ad.user.avatar}
                      alt="Avatar"
                      width={28}
                      height={28}
                    />
                  ) : (
                    <div className="text-[8px] font-bold text-gray-400">MA</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Bottom Info Section (Below Card) */}
      <div className="mt-2 px-1 flex flex-col items-center">
        <h2 className="text-[18px] font-bold text-black text-center leading-tight">
          {locale === "ar"
            ? `${t(ad.purpose)} ${ad.propertyType?.labelAr || ad.propertyType?.label} في ${ad.area?.labelAr || ad.area?.label}`
            : `${t(ad.purpose)} ${ad.propertyType?.label} in ${ad.area?.label}`}
        </h2>
        <div className="text-[18px] font-bold text-black text-center mt-0.5">
          {formatPrice(ad.price)}
        </div>
      </div>
    </div>
  );
}
