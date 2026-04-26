import dynamic from "next/dynamic";

const AdDetailPage = dynamic(() =>
  import("@/components/ads/ad-detail-page").then((mod) => mod.AdDetailPage),
);
import { getAdById } from "@/lib/api/ad";
import { Metadata } from "next";

type Props = {
  params: Promise<{ id: string; locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params;
  try {
    const ad = await getAdById(id);
    if (!ad) return {};

    const title = `${ad.purpose === "sale" ? "للبيع" : ad.purpose === "rent" ? "للايجار" : "للبدل"} ${ad.propertyType?.labelAr || ad.propertyType?.label || "عقار"} في ${ad.area?.labelAr || ad.area?.label || "المنطقة"}`;

    const imageHost = (process.env.NEXT_PUBLIC_IMAGE_HOST || "").trim();
    const firstMedia = ad.media && ad.media.length > 0 ? ad.media[0] : null;
    let imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/images/no-image.png`;

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
    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/ads/${id}`;

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
        siteName: "مسٹر عقار",
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
  } catch (error) {
    return {
      title: "Ad Detail",
    };
  }
}

export default async function AdDetail({ params }: Props) {
  const { id } = await params;
  return <AdDetailPage adId={id} />;
}
