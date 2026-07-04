import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { HomePage } from "@/components/home/home-page";
import {
  createServerQueryClient,
  prefetchPublicMetadata,
  prefetchSearchAds,
  prefetchWithinBudget,
} from "@/lib/query-prefetch";

const HERO_LOGO = "/images/aqar-new-logo-hero.webp";

export const metadata: Metadata = {
  title: "مستر عقار عقارات الكويت",
  description:
    "منصة مستر عقار لعقارات الكويت - للبيع وشراء وتأجير العقارات بسهولة وأمان",
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const queryClient = createServerQueryClient();
  await prefetchWithinBudget(
    [
      prefetchPublicMetadata(queryClient, locale),
      prefetchSearchAds(queryClient, {}, 10, locale),
    ],
    400,
  );

  return (
    <>
      <link
        rel="preload"
        as="image"
        href={HERO_LOGO}
        fetchPriority="high"
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <HomePage />
      </HydrationBoundary>
    </>
  );
}
