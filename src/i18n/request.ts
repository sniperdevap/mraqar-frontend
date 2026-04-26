import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async () => {
  // Get locale from cookie or default to 'en'
  const cookieStore = await cookies();
  const locale = (cookieStore.get('NEXT_LOCALE')?.value as Locale) || 'ar';

  return {
    locale,
    messages: {
      common: (await import(`../../public/locales/${locale}/common.json`)).default,
      home: (await import(`../../public/locales/${locale}/home.json`)).default,
      auth: (await import(`../../public/locales/${locale}/auth.json`)).default,
      office: (await import(`../../public/locales/${locale}/office.json`)).default,
      plan: (await import(`../../public/locales/${locale}/plan.json`)).default,
      admin: (await import(`../../public/locales/${locale}/admin.json`)).default,
    },
  };
});
