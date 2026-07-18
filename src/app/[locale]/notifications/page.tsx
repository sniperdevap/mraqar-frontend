import { NotificationsPage } from '@/components/notifications/notifications-page';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { cookies } from 'next/headers';
import { getLocale } from 'next-intl/server';
import {
  createServerQueryClient,
  prefetchPrivateNotifications,
  prefetchWithinBudget,
} from '@/lib/query-prefetch';

// Notifications are private and must be prefetched independently per request.
export const dynamic = 'force-dynamic';

export default async function Notifications() {
  const [cookieStore, locale] = await Promise.all([cookies(), getLocale()]);
  const token = cookieStore.get('auth-token')?.value;
  const queryClient = createServerQueryClient();

  if (token) {
    await prefetchWithinBudget(
      [prefetchPrivateNotifications(queryClient, token, locale)],
      180,
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotificationsPage />
    </HydrationBoundary>
  );
}
