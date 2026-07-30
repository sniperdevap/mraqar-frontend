import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getOffices, getOfficeById, GetOfficesParams, GetOfficesResult } from '@/lib/api/office';
import { GetAdsParams } from '@/types/ad';

export const useOffices = (params?: GetOfficesParams) => {
  return useQuery({
    queryKey: ['offices', params],
    queryFn: () => getOffices(params),
    staleTime: 30 * 1000, // 30s — ad counts change as offices post
  });
};

export const useInfiniteOffices = (params?: Omit<GetOfficesParams, 'page'>) => {
  return useInfiniteQuery<GetOfficesResult>({
    queryKey: ['offices', 'infinite', params],
    queryFn: ({ pageParam = 1 }) => getOffices({ ...params, page: pageParam as number }),
    getNextPageParam: lastPage => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 30 * 1000, // 30s — ad counts change as offices post
  });
};

export const useOfficeById = (id: string, adFilters?: GetAdsParams) => {
  return useQuery({
    queryKey: ['office', id, adFilters],
    queryFn: () => getOfficeById(id, adFilters),
    staleTime: 30 * 1000, // 30s — ad counts change as offices post
    enabled: !!id,
  });
};

export const useInfiniteOfficeById = (id: string, adFilters?: Omit<GetAdsParams, 'page'>) => {
  return useInfiniteQuery({
    queryKey: ['office', 'infinite', id, adFilters],
    queryFn: ({ pageParam = 1 }) => getOfficeById(id, { ...adFilters, page: pageParam as number }),
    getNextPageParam: lastPage => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 30 * 1000, // 30s — ad counts change as offices post
    enabled: !!id,
  });
};
