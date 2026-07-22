'use client';

import { useLocale } from '@/hooks/use-locale';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    setLocale(newLocale);
  };

  return (
    <Button
      variant="ghost"
      onClick={toggleLanguage}
      className="text-gray-900 hover:bg-transparent hover:text-primary transition-colors font-semibold px-2 h-auto"
      title={locale === 'en' ? 'Switch to Arabic' : 'Switch to English'}
    >
      {locale === 'en' ? 'عربي' : 'English'}
    </Button>
  );
}
