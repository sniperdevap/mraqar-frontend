'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthInfoSection } from '@/components/auth/auth-info-section';
import { AccountSetupProgress } from '@/components/auth/account-setup-progress';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AuthFooter } from '@/components/dashboard/auth-footer';
import { createCheckoutSession, verifySession } from '@/lib/api/subscription';
import { getSubscriptionPlan, SubscriptionPlan } from '@/lib/api/settings';
import { getErrorMessage, AUTH_COOKIE_DAYS } from '@/lib/utils/api';
import { useAuthStore } from '@/lib/store/auth-store';
import { useTranslations } from 'next-intl';

export function BuySubscription() {
  const t = useTranslations('auth.subscription');
  const tInfo = useTranslations('auth.info');
  const tSignin = useTranslations('auth.signin');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout } = useAuthStore();

  const planPrice = subscriptionPlan?.price || 0;
  const verifyingSessionIdRef = useRef<string | null>(null);
  const handleVerifySession = useCallback(
    async (sessionId: string, retryCount = 0) => {
      setIsVerifying(true);
      const maxRetries = 5;

      try {
        const response = await verifySession(sessionId);

        if (!response.success) {
          // Webhook delayed - retry after 3 seconds
          if (retryCount < maxRetries) {
            setTimeout(() => {
              handleVerifySession(sessionId, retryCount + 1);
            }, 3000);
            return;
          } else {
            toast.error(t('verifySubFailed'));
            return;
          }
        }

        const authUserCookie = Cookies.get('auth-user');
        if (authUserCookie && response.data) {
          const userData = JSON.parse(authUserCookie);
          userData.subscriptionId = response.data.subscriptionId;
          // userData.subscription = response.data.user.subscription as Subscription;
          Cookies.set('auth-user', JSON.stringify(userData), { expires: AUTH_COOKIE_DAYS });
        }
        setShowSuccess(true);
        toast.success(t('successTitle'));
        setIsVerifying(false);
      } catch (error) {
        toast.error(getErrorMessage(error, t('verifySubFailed')));
        router.replace('/auth/buy-subscription');
        setIsVerifying(false);
      }
    },
    [router, t]
  );

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setIsLoadingPlan(true);
        const response = await getSubscriptionPlan();
        if (response.data?.plan) {
          setSubscriptionPlan(response.data.plan);
        }
      } catch (error) {
        toast.error(getErrorMessage(error, t('errorLoading')));
      } finally {
        setIsLoadingPlan(false);
      }
    };

    fetchPlan();
  }, []);

  // Handle redirect back from Stripe
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const canceled = searchParams.get('canceled');

    if (canceled === 'true') {
      toast.error(t('paymentCanceled'));
      // Clean up URL
      router.replace('/auth/buy-subscription');
      return;
    }

    if (sessionId && verifyingSessionIdRef.current !== sessionId) {
      verifyingSessionIdRef.current = sessionId;
      handleVerifySession(sessionId);
    }
  }, [searchParams, router, handleVerifySession]);

  const handleSubscribe = async () => {
    try {
      // Check if user already has active subscription in cookies (from another tab)
      const authUserCookie = Cookies.get('auth-user');
      if (authUserCookie) {
        const userData = JSON.parse(authUserCookie);
        if (userData.subscriptionId) {
          // User already paid in another tab, sync auth store and redirect to dashboard
          useAuthStore.setState({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
          });
          router.push('/business/dashboard');
          return;
        }
      }

      setIsSubscribing(true);

      const result = await createCheckoutSession();
      // Redirect to Stripe checkout
      window.location.href = result.checkoutUrl;
    } catch (error) {
      toast.error(getErrorMessage(error, t('createSessionFailed')));
      setIsSubscribing(false);
    }
  };

  const handleBackToLogin = () => {
    logout();
    router.push('/auth/signin');
  };
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex">
          {/* Left info section to match authentication layout */}
          <AuthInfoSection title={tInfo('title')} subtitle={tInfo('subtitle')} description={tInfo('description')} features={[tInfo('feature1'), tInfo('feature2')]} />

          <div className="flex-1 flex flex-col bg-white overflow-y-auto max-h-[calc(100vh-60px)]">
            <div className="flex-1 flex flex-col justify-center px-6 py-10 sm:px-12">
              <div className="mx-auto w-full max-w-2xl space-y-6">
                {/* Progress header */}
                <AccountSetupProgress step="subscription" />

                {/* Loading overlay when verifying session */}
                {isVerifying && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-primary mx-auto mb-4"></div>
                      <h3 className="text-lg font-semibold mb-2">{t('verifying')}</h3>
                      <p className="text-gray-600 text-sm">{t('verifyingSub')}</p>
                    </div>
                  </div>
                )}

                {/* Plan and Order Summary */}
                {isLoadingPlan ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-primary"></div>
                    <span className="ml-3 text-gray-600">{t('loadingPlan')}</span>
                  </div>
                ) : subscriptionPlan ? (
                  <div className="grid grid-cols-1 gap-6 mt-8">
                    {/* Plan Card */}
                    <div className="rounded-xl border border-blue-primary/60 shadow-sm p-5 bg-white">
                      <h3 className="text-lg font-semibold text-gray-900">{subscriptionPlan.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{t('description')}</p>

                      <div className="mt-4 rounded-lg border border-gray-200 bg-[#EFF6FF] p-5">
                        <p className="text-base font-semibold text-gray-800 mb-5">{t('everythingYouNeed')}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-gray-700">
                          <Feature text={t('features.unlimited')} />
                          <Feature text={t('features.vin')} />
                          <Feature text={t('features.delivery')} />
                          <Feature text={t('features.management')} />
                          <Feature text={t('features.branding')} />
                        </div>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="rounded-xl border border-gray-200 shadow-sm p-5 bg-white">
                      <h3 className="text-lg font-semibold text-gray-900">{t('summary')}</h3>
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between text-sm text-gray-700">
                          <span>{subscriptionPlan.name}</span>
                          <span className="font-medium">${planPrice}/month</span>
                        </div>

                        <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                          <span className="text-base font-semibold text-gray-700">{t('total')}</span>
                          <span className="text-base font-semibold text-blue-primary">${planPrice}/month</span>
                        </div>

                        <Button onClick={handleSubscribe} disabled={isSubscribing || !subscriptionPlan} className="text-base font-semibold mt-4 w-full h-12 bg-blue-primary hover:bg-blue-primary/90">
                          {isSubscribing ? t('processing') : t('subscribeNow')}
                        </Button>
                      </div>
                    </div>

                    {/* Back to login link */}
                    <div className=" text-center">
                      <Link href="/auth/signin" onClick={handleBackToLogin} className="inline-flex items-center gap-3 text-primary-body hover:text-blue-primary cursor-pointer transition-colors">
                        <div className="flex items-center justify-center w-6 h-6 border border-blue-primary rounded-sm hover:border-blue-primary transition-colors">
                          <ChevronLeft size={16} className="text-blue-primary" />
                        </div>
                        <span className="text-base font-normal">{tSignin('title')}</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 p-5 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-700 text-center">{t('errorLoading')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <AuthFooter />
      </div>
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent
          showCloseButton={false}
          className="p-8 sm:max-w-xl"
          onInteractOutside={e => {
            e.preventDefault();
          }}
          onEscapeKeyDown={e => {
            e.preventDefault();
          }}
        >
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-[#3AAF3C] flex items-center justify-center mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">{t('successTitle')}</h3>
            <p className="text-gray-500 mb-8 max-w-md font-normal text-sm">{t('successSub')}</p>
            <Button
              className="h-12 px-8 bg-blue-primary hover:bg-blue-primary/90"
              onClick={() => {
                setShowSuccess(false);
                router.push('/business/dashboard');
              }}
            >
              {t('goDashboard')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-0.5">
        <path d="M20 6L9 17l-5-5" stroke="#19C37D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>{text}</span>
    </div>
  );
}
