'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { deleteWishlist } from '@/lib/api/account';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';

const AddWishModal = dynamic(() => import('../modals/add-wish-modal').then(mod => mod.AddWishModal));
const AdCard = dynamic(() => import('@/components/ads/ad-card').then(mod => mod.AdCard));
const Loader = dynamic(() => import('@/components/common/loader').then(mod => mod.Loader));
import { useTranslations } from 'next-intl';
import { useLocale } from '@/hooks/use-locale';
import { useQueryClient } from '@tanstack/react-query';
import { useWishlists } from '@/hooks/use-account';

export function WishlistTab() {
  const t = useTranslations('common.account');
  const { locale } = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeStatus, setActiveStatus] = useState<'active' | 'completed' | 'cancelled'>('active');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: wishlists = [], isLoading } = useWishlists(activeStatus);

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirmCancelWish'))) {
      return;
    }

    try {
      await deleteWishlist(id);
      toast.success(t('wishCancelled'));
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
    } catch (error) {
      console.error('Failed to cancel wish:', error);
      toast.error(t('failedToCancelWish'));
    }
  };

  const handleWishAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['wishlists'] });
    setIsAddModalOpen(false);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return t('active');
      case 'completed':
        return t('completed');
      case 'cancelled':
        return t('cancelled');
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-light text-blue-primary';
      case 'completed':
        return 'bg-green-light text-green-status';
      case 'cancelled':
        return 'bg-gray-200 text-gray-600';
      default:
        return 'bg-gray-200 text-gray-600';
    }
  };

  return (
    <>
      <div className="space-y-6 max-w-4xl mx-auto p-4 lg:p-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">{t('wishlist')}</h2>
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-primary hover:bg-primary/90">
            + {t('addWish')}
          </Button>
        </div>

        <SegmentedTabs
          items={[
            { key: 'active', label: t('active') },
            { key: 'completed', label: t('completed') },
            { key: 'cancelled', label: t('cancelled') },
          ]}
          activeKey={activeStatus}
          onChange={key => setActiveStatus(key as typeof activeStatus)}
          className="lg:h-16"
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-center justify-center ">
              <Loader />
            </div>
          </div>
        ) : wishlists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {wishlists.map(wish => (
              <div key={wish._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <Badge className={getStatusColor(wish.status)}>{getStatusLabel(wish.status)}</Badge>
                  {wish.status === 'active' && (
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(wish._id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  {wish.purpose && (
                    <div>
                      <span className="text-sm text-gray-500">{t('purpose')}: </span>
                      <span className="font-medium capitalize">{t(wish.purpose)}</span>
                    </div>
                  )}
                  {wish.propertyType && (
                    <div>
                      <span className="text-sm text-gray-500">{t('propertyType')}: </span>
                      <span className="font-medium">{locale === 'ar' ? wish.propertyType.labelAr || wish.propertyType.label : wish.propertyType.label}</span>
                    </div>
                  )}
                  {wish.area && (
                    <div>
                      <span className="text-sm text-gray-500">{t('area')}: </span>
                      <span className="font-medium">{locale === 'ar' ? wish.area.labelAr || wish.area.label : wish.area.label}</span>
                    </div>
                  )}
                  {(wish.minPrice !== undefined || wish.maxPrice !== undefined) && (
                    <div>
                      <span className="text-sm text-gray-500">{t('priceRange')}: </span>
                      <span className="font-medium">
                        {wish.minPrice !== undefined ? ` د.ك ${wish.minPrice}` : t('any')} - {wish.maxPrice !== undefined ? ` د.ك ${wish.maxPrice}` : t('any')}
                      </span>
                    </div>
                  )}
                </div>

                {wish.matchedAd && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">{t('matchedAd')}</p>
                    <AdCard ad={wish.matchedAd} onClick={() => router.push(`/ads/${wish.matchedAd?._id}`)} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">{t('noWishesFound')}</p>
            </div>
          </div>
        )}
      </div>

      <AddWishModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} onSuccess={handleWishAdded} />
    </>
  );
}
