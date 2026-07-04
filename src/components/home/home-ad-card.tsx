"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  DollarSign,
  Pencil,
  Pin,
  Play,
  RotateCw,
  Trash,
} from "lucide-react";
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


  const isFeatured = ad.isPremium || ad.premiumAd;
  const isVideo = firstMedia?.type === "video";

  const cardContent = (
    <>
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

          {/* Title + Price/Time — fixed min-height reduces CLS from font swap */}
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
                <span className="text-[13px] font-medium leading-5">
                  {getTimeAgo(ad.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description - spans full card width below the image */}
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
    <div className="relative block w-full mb-3" dir={direction}>
      <Link
        href={`/ads/${ad.id}`}
        onClick={onClick}
        className="block relative"
      >
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
