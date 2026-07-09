import type { Metadata } from 'next';
import { OfficesPage } from '@/components/offices/offices-page';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getLocale } from 'next-intl/server';
import {
  createServerQueryClient,
  prefetchOffices,
  prefetchWithinBudget,
} from '@/lib/query-prefetch';

export const metadata: Metadata = {
  title: 'مكاتب عقارية في الكويت | أفضل الوسطاء والشركات العقارية - مستر عقار',
  description:
    'اكتشف أفضل المكاتب العقارية في الكويت عبر مستر عقار. تصفح مكاتب ووسطاء عقاريين معتمدين، واعثر على خدمات بيع وشراء وتأجير وإدارة العقارات بسهولة.',
  openGraph: {
    title: 'مكاتب عقارية في الكويت | أفضل الوسطاء والشركات العقارية - مستر عقار',
    description:
      'اكتشف أفضل المكاتب العقارية في الكويت عبر مستر عقار. تصفح مكاتب ووسطاء عقاريين معتمدين، واعثر على خدمات بيع وشراء وتأجير وإدارة العقارات بسهولة.',
  },
};

type OfficesProps = {
  searchParams: Promise<{ search?: string }>;
};

export default async function Offices({ searchParams }: OfficesProps) {
  const locale = await getLocale();
  const { search } = await searchParams;
  const queryClient = createServerQueryClient();
  const params = {
    limit: 12,
    search: search || undefined,
  };

  await prefetchWithinBudget([prefetchOffices(queryClient, params, locale)], 400);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OfficesPage />
    </HydrationBoundary>
  );
}
