import { OfficesPage } from '@/components/offices/offices-page';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getLocale } from 'next-intl/server';
import { createServerQueryClient, prefetchOffices } from '@/lib/query-prefetch';

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

  await prefetchOffices(queryClient, params, locale);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OfficesPage />
    </HydrationBoundary>
  );
}
