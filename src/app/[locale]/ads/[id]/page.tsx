import { AdDetailPage } from "@/components/ads/ad-detail-page";
import { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getLocale } from "next-intl/server";
import { createServerQueryClient } from "@/lib/query-prefetch";
import { getCachedServerAdById, countServerAdView } from "@/lib/api/server";
import type { DetailAd } from "@/types/ad";
import { permanentRedirect } from "next/navigation";
import { after } from "next/server";
import { headers, cookies } from "next/headers";
import { SITE_URL } from "@/lib/seo";

type Props = {
  params: Promise<{ id: string; locale: string }>;
};

const LEGACY_OBJECT_ID = /^[a-f0-9]{24}$/i;

async function getAdWithinNavigationBudget(
  id: string,
  locale: string,
): Promise<DetailAd | null> {
  if (LEGACY_OBJECT_ID.test(id)) return getCachedServerAdById(id, locale).catch(() => null);

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      getCachedServerAdById(id, locale).catch(() => null),
      new Promise<null>(resolve => {
        timeoutId = setTimeout(() => resolve(null), 180);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params;
  try {
    const ad = await getCachedServerAdById(id, locale);
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

    const ogImage = `${SITE_URL}/_next/image?url=${encodeURIComponent(imageUrl)}&w=640&q=70`;

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
        images: [{ url: ogImage, alt: title }],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [{ url: ogImage, alt: title }],
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

  // Skip Next.js Link hover/viewport prefetch requests — only count real page loads.
  const requestHeaders = await headers();
  const isPrefetch = requestHeaders.has("next-router-prefetch");
  const forwardedFor =
    requestHeaders.get("x-forwarded-for") ||
    requestHeaders.get("x-real-ip") ||
    undefined;

  let canonicalAd: DetailAd | null = null;
  canonicalAd = await getAdWithinNavigationBudget(id, locale);

  if (canonicalAd && String(canonicalAd.id) !== id) {
    permanentRedirect(`/${routeLocale}/ads/${canonicalAd.id}`);
  }

  if (canonicalAd) {
    queryClient.setQueryData(["ad", id], canonicalAd);
  }

  if (!isPrefetch) {
    const token = (await cookies()).get("auth-token")?.value;
    after(
      countServerAdView(id, locale, forwardedFor, token).catch((err) => {
        // Best-effort — a missed view count shouldn't matter.
        console.error("[view-count] failed", { id }, err);
      }),
    );
  }

  // Similar ads load client-side with ad-derived filters (purpose/type/area),
  // so an SSR prefetch keyed on {} never matches — dropped to save its blocking time.

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdDetailPage adId={id} />
    </HydrationBoundary>
  );
}
