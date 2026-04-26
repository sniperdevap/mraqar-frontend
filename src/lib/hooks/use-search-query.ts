'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from './use-debounce';

interface UseSearchQueryOptions {
  paramName?: string;
  debounceDelay?: number;
  pathname: string;
}

interface UseSearchQueryReturn {
  searchTerm: string;
  debouncedSearch: string;
  searchQuery: string;
  setSearchTerm: (value: string) => void;
}

export function useSearchQuery(options: UseSearchQueryOptions): UseSearchQueryReturn {
  const { paramName = 'search', debounceDelay = 500, pathname } = options;
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchQuery = searchParams.get(paramName) || '';
  const [searchTerm, setSearchTerm] = useState(searchQuery);

  const debouncedSearch = useDebounce(searchTerm, debounceDelay);

  useEffect(() => {
    if (searchQuery !== searchTerm) {
      setSearchTerm(searchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      const params = new URLSearchParams(searchParams.toString());

      if (debouncedSearch) {
        params.set(paramName, debouncedSearch);
      } else {
        params.delete(paramName);
      }

      params.delete('page');

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(newUrl);
    }
  }, [debouncedSearch, searchQuery, router, pathname, paramName, searchParams]);

  return {
    searchTerm,
    debouncedSearch,
    searchQuery,
    setSearchTerm,
  };
}
