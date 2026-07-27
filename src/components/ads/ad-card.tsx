"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  Pin,
  Play,
  RotateCw,
  Pencil,
  Trash,
  Eye,
  Heart,
  Clock,
} from "lucide-react";
import { Ad, Media } from "@/types/ad";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { deleteAd, updateAd } from "@/lib/api/ad";
import { addFavorite, removeFavorite } from "@/lib/api/account";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useLocale } from "@/hooks/use-locale";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRoutePrefetch } from "@/hooks/use-route-prefetch";
import { useIsLastViewedAd, LAST_VIEWED_ATTR } from "@/hooks/use-last-viewed-ad";
import { formatAdPrice } from "@/lib/utils/format";

interface AdCardProps {
  ad: Ad;
  onClick?: () => void;
  variant?: "default" | "my-ad" | "admin";
  onAction?: (action: "edit" | "refresh" | "view", ad: Ad) => void;
  fetchFavorites?: () => Promise<void>;
  mode?: "light" | "dark";
}

export function AdCard({
  ad,
  onClick,
  variant = "default",
  onAction,
}: AdCardProps) {
  const { locale, direction } = useLocale();
  const { isAuthenticated } = useAuthStore();
  const query = useQueryClient();
  const { setPrefetchTarget, prefetchNow } = useRoutePrefetch(
    `/ads/${ad.id}`,
    variant !== "admin",
  );
  const isLastViewed = useIsLastViewedAd(variant === "admin" ? undefined : ad.id);
  const t = useTranslations("common.ads");
  const tButtons = useTranslations("common.buttons");
  const [isFavorite, setIsFavorite] = React.useState(ad.isFav || false);
  const [isLoadingFav, setIsLoadingFav] = React.useState(false);

  React.useEffect(() => {
    setIsFavorite(ad.isFav || false);
  }, [ad.isFav]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoadingFav) return;
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
      query.invalidateQueries({ queryKey: ["favorites"] });
      query.invalidateQueries({ queryKey: ["office"] });
      query.invalidateQueries({ queryKey: ["ads"] });
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      toast.error("Operation failed");
    } finally {
      setIsLoadingFav(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAd(ad.id);
      query.invalidateQueries({ queryKey: ["ads"] });
      toast.success(t("deletedSuccessfully"));
      if (onAction) onAction("refresh", ad);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(t("failedToDelete"));
    }
  };

  const handlePremium = async () => {
    try {
      await updateAd(ad.id, { isPremium: true });
      toast.success(t("premiumSuccessfully"));
      query.invalidateQueries({ queryKey: ["ads"] });
      if (onAction) onAction("refresh", ad);
    } catch (error) {
      console.error("Premium upgrade failed:", error);
      toast.error(t("failedToPremium"));
    }
  };

  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = ad.status === "active" ? "inactive" : "active";
    try {
      await updateAd(ad.id, { status: newStatus });
      toast.success(newStatus === "active" ? t("activated") : t("stopped"));
      query.invalidateQueries({ queryKey: ["ads"] });
      if (onAction) onAction("refresh", ad);
    } catch (error) {
      console.error("Status update failed:", error);
      toast.error(t("failedToUpdate"));
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAction) onAction("edit", ad);
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
      return t("recently");
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
  const hasMediaPreview = true;

  return (
    <>
      <Card
        ref={setPrefetchTarget}
        className={`group rounded-2xl relative shadow-none border-0 gap-0 h-auto flex flex-col overflow-hidden transition-all duration-200 active:scale-[0.99] cursor-pointer select-none bg-card-mint mb-3 ${isLastViewed ? "ad-glow" : ""}`}
        onClick={onClick}
        onMouseEnter={prefetchNow}
        onFocus={prefetchNow}
        onTouchStart={prefetchNow}
        dir={direction}
        {...(isLastViewed ? { [LAST_VIEWED_ATTR]: "" } : {})}
      >
        {isPremiumAd && (
          <div
            className={`absolute top-2 z-20 bg-brand-gold text-white px-3 py-1 text-[10px] sm:text-[11px] font-semibold rounded-full tracking-tight ${direction === "rtl" ? "left-2" : "right-2"}`}
          >
            {t("premiumBadge")}
          </div>
        )}
        <div className="flex flex-row w-full min-h-[160px] sm:min-h-[150px]">
          {/* Image Section */}
          {hasMediaPreview && (
            <div className="relative w-[130px] sm:w-[150px] self-stretch shrink-0">
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  fill
                  src={(displayUrl as string) || "/images/DefaultAdImage.jpeg"}
                  alt={
                    locale === "ar"
                      ? ad.propertyType?.labelAr || ad.propertyType?.label || ""
                      : ad.propertyType?.label || ""
                  }
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-lg">
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white ms-0.5" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Content Section */}
          <div className="flex-1 py-3 px-3 sm:px-4 flex flex-col justify-between overflow-hidden">
            <div className="flex-1">
              {/* Top Row: Price + Fav */}
              <div
                className={`${!hasMediaPreview ? "mt-2" : ""} flex justify-between items-start mb-1 gap-2`}
              >
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {ad.price ? (
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth="0"
                      viewBox="0 0 24 24"
                      className="text-[#e11d1d] shrink-0"
                      height="14"
                      width="14"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12.0049 22.0027C6.48204 22.0027 2.00488 17.5256 2.00488 12.0027C2.00488 6.4799 6.48204 2.00275 12.0049 2.00275C17.5277 2.00275 22.0049 6.4799 22.0049 12.0027C22.0049 17.5256 17.5277 22.0027 12.0049 22.0027ZM12.0049 20.0027C16.4232 20.0027 20.0049 16.421 20.0049 12.0027C20.0049 7.58447 16.4232 4.00275 12.0049 4.00275C7.5866 4.00275 4.00488 7.58447 4.00488 12.0027C4.00488 16.421 7.5866 20.0027 12.0049 20.0027ZM8.50488 14.0027H14.0049C14.281 14.0027 14.5049 13.7789 14.5049 13.5027C14.5049 13.2266 14.281 13.0027 14.0049 13.0027H10.0049C8.62417 13.0027 7.50488 11.8835 7.50488 10.5027C7.50488 9.12203 8.62417 8.00275 10.0049 8.00275H11.0049V6.00275H13.0049V8.00275H15.5049V10.0027H10.0049C9.72874 10.0027 9.50488 10.2266 9.50488 10.5027C9.50488 10.7789 9.72874 11.0027 10.0049 11.0027H14.0049C15.3856 11.0027 16.5049 12.122 16.5049 13.5027C16.5049 14.8835 15.3856 16.0027 14.0049 16.0027H13.0049V18.0027H11.0049V16.0027H8.50488V14.0027Z"></path>
                    </svg>
                  ) : null}
                  <span className="text-[16px] sm:text-[16px] font-bold text-black whitespace-nowrap">
                    {ad.price
                      ? formatAdPrice(ad.price, ad.priceUnit, locale)
                      : ""}
                  </span>
                </div>
                <div className="flex items-start gap-2 shrink-0">
                  {isAuthenticated && (
                    <button
                      onClick={handleToggleFavorite}
                      className=" -mr-1 rounded-full text-gray-400 hover:text-gray-600 transition-colors shrink-0 outline-none"
                      disabled={isLoadingFav}
                    >
                      <Heart
                        size={20}
                        className={
                          isFavorite
                            ? "fill-gray-500 text-gray-500"
                            : "text-gray-400"
                        }
                        strokeWidth={isFavorite ? 1 : 2}
                      />
                    </button>
                  )}
                </div>
              </div>

              {/* Title */}
              <h3 className="mt-2 text-[16px] sm:text-[15px] font-bold text-black leading-snug line-clamp-2 mb-1">
                {locale === "ar"
                  ? `${t(ad.purpose)} ${ad.propertyType?.labelAr || ad.propertyType?.label || "عقار"} في ${ad.area?.labelAr || ad.area?.label || "منطقة غير معروفة"}`
                  : `${t(ad.purpose)} ${ad.propertyType?.label || "Property"} in ${ad.area?.label || "Unknown Area"}`}
              </h3>

              {/* Description */}
              <p className="mt-4 text-[14px] sm:text-[13px] text-gray-500 font-light line-clamp-2 leading-snug">
                {ad.description}
              </p>
            </div>

            <div className="mt-auto">
              {/* Time Row */}
              <div className="flex items-center justify-start gap-1 text-gray-500 mb-1.5 mt-6">
                <Clock size={12} className="text-[#e11d1d]" />
                <span className="text-[11px] font-medium">
                  {getTimeAgo(ad.createdAt)}
                </span>
              </div>

              {/* Compact Row of Circular Actions (New Row Below Time) */}
              {(variant === "my-ad" || variant === "admin") && (
                <div
                  className="flex items-center justify-end gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {/* View Button (Admin only) */}
                  {variant === "admin" && (
                    <button
                      title={tButtons("viewMore")}
                      className="w-7 h-7 rounded-full bg-white border border-gray-200 text-brand-teal hover:bg-gray-50 flex items-center justify-center transition-all active:scale-95"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onAction) onAction("view", ad);
                      }}
                    >
                      <Eye size={13} />
                    </button>
                  )}

                  {/* Toggle Status Button */}
                  <button
                    title={
                      ad.status === "active" ? t("stopAd") : t("activateAd")
                    }
                    className="w-7 h-7 rounded-full bg-white border border-gray-200 text-brand-teal hover:bg-gray-50 flex items-center justify-center transition-all active:scale-95"
                    onClick={handleToggleStatus}
                  >
                    {ad.status === "active" ? (
                      <Play size={13} />
                    ) : (
                      <RotateCw size={13} />
                    )}
                  </button>

                  {/* Premium Upgrade Button */}
                  {variant === "my-ad" && !isPremiumAd && (
                    <ConfirmationDialog
                      trigger={
                        <button
                          title={t("featureAdTitle")}
                          className="w-7 h-7 rounded-full bg-white border border-gray-200 text-brand-teal hover:bg-gray-50 flex items-center justify-center transition-all active:scale-95"
                        >
                          <Pin size={13} />
                        </button>
                      }
                      icon={{
                        src: "/images/icons/star.svg",
                        alt: "Premium",
                        bgColor: "bg-yellow-100",
                      }}
                      title={t("featureAdTitle")}
                      description={t("featureAdDescription")}
                      confirmButtonText={t("featureConfirm")}
                      onConfirm={handlePremium}
                    />
                  )}

                  {/* Edit Button */}
                  <button
                    title={t("editAd")}
                    className="w-7 h-7 rounded-full bg-white border border-gray-200 text-brand-teal hover:bg-gray-50 flex items-center justify-center transition-all active:scale-95"
                    onClick={handleEdit}
                  >
                    <Pencil size={13} />
                  </button>

                  {/* Delete Button */}
                  <ConfirmationDialog
                    trigger={
                      <button
                        title={t("deleteAd")}
                        className="w-7 h-7 rounded-full bg-white border border-gray-200 text-red-500 hover:bg-gray-50 flex items-center justify-center transition-all active:scale-95"
                      >
                        <Trash size={13} />
                      </button>
                    }
                    icon={{
                      src: "/images/icons/delete.svg",
                      alt: "Delete",
                      bgColor: "bg-red-100",
                    }}
                    title={t("deleteAd")}
                    description={t("cancelNote")}
                    confirmButtonText={t("deleteAd")}
                    cancelButtonText={tButtons("cancel")}
                    onConfirm={handleDelete}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
