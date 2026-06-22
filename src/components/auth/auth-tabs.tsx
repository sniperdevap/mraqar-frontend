'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type AuthTab = {
  key: 'signin' | 'signup' | 'forgot-password';
  href: string;
  label: string;
};

export function AuthTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const tSignin = useTranslations('auth.signin');
  const tSignup = useTranslations('auth.signup');
  const tForgot = useTranslations('auth.forgotPassword');

  const tabs: AuthTab[] = [
    { key: 'signin', href: '/auth/signin', label: tSignin('title') },
    { key: 'signup', href: '/auth/signup', label: tSignup('createAccount') },
    { key: 'forgot-password', href: '/auth/forgot-password', label: tForgot('title') },
  ];

  const activeTab = tabs.find(tab => pathname.includes(tab.href))?.key ?? 'signin';

  return (
    <div className="w-full overflow-hidden border-b rounded-t border-gray-200 bg-white">
      <div className="grid grid-cols-3">
        {tabs.map(tab => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => router.push(tab.href)}
              className={cn(
                'h-12 px-2 text-[11px] md:text-xs font-semibold transition-colors',
                'border-r border-gray-200 last:border-r-0',
                isActive ? 'bg-[#0a7972] text-white' : 'bg-white text-gray-900 hover:bg-gray-50'
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
