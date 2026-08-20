import { Suspense } from 'react';
import { AdminAds } from '@/components/admin/admin-ads';

export default function AdminAdsPage() {
  return (
    <Suspense>
      <AdminAds />
    </Suspense>
  );
}
