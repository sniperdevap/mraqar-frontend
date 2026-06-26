import { SearchPage } from '@/components/search/search-page';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getLocale } from 'next-intl/server';
import {
  createServerQueryClient,
  prefetchPublicMetadata,
  prefetchSearchAds,
} from '@/lib/query-prefetch';
import type { GetAdsParams } from '@/types/ad';

type SearchProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Search({ searchParams }: SearchProps) {
  const rawSearchParams = await searchParams;
  const locale = await getLocale();
  const queryClient = createServerQueryClient();
  const area = rawSearchParams.area;
  const filters: GetAdsParams = {
    purpose: typeof rawSearchParams.purpose === 'string' ? rawSearchParams.purpose : undefined,
    propertyType: typeof rawSearchParams.propertyType === 'string' ? rawSearchParams.propertyType : undefined,
    area: Array.isArray(area) ? area : typeof area === 'string' ? [area] : undefined,
    minPrice: typeof rawSearchParams.minPrice === 'string' ? Number(rawSearchParams.minPrice) : undefined,
    maxPrice: typeof rawSearchParams.maxPrice === 'string' ? Number(rawSearchParams.maxPrice) : undefined,
  };

  await Promise.all([
    prefetchPublicMetadata(queryClient, locale),
    prefetchSearchAds(queryClient, filters, 10, locale),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SearchPage />
    </HydrationBoundary>
  );
}
