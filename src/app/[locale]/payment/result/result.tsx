'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMyPayments } from '@/lib/api/payment';
import { useAuthStore } from '@/lib/store/auth-store';
import { useLocale } from '@/hooks/use-locale';

export function PaymentResult() {
  const t = useTranslations('common.payment');
  const tc = useTranslations('common');
  const params = useSearchParams();
  const status = params.get('status') || 'failed';
  const track = params.get('track');
  const code = params.get('code');
  const { locale } = useLocale();
  const queryClient = useQueryClient();
  const { refreshSubscriptions } = useAuthStore();

  const { data: payments } = useQuery({ queryKey: ['my-payments'], queryFn: getMyPayments, enabled: !!track });
  const payment = payments?.find(p => p.trackId === track);

  useEffect(() => {
    if (status !== 'success') return;
    refreshSubscriptions();
    queryClient.invalidateQueries({ queryKey: ['my-subscriptions'] });
  }, [status, queryClient, refreshSubscriptions]);

  const view =
    status === 'success'
      ? { Icon: CheckCircle, color: 'text-green-600', title: t('successTitle'), body: t('successBody') }
      : status === 'pending'
        ? { Icon: Clock, color: 'text-amber-500', title: t('pendingTitle'), body: t('pendingBody') }
        : status === 'cancelled'
          ? { Icon: XCircle, color: 'text-gray-400', title: t('cancelledTitle'), body: t('failedBody') }
          : { Icon: XCircle, color: 'text-red-600', title: t('failedTitle'), body: t('failedBody') };

  const rows = [
    [t('plan'), payment?.plan && (locale === 'ar' ? payment.plan.nameAr : payment.plan.name)],
    [t('credits'), payment?.plan && payment.plan.adCredits * (payment.quantity || 1)],
    [t('amount'), payment && `${payment.amount} ${tc('currency')}`],
    [t('receipt'), payment?.receiptNo],
    [t('reference'), track],
    [t('errorCode'), code || payment?.errorCode],
  ].filter(([, value]) => value);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-white">
      <div className="w-full max-w-md text-center">
        <view.Icon size={64} className={`mx-auto mb-5 ${view.color}`} />
        <h1 className="text-xl font-bold text-primary-dark mb-2">{view.title}</h1>
        <p className="text-sm text-gray-500 mb-8">{view.body}</p>

        {rows.length > 0 && (
          <dl className="mb-8 divide-y divide-gray-100 border border-gray-100 rounded-xl text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-gray-500">{label}</dt>
                <dd className="font-medium text-primary-dark break-all">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        <Button asChild className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg">
          <Link href={status === 'success' ? '/account?tab=ad-balance' : '/plans'}>{status === 'success' ? t('goToAccount') : t('backToPlans')}</Link>
        </Button>
      </div>
    </div>
  );
}
