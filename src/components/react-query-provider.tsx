'use client';

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { getErrorMessage } from '@/lib/utils/api';
import { useTranslations } from 'next-intl';

async function toastError(message: string) {
  const { toast } = await import('sonner');
  toast.error(message);
}

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const t = useTranslations('common.messages');
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error: unknown) => {
            const message = getErrorMessage(error, t('somethingWentWrong'));
            void toastError(message);
          },
        }),

        mutationCache: new MutationCache({
          onError: (error: unknown) => {
            const message = getErrorMessage(error, t('actionFailed'));
            void toastError(message);
          },
        }),

        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
