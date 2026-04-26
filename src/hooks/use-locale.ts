'use client';

import { useTranslations as useNextIntlTranslations } from 'next-intl';
import { useLanguageStore } from '@/lib/store/language-store';

export function useLocale() {
  const { locale, direction, setLocale } = useLanguageStore();

  return {
    locale,
    direction,
    setLocale,
  };
}

// Re-export useTranslations from next-intl for convenience
export function useTranslations(namespace?: string) {
  return useNextIntlTranslations(namespace);
}
