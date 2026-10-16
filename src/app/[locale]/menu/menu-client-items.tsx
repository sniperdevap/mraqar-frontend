'use client';

import React from 'react';
import Link from 'next/link';
import { UserCircle, List, Wallet, Languages, Power, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useLocale, useTranslations } from '@/hooks/use-locale';

export const ROW =
  'flex items-center gap-3.5 min-h-14 px-4 py-3 transition-colors hover:bg-gray-50 active:bg-gray-100';
export const ICON_TILE = 'flex items-center justify-center size-10 shrink-0 rounded-xl';

/** Chevron that points "forward" in both reading directions. */
export function RowChevron() {
  const { direction } = useLocale();
  const Icon = direction === 'rtl' ? ChevronLeft : ChevronRight;
  return <Icon size={18} className="shrink-0 text-gray-300" aria-hidden="true" />;
}

export function MenuGroup({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      {title ? <h2 className="px-1 text-[13px] font-semibold text-gray-500">{title}</h2> : null}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(16,24,40,0.04)] divide-y divide-gray-100">
        {children}
      </div>
    </section>
  );
}

function AccountRow({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <Link href={href} prefetch className={ROW}>
      <span className={`${ICON_TILE} bg-primary/[0.07] text-primary`}>
        <Icon size={20} />
      </span>
      <span className="flex-1 text-[15px] font-medium text-gray-800">{label}</span>
      <RowChevron />
    </Link>
  );
}

/** Top of the menu: a welcome card for guests, the account group for signed-in users. */
export function MenuAuthItems() {
  const { isAuthenticated, user } = useAuthStore();
  const t = useTranslations('common.menu');

  if (isAuthenticated) {
    const name = (user as { name?: string } | null)?.name || '';
    return (
      <>
        {name ? (
          <div className="flex items-center gap-3.5 rounded-2xl border border-gray-100 bg-white p-4">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/[0.08] text-lg font-bold text-primary">
              {name.trim().charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[17px] font-bold text-gray-900">{name}</p>
              <p className="text-[13px] text-gray-500">{t('guestTitle')}</p>
            </div>
          </div>
        ) : null}
        <MenuGroup title={t('sectionAccount')}>
          <AccountRow href="/account" icon={UserCircle} label={t('myAccount')} />
          <AccountRow href="/account?tab=my-ads" icon={List} label={t('myListings')} />
          <AccountRow href="/plans" icon={Wallet} label={t('plans')} />
        </MenuGroup>
      </>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
      <h1 className="text-[19px] font-bold text-gray-900 text-balance">{t('guestTitle')}</h1>
      <p className="mt-1.5 text-[14px] leading-6 text-gray-500">{t('guestSubtitle')}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link
          href="/auth/signin"
          prefetch={false}
          className="flex h-12 items-center justify-center rounded-xl bg-[#e11d1d] text-[15px] font-semibold text-white transition-colors hover:bg-[#b91616] active:scale-[0.98]"
        >
          {t('signIn')}
        </Link>
        <Link
          href="/auth/signup"
          prefetch={false}
          className="flex h-12 items-center justify-center rounded-xl border border-gray-200 bg-white text-[15px] font-semibold text-gray-800 transition-colors hover:bg-gray-50 active:scale-[0.98]"
        >
          {t('createAccount')}
        </Link>
      </div>
    </div>
  );
}

export function LanguageToggleItem() {
  const { locale, setLocale } = useLocale();
  const t = useTranslations('common.menu');

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
      className={`${ROW} w-full text-start`}
    >
      <span className={`${ICON_TILE} bg-primary/[0.07] text-primary`}>
        <Languages size={20} />
      </span>
      <span className="flex-1 text-[15px] font-medium text-gray-800">{t('languageLabel')}</span>
      <span className="inline-flex items-center rounded-full bg-gray-100 p-1 text-[13px] font-semibold" aria-hidden="true">
        <span className={`rounded-full px-3 py-1 ${locale === 'ar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>ع</span>
        <span className={`rounded-full px-3 py-1 ${locale === 'en' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>EN</span>
      </span>
      <span className="sr-only">{t('language')}</span>
    </button>
  );
}

export function LogoutButton() {
  const { isAuthenticated, logout } = useAuthStore();
  const t = useTranslations('common.menu');

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <button
      onClick={handleLogout}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-white transition-colors hover:bg-red-50 active:bg-red-100"
    >
      <Power size={19} strokeWidth={2.5} className="text-red-500" />
      <span className="text-[15px] font-semibold text-red-500">{t('logout')}</span>
    </button>
  );
}
