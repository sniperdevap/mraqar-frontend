import { OfficeDetailPage } from '@/components/offices/office-detail-page';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getLocale } from 'next-intl/server';
import {
  createServerQueryClient,
  prefetchOfficeDetail,
  prefetchPublicMetadata,
  prefetchWithinBudget,
} from '@/lib/query-prefetch';
import type { GetAdsParams } from '@/types/ad';
import type { GetOfficeByIdResult } from '@/lib/api/office';
import { permanentRedirect } from 'next/navigation';

const LEGACY_OBJECT_ID = /^[a-f0-9]{24}$/i;

type OfficeDetailProps = {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OfficeDetail({ params, searchParams }: OfficeDetailProps) {
  const { id, locale: routeLocale } = await params;
  const rawSearchParams = await searchParams;
  const locale = await getLocale();
  const queryClient = createServerQueryClient();
  const area = rawSearchParams.area;
  const filters: Omit<GetAdsParams, 'page'> & { limit: number } = {
    limit: 12,
    purpose: typeof rawSearchParams.purpose === 'string' ? rawSearchParams.purpose : undefined,
    propertyType: typeof rawSearchParams.propertyType === 'string' ? rawSearchParams.propertyType : undefined,
    area: Array.isArray(area) ? area : typeof area === 'string' ? [area] : undefined,
    minPrice: typeof rawSearchParams.minPrice === 'string' ? Number(rawSearchParams.minPrice) : undefined,
    maxPrice: typeof rawSearchParams.maxPrice === 'string' ? Number(rawSearchParams.maxPrice) : undefined,
  };

  const tasks = [
    prefetchPublicMetadata(queryClient, locale),
    prefetchOfficeDetail(queryClient, id, filters, locale),
  ];
  // ponytail: legacy ObjectId URLs are rare (old links, crawlers) and must resolve
  // their canonical redirect, so they wait out the fetch; numeric publicIds — the
  // path real navigation takes — keep the fast budget.
  if (LEGACY_OBJECT_ID.test(id)) {
    await Promise.allSettled(tasks);
  } else {
    await prefetchWithinBudget(tasks, 400);
  }

  // Legacy ObjectId links redirect to the public-id URL (same as ads).
  const canonicalId = queryClient.getQueryData<{ pages: GetOfficeByIdResult[] }>([
    'office',
    'infinite',
    id,
    filters,
  ])?.pages?.[0]?.office?.publicId;
  if (canonicalId && String(canonicalId) !== id) {
    permanentRedirect(`/${routeLocale}/offices/${canonicalId}`);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OfficeDetailPage officeId={id} />
    </HydrationBoundary>
  );
}
