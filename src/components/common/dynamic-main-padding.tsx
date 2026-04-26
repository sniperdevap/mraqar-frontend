'use client';

import { usePathname } from 'next/navigation';

export function DynamicMainPadding({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdDetailPage = pathname?.startsWith('/ads/') && pathname?.split('/').length === 3 && pathname?.split('/')[2] !== 'create';

  return <main className={`flex-1 ${isAdDetailPage ? 'pb-0' : 'pb-24'} lg:pb-0`}>{children}</main>;
}
