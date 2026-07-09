"use client";

import React from "react";
import Image from "next/image";
import { Heart, Clock, Eye } from "lucide-react";
import { Ad, Media } from "@/types/ad";
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useLocale } from "@/hooks/use-locale";
import { useAuthStore } from "@/lib/store/auth-store";
import { useQueryClient } from "@tanstack/react-query";
import { addFavorite, removeFavorite } from "@/lib/api/account";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SearchAdCardProps {
  ad: Ad;
  onClick?: () => void;
}

export function SearchAdCard({ ad, onClick }: SearchAdCardProps) {
  const { locale, direction } = useLocale();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const t = useTranslations("common.ads");

  const [isFavorite, setIsFavorite] = React.useState(ad.isFav || false);
  const [isLoadingFav, setIsLoadingFav] = React.useState(false);

  React.useEffect(() => {
    setIsFavorite(ad.isFav || false);
  }, [ad.isFav]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoadingFav || !isAuthenticated) return;

    setIsLoadingFav(true);
    try {
      if (isFavorite) {
        await removeFavorite(ad.id);
        setIsFavorite(false);
        toast.success(t("removedFromFavorites") || "Removed from favorites");
      } else {
        await addFavorite(ad.id);
        setIsFavorite(true);
        toast.success(t("addedToFavorites") || "Added to favorites");
      }
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      toast.error("Operation failed");
    } finally {
      setIsLoadingFav(false);
    }
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
      return "";
    }
  };

  const getMediaUrl = (media: Media) => {
    if (!media) return null;
    if (media.url?.startsWith("http")) return media.url;
    return `${process.env.NEXT_PUBLIC_IMAGE_HOST}/${media.url}`;
  };

  const getThumbnailUrl = (media: Media) => {
    if (!media.thumbnail) return getMediaUrl(media);
    if (media.thumbnail.startsWith("http")) return media.thumbnail;
    return `${process.env.NEXT_PUBLIC_IMAGE_HOST}/${media.thumbnail}`;
  };

  const isPremiumAd = ad.isPremium ?? ad.premiumAd;
  const firstMedia = ad.media?.[0];
  const isVideo = firstMedia?.type === "video";
  const displayUrl = firstMedia
    ? isVideo
      ? getThumbnailUrl(firstMedia)
      : getMediaUrl(firstMedia)
    : null;

  return (
    <div
      onClick={onClick}
      dir={direction}
      className={cn(
        "group relative flex flex-col bg-[#f3f3f3] p-2 rounded-lg cursor-pointer transition-all hover:shadow-[0_10px_30px_-10px_rgba(31,64,114,0.15)] border border-primary/10 mb-4 overflow-hidden text-start",
      )}
    >
      {/* Main Content (Image + Header Info) */}
      <div className="flex items-start gap-2 flex-row">
        {/* Small Image with Badge */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
          <div className="relative w-full h-full rounded-sm ">
            <div className="absolute inset-0 overflow-hidden rounded-sm border border-gray-200">
              <Image
                fill
                src={(displayUrl as string) || "/images/DefaultAdImage.jpeg"}
                alt=""
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            {/* Premium Badge (Corner Relative to Image) */}
            {isPremiumAd && (
              <div
                className={cn(
                  "absolute -top-1 z-20 flex",
                  direction === "rtl" ? "-right-1" : "-left-1",
                )}
              >
                <div
                  className={cn(
                    "relative bg-primary text-white px-2 py-0.5 text-[10px] font-bold uppercase shadow-lg",
                    direction === "rtl" ? "rounded-l-sm" : "rounded-r-sm",
                  )}
                >
                  {t("premiumBadge")}
                  {/* Ribbon "fold" effect */}
                  <div
                    className={cn(
                      "absolute top-full w-1.5 h-1.5 bg-primary [clip-path:polygon(0_0,100%_0,0_100%)]",
                      direction === "rtl" ? "right-0 scale-x-[-1]" : "left-0",
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0 pt-0.5 flex flex-col gap-1">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-sm md:text-base font-bold text-[#1f2937] leading-tight">
              {locale === "ar"
                ? `${t(ad.purpose)} ${ad.propertyType?.labelAr || ad.propertyType?.label || "عقار"} في ${ad.area?.labelAr || ad.area?.label || "منطقة غير معروفة"}`
                : `${t(ad.purpose)} ${ad.propertyType?.label || "Property"} in ${ad.area?.label || "Unknown Area"}`}
            </h3>

            {isAuthenticated && (
              <button
                onClick={handleToggleFavorite}
                className="shrink-0"
                disabled={isLoadingFav}
              >
                <Heart
                  size={18}
                  className={cn(
                    "transition-all duration-300",
                    isFavorite
                      ? "fill-[#ea5455] text-[#ea5455]"
                      : "text-gray-400",
                  )}
                  strokeWidth={isFavorite ? 0 : 2}
                />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 flex-row">
            {ad.price ? (
              <span className="text-base font-bold text-[#9a090e]">{`${Number(ad.price).toLocaleString("en-US")}  د.ك`}</span>
            ) : null}
            <div className="flex items-center gap-1.5 text-gray-500 font-medium">
              <Clock size={13} className="text-[#94a3b8]" />
              <span className="text-[12px]">{getTimeAgo(ad.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500 font-medium">
              <Eye size={13} className="text-[#94a3b8]" />
              <span className="text-[12px]">{ad.views || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Description (Bottom Row) */}
      <p className="mt-2 text-xs md:text-sm text-[#506076] line-clamp-2 leading-relaxed font-medium">
        {ad.description}
      </p>
    </div>
  );
}
