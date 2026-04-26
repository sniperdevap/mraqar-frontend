import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
const locales = ['en', 'ar'];

export default getRequestConfig(async ({ requestLocale }) => {
  // Validate that the incoming `locale` parameter is valid
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale)) {
    locale = 'en';
  }

  return {
    locale,
    messages: {
      common: (await import(`../public/locales/${locale}/common.json`)).default,
      home: (await import(`../public/locales/${locale}/home.json`)).default,
      auth: (await import(`../public/locales/${locale}/auth.json`)).default,
      office: (await import(`../public/locales/${locale}/office.json`)).default,
      admin: (await import(`../public/locales/${locale}/admin.json`)).default,
      plan: (await import(`../public/locales/${locale}/plan.json`)).default,
    },
  };
});
