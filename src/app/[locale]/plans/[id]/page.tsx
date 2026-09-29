import { PlanViewPage } from "@/components/plans/plan-view-page";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getLocale } from "next-intl/server";
import {
  createServerQueryClient,
  prefetchSubscriptionPlan,
  prefetchWithinBudget,
} from "@/lib/query-prefetch";

export default async function PlanView({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ qty?: string }>;
}) {
  const { id } = await params;
  const { qty } = await searchParams;
  const locale = await getLocale();
  const queryClient = createServerQueryClient();

  await prefetchWithinBudget(
    [prefetchSubscriptionPlan(queryClient, id, locale)],
    400,
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PlanViewPage planId={id} initialQty={Number(qty) || 1} />
    </HydrationBoundary>
  );
}
