import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // Use the [locale] segment from middleware — do not call cookies().
  // cookies() forces dynamic rendering and Cache-Control: no-store, which
  // blocks the browser back/forward cache (bfcache).
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "en" | "ar")) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: {
      common: (await import(`../../public/locales/${locale}/common.json`))
        .default,
      home: (await import(`../../public/locales/${locale}/home.json`)).default,
      auth: (await import(`../../public/locales/${locale}/auth.json`)).default,
      office: (await import(`../../public/locales/${locale}/office.json`))
        .default,
      plan: (await import(`../../public/locales/${locale}/plan.json`)).default,
      admin: (await import(`../../public/locales/${locale}/admin.json`)).default,
    },
  };
});
