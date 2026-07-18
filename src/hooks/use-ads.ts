import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getAds, getAdById } from '@/lib/api/ad';
import { GetAdsParams, GetAdsResult, DetailAd } from '@/types/ad';

export const useAds = (params: GetAdsParams) => {
  return useQuery({
    queryKey: ['ads', params],
    queryFn: () => getAds(params),
  });
};

export const useInfiniteAds = (limit: number) => {
  return useInfiniteQuery({
    queryKey: ['ads', 'infinite'],
    queryFn: ({ pageParam = 1 }) => getAds({ page: pageParam as number, limit }),
    getNextPageParam: (lastPage: GetAdsResult) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};

export const useSearchAds = (params: GetAdsParams, limit: number) => {
  return useInfiniteQuery({
    queryKey: ['ads', 'search', params],
    queryFn: ({ pageParam = 1 }) => getAds({ ...params, page: pageParam as number, limit }),
    getNextPageParam: (lastPage: GetAdsResult) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    // The server-hydrated first page is already current. Ad detail writes its
    // fresh view count back into matching list caches, avoiding a duplicate
    // list request immediately after navigation/hydration.
    staleTime: 60 * 1000,
    refetchOnMount: false,
  });
};

export const useInfiniteSearchAds = (params: GetAdsParams, limit: number, enabled: boolean = true) => {
  return useInfiniteQuery({
    queryKey: ['ads', 'search', 'infinite', params, limit],
    queryFn: ({ pageParam = 1 }) => getAds({ ...params, page: pageParam as number, limit }),
    getNextPageParam: (lastPage: GetAdsResult) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled,
  });
};

export const useAdById = (id: string, initialData?: DetailAd) => {
  return useQuery<DetailAd>({
    queryKey: ['ad', id],
    queryFn: () => getAdById(id),
    enabled: !!id,
    initialData: initialData,
    // Paint cached ad instantly, but always refetch so the view count is current.
    staleTime: 0,
    refetchOnMount: 'always',
  });
};
