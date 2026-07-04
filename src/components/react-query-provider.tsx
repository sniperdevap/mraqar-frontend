'use client';

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { getErrorMessage } from '@/lib/utils/api';

async function toastError(message: string) {
  const { toast } = await import('sonner');
  toast.error(message);
}

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error: unknown) => {
            const message = getErrorMessage(error, 'Something went wrong. Please try again.');
            void toastError(message);
          },
        }),

        mutationCache: new MutationCache({
          onError: (error: unknown) => {
            const message = getErrorMessage(error, 'Action failed. Please try again.');
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
