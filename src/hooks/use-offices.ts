import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getOffices, getOfficeById, GetOfficesParams, GetOfficesResult } from '@/lib/api/office';
import { GetAdsParams } from '@/types/ad';

export const useOffices = (params?: GetOfficesParams) => {
  return useQuery({
    queryKey: ['offices', params],
    queryFn: () => getOffices(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
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
    staleTime: 1000 * 60 * 5,
  });
};

export const useOfficeById = (id: string, adFilters?: GetAdsParams) => {
  return useQuery({
    queryKey: ['office', id, adFilters],
    queryFn: () => getOfficeById(id, adFilters),
    staleTime: 1000 * 60 * 5, // 5 minutes
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
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
};
