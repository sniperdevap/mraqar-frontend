'use client';

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils/api';

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error: unknown) => {
            const message = getErrorMessage(error, 'Something went wrong. Please try again.');
            toast.error(message);
          },
        }),

        mutationCache: new MutationCache({
          onError: (error: unknown) => {
            const message = getErrorMessage(error, 'Action failed. Please try again.');
            toast.error(message);
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
