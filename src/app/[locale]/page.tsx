import { HomePage } from '@/components/home/home-page';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getLocale } from 'next-intl/server';
import {
  createServerQueryClient,
  prefetchPublicMetadata,
  prefetchSearchAds,
} from '@/lib/query-prefetch';

export default async function Home() {
  const locale = await getLocale();
  const queryClient = createServerQueryClient();

  await Promise.all([
    prefetchPublicMetadata(queryClient, locale),
    prefetchSearchAds(queryClient, {}, 10, locale),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomePage />
    </HydrationBoundary>
  );
}
