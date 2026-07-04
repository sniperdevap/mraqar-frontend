import { QueryClient } from "@tanstack/react-query";
import {
  getServerAdById,
  getServerAds,
  getServerAreas,
  getServerOfficeById,
  getServerOffices,
  getServerPropertyTypes,
  getServerSubscriptionPlanById,
  getServerSubscriptionPlans,
} from "@/lib/api/server";
import type { GetAdsParams } from "@/types/ad";
import type { GetOfficesParams } from "@/lib/api/office";

type AdsListParams = Omit<GetAdsParams, "page"> & { limit?: number };

export const createServerQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 0,
      },
    },
  });

/**
 * Run SSR prefetches without blocking the HTML document for long.
 * If the budget elapses, dehydrate whatever is already in the cache and
 * let the client finish loading — keeps TTFB low when the API is slow.
 */
export async function prefetchWithinBudget(
  tasks: Promise<unknown>[],
  budgetMs = 400,
): Promise<void> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      Promise.allSettled(tasks),
      new Promise<void>((resolve) => {
        timeoutId = setTimeout(resolve, budgetMs);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export const prefetchPublicMetadata = (queryClient: QueryClient, locale?: string) =>
  Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["property-types"],
      queryFn: () => getServerPropertyTypes(locale),
      staleTime: 1000 * 60 * 60 * 24,
    }),
    queryClient.prefetchQuery({
      queryKey: ["areas"],
      queryFn: () => getServerAreas(locale),
      staleTime: 1000 * 60 * 60 * 24,
    }),
  ]);

export const prefetchSearchAds = (
  queryClient: QueryClient,
  params: GetAdsParams,
  limit: number,
  locale?: string,
) =>
  queryClient.prefetchInfiniteQuery({
    queryKey: ["ads", "search", params],
    queryFn: () => getServerAds({ ...params, page: 1, limit }, locale),
    initialPageParam: 1,
  });

export const prefetchInfiniteSearchAds = (
  queryClient: QueryClient,
  params: GetAdsParams,
  limit: number,
  locale?: string,
) =>
  queryClient.prefetchInfiniteQuery({
    queryKey: ["ads", "search", "infinite", params, limit],
    queryFn: () => getServerAds({ ...params, page: 1, limit }, locale),
    initialPageParam: 1,
  });

export const prefetchOffices = (
  queryClient: QueryClient,
  params: Omit<GetOfficesParams, "page">,
  locale?: string,
) =>
  queryClient.prefetchInfiniteQuery({
    queryKey: ["offices", "infinite", params],
    queryFn: () => getServerOffices({ ...params, page: 1 }, locale),
    initialPageParam: 1,
  });

export const prefetchOfficeDetail = (
  queryClient: QueryClient,
  id: string,
  params: AdsListParams,
  locale?: string,
) =>
  queryClient.prefetchInfiniteQuery({
    queryKey: ["office", "infinite", id, params],
    queryFn: () => getServerOfficeById(id, { ...params, page: 1 }, locale),
    initialPageParam: 1,
  });

export const prefetchAdDetail = (
  queryClient: QueryClient,
  id: string,
  locale?: string,
) =>
  queryClient.prefetchQuery({
    queryKey: ["ad", id],
    queryFn: () => getServerAdById(id, locale),
    staleTime: 60 * 1000,
  });

export const prefetchSubscriptionPlans = (
  queryClient: QueryClient,
  locale?: string,
) =>
  queryClient.prefetchQuery({
    queryKey: ["subscription-plans"],
    queryFn: () => getServerSubscriptionPlans(locale),
    staleTime: 1000 * 60 * 60 * 24,
  });

export const prefetchSubscriptionPlan = (
  queryClient: QueryClient,
  id: string,
  locale?: string,
) =>
  queryClient.prefetchQuery({
    queryKey: ["subscription-plan", id],
    queryFn: () => getServerSubscriptionPlanById(id, locale),
    staleTime: 1000 * 60 * 60 * 24,
  });
