'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, X, CheckCircle, Tag, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { startCheckout } from '@/lib/api/subscription-plan';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils/api';
import { PlanType } from '@/lib/utils/constant';
import { useAuthStore } from '@/lib/store/auth-store';
import { useLocale } from '@/hooks/use-locale';
import { useTranslations } from 'next-intl';
import { useSubscriptionPlanById } from '@/hooks/use-plans';
import { useQueryClient } from '@tanstack/react-query';
import { validateCoupon } from '@/lib/api/coupon';

interface PlanViewPageProps {
  planId: string;
}

export function PlanViewPage({ planId }: PlanViewPageProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = useTranslations('common');
  const { refreshSubscriptions } = useAuthStore();
  const queryClient = useQueryClient();
  const { data: plan, isLoading } = useSubscriptionPlanById(planId);
  const [modalOpen, setModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState<number | null>(null);
  const [amountDue, setAmountDue] = useState(0);

  // Sync amountDue when plan data loads
  useEffect(() => {
    if (plan) {
      setAmountDue(plan.price);
    }
  }, [plan]);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;

    try {
      const response = await validateCoupon(discountCode);
      if (response.success && response.data) {
        setDiscount(response.data.discountValue);
        const discountAmount = (plan!.price * response.data.discountValue) / 100;
        setAmountDue(plan!.price - discountAmount);
        toast.success(t('plan.discountApplied'));
      }
    } catch (error) {
      toast.error(getErrorMessage(error) || t('plan.invalidDiscountCode'));
      setDiscount(null);
      setAmountDue(plan!.price);
    }
  };

  const handlePay = async () => {
    setIsPaying(true);

    try {
      if (plan) {
        const checkout = await startCheckout(plan._id, discount !== null ? discountCode : undefined);
        if (!checkout.free) {
          // Paid plan: continue on MyFatoorah (KNET / card). It returns to /payment/result.
          window.location.href = checkout.url;
          return;
        }
        if (plan?.planType === PlanType.OFFICE && plan.price === 0) {
          toast.success(t('plan.officePlanActivated'));
        } else {
          toast.success(t('plan.successfullySubscribed', { name: plan.name }));
        }
        refreshSubscriptions();
        queryClient.invalidateQueries({ queryKey: ['my-subscriptions'] });
        router.push('/account?tab=ad-balance');
      }
    } catch (error) {
      toast.error(getErrorMessage(error || t('plan.subscriptionFailed')));
    } finally {
      setIsPaying(false);
      setModalOpen(false);
    }
  };

  if (isLoading || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="animate-pulse bg-white p-8 rounded-2xl w-full max-w-lg h-60"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Back Navigation */}
      <div className="max-w-xl mx-auto px-6 pt-6">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-gray-400 hover:text-primary transition-colors cursor-pointer group">
          <ArrowLeft size={16} className={locale === 'ar' ? 'rotate-180' : ''} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{t('plan.back')}</span>
        </button>
      </div>

      <div className="max-w-lg mx-auto px-6 pt-4 sm:pt-8">
        {/* Plan Header */}
        <div className="mb-6 border-b border-gray-100 pb-6">
          <div className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-1 text-center">{t('plan.officesPlan')}</div>
          <h1 className="text-lg text-center sm:text-xl font-semibold text-primary-dark mb-1 leading-tight">{locale === 'ar' ? plan.nameAr : plan.name}</h1>
        </div>

        {/* Essential Info List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center gap-2.5">
              <Calendar size={15} className="text-gray-300" />
              <span className="text-xs font-medium text-gray-500">{t('plan.numberOfMonths')}</span>
            </div>
            <span className="text-xs font-medium text-primary-blue">{plan.numberOfMonths}</span>
          </div>

          <div className="flex justify-between items-center py-3 border-t border-gray-50">
            <div className="flex items-center gap-2.5">
              <CheckCircle size={15} className="text-gray-300" />
              <span className="text-xs font-medium text-gray-500">{t('plan.ads')}</span>
            </div>
            <span className="text-xs font-medium text-primary-blue">{plan.adCredits}</span>
          </div>

          <div className="flex justify-between items-center py-3 border-t border-gray-50 mt-0">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-gray-500 leading-none">{t('plan.planPrice')}</span>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-bold text-primary-blue">{plan.price}</span>
              <span className="text-[10px] font-semibold text-primary-blue">{t('currency')}</span>
            </div>
          </div>

          <div className="py-3 border-t border-gray-50">
            <div className="flex items-center gap-2.5 mb-3">
              <Tag size={15} className="text-gray-300" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('plan.planDescription')}</span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">{plan.description || t('plan.empty')}</p>
          </div>
        </div>

        {/* Subscription Action */}
        <div className="mt-10 sm:mt-14 pb-8">
          <Button onClick={() => setModalOpen(true)} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-11 rounded-lg shadow-sm transition-all active:scale-[0.99] text-sm">
            {t('plan.subscribeNow')}
          </Button>
          <div className="mt-4">
            <p className="text-[9px] text-gray-300 font-medium text-center leading-normal max-w-[240px] mx-auto">{t('plan.officesLandingCopy', { highlight: '' })}</p>
          </div>
        </div>
      </div>

      {/* ================= PAYMENT MODAL ================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-primary-dark">{t('plan.payInvoice')}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Summary Items */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">{t('plan.amount')}</span>
                  <span className="text-primary-dark font-bold">
                    {plan.price} {t('currency')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">{t('plan.paymentMethod')}</span>
                  <span className="text-primary-dark font-bold uppercase">{t('plan.knet')}</span>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="pt-5 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('plan.discountCode')}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={e => setDiscountCode(e.target.value)}
                    placeholder={t('plan.enterDiscountCode')}
                    disabled={discount !== null}
                    className="flex-1 min-w-0 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-primary bg-white text-gray-600 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                  <Button onClick={handleApplyDiscount} disabled={discount !== null || !discountCode} className="shrink-0 h-10 px-4 bg-primary rounded-lg text-xs font-bold">
                    {t('plan.apply')}
                  </Button>
                </div>
                {discount !== null && (
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg w-fit">
                    <CheckCircle size={14} />
                    <span>{t('plan.discountApplied')}</span>
                  </div>
                )}
              </div>

              {/* Total Row */}
              <div className="pt-5 border-t border-gray-100 flex justify-between items-center">
                <span className="text-base font-bold text-primary-dark">{t('plan.total')}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-primary tracking-tight">{amountDue}</span>
                  <span className="text-xs font-bold text-primary/60">{t('currency')}</span>
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <div className="p-6 pt-0">
              <Button
                onClick={handlePay}
                disabled={isPaying}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              >
                {isPaying ? t('plan.processing') : t('plan.pay')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
