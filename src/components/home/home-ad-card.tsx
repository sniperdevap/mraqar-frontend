"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Pencil, Pin, Play, RotateCw, Trash } from "lucide-react";
import { Ad, Media } from "@/types/ad";
import { useLocale, useTranslations } from "@/hooks/use-locale";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { deleteAd, updateAd } from "@/lib/api/ad";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
  const tButtons = useTranslations("common.buttons");
  const queryClient = useQueryClient();

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

  const handleDelete = async () => {
    try {
      await deleteAd(ad.id);
      queryClient.invalidateQueries({ queryKey: ["ads"] });
      toast.success(t("deletedSuccessfully"));
      onAction?.("refresh", ad);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(t("failedToDelete"));
    }
  };

  const handlePremium = async () => {
    try {
      await updateAd(ad.id, { isPremium: true });
      toast.success(t("premiumSuccessfully"));
      queryClient.invalidateQueries({ queryKey: ["ads"] });
      onAction?.("refresh", ad);
    } catch (error) {
      console.error("Premium upgrade failed:", error);
      toast.error(t("failedToPremium"));
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = ad.status === "active" ? "inactive" : "active";
    try {
      await updateAd(ad.id, { status: newStatus });
      toast.success(newStatus === "active" ? t("activated") : t("stopped"));
      queryClient.invalidateQueries({ queryKey: ["ads"] });
      onAction?.("refresh", ad);
    } catch (error) {
      console.error("Status update failed:", error);
      toast.error(t("failedToUpdate"));
    }
  };

  const cardContent = (
    <div className="block w-full h-[104px] p-2.5">
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
    </div>
  );

  const cardClasses =
    "block w-full bg-[#f9eef2] border border-gray-200 rounded-lg overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all cursor-pointer mb-3";

  if (variant === "default") {
    return (
      <Link
        href={`/ads/${ad.id}`}
        className={cardClasses}
        onClick={onClick}
        dir={direction}
      >
        {cardContent}
      </Link>
    );
  }

  const isPremiumAd = ad.isPremium ?? ad.premiumAd;

  return (
    <div className={cardClasses} dir={direction}>
      <Link href={`/ads/${ad.id}`} onClick={onClick} className="block">
        {cardContent}
      </Link>
      <div
        className="flex items-center justify-end gap-1.5 border-t border-gray-200/80 px-2.5 py-2"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          title={ad.status === "active" ? t("stopAd") : t("activateAd")}
          className="w-7 h-7 rounded-full bg-white border border-gray-200 text-[#4fd1ed] hover:bg-gray-50 flex items-center justify-center transition-all active:scale-95"
          onClick={handleToggleStatus}
        >
          {ad.status === "active" ? <Play size={13} /> : <RotateCw size={13} />}
        </button>

        {!isPremiumAd && (
          <ConfirmationDialog
            trigger={
              <button
                type="button"
                title={t("featureAdTitle")}
                className="w-7 h-7 rounded-full bg-white border border-gray-200 text-amber-500 hover:bg-gray-50 flex items-center justify-center transition-all active:scale-95"
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

        <button
          type="button"
          title={t("editAd")}
          className="w-7 h-7 rounded-full bg-white border border-gray-200 text-slate-600 hover:bg-gray-50 flex items-center justify-center transition-all active:scale-95"
          onClick={() => onAction?.("edit", ad)}
        >
          <Pencil size={13} />
        </button>

        <ConfirmationDialog
          trigger={
            <button
              type="button"
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
    </div>
  );
}
