import { PlansPage } from '@/components/plans/plans-page';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getLocale } from 'next-intl/server';
import {
  createServerQueryClient,
  prefetchSubscriptionPlans,
  prefetchWithinBudget,
} from '@/lib/query-prefetch';

export default async function Plans() {
  const locale = await getLocale();
  const queryClient = createServerQueryClient();

  await prefetchWithinBudget(
    [prefetchSubscriptionPlans(queryClient, locale)],
    400,
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PlansPage />
    </HydrationBoundary>
  );
}
