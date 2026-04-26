'use client';

import { Calendar, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/hooks/use-locale';
import { useMySubscriptions } from '@/hooks/use-account';

export function AdBalanceTab() {
  const { locale } = useLocale();
  const t = useTranslations('common.account');
  const { data: subscriptions = [], isLoading } = useMySubscriptions();

  if (isLoading) return <div className="text-center py-10 text-gray-500">{t('loading')}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-4 px-4 lg:px-0 mb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{t('availableAds')}</h2>
      </div>

      {subscriptions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-400 text-sm font-medium">{t('noActiveSubscriptions')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subscriptions.map((sub, index) => (
            <div key={index} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm transition-all duration-300 hover:border-primary/20">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-primary rounded-full" />
                  <h3 className="text-base font-bold text-gray-800">{locale === 'ar' ? sub.plan?.nameAr : sub.plan?.name}</h3>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${sub.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {sub.isActive ? t('active') : t('inactive')}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-5 p-2 rounded-xl bg-gray-50/80 border border-gray-100/50">
                <div className="p-1.5 bg-white rounded-lg shadow-sm">
                  <CheckCircle2 className="text-primary-dark w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-0.5">{t('premiumProperties')}</span>
                  <span className="text-xl font-semibold text-primary-dark leading-none">{sub.credits || 0}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar size={14} />
                    <span>{t('subscriptionDate')}</span>
                  </div>
                  <span className="font-bold text-gray-700">{new Date(sub.startDate).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar size={14} />
                    <span>{t('endDate')}</span>
                  </div>
                  <span className="font-bold text-gray-700">{new Date(sub.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
