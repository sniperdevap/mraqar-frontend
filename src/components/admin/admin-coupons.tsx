'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Ticket, Pencil, Trash, Plus, RotateCw, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslations, useLocale } from '@/hooks/use-locale';
import { useAdminCoupons, useCouponStats } from '@/hooks/use-coupons';
import { Pagination } from '@/components/ui/pagination';
import { Loader } from '@/components/common/loader';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { deleteCoupon, updateCoupon, createCoupon, Coupon } from '@/lib/api/coupon';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { CouponModal } from './coupon-modal';

export function AdminCoupons() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const { locale } = useLocale();
  const isRTL = locale === 'ar';

  // Filters state from URL
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchInput, 500);
  const page = parseInt(searchParams.get('page') || '1');
  const status = searchParams.get('status') || 'all';

  const { data: couponResponse, isLoading } = useAdminCoupons({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    status: status !== 'all' ? status : undefined,
  });

  const { data: statsResponse } = useCouponStats();
  const coupons = couponResponse?.data?.data || [];
  const pagination = couponResponse?.data?.pagination;
  const stats = statsResponse?.data;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Update URL search when debounced search changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  }, [debouncedSearch]);

  const updateParams = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    if (!newParams.page) params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      await updateCoupon(coupon._id, { isActive: !coupon.isActive });
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupon-stats'] });
      toast.success(t(`coupons.messages.${!coupon.isActive ? 'activateSuccess' : 'deactivateSuccess'}`));
    } catch (error) {
      toast.error(t('coupons.messages.toggleError'));
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      await deleteCoupon(id);
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupon-stats'] });
      toast.success(t('coupons.messages.deleteSuccess'));
    } catch (error) {
      toast.error(t('coupons.messages.deleteError'));
    }
  };

  const isExpired = (expiryDate: string) => new Date(expiryDate) <= new Date();

  return (
    <div className="space-y-8 py-6 lg:py-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="md:text-3xl text-xl font-bold text-gray-900 tracking-tight">{t('coupons.title')}</h1>
          <p className="text-gray-500 text-sm md:text-md mt-1">{t('coupons.description')}</p>
        </div>
        <Button
          onClick={() => {
            setEditingCoupon(null);
            setIsModalOpen(true);
          }}
          className="gap-2 shrink-0"
        >
          <Plus size={18} />
          {t('coupons.addNew')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Ticket size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{t('coupons.stats.total')}</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{t('coupons.stats.active')}</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.active || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
            <XCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{t('coupons.stats.inactive')}</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.inactive || 0}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input placeholder={t('coupons.filters.search')} className="pl-10 h-11" value={searchInput} onChange={e => setSearchInput(e.target.value)} />
        </div>
        <Select value={status} onValueChange={val => updateParams({ status: val })}>
          <SelectTrigger className="w-full md:w-48 !h-12 md:!h-13">
            <SelectValue placeholder={t('coupons.filters.allStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('coupons.filters.allStatus')}</SelectItem>
            <SelectItem value="active">{t('coupons.filters.active')}</SelectItem>
            <SelectItem value="inactive">{t('coupons.filters.inactive')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table & Cards */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader />
          <p className="text-gray-500 animate-pulse text-sm">{t('coupons.messages.loading')}</p>
        </div>
      ) : coupons && coupons.length > 0 ? (
        <div className="space-y-6">
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('coupons.table.code')}</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('coupons.table.discount')}</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('coupons.table.limit')}</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('coupons.table.used')}</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('coupons.table.expiry')}</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('coupons.table.status')}</th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('coupons.table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {coupons.map((coupon: Coupon) => {
                    const expired = isExpired(coupon.expiryDate);
                    return (
                      <tr key={coupon._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-bold text-gray-900 uppercase">{coupon.code}</code>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-600 font-medium">{coupon.discountValue}%</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-600 font-medium">{coupon.userLimit === 0 ? t('coupons.table.unlimited') : coupon.userLimit}</span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 font-medium">{coupon.usageCount}</td>
                        <td className="py-4 px-6">
                          <div className={`text-sm ${expired ? 'text-red-500 font-medium' : 'text-gray-600'}`}>{new Date(coupon.expiryDate).toLocaleDateString()}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              coupon.isActive && !expired ? 'bg-green-100 text-green-700' : expired ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {expired ? t('coupons.status.expired') : coupon.isActive ? t('coupons.status.active') : t('coupons.status.inactive')}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            <ConfirmationDialog
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-8 w-8 rounded-lg ${coupon.isActive ? 'text-amber-500 hover:bg-amber-50 hover:text-amber-500' : 'text-green-500 hover:bg-green-50 hover:text-green-500'}`}
                                  title={coupon.isActive ? t('coupons.actions.deactivate') : t('coupons.actions.activate')}
                                >
                                  <RotateCw size={18} />
                                </Button>
                              }
                              icon={{
                                src: coupon.isActive ? '/images/icons/delete.svg' : '/images/icons/star.svg',
                                alt: coupon.isActive ? t('coupons.actions.deactivate') : t('coupons.actions.activate'),
                                bgColor: coupon.isActive ? 'bg-amber-100' : 'bg-green-100',
                              }}
                              title={coupon.isActive ? t('coupons.modals.deactivateTitle') : t('coupons.modals.activateTitle')}
                              description={t(`coupons.modals.${coupon.isActive ? 'deactivateDescription' : 'activateDescription'}`, { code: coupon.code })}
                              confirmButtonText={coupon.isActive ? t('coupons.actions.deactivate') : t('coupons.actions.activate')}
                              onConfirm={() => handleToggleStatus(coupon)}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingCoupon(coupon);
                                setIsModalOpen(true);
                              }}
                              className="h-8 w-8 text-blue-500 hover:bg-blue-50 hover:text-blue-500 rounded-lg"
                              title={t('coupons.actions.edit')}
                            >
                              <Pencil size={18} />
                            </Button>
                            <ConfirmationDialog
                              trigger={
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:!text-red-500 rounded-lg" title={t('coupons.actions.delete')}>
                                  <Trash size={18} />
                                </Button>
                              }
                              icon={{ src: '/images/icons/delete.svg', alt: t('coupons.actions.delete'), bgColor: 'bg-red-100' }}
                              title={t('coupons.modals.deleteTitle')}
                              description={t('coupons.modals.deleteDescription', { code: coupon.code })}
                              confirmButtonText={t('coupons.actions.delete')}
                              onConfirm={() => handleDeleteCoupon(coupon._id)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {coupons.map((coupon: Coupon) => {
              const expired = isExpired(coupon.expiryDate);
              return (
                <div key={coupon._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold">{t('coupons.table.code')}</p>
                      <p className="text-sm font-medium text-gray-900">{coupon.code}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold">{t('coupons.table.status')}</p>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          coupon.isActive && !expired ? 'bg-green-100 text-green-700' : expired ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {expired ? t('coupons.status.expired') : coupon.isActive ? t('coupons.status.active') : t('coupons.status.inactive')}
                      </span>{' '}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold">{t('coupons.table.discount')}</p>
                      <p className="text-sm font-medium text-gray-900">{coupon.discountValue}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold">{t('coupons.table.limit')}</p>
                      <p className="text-sm font-medium text-gray-600">{coupon.userLimit === 0 ? t('coupons.table.unlimited') : coupon.userLimit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold">{t('coupons.table.used')}</p>
                      <p className="text-sm font-medium text-gray-600">{coupon.usageCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold">{t('coupons.table.expiry')}</p>
                      <p className={`text-sm font-medium ${expired ? 'text-red-500' : 'text-gray-600'}`}>{new Date(coupon.expiryDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-50">
                    <ConfirmationDialog
                      trigger={
                        <Button variant="ghost" size="sm" className={`h-9 px-3 gap-2 rounded-lg ${coupon.isActive ? 'text-amber-500 hover:bg-amber-50' : 'text-green-500 hover:bg-green-50'}`}>
                          <RotateCw size={16} />
                          <span className="text-xs font-medium">{coupon.isActive ? t('coupons.actions.deactivate') : t('coupons.actions.activate')}</span>
                        </Button>
                      }
                      icon={{
                        src: coupon.isActive ? '/images/icons/delete.svg' : '/images/icons/star.svg',
                        alt: coupon.isActive ? t('coupons.actions.deactivate') : t('coupons.actions.activate'),
                        bgColor: coupon.isActive ? 'bg-amber-100' : 'bg-green-100',
                      }}
                      title={coupon.isActive ? t('coupons.modals.deactivateTitle') : t('coupons.modals.activateTitle')}
                      description={t(`coupons.modals.${coupon.isActive ? 'deactivateDescription' : 'activateDescription'}`, { code: coupon.code })}
                      confirmButtonText={coupon.isActive ? t('coupons.actions.deactivate') : t('coupons.actions.activate')}
                      onConfirm={() => handleToggleStatus(coupon)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingCoupon(coupon);
                        setIsModalOpen(true);
                      }}
                      className="h-9 px-3 gap-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                    >
                      <Pencil size={16} />
                      <span className="text-xs font-medium">{t('coupons.actions.edit')}</span>
                    </Button>
                    <ConfirmationDialog
                      trigger={
                        <Button variant="ghost" size="sm" className="h-9 px-3 gap-2 text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash size={16} />
                          <span className="text-xs font-medium">{t('coupons.actions.delete')}</span>
                        </Button>
                      }
                      icon={{ src: '/images/icons/delete.svg', alt: t('coupons.actions.delete'), bgColor: 'bg-red-100' }}
                      title={t('coupons.modals.deleteTitle')}
                      description={t('coupons.modals.deleteDescription', { code: coupon.code })}
                      confirmButtonText={t('coupons.actions.delete')}
                      onConfirm={() => handleDeleteCoupon(coupon._id)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {pagination && (
            <div className="flex justify-center">
              <Pagination currentPage={page} totalItems={pagination.total} pageSize={10} onPageChange={p => updateParams({ page: p.toString() })} />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-20 text-center space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-300">
            <Ticket size={32} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('coupons.messages.noCoupons')}</h3>
            <p className="text-gray-500">{t('coupons.messages.noCouponsSub')}</p>
          </div>
          <Button variant="outline" className="hover:border-gray-500 hover:text-gray-500" onClick={() => router.push(window.location.pathname)}>
            {t('coupons.messages.clearFilters')}
          </Button>
        </div>
      )}

      <CouponModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        coupon={editingCoupon}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
          queryClient.invalidateQueries({ queryKey: ['admin', 'coupon-stats'] });
        }}
      />
    </div>
  );
}
