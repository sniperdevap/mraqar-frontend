'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function AuthFooter() {
  const t = useTranslations('auth.footer');

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full py-4 px-4 md:px-6 lg:px-12 text-white bg-primary-cyan z-50">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
        <div className="flex flex-row items-center justify-center md:justify-end gap-3 sm:gap-4 md:gap-6 order-1 md:order-2">
          <Link href="#" className="text-sm font-normal text-white hover:text-white/80 hover:underline transition-colors duration-200">
            {t('contactUs')}
          </Link>
          <Link href="#" className="text-sm font-normal text-white hover:text-white/80 hover:underline transition-colors duration-200">
            {t('termsOfService')}
          </Link>
          <Link href="#" className="text-sm font-normal text-white hover:text-white/80 hover:underline transition-colors duration-200">
            {t('privacyPolicy')}
          </Link>
        </div>

        <p className="text-sm font-normal text-center md:text-left order-2 md:order-1">
          {t('designedBy')}{' '}
          <Link href="https://www.ropstam.com/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 hover:underline transition-colors duration-200">
            {t('developer')}
          </Link>
        </p>
      </div>
    </div>
  );
}
