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
  Copy,
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
const HomeAdCard = dynamic(() =>
  import("@/components/home/home-ad-card").then((mod) => mod.HomeAdCard),
);
import { formatDisplayPhone } from "@/lib/utils";
import { useAdById, useInfiniteSearchAds } from "@/hooks/use-ads";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useAdStore } from "@/lib/store/ad-store";
import { DetailAd, GetAdsParams, GetAdsResult } from "@/types/ad";
import Image from "next/image";

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

  const { data: ad, isLoading: queryLoading } = useAdById(adId, cachedAd);

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

  // Copy this ad's fresh view count into the cached home/search lists,
  // so going back shows the new number instantly.
  useEffect(() => {
    const views = ad?.views;
    if (typeof views !== "number") return;

    const updatePage = (page: GetAdsResult): GetAdsResult => ({
      ...page,
      ads: page.ads.map((a) => (String(a.id) === adId ? { ...a, views } : a)),
    });

    queryClient.setQueriesData<GetAdsResult | InfiniteData<GetAdsResult>>(
      { queryKey: ["ads"] },
      (data) => {
        if (!data) return data;
        if ("pages" in data)
          return { ...data, pages: data.pages.map(updatePage) };
        return updatePage(data);
      },
    );
  }, [ad?.views, adId, queryClient]);

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
        await removeFavorite(ad.id);
        setIsFavorite(false);
        toast.success(t("removedFromFavorites"));
      } else {
        await addFavorite(ad.id);
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
      propertyType: ad?.propertyType?.id
        ? String(ad.propertyType.id)
        : undefined,
      area: ad?.area?.id ? String(ad.area.id) : undefined,
    }),
    [ad?.purpose, ad?.propertyType?.id, ad?.area?.id],
  );

  const shouldFetchSimilarAds = Boolean(
    ad?.purpose && ad?.propertyType?.id && ad?.area?.id,
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
      .filter((similarAd) => String(similarAd.id) !== adId);
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
      return t("recently");
    }
  };

  const getMediaUrl = (m: Media) => {
    if (!m) return "/images/DefaultAdImage.jpeg";
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
    router.push(`/ads/edit/${ad.id}`);
  };

  const handleToggleStatus = async () => {
    if (!ad) return;
    try {
      const newStatus = ad.status === "active" ? "inactive" : "active";
      await updateAd(ad.id, { status: newStatus });
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
      await deleteAd(ad.id);
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

  const handleCopyDescription = async () => {
    if (!ad?.description) return;
    try {
      await navigator.clipboard.writeText(ad.description);
      toast.success(t("descriptionCopied"));
    } catch {
      toast.error(t("failedToCopy"));
    }
  };

  const handleWhatsApp = () => {
    if (!ad) return;
    const phoneNumber =
      ad.isPhoneHidden && ad.alternativePhoneNumber
        ? ad.alternativePhoneNumber
        : ad.phoneNumber;

    const propertyInfo =
      locale === "ar"
        ? `${ad.propertyType?.labelAr || ad.propertyType?.label || t("propertyFallback")} - ${ad.area?.labelAr || ad.area?.label || t("areaFallback")}`
        : `${ad.propertyType?.label || t("propertyFallback")} - ${ad.area?.label || t("areaFallback")}`;

    const message = encodeURIComponent(`${t("whatsappMessage")}
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
    : "/images/DefaultAdImage.jpeg";

  return (
    <div className="min-h-screen pb-28 bg-white" dir={direction}>
      {/* Top Image Slider or Spacer */}
      {ad.media && ad.media.length > 0 ? (
        <section className="relative max-w-4xl mx-auto h-[35vh] md:h-[45vh] overflow-hidden bg-neutral-900 border-b border-gray-100">
          {/* Main Media Slider */}
          <div
            className={`relative w-full h-full ${currentMedia?.type === "video" ? "cursor-pointer" : ""}`}
            onClick={
              currentMedia?.type === "video"
                ? () => setIsMediaViewerOpen(true)
                : undefined
            }
          >
            {currentMedia?.type === "video" ? (
              <div className="relative w-full h-full flex items-center justify-center bg-white/5">
                <Image
                  src={getThumbnailUrl(currentMedia)}
                  alt="Video thumbnail"
                  fill
                  priority
                  sizes="(max-width: 896px) 100vw, 896px"
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-2xl">
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                  </div>
                </div>
              </div>
            ) : (
              <Image
                src={currentImageUrl}
                alt={
                  locale === "ar"
                    ? ad.propertyType?.labelAr ||
                      ad.propertyType?.label ||
                      "عقار"
                    : ad.propertyType?.label || "Property"
                }
                fill
                priority
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-cover"
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
        <section className="relative max-w-4xl mx-auto h-[35vh] md:h-[45vh] overflow-hidden bg-gray-50 border-b border-gray-100">
          <img
            src="/images/DefaultAdImage.jpeg"
            alt={
              locale === "ar"
                ? ad.propertyType?.labelAr || ad.propertyType?.label || "عقار"
                : ad.propertyType?.label || "Property"
            }
            className="w-full h-full object-contain"
          />
        </section>
      )}

      {/* Detail Content Section */}
      <div className="max-w-4xl mx-auto px-4 pt-3 pb-10">
        <div className="flex flex-col w-full mb-4">
          {/* Title */}
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 text-center tracking-tight uppercase mb-4">
            {locale === "ar"
              ? `${ad.purpose === "sale" ? "للبيع" : ad.purpose === "rent" ? "للايجار" : "للبدل"} ${ad.propertyType?.labelAr || ad.propertyType?.label || ""} في ${ad.area?.labelAr || ad.area?.label || ""}`
              : `${ad.purpose === "sale" ? "FOR SALE" : ad.purpose === "rent" ? "FOR RENT" : "FOR EXCHANGE"} ${ad.propertyType?.label || ""} IN ${ad.area?.label || ""}`}
          </h1>

          {/* Views & Phone Row */}
          <div className="flex items-center justify-between w-full pb-3 mb-3">
            {/* Phone numbers on the right */}
            <div
              className="flex items-center gap-2 text-[#169899] font-bold text-base sm:text-lg tracking-wide"
              dir="ltr"
            >
              <button onClick={handlePhoneCall} className="hover:underline">
                {formatDisplayPhone(ad.phoneNumber)}
              </button>
              {ad.alternativePhoneNumber && (
                <>
                  <span>-</span>
                  <button
                    onClick={() =>
                      (window.location.href = `tel:${ad.alternativePhoneNumber}`)
                    }
                    className="hover:underline"
                  >
                    {formatDisplayPhone(ad.alternativePhoneNumber)}
                  </button>
                </>
              )}
            </div>
            {/* Views count on the left */}
            <div className="bg-[#8b0000] text-white px-3 py-1 rounded-md text-[13px] font-bold flex items-center gap-1.5 shadow-sm">
              <span>{ad.views}</span>
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </div>
          </div>

          {/* Price & Time Row */}
          <div className="flex items-center justify-between w-full mb-5">
            {/* Time-ago on the right */}
            <div className="flex items-center gap-1.5 text-gray-500 text-xs font-semibold">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span className="text-right">{getTimeAgo(ad.createdAt)}</span>
            </div>

            {/* Price on the left */}
            <div className="text-xl font-bold text-[#9a090e]">
              {ad.price
                ? `${Number(ad.price).toLocaleString("en-US")} ${locale === "ar" ? "د.ك" : "KD"}`
                : ""}
            </div>
          </div>

          {/* Publisher profile badge */}
          <div className="flex justify-center mb-6">
            <div
              className={`inline-flex items-center gap-2 bg-primary px-3 py-2 rounded-full shadow-sm text-white ${
                ad.isOffice
                  ? "cursor-pointer transition-opacity hover:opacity-90"
                  : ""
              }`}
              role={ad.isOffice ? "link" : undefined}
              tabIndex={ad.isOffice ? 0 : undefined}
              onClick={() => {
                if (ad.isOffice && ad.user?._id) {
                  router.push(`/offices/${ad.user._id}`);
                }
              }}
              onKeyDown={(event) => {
                if (
                  ad.isOffice &&
                  ad.user?._id &&
                  (event.key === "Enter" || event.key === " ")
                ) {
                  event.preventDefault();
                  router.push(`/offices/${ad.user._id}`);
                }
              }}
            >
              <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center shrink-0 overflow-hidden">
                {ad.user?.avatar ? (
                  <Image
                    src={getImageUrl(ad.user.avatar)}
                    alt={ad.user?.name || "User"}
                    width={24}
                    height={24}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    className="w-3.5 h-3.5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                )}
              </div>
              <span className="text-sm text-white font-bold tracking-wide">
                {ad.user?.name || "علي جمال أبو حمزة"}
              </span>
            </div>
          </div>

          {/* Description Section */}
          <div
            className={`flex flex-col w-full mt-4 ${
              direction === "rtl"
                ? "items-end text-right"
                : "items-start text-left"
            }`}
            dir={direction}
          >
            <div className="mb-2 flex justify-between w-full items-center">
              <h3 className="text-base font-bold text-gray-800">
                {t("description")}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyDescription}
                  aria-label={t("copyDescription")}
                  title={t("copyDescription")}
                  className="cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Copy className="w-5 h-5 text-gray-600" />
                </button>
                <Image
                  src={"/images/icons/share-icon.svg"}
                  alt="Share"
                  width={40}
                  height={40}
                  className="text-black cursor-pointer"
                  onClick={handleShare}
                />
              </div>
            </div>
            <p
              className={`text-gray-700 text-sm sm:text-base leading-relaxed w-full whitespace-pre-wrap break-words ${
                direction === "rtl" ? "text-right" : "text-left"
              }`}
              dir={direction}
              style={{ unicodeBidi: "plaintext" }}
            >
              {ad.description}
            </p>
          </div>
        </div>

        {/* Owner Controls */}
        {isAuthenticated && isOwner && (
          <div className="flex flex-row flex-wrap w-full items-center justify-center gap-4 mt-6 py-4">
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
                      key={similarAd.id}
                      ref={
                        hasNextSimilarAdsPage &&
                        index === similarAdsTriggerIndex
                          ? similarAdsPrefetchRef
                          : undefined
                      }
                    >
                      <HomeAdCard
                        ad={similarAd}
                        onClick={() => router.push(`/ads/${similarAd.id}`)}
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
            onClick={handleWhatsApp}
            className="cursor-pointer flex-1 bg-[#15803d] hover:bg-[#166534] text-white h-12 rounded-xl flex items-center justify-center gap-3 text-xl font-bold transition-all active:scale-[0.98] shadow-md"
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
            <span className="text-lg">{t("contactOffice")}</span>
          </button>
          <button
            onClick={handlePhoneCall}
            className="cursor-pointer flex items-center justify-center bg-[#111] text-white w-14 h-12 rounded-xl hover:bg-black transition-all active:scale-90"
          >
            <Phone size={24} fill="currentColor" />
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
          title={`${t("whatsappMessage")}\n${
            locale === "ar"
              ? `${ad.propertyType?.labelAr || ad.propertyType?.label || t("propertyFallback")} - ${ad.area?.labelAr || ad.area?.label || t("areaFallback")}`
              : `${ad.propertyType?.label || t("propertyFallback")} - ${ad.area?.label || t("areaFallback")}`
          }`}
        />
      )}
    </div>
  );
}
