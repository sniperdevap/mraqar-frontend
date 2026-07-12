'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/common/navbar';
import { Footer } from '@/components/common/footer';
import { DynamicMainPadding } from '@/components/common/dynamic-main-padding';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pathnameWithoutLocale = pathname?.replace(/^\/(en|ar)/, '') || '/';
  const isAdminRoute = pathnameWithoutLocale.startsWith('/admin');

  // Re-key by route so the cross-fade replays on every navigation. Data lives
  // in React Query / zustand above this, so the remount is cheap.
  const animated = (
    <div key={pathname} className="animate-page-enter">
      {children}
    </div>
  );

  if (isAdminRoute) {
    // Admin pages get rendered without navbar/footer — their own layout handles everything
    return animated;
  }

  return (
    <>
      <Navbar />
      <DynamicMainPadding>{animated}</DynamicMainPadding>
      <Footer />
    </>
  );
}
