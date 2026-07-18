import { AccountPage } from '@/components/account/account-page';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { cookies } from 'next/headers';
import { getLocale } from 'next-intl/server';
import {
  AccountTab,
  createServerQueryClient,
  prefetchPrivateAccountTab,
  prefetchWithinBudget,
} from '@/lib/query-prefetch';

const ACCOUNT_TABS: AccountTab[] = ['profile', 'ad-balance', 'my-ads', 'wishlist', 'favourites'];

// This route hydrates user-scoped data from the auth cookie. It must never be
// emitted as shared static HTML by the locale-level generateStaticParams.
export const dynamic = 'force-dynamic';

export default async function Account({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ tab }, cookieStore, locale] = await Promise.all([
    searchParams,
    cookies(),
    getLocale(),
  ]);
  const activeTab = ACCOUNT_TABS.includes(tab as AccountTab)
    ? (tab as AccountTab)
    : 'profile';
  const token = cookieStore.get('auth-token')?.value;
  const queryClient = createServerQueryClient();

  if (token) {
    await prefetchWithinBudget(
      [prefetchPrivateAccountTab(queryClient, activeTab, token, locale)],
      180,
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AccountPage />
    </HydrationBoundary>
  );
}
