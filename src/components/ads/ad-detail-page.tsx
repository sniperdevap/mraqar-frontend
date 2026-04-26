"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Share2,
  Phone,
  Heart,
  ChevronLeft,
  ChevronRight,
  Play,
} from "lucide-react";
import { updateAd, deleteAd } from "@/lib/api/ad";
import { Media } from "@/types/ad";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNowStrict } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { addFavorite, removeFavorite } from "@/lib/api/account";
import { useAuthStore } from "@/lib/store/auth-store";
import { Loader } from "../common/loader";
import { getErrorMessage } from "@/lib/utils/api";
import { useLocale } from "@/hooks/use-locale";
import dynamic from "next/dynamic";
import { useInView } from "react-intersection-observer";

const ConfirmationDialog = dynamic(() =>
  import("@/components/ui/confirmation-dialog").then(
    (mod) => mod.ConfirmationDialog,
  ),
);
const MediaViewer = dynamic(() =>
  import("../ui/media-viewer").then((mod) => mod.MediaViewer),
);
const ShareDialog = dynamic(() =>
  import("@/components/common/share-dialog").then((mod) => mod.ShareDialog),
);
const SearchAdCard = dynamic(() =>
  import("@/components/search/search-ad-card").then((mod) => mod.SearchAdCard),
);
import { formatDisplayPhone } from "@/lib/utils";
import { useAdById, useInfiniteSearchAds } from "@/hooks/use-ads";
import { useQueryClient } from "@tanstack/react-query";
import { useAdStore } from "@/lib/store/ad-store";
import { DetailAd, GetAdsParams } from "@/types/ad";

interface AdDetailPageProps {
  adId: string;
}

