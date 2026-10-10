'use client';

import Link from 'next/link';
import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-locale';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('common');

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-5 flex size-20 items-center justify-center rounded-full bg-red-50">
          <TriangleAlert size={40} className="text-red-600" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-primary-dark">{t('messages.error')}</h1>
        <p className="mb-8 text-sm text-gray-500">{t('messages.somethingWentWrong')}</p>
        <div className="flex gap-3">
          <Button onClick={reset} className="h-11 flex-1 rounded-lg font-semibold">
            {t('buttons.tryAgain')}
          </Button>
          <Button asChild variant="outline" className="h-11 flex-1 rounded-lg font-semibold">
            <Link href="/">{t('nav.home')}</Link>
          </Button>
        </div>
        {/* Hide once error tracking (e.g. Sentry) is added */}
        <p dir="ltr" className="mt-6 wrap-break-word text-xs text-gray-400">
          {error.message}
          {error.digest && ` (${error.digest})`}
        </p>
      </div>
    </div>
  );
}
