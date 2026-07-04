import { PlanViewPage } from '@/components/plans/plan-view-page';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getLocale } from 'next-intl/server';
import {
  createServerQueryClient,
  prefetchSubscriptionPlan,
  prefetchWithinBudget,
} from '@/lib/query-prefetch';

export default async function PlanView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = await getLocale();
  const queryClient = createServerQueryClient();

  await prefetchWithinBudget(
    [prefetchSubscriptionPlan(queryClient, id, locale)],
    400,
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PlanViewPage planId={id} />
    </HydrationBoundary>
  );
}
