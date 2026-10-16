import type { Metadata } from "next";
import { cache } from "react";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { after } from "next/server";
import { headers, cookies } from "next/headers";
import { AdDetailPage } from "@/components/ads/ad-detail-page";
import { createServerQueryClient } from "@/lib/query-prefetch";
import {
  getCachedServerAdById,
  countServerAdView,
  getServerAreas,
} from "@/lib/api/server";
import { adHref, findArea } from "@/lib/ad-url";
import { SITE_URL } from "@/lib/seo";
import type { DetailAd } from "@/types/ad";
import type { Area } from "@/lib/api/metadata";

const PURPOSE_AR: Record<string, string> = { sale: "للبيع", rent: "للايجار", exchange: "للبدل" };
const PURPOSE_EN: Record<string, string> = { sale: "For sale", rent: "For rent", exchange: "For exchange" };

export const loadAd = (id: string, locale: string) =>
  getCachedServerAdById(id, locale).catch(() => null);

export const loadAreas = cache((locale: string) =>
  getServerAreas(locale).catch((): Area[] => []),
);

/** Canonical path for an ad, resolving its governorate from the areas list. */
export async function canonicalAdPath(ad: DetailAd, locale: string): Promise<string> {
  const areas = ad.area && "governorate" in ad.area ? [] : await loadAreas(locale);
  return adHref(ad, areas);
}

const adTitle = (ad: DetailAd, locale: string) =>
  locale === "en"
    ? `${PURPOSE_EN[ad.purpose] || "For sale"}: ${ad.propertyType?.label || "Property"} in ${ad.area?.label || "Kuwait"}`
    : `${PURPOSE_AR[ad.purpose] || "للبيع"} ${ad.propertyType?.labelAr || ad.propertyType?.label || "عقار"} في ${ad.area?.labelAr || ad.area?.label || "الكويت"}`;

const adImageUrl = (ad: DetailAd) => {
  const imageHost = (process.env.NEXT_PUBLIC_IMAGE_HOST || "").trim();
  const firstMedia = ad.media?.[0];
  if (!firstMedia) return `${SITE_URL}/images/aqar-new-logo.png`;
  const mediaPath =
    firstMedia.type === "video" ? firstMedia.thumbnail || firstMedia.url : firstMedia.url;
  return mediaPath.startsWith("http")
    ? mediaPath
    : `${imageHost}${mediaPath.startsWith("/") ? "" : "/"}${mediaPath}`;
};

const cleanDescription = (text: string | undefined, fallback: string) => {
  const flat = (text || "").replace(/\s+/g, " ").trim();
  if (!flat) return fallback;
  return flat.length > 160 ? `${flat.slice(0, 157).trimEnd()}…` : flat;
};

export async function buildAdMetadata(ad: DetailAd | null, locale: string): Promise<Metadata> {
  if (!ad) return { title: locale === "en" ? "Ad details" : "تفاصيل الإعلان", robots: { index: false } };

  const title = adTitle(ad, locale);
  const area = ad.area?.labelAr || ad.area?.label || "";
  const fallbackDescription =
    locale === "en"
      ? `${title}. Price ${ad.price?.toLocaleString("en-US")} KWD. Browse real estate in Kuwait on Mr Aqar.`
      : `${title}. السعر ${ad.price?.toLocaleString("en-US")} د.ك. تصفح عقارات ${area} والكويت على مستر عقار.`;
  const description = cleanDescription(ad.description, fallbackDescription);
  const url = `${SITE_URL}${await canonicalAdPath(ad, locale)}`;
  const ogImage = `${SITE_URL}/_next/image?url=${encodeURIComponent(adImageUrl(ad))}&w=640&q=70`;
  const sold = ad.status && ad.status !== "active";

  return {
    title,
    description,
    alternates: { canonical: url },
    // Sold/inactive ads stay reachable for visitors but drop out of Google.
    ...(sold ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title,
      description,
      url,
      siteName: "مستر عقار",
      images: [{ url: ogImage, alt: title }],
      type: "website",
      locale: locale === "en" ? "en_US" : "ar_KW",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: ogImage, alt: title }],
    },
  };
}

