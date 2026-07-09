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
  title: "مستر عقار | دليل عقارات الكويت للبيع والإيجار والاستثمار 2026",
  description:
    "مستر عقار هو منصة عقارية في الكويت لبيع وإيجار وتبادل العقارات. تصفح آلاف الشقق والفلل والأراضي والمكاتب والمحلات، أو أعلن عن عقارك بسهولة وتواصل مباشرة مع الملاك والوسطاء المعتمدين.",
  keywords: [
    "مستر عقار",
    "عقارات الكويت",
    "بيع عقارات",
    "إيجار عقارات",
    "شقق للبيع",
    "فلل للبيع",
    "أراضي للبيع",
    "مكاتب للإيجار",
    "محلات للإيجار",
    "عقارات الكويت 2026",
    "Mr Aqar",
  ],
  openGraph: {
    title: "مستر عقار | دليل عقارات الكويت للبيع والإيجار والاستثمار 2026",
    description:
      "مستر عقار هو منصة عقارية في الكويت لبيع وإيجار وتبادل العقارات. تصفح آلاف الشقق والفلل والأراضي والمكاتب والمحلات، أو أعلن عن عقارك بسهولة وتواصل مباشرة مع الملاك والوسطاء المعتمدين.",
  },
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
