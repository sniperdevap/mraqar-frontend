'use client';

import { useState, useEffect } from 'react';
import { useAdminUserDetails } from '@/hooks/use-admin';
import { ArrowLeft, Instagram, Phone, Calendar, Mail, FileText, CreditCard, ExternalLink, User as UserIcon, Eye } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdCard } from '@/components/ads/ad-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Subscription } from '@/types/auth';
import { Ad } from '@/types/ad';
import { useTranslations, useLocale } from '@/hooks/use-locale';

export function AdminUserDetails({ id }: { id: string }) {
  const { locale } = useLocale();
  const router = useRouter();
  const t = useTranslations('admin.userDetails');
  const tCommon = useTranslations('common');
  const [page, setPage] = useState(1);
  const [allAds, setAllAds] = useState<Ad[]>([]);
  const { data, isLoading, isFetching, error } = useAdminUserDetails(id, page, 6); // Fetch 6 ads at a time for "View More"

  useEffect(() => {
    if (data?.ads) {
      if (page === 1) {
        setAllAds(data.ads);
      } else if (data.pagination.page === page) {
        setAllAds(prev => {
          const newAds = data.ads.filter(ad => !prev.some(p => p.id === ad.id));
          return [...prev, ...newAds];
        });
      }
    }
  }, [data?.ads, page, data?.pagination?.page]);

  if (isLoading && page === 1)
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spinner />
      </div>
    );
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100">
        <p className="text-gray-500 font-medium">{t('notFound')}</p>
        <Link href={`/${locale}/admin/users`}>
          <Button variant="link" className="mt-4">
            {t('back')}
          </Button>
        </Link>
      </div>
    );
  }

  const { user, subscriptions, stats, pagination } = data;
  const totalViews = stats?.totalViews || 0;
  const totalAds = stats?.totalAds || 0;

  const isRTL = locale === 'ar';

  return (
    <div className="py-4 lg:py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <Link href={`/${locale}/admin/users`} className="group flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors">
          <div className="p-2 rounded-xl group-hover:bg-primary/10 transition-colors">
            <ArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} />
          </div>
          {t('back')}
        </Link>
        <div className="flex items-center gap-3">
          {user.isActive ? (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 px-3 py-1 text-sm rounded-lg">{t('subscriptions.active')}</Badge>
          ) : (
            <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0 px-3 py-1 text-sm rounded-lg">Inactive</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-3xl border-gray-100 overflow-hidden shadow-sm">
            <div className="h-24 bg-gradient-to-r from-primary/30 to-primary/10" />
            <CardContent className="pt-0 relative px-6 pb-8">
              <div className="flex justify-center -mt-12 mb-4">
                <div className="w-24 h-24 rounded-3xl bg-white p-1.5 shadow-xl">
                  <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center overflow-hidden">
                    {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : <UserIcon size={40} className="text-primary" />}
                  </div>
                </div>
              </div>

              <div className="text-center space-y-1 mb-8">
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-500 font-medium">{t('joined', { date: new Date(user.createdAt).toLocaleDateString(locale, { month: 'long', year: 'numeric' }) })}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-50 hover:border-gray-100 transition-colors">
                  <div className="p-2 rounded-xl bg-white text-primary shadow-sm">
                    <Phone size={18} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 font-mono" dir="ltr">
                    {user.phoneNumber}
                  </span>
                </div>

                {user.instagram && (
                  <a
                    href={`https://instagram.com/${user.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-50 hover:border-gray-100 transition-colors"
                  >
                    <div className="p-2 rounded-xl bg-white text-pink-600 shadow-sm">
                      <Instagram size={18} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 truncate">@{user.instagram}</span>
                    <ExternalLink size={14} className={`${isRTL ? 'mr-auto' : 'ml-auto'} text-gray-400`} />
                  </a>
                )}

                {user.tiktok && (
                  <a
                    href={`https://tiktok.com/@${user.tiktok}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-50 hover:border-gray-100 transition-colors"
                  >
                    <div className="p-2 rounded-xl bg-white text-gray-900 shadow-sm">
                      {/* Use simple icon as placeholder for TikTok if not available in Lucide */}
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v20" />
                        <path d="M18 12c-3.3 0-6 2.7-6 6" />
                        <path d="M6 12a6 6 0 0 1 12 0" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 truncate">@{user.tiktok}</span>
                    <ExternalLink size={14} className={`${isRTL ? 'mr-auto' : 'ml-auto'} text-gray-400`} />
                  </a>
                )}
              </div>

              {user.description && (
                <div className="mt-8 pt-6 border-t border-gray-100 text-start">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('about')}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{user.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Stats Mini-cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="rounded-2xl border-gray-100 shadow-sm text-start">
              <CardContent className="p-4 flex flex-col items-center justify-center gap-1">
                <FileText size={20} className="text-primary mb-1" />
                <span className="text-lg font-bold text-gray-900">{totalAds}</span>
                <span className="text-xs text-gray-500 font-medium">{t('stats.adsPosted')}</span>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-gray-100 shadow-sm text-start">
              <CardContent className="p-4 flex flex-col items-center justify-center gap-1">
                {/* views icons is eye */}
                <div className="flex items-center gap-1 mb-1">
                  <Eye size={20} className="text-primary" />
                </div>
                <span className="text-lg font-bold text-gray-900">{totalViews.toLocaleString()}</span>
                <span className="text-xs text-gray-500 font-medium">{t('stats.totalViews')}</span>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Subscriptions & Ads */}
        <div className="lg:col-span-2 space-y-8">
          {/* Subscription Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-start">
              <div className="p-2.5 rounded-2xl bg-violet-100 text-violet-600">
                <CreditCard size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{t('subscriptions.title')}</h3>
            </div>

            {subscriptions && subscriptions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subscriptions.map((sub: Subscription) => (
                  <Card key={sub._id} className={`rounded-2xl border-gray-100 overflow-hidden shadow-sm relative ${sub.isActive ? 'ring-2 ring-primary/10 bg-primary/5' : 'bg-gray-50'}`}>
                    {sub.isActive && (
                      <div className={`absolute top-0 ${isRTL ? 'left-0 rounded-br-xl' : 'right-0 rounded-bl-xl'} px-3 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-tight`}>
                        {t('subscriptions.active')}
                      </div>
                    )}
                    <CardContent className="p-5 space-y-4 text-start">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{sub.planType}</p>
                          <h4 className="text-lg font-bold text-gray-900">{t('subscriptions.planDetails')}</h4>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">{t('subscriptions.credits')}</p>
                          <p className="text-sm font-bold text-gray-900">{String(sub.credits)}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500 mb-0.5">{t('subscriptions.expiresOn')}</p>
                          <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                            <Calendar size={14} className="text-primary" />
                            {new Date(sub.endDate).toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="rounded-2xl border-dashed border-2 border-gray-200 bg-transparent py-10">
                <CardContent className="flex flex-col items-center justify-center text-gray-400">
                  <CreditCard size={40} className="mb-3 opacity-20" />
                  <p className="text-sm font-medium">{t('subscriptions.noSubscriptions')}</p>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Ads Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-start">
                <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-600">
                  <FileText size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{t('ads.title')}</h3>
              </div>
              <Badge variant="secondary" className="px-3 py-1 font-bold">
                {t('ads.total', { count: totalAds })}
              </Badge>
            </div>

            {allAds.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {allAds.map((ad: Ad) => (
                    <div key={ad.id} className="transform hover:scale-[1.01] transition-transform duration-300 text-start">
                      <AdCard ad={ad} onClick={() => router.push(`/${locale}/admin/user-ad-detail/${ad.id}`)} />
                    </div>
                  ))}
                </div>

                {pagination && page < pagination.totalPages && (
                  <div className="flex justify-center pt-2">
                    <Button
                      type="button"
                      onClick={() => setPage(p => p + 1)}
                      disabled={isFetching}
                      variant="outline"
                      className="h-12 px-8 min-w-[200px] border-primary text-primary hover:bg-primary/5 font-medium text-lg rounded-xl transition-all active:scale-95"
                    >
                      {isFetching ? t('ads.loading') : t('ads.viewMore')}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
                <FileText size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-500 font-medium">{t('ads.noAds')}</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