/** schema.org data: breadcrumb (shown in Google results) + the listing itself. */
async function adStructuredData(ad: DetailAd, locale: string) {
  const isAr = locale !== "en";
  const areas = await loadAreas(locale);
  const area = findArea(ad.area, areas);
  const url = `${SITE_URL}${adHref(ad, areas)}`;
  const purposeName = (isAr ? PURPOSE_AR : PURPOSE_EN)[ad.purpose] || "";
  const typeName = (isAr ? ad.propertyType?.labelAr : ad.propertyType?.label) || ad.propertyType?.label || "";
  const areaName = (isAr ? area?.labelAr : area?.label) || area?.label || "";
  const govName = (isAr ? area?.governorateAr : area?.governorate) || area?.governorate || "";
  const searchBase = `${SITE_URL}/search?purpose=${ad.purpose}`;
  const typeQuery = ad.propertyType?.id ? `&propertyType=${ad.propertyType.id}` : "";

  const crumbs = [
    { name: isAr ? "الرئيسية" : "Home", item: SITE_URL },
    purposeName && { name: purposeName, item: searchBase },
    typeName && { name: typeName, item: `${searchBase}${typeQuery}` },
    areaName && ad.area?.id && { name: areaName, item: `${searchBase}${typeQuery}&area=${ad.area.id}` },
    { name: adTitle(ad, locale), item: url },
  ].filter(Boolean) as Array<{ name: string; item: string }>;

  return [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: c.item,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      name: adTitle(ad, locale),
      description: cleanDescription(ad.description, adTitle(ad, locale)),
      url,
      image: adImageUrl(ad),
      // posted / re-posted date only: updatedAt also changes on every view
      datePosted: ad.createdAt,
      dateModified: ad.createdAt,
      contentLocation: {
        "@type": "Place",
        name: [areaName, govName, isAr ? "الكويت" : "Kuwait"].filter(Boolean).join(isAr ? "، " : ", "),
        address: {
          "@type": "PostalAddress",
          addressLocality: areaName || undefined,
          addressRegion: govName || undefined,
          addressCountry: "KW",
        },
      },
      offers: {
        "@type": "Offer",
        price: ad.price,
        priceCurrency: "KWD",
        businessFunction:
          ad.purpose === "rent" ? "http://purl.org/goodrelations/v1#LeaseOut" : "http://purl.org/goodrelations/v1#Sell",
        availability:
          ad.status === "active" ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
        ...(ad.user?.name ? { seller: { "@type": "RealEstateAgent", name: ad.user.name } } : {}),
      },
    },
  ];
}

const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

/** Renders the ad detail page with the ad already in the HTML (so Google sees it). */
export async function AdDetailView({
  id,
  ad,
  locale,
}: {
  id: string;
  ad: DetailAd | null;
  locale: string;
}) {
  const queryClient = createServerQueryClient();
  if (ad) queryClient.setQueryData(["ad", id], ad);

  // Skip Next.js Link hover/viewport prefetch requests — only count real page loads.
  const requestHeaders = await headers();
  const isPrefetch = requestHeaders.has("next-router-prefetch");
  if (!isPrefetch) {
    const forwardedFor =
      requestHeaders.get("x-forwarded-for") || requestHeaders.get("x-real-ip") || undefined;
    const token = (await cookies()).get("auth-token")?.value;
    after(
      countServerAdView(id, locale, forwardedFor, token).catch((err) => {
        // Best-effort — a missed view count shouldn't matter.
        console.error("[view-count] failed", { id }, err);
      }),
    );
  }

  const structuredData = ad ? await adStructuredData(ad, locale) : null;

  return (
    <>
      {structuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
        />
      ) : null}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AdDetailPage adId={id} />
      </HydrationBoundary>
    </>
  );
}
