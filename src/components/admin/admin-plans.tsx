'use client';

import React, { useState } from 'react';
import { CreditCard, Pencil, Power, Hash, DollarSign, Calendar, Percent, Zap } from 'lucide-react';
import { useTranslations, useLocale } from '@/hooks/use-locale';
import { useAdminPlans } from '@/hooks/use-admin';
import { Loader } from '@/components/common/loader';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { toggleSubscriptionPlanStatus, SubscriptionPlan } from '@/lib/api/admin';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Button } from '@/components/ui/button';
import { AdminPlanEditModal } from './admin-plan-edit-modal';

export function AdminPlans() {
  const queryClient = useQueryClient();
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const { direction, locale } = useLocale();
  const isRTL = direction === 'rtl';
  const { data: plans, isLoading } = useAdminPlans();

  // Edit State
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const handleToggleStatus = async (plan: SubscriptionPlan) => {
    try {
      await toggleSubscriptionPlanStatus(plan._id);
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
      toast.success(t('plans.messages.statusSuccess'));
    } catch (error) {
      console.error('Toggle status failed:', error);
      toast.error(t('plans.messages.statusError'));
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="py-6 lg:py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="md:text-3xl text-xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <CreditCard className="text-primary" size={28} />
            {t('plans.title')}
          </h1>
          <p className="text-gray-500 text-sm md:text-md mt-1">{t('plans.description')}</p>
        </div>
      </div>

      {!plans || plans.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCard size={40} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-bold">{t('plans.messages.noPlans')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {plans.map(plan => (
            <div
              key={plan._id}
              className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 ${
                !plan.isActive ? 'border-red-100 opacity-80' : 'border-gray-100'
              }`}
            >
              {/* Plan Header */}
              <div className={`px-3 md:px-8 py-6 flex items-start justify-between border-b ${!plan.isActive ? 'bg-red-50/30 border-red-50' : 'bg-gray-50/30 border-gray-50'}`}>
                <div className="flex items-center gap-4">
                  <div
                    className={`md:w-14 md:h-14 w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${
                      plan.planType === 'office-plan' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}
                  >
                    <CreditCard size={28} />
                  </div>
                  <div>
                    <h3 className="md:text-xl text-md font-bold text-gray-900 uppercase tracking-tight">{isRTL ? plan.nameAr : plan.name}</h3>
                  </div>
                </div>

                <div className="flex items-cente justify-centerr md:gap-2 h-full">
                  <Button variant="ghost" size="icon" onClick={() => setEditingPlan(plan)} className=" text-gray-400 hover:text-primary hover:bg-primary/5 transition-all">
                    <Pencil size={20} />
                  </Button>

                  <ConfirmationDialog
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`transition-all ${plan.isActive ? 'text-red-400 hover:text-red-600 hover:bg-red-50' : 'text-green-400 hover:text-green-600 hover:bg-green-50'}`}
                      >
                        <Power size={20} />
                      </Button>
                    }
                    icon={{
                      src: plan.isActive ? '/images/icons/delete.svg' : '/images/icons/star.svg',
                      alt: 'Plan Status',
                      bgColor: plan.isActive ? 'bg-red-100' : 'bg-green-100',
                    }}
                    title={plan.isActive ? t('plans.modals.deactivateTitle') : t('plans.modals.activateTitle')}
                    description={
                      plan.isActive
                        ? t('plans.modals.deactivateDescription', { name: isRTL ? plan.nameAr : plan.name })
                        : t('plans.modals.activateDescription', { name: isRTL ? plan.nameAr : plan.name })
                    }
                    confirmButtonText={plan.isActive ? t('plans.modals.confirmDeactivate') : t('plans.modals.confirmActivate')}
                    onConfirm={() => handleToggleStatus(plan)}
                  />
                </div>
              </div>

              {/* Plan Details */}
              <div className="px-3 md:px-8 py-6 md:py-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Price */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                      <DollarSign size={10} />
                      {t('plans.table.price')}
                    </p>
                    <p className="text-lg font-bold text-gray-900 tabular-nums">
                      {plan.price} <span className="text-xs font-medium text-gray-400 lowercase">{tCommon('currency')}</span>
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                      <Calendar size={10} />
                      {t('plans.table.duration')}
                    </p>
                    <p className="text-lg font-bold text-gray-900 tabular-nums">{plan.numberOfMonths}</p>
                  </div>

                  {/* Normal Ads */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                      <Hash size={10} />
                      {t('plans.table.normal')}
                    </p>
                    <p className="text-lg font-bold text-gray-900 tabular-nums">{plan.normalAds}</p>
                  </div>

                  {/* Premium Ads */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                      <Zap size={10} className="text-primary" />
                      {t('plans.table.premium')}
                    </p>
                    <p className="text-lg font-bold tabular-nums text-primary">{plan.premiumAds}</p>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                  {plan.discount > 0 && (
                    <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100">
                      <Percent size={14} className="font-bold" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {plan.discount}% {t('plans.table.discount')}
                      </span>
                    </div>
                  )}

                  <div className="ms-auto flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${plan.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-widest ${
                        plan.isActive ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                      }`}
                    >
                      {plan.isActive ? t('plans.status.active') : t('plans.status.inactive')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <AdminPlanEditModal plan={editingPlan} onClose={() => setEditingPlan(null)} />
    </div>
  );
}
