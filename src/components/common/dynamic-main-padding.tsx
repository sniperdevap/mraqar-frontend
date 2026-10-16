'use client';

import { usePathname } from 'next/navigation';
import { isAdDetailPath } from '@/lib/ad-url';

export function DynamicMainPadding({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdDetailPage = isAdDetailPath(pathname);

  return <main className={`flex-1 ${isAdDetailPage ? 'pb-0' : 'pb-24'} lg:pb-0`}>{children}</main>;
}