export function AdDetailPage({ adId }: AdDetailPageProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { locale, direction } = useLocale();
  const t = useTranslations("common.ads");
  const tButtons = useTranslations("common.buttons");
  const queryClient = useQueryClient();
  const { getAd, setAd, setAds } = useAdStore();

  // Try to load initial data from Zustand store
  const cachedAd = getAd(adId) as DetailAd | undefined;

  const { data: ad, isLoading: queryLoading } = useAdById(adId, cachedAd, true);

  // We only show loader if we have NO cached ad and query is still loading
  const isLoading = queryLoading && !cachedAd;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMediaViewerOpen, setIsMediaViewerOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(ad?.isFav || false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [showArrows, setShowArrows] = useState(false);
  const [hasSetSimilarAdsForPage, setHasSetSimilarAdsForPage] = useState<
    number[]
  >([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const similarAdsPerPage = 10;

  // Update store when full ad detail is fetched
  useEffect(() => {
    // Only update if the store doesn't already have this exact ad reference
    if (ad && (!cachedAd || cachedAd.updatedAt !== ad.updatedAt)) {
      setAd(ad);
    }
  }, [ad, cachedAd, setAd]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const checkScrollable = () => {
      if (scrollContainerRef.current) {
        const { scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowArrows(scrollWidth > clientWidth);
      }
    };

    checkScrollable();

    const observer = new ResizeObserver(checkScrollable);
    if (scrollContainerRef.current) {
      observer.observe(scrollContainerRef.current);
    }

    window.addEventListener("resize", checkScrollable);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", checkScrollable);
    };
  }, [ad?.media]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Initialize favorite status from ad data
  useEffect(() => {
    if (ad && isAuthenticated) {
      setIsFavorite(ad.isFav || false);
    } else {
      setIsFavorite(false);
    }
  }, [ad, isAuthenticated]);

  const isOwner = Boolean(
    ad && user && ad.user._id && ad.user._id === user._id,
  );

  const handleToggleFavorite = async () => {
    if (!ad) return;

    if (!isAuthenticated) {
      toast.error(t("pleaseLoginToAddFavorites"));
      router.push("/auth/signin");
      return;
    }

    /* if (isOwner) {
      toast.error(t('cannotFavoriteOwnProperty'));
      return;
    } */

    setIsFavoriteLoading(true);
    try {
      if (isFavorite) {
        await removeFavorite(ad._id);
        setIsFavorite(false);
        toast.success(t("removedFromFavorites"));
      } else {
        await addFavorite(ad._id);
        setIsFavorite(true);
        toast.success(t("addedToFavorites"));
      }
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      toast.error(getErrorMessage(error || "Failed to update favorite"));
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  // Dispatch favorite state to navbar via custom events
  useEffect(() => {
    const detail = { isFavorite, isFavoriteLoading, isOwner, isLoading };
    window.dispatchEvent(new CustomEvent("ad-favorite-state", { detail }));
  }, [isFavorite, isFavoriteLoading, isOwner, isLoading]);

  useEffect(() => {
    const handler = () => handleToggleFavorite();
    window.addEventListener("ad-toggle-favorite", handler);
    return () => window.removeEventListener("ad-toggle-favorite", handler);
  }, [ad, isAuthenticated, isFavorite, isOwner]);

  const similarAdsFilters = useMemo<GetAdsParams>(
    () => ({
      purpose: ad?.purpose,
      propertyType: ad?.propertyType?._id,
      area: ad?.area?._id,
    }),
    [ad?.purpose, ad?.propertyType?._id, ad?.area?._id],
  );

  const shouldFetchSimilarAds = Boolean(
    ad?.purpose && ad?.propertyType?._id && ad?.area?._id,
  );

  const {
    data: similarAdsData,
    fetchNextPage: fetchNextSimilarAdsPage,
    hasNextPage: hasNextSimilarAdsPage,
    isFetchingNextPage: isFetchingNextSimilarAdsPage,
    isLoading: isSimilarAdsLoading,
  } = useInfiniteSearchAds(
    similarAdsFilters,
    similarAdsPerPage,
    shouldFetchSimilarAds,
  );

  const similarAds = useMemo(() => {
    if (!similarAdsData?.pages) return [];
    return similarAdsData.pages
      .flatMap((page) => page.ads)
      .filter((similarAd) => similarAd._id !== adId);
  }, [similarAdsData?.pages, adId]);

  const similarAdsTriggerIndex = Math.max(
    0,
    similarAds.length - Math.ceil(similarAdsPerPage / 2),
  );

  const { ref: similarAdsPrefetchRef, inView: isSimilarAdsPrefetchVisible } =
    useInView({
      threshold: 0,
      rootMargin: "100px 0px",
    });

  useEffect(() => {
    if (
      isSimilarAdsPrefetchVisible &&
      hasNextSimilarAdsPage &&
      !isFetchingNextSimilarAdsPage
    ) {
      fetchNextSimilarAdsPage();
    }
  }, [
    isSimilarAdsPrefetchVisible,
    hasNextSimilarAdsPage,
    isFetchingNextSimilarAdsPage,
    fetchNextSimilarAdsPage,
  ]);

  useEffect(() => {
    if (similarAdsData?.pages) {
      similarAdsData.pages.forEach((page, index) => {
        if (!hasSetSimilarAdsForPage.includes(index) && page.ads.length > 0) {
          setAds(page.ads);
          setHasSetSimilarAdsForPage((prev) => [...prev, index]);
        }
      });
    }
  }, [similarAdsData?.pages, hasSetSimilarAdsForPage, setAds]);

  useEffect(() => {
    setHasSetSimilarAdsForPage([]);
  }, [adId]);

  const getTimeAgo = (date: string) => {
    try {
      const locale_obj = locale === "ar" ? ar : enUS;
      return formatDistanceToNowStrict(new Date(date), {
        addSuffix: true,
        locale: locale_obj,
      });
    } catch {
      return "Recently";
    }
  };

  const getMediaUrl = (m: Media) => {
    if (!m) return "/images/placeholder-avatar.jpg";
    if (m.url?.startsWith("http")) return m.url;
    return `${process.env.NEXT_PUBLIC_IMAGE_HOST || ""}/${m.url}`;
  };

  const getThumbnailUrl = (m: Media) => {
    if (!m.thumbnail) return getMediaUrl(m);
    if (m.thumbnail.startsWith("http")) return m.thumbnail;
    return `${process.env.NEXT_PUBLIC_IMAGE_HOST || ""}/${m.thumbnail}`;
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/images/placeholder-avatar.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return `${process.env.NEXT_PUBLIC_IMAGE_HOST || ""}/${imagePath}`;
  };

  const handleEdit = () => {
    if (!ad) return;
    router.push(`/ads/edit/${ad._id}`);
  };

  const handleToggleStatus = async () => {
    if (!ad) return;
    try {
      const newStatus = ad.status === "active" ? "inactive" : "active";
      await updateAd(ad._id, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ["ad", adId] });
      queryClient.invalidateQueries({ queryKey: ["ads"] });
      queryClient.invalidateQueries({ queryKey: ["my-ads"] });
      toast.success(newStatus === "active" ? t("activated") : t("stopped"));
    } catch (error) {
      toast.error(t("failedToUpdate"));
    }
  };

  const handleDelete = async () => {
    if (!ad) return;
    try {
      await deleteAd(ad._id);
      queryClient.invalidateQueries({ queryKey: ["ads"] });
      queryClient.invalidateQueries({ queryKey: ["my-ads"] });
      toast.success(t("deletedSuccessfully"));
      router.push("/account?tab=my-ads");
    } catch (error) {
      toast.error(t("failedToDelete"));
    }
  };

  const handleShare = () => {
    if (!ad) return;
    setIsShareOpen(true);
  };

  const handleWhatsApp = () => {
    if (!ad) return;
    const phoneNumber =
      ad.isPhoneHidden && ad.alternativePhoneNumber
        ? ad.alternativePhoneNumber
        : ad.phoneNumber;

    const propertyInfo =
      locale === "ar"
        ? `${ad.propertyType?.labelAr || ad.propertyType?.label || "عقار"} - ${ad.area?.labelAr || ad.area?.label || "المنطقة"}`
        : `${ad.propertyType?.label || "Property"} - ${ad.area?.label || "Area"}`;

    const message = encodeURIComponent(`السلام عليكم
أنا مهتم بهذا الإعلان:
${propertyInfo}
${window.location.href}`);

    let phoneParam = phoneNumber.replace(/[^0-9]/g, "");
    // If it doesn't start with 965, add it
    if (!phoneParam.startsWith("965")) {
      phoneParam = "965" + phoneParam;
    }

    const whatsappUrl = `https://wa.me/${phoneParam}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  const handlePhoneCall = () => {
    if (!ad) return;
    const phoneNumber =
      ad.isPhoneHidden && ad.alternativePhoneNumber
        ? ad.alternativePhoneNumber
        : ad.phoneNumber;
    window.location.href = `tel:${phoneNumber}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <Loader />
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("adNotFound")}
          </h2>
          <Button onClick={() => router.push("/")} className="mt-4">
            {t("goToHome")}
          </Button>
        </div>
      </div>
    );
  }

  const currentMedia =
    ad.media && ad.media.length > 0 ? ad.media[currentImageIndex] : null;
  const currentImageUrl = currentMedia
    ? currentMedia.type === "video"
      ? getThumbnailUrl(currentMedia)
      : getMediaUrl(currentMedia)
    : "/images/aqar-logo.png";

  return (
    <div className="min-h-screen pb-28 bg-white" dir={direction}>
      {/* Top Image Slider or Spacer */}
      {ad.media && ad.media.length > 0 ? (
        <section className="relative max-w-4xl mx-auto  max-h-[30vh] overflow-hidden bg-gray-50 border-b border-gray-100">
          {/* Top Header Controls - Fixed to top left side regardless of language */}
          <div className="absolute top-6 left-4 z-30 pointer-events-none">
            <div className="flex gap-2.5 pointer-events-auto">
              {isAuthenticated && (
                <button
                  onClick={handleToggleFavorite}
                  disabled={isFavoriteLoading}
                  className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:bg-white/40 transition-all active:scale-95"
                >
                  <Heart
                    size={18}
                    className={
                      isFavorite ? "fill-red-500 text-red-500" : "text-black"
                    }
                    strokeWidth={isFavorite ? 0 : 2}
                  />
                </button>
              )}
              <button
                onClick={handleShare}
                className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:bg-white/40 transition-all active:scale-95"
              >
                <Share2 size={18} className="text-black" />
              </button>
            </div>
          </div>
          {/* Main Media Slider */}
          <div
            className="w-full h-full cursor-pointer"
            onClick={() => setIsMediaViewerOpen(true)}
          >
            {currentMedia?.type === "video" ? (
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <img
                  src={getThumbnailUrl(currentMedia)}
                  alt="Video thumbnail"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-2xl">
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                  </div>
                </div>
              </div>
            ) : (
              <img
                src={currentImageUrl}
                alt={
                  locale === "ar"
                    ? ad.propertyType?.labelAr ||
                      ad.propertyType?.label ||
                      "عقار"
                    : ad.propertyType?.label || "Property"
                }
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Slide Controls (Forward/Backward On-Image Icons) */}
          {ad.media.length > 1 && (
            <div className="absolute inset-y-0 left-0 right-0 pointer-events-none flex items-center justify-between px-2 text-white">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) =>
                    prev === 0 ? ad.media!.length - 1 : prev - 1,
                  );
                }}
                className="pointer-events-auto w-9 h-9 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-xs hover:bg-black/40 transition-colors"
              >
                {direction === "rtl" ? (
                  <ChevronRight size={24} />
                ) : (
                  <ChevronLeft size={24} />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) =>
                    prev === ad.media!.length - 1 ? 0 : prev + 1,
                  );
                }}
                className="pointer-events-auto w-9 h-9 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-xs hover:bg-black/40 transition-colors"
              >
                {direction === "rtl" ? (
                  <ChevronLeft size={24} />
                ) : (
                  <ChevronRight size={24} />
                )}
              </button>
            </div>
          )}

          {/* Media Badge (Count) */}
          <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-md flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            {currentImageIndex + 1} / {ad.media.length}
          </div>
        </section>
      ) : (
        <div className="h-16 w-full" />
      )}

      {/* Detail Content Section */}
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-10">
        <div className="flex flex-col items-center w-full mb-1 relative">
          {/* Title & Price Centered */}
          <div className="text-center space-y-2 mb-0">
            <h1 className="text-[22px] md:text-2xl font-bold text-black leading-tight">
              {locale === "ar"
                ? `${ad.purpose === "sale" ? "للبيع" : ad.purpose === "rent" ? "للايجار" : "للبدل"} ${ad.propertyType?.labelAr || ad.propertyType?.label || ""} في ${ad.area?.labelAr || ad.area?.label || ""}`
                : `${ad.purpose === "sale" ? "Sale" : ad.purpose === "rent" ? "Rent" : "Exchange"} ${ad.propertyType?.label || ""} in ${ad.area?.label || ""}`}
            </h1>
            <div className="text-[22px] md:text-2xl font-bold text-black">
              {ad.price
                ? `${Number(ad.price).toLocaleString("en-US")} د.ك`
                : ""}
            </div>
          </div>

          {/* Contact Info & Logo Row */}
          <div
            dir={locale === "ar" ? "rtl" : "ltr"}
            className="flex items-center justify-between w-full"
          >
            <div className="flex-1 flex justify-start items-center gap-2 text-[#197aca] font-bold text-lg md:text-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                shape-rendering="geometricPrecision"
                text-rendering="geometricPrecision"
                image-rendering="optimizeQuality"
                fill-rule="evenodd"
                clip-rule="evenodd"
                className="h-12 w-12"
                viewBox="0 0 512 437.15"
              >
                <path d="M180.84 0h150.33c13.67 0 26.14 5.58 35.04 14.54 9.02 9.02 14.51 21.43 14.51 35.04v338.01c0 13.68-5.56 26.15-14.51 35.03-9.04 9.05-21.44 14.53-35.04 14.53H180.84c-13.68 0-26.16-5.56-35.04-14.52-9.03-9.02-14.53-21.43-14.53-35.04V49.51c0-13.68 5.57-26.16 14.53-35.05C154.82 5.44 167.16 0 180.84 0zm289.72 327.5c-3.56 3.83-9.55 4.05-13.38.49-3.82-3.56-4.04-9.55-.48-13.37 11.49-12.36 20.71-26.87 26.98-42.84 6.03-15.37 9.35-32.14 9.35-49.72 0-19.23-3.95-37.46-11.06-53.93-7.41-17.14-18.29-32.48-31.75-45.14-3.81-3.58-3.99-9.57-.41-13.38 3.58-3.8 9.57-3.98 13.37-.4a155.114 155.114 0 0 1 36.12 51.44c8.17 18.89 12.7 39.67 12.7 61.41 0 19.94-3.79 39.05-10.69 56.61-7.15 18.21-17.66 34.75-30.75 48.83zm-33.31-33.03c-3.33 4.01-9.29 4.56-13.3 1.22-4.01-3.33-4.55-9.28-1.22-13.29 7.06-8.51 12.7-18.25 16.52-28.84 3.66-10.16 5.66-21.2 5.66-32.77 0-13.04-2.55-25.42-7.17-36.67a96.839 96.839 0 0 0-20.68-31.18c-3.68-3.7-3.67-9.69.03-13.37 3.7-3.68 9.7-3.67 13.37.03 10.51 10.62 18.99 23.29 24.76 37.33 5.58 13.58 8.66 28.39 8.66 43.86 0 13.66-2.42 26.85-6.86 39.14-4.57 12.7-11.32 24.36-19.77 34.54zM55.3 314.62c3.56 3.82 3.34 9.81-.48 13.37-3.83 3.56-9.82 3.34-13.37-.49-13.1-14.08-23.61-30.62-30.76-48.83C3.79 261.11 0 242 0 222.06c0-21.74 4.53-42.52 12.7-61.41 8.47-19.6 20.84-37.07 36.12-51.44 3.8-3.58 9.79-3.4 13.37.4 3.58 3.81 3.4 9.8-.41 13.38-13.46 12.66-24.34 28-31.75 45.14-7.11 16.47-11.06 34.7-11.06 53.93 0 17.58 3.32 34.35 9.35 49.72 6.27 15.97 15.5 30.48 26.98 42.84zm33.97-32.22c3.33 4.01 2.79 9.96-1.22 13.29-4.01 3.34-9.97 2.79-13.3-1.22a115.372 115.372 0 0 1-19.77-34.54 115.027 115.027 0 0 1-6.86-39.14c0-15.47 3.08-30.28 8.66-43.86 5.77-14.04 14.25-26.71 24.76-37.33 3.68-3.7 9.67-3.71 13.37-.03 3.7 3.68 3.71 9.67.03 13.37-8.77 8.87-15.85 19.45-20.67 31.18-4.63 11.25-7.18 23.63-7.18 36.67 0 11.57 2 22.61 5.66 32.77a96.693 96.693 0 0 0 16.52 28.84zM256 383.82c11.22 0 20.38 9.03 20.38 20.38 0 11.22-9.03 20.39-20.38 20.39-6.96 0-13.14-3.49-16.82-8.85a20.425 20.425 0 0 1-3.57-11.54c.01-11.21 9.03-20.38 20.39-20.38zm-112.44-15.51 224.88-.01V54.06H143.56v314.25z" />
              </svg>
              <button
                onClick={() => (window.location.href = `tel:${ad.phoneNumber}`)}
                className="hover:underline decoration-2 underline-offset-4 transition-all active:scale-95"
              >
                {formatDisplayPhone(ad.phoneNumber)}
              </button>
              {ad.alternativePhoneNumber && (
                <>
                  <span className="mx-0.5">/</span>
                  <button
                    onClick={() =>
                      (window.location.href = `tel:${ad.alternativePhoneNumber}`)
                    }
                    className="hover:underline decoration-2 underline-offset-4 transition-all active:scale-95"
                  >
                    {formatDisplayPhone(ad.alternativePhoneNumber)}
                  </button>
                </>
              )}
            </div>
            <div className="shrink-0">
              <div className="w-24 h-24 flex items-center justify-center">
                <img
                  src="/images/aqar-logo.png"
                  alt="Company Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex justify-center gap-10 mb-6 ">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-gray-500">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span className="text-sm font-semibold">
                {getTimeAgo(ad.createdAt)}
              </span>
            </div>
          </div>
          {/* <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-gray-500">
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span className="text-sm font-semibold">{ad.views || 0}</span>
            </div>
          </div> */}
        </div>
        {ad.isOffice && (
          <div className="flex justify-center mt-3 mb-5">
            <button
              onClick={() => router.push(`/offices/${ad.user._id}`)}
              className="cursor-pointer bg-[#197aca] hover:bg-[#197aca]/90 transition-colors rounded-full px-4 py-2 flex items-center gap-2.5 shadow-md active:scale-95"
            >
              <div className="rounded-full w-8 h-8 flex items-center justify-center shrink-0 border border-white/20 overflow-hidden">
                <img
                  src={getImageUrl(ad.user.avatar || "")}
                  alt={ad.user.name || "Office"}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-white text-sm font-bold truncate w-full">
                {ad.user.name}
              </span>
            </button>
          </div>
        )}
        {/* Detailed Arabic Description centered */}
        <div className="text-center mb-2">
          <p className="text-[#001533] font-normal text-base sm:text-xl leading-relaxed whitespace-pre-wrap break-words w-full">
            {ad.description}
          </p>
        </div>

        {/* Owner Controls */}
        {isAuthenticated && isOwner && (
          <div className="flex flex-row flex-wrap w-full items-center justify-center gap-4 mt-6 py-8">
            <button
              onClick={handleEdit}
              className="cursor-pointer flex-1 min-w-[140px] px-6 py-2.5 bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl font-semibold transition-all text-base active:scale-95"
            >
              {t("edit")}
            </button>
            <button
              onClick={handleToggleStatus}
              className="cursor-pointer flex-1 min-w-[140px] px-6 py-2.5 bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl font-semibold transition-all text-base active:scale-95"
            >
              {ad.status === "active" ? t("stopAd") : t("activateAd")}
            </button>
            <ConfirmationDialog
              trigger={
                <button className="cursor-pointer flex-1 min-w-[140px] px-6 py-2.5 bg-primary text-white rounded-xl font-semibold transition-all text-base hover:bg-primary/90 active:scale-95">
                  {t("deleteAd")}
                </button>
              }
              title={t("deleteAd")}
              description={t("deleteAdConfirm")}
              confirmButtonText={t("deleteAd")}
              cancelButtonText={tButtons("cancel")}
              onConfirm={handleDelete}
              icon={{
                src: "/images/icons/delete.svg",
                alt: "Delete",
                bgColor: "bg-red-100",
              }}
            />
          </div>
        )}

        {shouldFetchSimilarAds && (
          <div className="mt-8 border-t border-gray-100 pt-8">
            <h2 className="text-2xl font-bold text-[#001533] mb-4">
              {t("similarAds")}
            </h2>

            {isSimilarAdsLoading ? (
              <div className="flex justify-center py-6">
                <Loader size="sm" />
              </div>
            ) : similarAds.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-0">
                  {similarAds.map((similarAd, index) => (
                    <div
                      key={similarAd._id}
                      ref={
                        hasNextSimilarAdsPage &&
                        index === similarAdsTriggerIndex
                          ? similarAdsPrefetchRef
                          : undefined
                      }
                    >
                      <SearchAdCard
                        ad={similarAd}
                        onClick={() => router.push(`/ads/${similarAd._id}`)}
                      />
                    </div>
                  ))}
                </div>

                {isFetchingNextSimilarAdsPage && (
                  <div className="flex justify-center py-2">
                    <Loader size="sm" />
                  </div>
                )}

                {hasNextSimilarAdsPage && similarAds.length === 0 && (
                  <div ref={similarAdsPrefetchRef} className="h-1" />
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">{t("noSimilarAds")}</p>
            )}
          </div>
        )}
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={handlePhoneCall}
            className="cursor-pointer flex items-center justify-center bg-[#1e293b] text-white w-14 h-14 rounded-2xl hover:bg-black transition-all active:scale-90"
          >
            <Phone size={24} fill="currentColor" />
          </button>
          <button
            onClick={handleWhatsApp}
            className="cursor-pointer flex-1 bg-[#54c27d] hover:bg-[#48b06d] text-white h-14 rounded-2xl flex items-center justify-center gap-3 text-xl font-bold transition-all active:scale-[0.98] shadow-md"
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 512 512"
              height="24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M260.062 32C138.605 32 40.134 129.701 40.134 250.232c0 41.23 11.532 79.79 31.559 112.687L32 480l121.764-38.682c31.508 17.285 67.745 27.146 106.298 27.146C381.535 468.464 480 370.749 480 250.232 480 129.701 381.535 32 260.062 32zm109.362 301.11c-5.174 12.827-28.574 24.533-38.899 25.072-10.314.547-10.608 7.994-66.84-16.434-56.225-24.434-90.052-83.844-92.719-87.67-2.669-3.812-21.78-31.047-20.749-58.455 1.038-27.413 16.047-40.346 21.404-45.725 5.351-5.387 11.486-6.352 15.232-6.413 4.428-.072 7.296-.132 10.573-.011 3.274.124 8.192-.685 12.45 10.639 4.256 11.323 14.443 39.153 15.746 41.989 1.302 2.839 2.108 6.126.102 9.771-2.012 3.653-3.042 5.935-5.961 9.083-2.935 3.148-6.174 7.042-8.792 9.449-2.92 2.665-5.97 5.572-2.9 11.269 3.068 5.693 13.653 24.356 29.779 39.736 20.725 19.771 38.598 26.329 44.098 29.317 5.515 3.004 8.806 2.67 12.226-.929 3.404-3.599 14.639-15.746 18.596-21.169 3.955-5.438 7.661-4.373 12.742-2.329 5.078 2.052 32.157 16.556 37.673 19.551 5.51 2.989 9.193 4.529 10.51 6.9 1.317 2.38.901 13.531-4.271 26.359z"></path>
            </svg>
            <span className="text-xl">واتس آب</span>
          </button>
        </div>
      </div>

      {/* Media Viewer */}
      {ad && ad.media && (
        <MediaViewer
          media={ad.media}
          initialIndex={currentImageIndex}
          isOpen={isMediaViewerOpen}
          onClose={() => setIsMediaViewerOpen(false)}
        />
      )}

      {/* Share Dialog */}
      {ad && (
        <ShareDialog
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          url={typeof window !== "undefined" ? window.location.href : ""}
          title={
            locale === "ar"
              ? `السلام عليكم\nأنا مهتم بهذا الإعلان:\n${ad.propertyType?.labelAr || ad.propertyType?.label || "عقار"} - ${ad.area?.labelAr || ad.area?.label || "المنطقة"}`
              : `Hello\nI am interested in this ad:\n${ad.propertyType?.label || "Property"} - ${ad.area?.label || "Area"}`
          }
        />
      )}
    </div>
  );
}
