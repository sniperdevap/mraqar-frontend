"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Eye, Play, Share2, Calendar, BadgeCheck, Crown } from "lucide-react";
import { Ad, Media } from "@/types/ad";
import { useLocale, useTranslations } from "@/hooks/use-locale";
import { formatDistanceToNow } from "@/lib/utils/format";
import { useRoutePrefetch } from "@/hooks/use-route-prefetch";

const MyAdActions = dynamic(() =>
  import("./my-ad-actions").then((mod) => mod.MyAdActions),
);
const ShareDialog = dynamic(() =>
  import("@/components/common/share-dialog").then((mod) => mod.ShareDialog),
);

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 448 512" fill="currentColor" className={className} aria-hidden="true">
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
    </svg>
  );
}

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
  const tButtons = useTranslations("common.buttons");
  const href = `/ads/${ad.id}`;
  const { setPrefetchTarget, prefetchNow } = useRoutePrefetch(href);
  const [shareUrl, setShareUrl] = React.useState<string | null>(null);

  const title =
    locale === "ar"
      ? `${t(ad.purpose)} ${ad.propertyType?.labelAr || ad.propertyType?.label} في ${ad.area?.labelAr || ad.area?.label}`
      : `${t(ad.purpose)} ${ad.propertyType?.label} in ${ad.area?.label}`;

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleShare = (e: React.MouseEvent) => {
    stop(e);
    setShareUrl(`${window.location.origin}${href}`);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    stop(e);
    const raw =
      ad.isPhoneHidden && ad.alternativePhoneNumber
        ? ad.alternativePhoneNumber
        : ad.phoneNumber;
    if (!raw) return;
    let phone = raw.replace(/[^0-9]/g, "");
    if (!phone.startsWith("965")) phone = "965" + phone;
    const message = encodeURIComponent(
      `${t("whatsappMessage")}\n${title}\n${window.location.origin}${href}`,
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

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

  const ownerName = ad.user?.name || "";
  const avatarUrl = ad.user?.avatar
    ? ad.user.avatar.startsWith("http")
      ? ad.user.avatar
      : `${(process.env.NEXT_PUBLIC_IMAGE_HOST || "").replace(/\/+$/, "")}/${ad.user.avatar.replace(/^\/+/, "")}`
    : null;

  const cardContent = (
    <div className="relative w-full rounded-2xl border border-[#f1e5db] shadow-[0_2px_12px_rgba(16,24,40,0.05)] p-3 sm:p-3.5 bg-gradient-to-br from-[#fbf1ea] via-white to-[#fbf1ea]">
      {isFeatured && (
        <span className={`absolute top-2.5 ${direction === "rtl" ? "left-3" : "right-3"} z-10 flex items-center gap-1 bg-[linear-gradient(135deg,#b8891f_0%,#e6cb7a_50%,#b8891f_100%)] text-white px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-full shadow-sm tracking-wide`}>
          {locale === "ar" ? "مميز" : "DISTINCT"}
          <Crown size={10} className="fill-white text-white" />
        </span>
      )}

      {/* Title */}
      <h3 className={`text-sm sm:text-base font-bold text-gray-900 line-clamp-2 leading-5 sm:leading-6 pt-0.5 ${direction === "rtl" ? "pl-14" : "pr-14"}`}>
        {title}
      </h3>

      {/* Image (start) + owner / date / description (end) */}
      <div className="flex gap-2.5 mt-2.5">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl overflow-hidden bg-gray-100 ring-2 ring-white shadow-[0_3px_10px_rgba(16,24,40,0.12)]">
          <Image
            src={displayUrl as string}
            alt={ad.description}
            fill
            className="object-cover"
            sizes="(min-width: 640px) 112px, 96px"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
          />
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/80">
                <Play className="w-3 h-3 text-white fill-white ms-0.5" />
              </span>
            </div>
          )}
          {/* view count */}
          <span className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 text-white ps-1.5 pe-2 py-0.5 rounded-full text-[10px] font-semibold leading-none shadow-sm">
            <Eye strokeWidth={2.5} className="w-3 h-3" />
            {ad.views || 0}
          </span>
          {/* purpose sticker */}
          <div className="absolute bottom-1.5 inset-x-0 flex justify-center">
            <span className="bg-white/95 text-gray-800 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              {t(ad.purpose)}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
          {/* owner */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="flex items-center justify-center w-5 h-5 shrink-0 rounded-full overflow-hidden bg-brand-teal/10 text-brand-teal text-[8px] font-bold">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={ownerName || "User"}
                  width={20}
                  height={20}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                ownerName.trim().charAt(0) || "?"
              )}
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium text-gray-700 truncate">
              {ownerName}
            </span>
          </div>
          {/* date */}
          <div className="flex items-center gap-1 text-gray-500 text-[10px] sm:text-[11px]">
            {ad.isOffice && (
              <BadgeCheck size={12} className="text-[#16A34A] shrink-0" aria-hidden="true" />
            )}
            <Calendar size={12} className="shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap" suppressHydrationWarning>
              {getTimeAgo(ad.createdAt)}
            </span>
          </div>
          {/* description */}
          <p className="text-[11px] sm:text-[12px] text-gray-600 line-clamp-2 leading-4 font-light">
            {shortDescription}
          </p>
        </div>
      </div>

      {/* Price + location + actions */}
      <div className="flex items-center justify-between gap-2 mt-3">
        <div className="min-w-0">
          <span className="whitespace-nowrap font-bold text-sm text-[#7546BD]">
            {formatPrice(ad.price)}
          </span>
        </div>

        {variant === "default" && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1 whitespace-nowrap bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full px-3 py-1.5 text-[11px] sm:text-[12px] font-semibold transition-colors"
            >
              <Share2 size={13} />
              <span>{tButtons("share")}</span>
            </button>
            <button
              type="button"
              onClick={handleWhatsApp}
              className="flex items-center gap-1 whitespace-nowrap bg-white border border-gray-200 text-[#16A34A] hover:bg-[#f0fdf4] rounded-full px-3 py-1.5 text-[11px] sm:text-[12px] font-semibold transition-colors"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
              <span>{t("whatsapp")}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const cardClasses =
    "relative block w-full cursor-pointer mb-3 hover:opacity-95 transition-opacity cv-card";

  const shareDialog = shareUrl !== null && (
    <ShareDialog
      isOpen
      onClose={() => setShareUrl(null)}
      url={shareUrl}
      title={title}
    />
  );

  if (variant === "default") {
    return (
      <>
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
        {shareDialog}
      </>
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
      {shareDialog}
    </div>
  );
}

export const HomeAdCard = React.memo(HomeAdCardBase);
