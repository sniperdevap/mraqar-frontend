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

  // Count the view BEFORE fetching ad details, so the number rendered below
  // already reflects the increment — no client-side jump from N to N+1.
  // Skip Next.js Link hover/viewport prefetch requests — only count real page loads.
  const requestHeaders = await headers();
  const isPrefetch = requestHeaders.has("next-router-prefetch");
  if (!isPrefetch) {
    try {
      const forwardedFor =
        requestHeaders.get("x-forwarded-for") ||
        requestHeaders.get("x-real-ip") ||
        undefined;
      await countServerAdView(id, locale, forwardedFor);
    } catch {
      // Best-effort — a missed view count shouldn't block the page.
    }
  }

  try {
    // revalidate: 0 — bypass Next's Data Cache so this reflects the count
    // increment just sent above, not a stale cached response.
    const canonicalAd = await getServerAdById(id, locale, 0);
    if (String(canonicalAd.id) !== id) {
      permanentRedirect(`/${routeLocale}/ads/${canonicalAd.id}`);
    }
    queryClient.setQueryData(["ad", id], canonicalAd);
  } catch {
    // API slow/unavailable — client will load the ad; do not block HTML.
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
