import { create } from 'zustand';
import Cookies from 'js-cookie';

type Locale = 'en' | 'ar';
const DEFAULT_LOCALE: Locale = 'ar';
const STORAGE_KEY = 'locale';

interface LanguageState {
  locale: Locale;
  direction: 'ltr' | 'rtl';
  setLocale: (locale: Locale) => void;
}

const isLocale = (value: string | null | undefined): value is Locale =>
  value === 'en' || value === 'ar';

const readStoredLocale = (): Locale => {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const stored = window.sessionStorage.getItem(STORAGE_KEY);
  if (isLocale(stored)) return stored;
  const cookieLocale = Cookies.get('NEXT_LOCALE');
  return isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
};

const initialLocale = readStoredLocale();

export const useLanguageStore = create<LanguageState>()(set => ({
  locale: initialLocale,
  direction: initialLocale === 'ar' ? 'rtl' : 'ltr',
  setLocale: (locale: Locale) => {
    window.sessionStorage.setItem(STORAGE_KEY, locale);
    // Session cookie (no `expires`) — dies with the browser session.
    Cookies.set('NEXT_LOCALE', locale);
    set({ locale, direction: locale === 'ar' ? 'rtl' : 'ltr' });
    // Reload so the server re-renders with the new messages.
    window.location.reload();
  },
}));

if (typeof window !== 'undefined' && !window.sessionStorage.getItem(STORAGE_KEY)) {
  window.sessionStorage.setItem(STORAGE_KEY, initialLocale);
  Cookies.set('NEXT_LOCALE', initialLocale);
}
