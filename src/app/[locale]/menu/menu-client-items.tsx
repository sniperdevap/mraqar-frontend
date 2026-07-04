'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserCircle, List, Wallet, Earth, Power, Key } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useLocale, useTranslations } from '@/hooks/use-locale';

export function MenuAuthItems() {
  const { isAuthenticated } = useAuthStore();
  const t = useTranslations('common.menu');

  if (isAuthenticated) {
    return (
      <>
        <Link
          href="/account"
          prefetch={true}
          className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="text-primary bg-primary/5 p-3 rounded-full">
            <UserCircle size={24} />
          </div>
          <span className="font-medium text-gray-700 text-[14px] text-center">{t('myAccount')}</span>
        </Link>
        <Link
          href="/account?tab=my-ads"
          prefetch={true}
          className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="text-primary bg-primary/5 p-3 rounded-full">
            <List size={24} />
          </div>
          <span className="font-medium text-gray-700 text-[14px] text-center">{t('myListings')}</span>
        </Link>
        <Link
          href="/plans"
          prefetch={true}
          className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="text-primary bg-primary/5 p-3 rounded-full">
            <Wallet size={24} />
          </div>
          <span className="font-medium text-gray-700 text-[14px] text-center">{t('plans')}</span>
        </Link>
      </>
    );
  }

  return (
    <Link
      href="/auth/signin"
      prefetch={false}
      className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all active:scale-[0.98]"
    >
      <div className="text-primary bg-primary/5 p-3 rounded-full">
        <Key size={24} />
      </div>
      <span className="font-medium text-gray-700 text-[14px] text-center">{t('loginRegister')}</span>
    </Link>
  );
}

export function LanguageToggleItem() {
  const { locale, setLocale } = useLocale();
  const t = useTranslations('common.menu');

  const handleLanguageToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    const newLocale = locale === 'en' ? 'ar' : 'en';
    setLocale(newLocale);
  };

  return (
    <a
      href="#"
      onClick={handleLanguageToggle}
      className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all active:scale-[0.98]"
    >
      <div className="text-primary bg-primary/5 p-3 rounded-full">
        <Earth size={24} />
      </div>
      <span className="font-medium text-gray-700 text-[14px] text-center">{t('language')}</span>
    </a>
  );
}

export function LogoutButton() {
  const { isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const t = useTranslations('common.menu');

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="mt-4">
      <button onClick={handleLogout} className="w-full bg-white rounded-xl border border-red-100 p-4 flex justify-center items-center gap-2 hover:bg-red-50 transition-colors active:bg-red-100 ">
        <div className="text-red-500">
          <Power size={20} strokeWidth={2.5} />
        </div>
        <span className="font-semibold text-[15px] text-red-500">{t('logout')}</span>
      </button>
    </div>
  );
}
