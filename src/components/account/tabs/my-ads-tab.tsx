'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ad } from '@/types/ad';
import dynamic from 'next/dynamic';

const AdCard = dynamic(() => import('@/components/ads/ad-card').then(mod => mod.AdCard));
const Loader = dynamic(() => import('@/components/common/loader').then(mod => mod.Loader));
import { useTranslations } from 'next-intl';
import { useLocale } from '@/hooks/use-locale';
import { useQueryClient } from '@tanstack/react-query';
import { useMyAds } from '@/hooks/use-account';
import { useAdStore } from '@/lib/store/ad-store';
import { useEffect } from 'react';

export function MyAdsTab() {
  const { direction } = useLocale();
  const t = useTranslations('common.account');
  const router = useRouter();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: ads = [], isLoading } = useMyAds();
  const [hasSetAds, setHasSetAds] = useState(false);
  const { setAds } = useAdStore();

  useEffect(() => {
    // Only set ads once per fetch to avoid infinite render loops
    if (ads.length > 0 && !hasSetAds) {
      setAds(ads);
      setHasSetAds(true);
    }
  }, [ads, hasSetAds, setAds]);

  // Reset flag when loading state changes (i.e. new fetch)
  useEffect(() => {
    if (isLoading) {
      setHasSetAds(false);
    }
  }, [isLoading]);

  const handleAction = (action: 'edit' | 'refresh' | 'view', ad: Ad) => {
    if (action === 'refresh') {
      queryClient.invalidateQueries({ queryKey: ['my-ads'] });
      queryClient.invalidateQueries({ queryKey: ['ads'] });
    } else if (action === 'edit') {
      router.push(`/ads/edit/${ad.id}`);
    } else if (action === 'view') {
      router.push(`/ads/${ad.id}`);
    }
  };

  const filteredAds = ads.filter(ad => {
    if (statusFilter === 'all') return true;
    return ad.status === statusFilter;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 lg:p-0" dir={direction}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">{t('myAds')}</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={t('filterByStatus')} />
          </SelectTrigger>
          <SelectContent position="item-aligned">
            <SelectItem value="all">{t('allStatus')}</SelectItem>
            <SelectItem value="active">{t('active')}</SelectItem>
            <SelectItem value="inactive">{t('inactive')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div className="flex items-center justify-center ">
            <Loader />
          </div>
        </div>
      ) : filteredAds.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filteredAds.map(ad => (
            <AdCard key={ad.id} ad={ad} onClick={() => router.push(`/ads/${ad.id}`)} variant="my-ad" onAction={handleAction} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">{statusFilter !== 'all' ? t('noAdsFound', { status: t(statusFilter) }) : t('noAdsFoundSimple')}</p>
        </div>
      )}
    </div>
  );
}
