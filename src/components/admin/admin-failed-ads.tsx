'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Trash2, AlertCircle, Zap, User } from 'lucide-react';
import { useTranslations, useLocale } from '@/hooks/use-locale';
import { useAdminFailedAds } from '@/hooks/use-admin';
import { Pagination } from '@/components/ui/pagination';
import { Loader } from '@/components/common/loader';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { deleteFailedAd, FailedAd } from '@/lib/api/admin';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

export function AdminFailedAds() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const { locale } = useLocale();
  const isRTL = locale === 'ar';

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';

  const { data, isLoading } = useAdminFailedAds({
    page,
    limit: 10,
    search: search || undefined,
  });

  const updateParams = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    if (!newParams.page) params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFailedAd(id);
      queryClient.invalidateQueries({ queryKey: ['admin', 'failed-ads'] });
      toast.success(t('manageAds.messages.deletedSuccessfully'));
    } catch (error) {
      toast.error(t('manageAds.messages.failedToDelete'));
    }
  };

  const handleConvert = (ad: FailedAd) => {
    router.push(`/admin/ads/failed/${ad._id}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader />
        <p className="text-gray-500 animate-pulse">{t('manageAds.messages.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={t('manageAds.filters.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            defaultValue={search}
            onKeyDown={e => {
              if (e.key === 'Enter') updateParams({ search: e.currentTarget.value });
            }}
          />
        </div>
      </div>

      {data?.data && data.data.length > 0 ? (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm overflow-x-auto hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-start py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('users.table.user')}</th>
                  <th className="text-start py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('manageAds.filters.purpose')}</th>
                  <th className="text-start py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('manageAds.filters.error')}</th>
                  <th className="text-start py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('users.table.date')}</th>
                  <th className={`${isRTL ? 'text-start' : 'text-end'} py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider`}>{t('users.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.data.map((ad: FailedAd) => (
                  <tr key={ad._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-bold text-gray-900 uppercase tracking-tight">{ad.user?.name || 'Unknown'}</span>
                        <span className="text-xs text-gray-500 tabular-nums" dir="ltr">
                          {ad.user?.phoneNumber}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-600 capitalize">{tCommon(`ads.${ad.purpose}`)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 max-w-xs text-red-600">
                        <AlertCircle size={14} className="flex-shrink-0" />
                        <span className="text-xs font-medium truncate" title={ad.error}>
                          {ad.error || 'Unknown Error'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-gray-500">{new Date(ad.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-6">
                      <div className={`flex items-center ${isRTL ? 'justify-start' : 'justify-end'} gap-2`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleConvert(ad)}
                          className="h-8 w-8 text-primary hover:text-primary-dark hover:bg-primary/5 rounded-lg"
                          title={t('manageAds.buttons.convert')}
                        >
                          <Zap size={18} fill="currentColor" />
                        </Button>
                        <ConfirmationDialog
                          trigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 size={18} />
                            </Button>
                          }
                          icon={{ src: '/images/icons/delete.svg', alt: 'Delete', bgColor: 'bg-red-100' }}
                          title={tCommon('buttons.delete')}
                          description={tCommon('ads.deleteAdConfirm')}
                          confirmButtonText={tCommon('buttons.delete')}
                          onConfirm={() => handleDelete(ad._id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {data.data.map((ad: FailedAd) => (
              <div key={ad._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 text-primary rounded-xl flex items-center justify-center border border-gray-100">
                      <User size={20} />
                    </div>
                    <div className="flex flex-col items-start">
                      <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{ad.user?.name || 'Unknown'}</p>
                      <p className="text-xs font-medium text-gray-500 tabular-nums">
                        <span dir="ltr">{ad.user?.phoneNumber}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleConvert(ad)} className="h-8 w-8 text-primary hover:text-primary-dark hover:bg-primary/5 rounded-lg">
                      <Zap size={18} fill="currentColor" />
                    </Button>
                    <ConfirmationDialog
                      trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 size={18} />
                        </Button>
                      }
                      icon={{ src: '/images/icons/delete.svg', alt: 'Delete', bgColor: 'bg-red-100' }}
                      title={tCommon('buttons.delete')}
                      description={tCommon('ads.deleteAdConfirm')}
                      confirmButtonText={tCommon('buttons.delete')}
                      onConfirm={() => handleDelete(ad._id)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">{t('manageAds.filters.purpose')}</p>
                    <p className="text-sm font-bold text-gray-700 capitalize">{tCommon(`ads.${ad.purpose}`)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">{t('users.table.date')}</p>
                    <p className="text-sm font-bold text-gray-700">{new Date(ad.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {ad.error && (
                  <div className="bg-red-50/50 p-3 rounded-xl border border-red-100/50 flex items-start gap-2">
                    <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium text-red-600 leading-relaxed">{ad.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {data.pagination.totalPages > 1 && (
            <div className="flex flex-col items-center justify-center pt-8 border-t border-gray-100">
              <Pagination currentPage={page} pageSize={10} totalItems={data.pagination.total} onPageChange={p => updateParams({ page: p.toString() })} />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-20 text-center space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle size={32} className="text-gray-300" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('manageAds.messages.noFailedFound')}</h3>
            <p className="text-gray-500">{t('users.messages.tryDifferentSearch')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
