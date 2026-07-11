import { AdDetailPage } from "@/components/ads/ad-detail-page";
import { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getLocale } from "next-intl/server";
import {
  createServerQueryClient,
  prefetchInfiniteSearchAds,
  prefetchWithinBudget,
} from "@/lib/query-prefetch";
import { getServerAdById, countServerAdView } from "@/lib/api/server";
import type { DetailAd } from "@/types/ad";
import { permanentRedirect } from "next/navigation";
import { headers } from "next/headers";
import { SITE_URL } from "@/lib/seo";

type Props = {
  params: Promise<{ id: string; locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params;
  try {
    const ad = await getServerAdById(id, locale);
    if (!ad) return {};

    const title = `${ad.purpose === "sale" ? "للبيع" : ad.purpose === "rent" ? "للايجار" : "للبدل"} ${ad.propertyType?.labelAr || ad.propertyType?.label || "عقار"} في ${ad.area?.labelAr || ad.area?.label || "المنطقة"}`;

    const imageHost = (process.env.NEXT_PUBLIC_IMAGE_HOST || "").trim();
    const firstMedia = ad.media && ad.media.length > 0 ? ad.media[0] : null;
    let imageUrl = `${SITE_URL}/images/aqar-new-logo.png`;

    if (firstMedia) {
      const mediaPath =
        firstMedia.type === "video"
          ? firstMedia.thumbnail || firstMedia.url
          : firstMedia.url;
      imageUrl = mediaPath.startsWith("http")
        ? mediaPath
        : `${imageHost}${mediaPath.startsWith("/") ? "" : "/"}${mediaPath}`;
    }

    const description = ad.description
      ? ad.description.substring(0, 160)
      : title;
    const shareUrl = `${SITE_URL}/ads/${id}`;

    return {
      title,
      description,
      alternates: {
        canonical: shareUrl,
      },
      openGraph: {
        title,
        description,
        url: shareUrl,
        siteName: "مستر عقار",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
    };
  } catch {
    return {
      title: "Ad Detail",
    };
  }
}

export default async function AdDetail({ params }: Props) {
  const { id, locale: routeLocale } = await params;
  const locale = await getLocale();
  const queryClient = createServerQueryClient();

  // Count the view in parallel with a cached ad fetch. The POST returns the
  // fresh views total, which overwrites the (possibly stale) cached value —
  // same accuracy as the old serial count→uncached-refetch, minus a full
  // blocking round trip. The cached fetch also dedupes with generateMetadata.
  // Skip Next.js Link hover/viewport prefetch requests — only count real page loads.
  const requestHeaders = await headers();
  const isPrefetch = requestHeaders.has("next-router-prefetch");
  const forwardedFor =
    requestHeaders.get("x-forwarded-for") ||
    requestHeaders.get("x-real-ip") ||
    undefined;
  const countPromise = isPrefetch
    ? null
    : countServerAdView(id, locale, forwardedFor)
        .then((result) => {
          console.log("[view-count]", { id, forwardedFor, result });
          return result;
        })
        .catch((err) => {
          // Best-effort — a missed view count shouldn't block the page.
          console.error("[view-count] failed", { id }, err);
          return null;
        });

  let canonicalAd: DetailAd | null = null;
  try {
    canonicalAd = await getServerAdById(id, locale);
  } catch {
    // API slow/unavailable — client will load the ad; do not block HTML.
  }

  if (canonicalAd && String(canonicalAd.id) !== id) {
    permanentRedirect(`/${routeLocale}/ads/${canonicalAd.id}`);
  }

  if (canonicalAd) {
    const count = countPromise ? await countPromise : null;
    queryClient.setQueryData(
      ["ad", id],
      typeof count?.views === "number"
        ? { ...canonicalAd, views: count.views }
        : canonicalAd,
    );
  }

  await prefetchWithinBudget(
    [prefetchInfiniteSearchAds(queryClient, {}, 10, locale)],
    400,
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdDetailPage adId={id} />
    </HydrationBoundary>
  );
}
