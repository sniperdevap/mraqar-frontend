import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

type Locale = 'en' | 'ar';

interface LanguageState {
  locale: Locale;
  direction: 'ltr' | 'rtl';
  setLocale: (locale: Locale) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    set => ({
      locale: 'ar',
      direction: 'rtl',
      setLocale: (locale: Locale) => {
        const direction = locale === 'ar' ? 'rtl' : 'ltr';

        // Set cookie for server-side locale detection
        Cookies.set('NEXT_LOCALE', locale, { expires: 365 });

        // Update store
        set({ locale, direction });

        // Reload page to apply new locale
        window.location.reload();
      },
    }),
    {
      name: 'language-storage',
      // Initialize from cookie on load
      onRehydrateStorage: () => state => {
        if (state) {
          const cookieLocale = Cookies.get('NEXT_LOCALE') as Locale | undefined;
          if (cookieLocale && (cookieLocale === 'en' || cookieLocale === 'ar')) {
            state.locale = cookieLocale;
            state.direction = cookieLocale === 'ar' ? 'rtl' : 'ltr';
          }
        }
      },
    }
  )
);
