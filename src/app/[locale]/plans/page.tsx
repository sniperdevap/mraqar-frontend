import { PlansPage } from '@/components/plans/plans-page';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getLocale } from 'next-intl/server';
import { createServerQueryClient, prefetchSubscriptionPlans } from '@/lib/query-prefetch';

export default async function Plans() {
  const locale = await getLocale();
  const queryClient = createServerQueryClient();

  await prefetchSubscriptionPlans(queryClient, locale);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PlansPage />
    </HydrationBoundary>
  );
}
