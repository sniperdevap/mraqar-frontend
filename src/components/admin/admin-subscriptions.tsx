'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, CreditCard, User, ChevronDown, ChevronUp, Calendar, Zap, ShieldAlert, XCircle } from 'lucide-react';
import { useTranslations } from '@/hooks/use-locale';
import { useAdminSubscriptions } from '@/hooks/use-admin';
import { Pagination } from '@/components/ui/pagination';
import { Loader } from '@/components/common/loader';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { cancelSubscription, AdminSubscription } from '@/lib/api/admin';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface GroupedSubscription {
  user: AdminSubscription['user'];
  office: AdminSubscription | null;
}

export function AdminSubscriptions() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');

  // Filters state from URL
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchInput, 500);
  const page = parseInt(searchParams.get('page') || '1');

  // Expandable row state
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});

  const toggleUserExpansion = (userId: string) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const { data: subscriptionResponse, isLoading } = useAdminSubscriptions({
    page,
    limit: 20, // Increased limit to have more candidates for grouping
    search: debouncedSearch || undefined,
  });

  const subscriptions = subscriptionResponse?.data || [];
  const pagination = subscriptionResponse?.pagination;

  // Group subscriptions by user
  const groupedData: GroupedSubscription[] = Object.values(
    subscriptions.reduce((acc: Record<string, GroupedSubscription>, sub: AdminSubscription) => {
      const userId = sub.user._id;
      if (!acc[userId]) {
        acc[userId] = {
          user: sub.user,
          office: null,
        };
      }
      if (sub.planType === 'office-plan') acc[userId].office = sub;
      return acc;
    }, {})
  );

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
      if (value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    if (!newParams.page) params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleCancelSubscription = async (id: string) => {
    try {
      await cancelSubscription(id);
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] });
      toast.success(t('subscriptions.messages.cancelSuccess'));
    } catch (error) {
      toast.error(t('subscriptions.messages.cancelError'));
    }
  };

  const renderPlanCard = (sub: AdminSubscription | null, userName: string) => {
    const title = t('subscriptions.table.officePlan');
    const isActive = sub && sub.isActive;

    return (
      <div
        className={`relative flex items-center p-5 rounded-2xl border transition-all duration-300 ${
          isActive ? 'bg-white border-blue-100 shadow-[0_4px_12px_rgba(59,130,246,0.06)]' : 'bg-gray-50/50 border-gray-100'
        }`}
      >
        {/* Decorative active indicator */}
        {isActive && <div className="absolute -left-[1px] top-6 bottom-6 w-[3px] bg-blue-500 rounded-r-full" />}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isActive ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
              <Zap size={16} fill={isActive ? 'currentColor' : 'none'} />
            </div>
            <div>
              <p className={`text-sm font-black uppercase tracking-wider ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>{title}</p>
              {isActive && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-50 text-green-700 border border-green-100 uppercase mt-0.5">
                  {t('subscriptions.status.active')}
                </span>
              )}
            </div>
          </div>

          {!isActive ? (
            <p className="text-xs text-gray-400 italic line-clamp-1">{t('subscriptions.table.noPlan')}</p>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <ShieldAlert size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-tight">{t('subscriptions.table.credits')}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-gray-900">{sub.credits}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Calendar size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-tight">{t('subscriptions.table.expires')}</span>
                </div>
                <p className="text-sm font-semibold text-gray-700">{new Date(sub.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
          )}
        </div>

        {isActive && (
          <div className="ml-6 pl-6 border-l border-gray-100">
            <ConfirmationDialog
              trigger={
                <Button variant="ghost" className="group flex flex-col items-center gap-1 hover:bg-red-50 text-red-400 hover:text-red-500 transition-all">
                  <XCircle size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">{t('subscriptions.modals.cancelConfirm').split(' ')[0]}</span>
                </Button>
              }
              icon={{ src: '/images/icons/delete.svg', alt: 'Cancel', bgColor: 'bg-red-100' }}
              title={t('subscriptions.modals.cancelTitle')}
              description={t('subscriptions.modals.cancelDescription', {
                type: title,
                name: userName,
              })}
              confirmButtonText={t('subscriptions.modals.cancelConfirm')}
              onConfirm={() => handleCancelSubscription(sub._id)}
            />
          </div>
        )}
      </div>
    );
  };

  const getActiveCount = (group: GroupedSubscription) => {
    return group.office?.isActive ? 1 : 0;
  };

  return (
    <div className="space-y-8 py-6 lg:py-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="md:text-3xl text-xl font-bold text-gray-900 tracking-tight">{t('subscriptions.title')}</h1>
          <p className="text-gray-500 text-sm md:text-md mt-1">{t('subscriptions.description')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder={t('subscriptions.searchPlaceholder')}
            className="pl-10 h-11 border-gray-200 focus:border-primary transition-colors hover:border-gray-300"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {/* Table & Cards */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader />
          <p className="text-gray-500 animate-pulse text-sm font-medium">{t('subscriptions.messages.loading')}</p>
        </div>
      ) : groupedData.length > 0 ? (
        <div className="space-y-6">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-black/5">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-start text-[11px] font-black uppercase tracking-widest text-gray-400">{t('subscriptions.table.user')}</th>
                  <th className="px-6 py-4 text-start text-[11px] font-black uppercase tracking-widest text-gray-400">{t('subscriptions.table.phone')}</th>
                  <th className="px-6 py-4 text-start text-[11px] font-black uppercase tracking-widest text-gray-400">{t('subscriptions.table.plans')}</th>
                  <th className="px-6 py-4 text-end text-[11px] font-black uppercase tracking-widest text-gray-400">{t('subscriptions.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {groupedData.map(group => {
                  const isExpanded = expandedUsers[group.user._id];
                  const activeCount = getActiveCount(group);

                  return (
                    <React.Fragment key={group.user._id}>
                      <tr className={`group transition-all duration-200 cursor-pointer ${isExpanded ? 'bg-blue-50/20' : 'hover:bg-gray-50/80'}`} onClick={() => toggleUserExpansion(group.user._id)}>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200 ${
                                isExpanded ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
                              }`}
                            >
                              <User size={20} />
                            </div>
                            <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{group.user.name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-start">
                          <p className="text-sm font-medium text-gray-500 tabular-nums">
                            <span dir="ltr">{group.user.phoneNumber}</span>
                          </p>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                              activeCount > 0 ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-500 border border-gray-200'
                            }`}
                          >
                            {t('subscriptions.table.activeCount', { count: activeCount })}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-end">
                          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:text-primary-dark transition-colors">
                            {t('subscriptions.table.view')}
                            <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                              <ChevronDown size={14} />
                            </div>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-gray-50/40">
                          <td colSpan={4} className="p-0">
                            <div className="px-12 py-8 bg-gradient-to-b from-blue-50/20 to-transparent border-t border-blue-50/50">
                              <div className="flex gap-8">
                                {/* Vertical track decorator */}
                                <div className="hidden lg:block w-px bg-gradient-to-b from-blue-200 to-transparent relative">
                                  <div className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-blue-100 border-2 border-white shadow-sm" />
                                </div>

                                <div className="flex-1 grid grid-cols-1 gap-6 animate-in slide-in-from-top-4 duration-500">
                                  {renderPlanCard(group.office, group.user.name)}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {groupedData.map(group => {
              const activeCount = getActiveCount(group);
              return (
                <div key={group.user._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{group.user.name}</p>
                        <p className="text-xs font-medium text-gray-500 tabular-nums">
                          <span dir="ltr">{group.user.phoneNumber}</span>
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border ${
                        activeCount > 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-200'
                      }`}
                    >
                      {activeCount} Active
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2.5">
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest ml-1">{t('subscriptions.table.officePlan')}</p>
                      {group.office && group.office.isActive ? (
                        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-100 uppercase">{t('subscriptions.status.active')}</span>
                            <ConfirmationDialog
                              trigger={<button className="text-[10px] text-red-500 font-black uppercase tracking-widest underline px-0">{t('subscriptions.modals.cancelConfirm')}</button>}
                              icon={{ src: '/images/icons/delete.svg', alt: 'Cancel', bgColor: 'bg-red-100' }}
                              title={t('subscriptions.modals.cancelTitle')}
                              description={t('subscriptions.modals.cancelDescription', { type: t('subscriptions.table.officePlan'), name: group.user.name })}
                              confirmButtonText={t('subscriptions.modals.cancelConfirm')}
                              onConfirm={() => handleCancelSubscription(group.office!._id)}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[9px] text-gray-400 uppercase font-bold tracking-tight mb-0.5">{t('subscriptions.table.credits')}</p>
                              <p className="text-xs font-bold text-gray-900">
                                {group.office.credits} <span className="text-[10px] text-gray-400 font-normal">/ {group.office.credits}</span>
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] text-gray-400 uppercase font-bold tracking-tight mb-0.5">{t('subscriptions.table.expires')}</p>
                              <p className="text-xs font-bold text-gray-900">{new Date(group.office.endDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic pl-1">{t('subscriptions.table.noPlan')}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {pagination && (
            <div className="flex justify-center pt-4">
              <Pagination currentPage={page} totalItems={pagination.total} pageSize={20} onPageChange={p => updateParams({ page: p.toString() })} />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-20 text-center space-y-6 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto text-gray-300 border border-gray-100">
            <CreditCard size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">{t('subscriptions.messages.noSubscriptions')}</h3>
            <p className="text-gray-500 max-w-xs mx-auto text-sm">No active or historical subscriptions found for your current search criteria.</p>
          </div>
          <button
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 hover:bg-gray-50 transition-all shadow-sm"
            onClick={() => router.push(window.location.pathname)}
          >
            {tCommon('buttons.back')}
          </button>
        </div>
      )}
    </div>
  );
}
