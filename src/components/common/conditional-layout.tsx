'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/common/navbar';
import { Footer } from '@/components/common/footer';
import { DynamicMainPadding } from '@/components/common/dynamic-main-padding';
import { ScrollToTop } from '@/components/common/scroll-to-top';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pathnameWithoutLocale = pathname?.replace(/^\/(en|ar)/, '') || '/';
  const isAdminRoute = pathnameWithoutLocale.startsWith('/admin');
  const isHomePage = pathnameWithoutLocale === '/' || pathnameWithoutLocale === '';
  // Its fixed button overlaps the action buttons on the plans and ad form pages.
  const hideScrollToTop = isHomePage || /^\/(plans|ads\/create|ads\/edit)(\/|$)/.test(pathnameWithoutLocale);

  if (isAdminRoute) {
    // Admin pages get rendered without navbar/footer — their own layout handles everything
    return children;
  }

  return (
    <>
      <Navbar />
      <DynamicMainPadding>{children}</DynamicMainPadding>
      {!hideScrollToTop && <ScrollToTop />}
      <Footer />
    </>
  );
}
