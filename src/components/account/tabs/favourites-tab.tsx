'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const AdCard = dynamic(() => import('@/components/ads/ad-card').then(mod => mod.AdCard));
const Pagination = dynamic(() => import('@/components/ui/pagination'));
const Loader = dynamic(() => import('@/components/common/loader').then(mod => mod.Loader));
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { useFavorites } from '@/hooks/use-account';

export function FavouritesTab() {
  const t = useTranslations('common.account');
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const adsPerPage = 12;

  const { data: adsData, isLoading } = useFavorites(currentPage, adsPerPage);

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 lg:p-0">
      <h2 className="text-2xl font-bold text-gray-900">{t('favourites')}</h2>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div className=" flex items-center justify-center ">
            <Loader />
          </div>
        </div>
      ) : adsData && adsData.ads.length > 0 ? (
        <>
          <div className="flex flex-col gap-4">
            {adsData.ads.map(ad => (
              <AdCard key={ad._id} ad={ad} onClick={() => router.push(`/ads/${ad._id}`)} />
            ))}
          </div>

          {adsData.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination totalItems={adsData.total} pageSize={adsPerPage} currentPage={currentPage} onPageChange={setCurrentPage} />
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">{t('noFavoritesYet')}</p>
            <p className="text-gray-400 text-sm mt-2">{t('startFavoriting')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
