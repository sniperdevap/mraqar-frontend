'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type AuthTab = {
  key: 'signin' | 'signup';
  href: string;
  label: string;
};

/**
 * Sign in / Create account switch, styled like the home page purpose switch.
 * "Forgot password" lives as a link under the password field instead of a tab.
 */
export function AuthTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const tSignin = useTranslations('auth.signin');
  const tSignup = useTranslations('auth.signup');

  const tabs: AuthTab[] = [
    { key: 'signin', href: '/auth/signin', label: tSignin('title') },
    { key: 'signup', href: '/auth/signup', label: tSignup('createAccount') },
  ];

  const activeTab = tabs.find(tab => pathname.includes(tab.href))?.key ?? null;

  return (
    <div className="px-5 pt-5 md:px-6 md:pt-6">
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-gray-200/70 bg-gray-50 p-1" role="tablist">
        {tabs.map(tab => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => router.push(tab.href)}
              onMouseEnter={() => router.prefetch(tab.href)}
              className={cn(
                'h-11 rounded-[10px] text-[15px] transition-all',
                isActive
                  ? 'bg-white font-semibold text-gray-900 shadow-sm'
                  : 'font-normal text-gray-500 hover:text-gray-900'
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
