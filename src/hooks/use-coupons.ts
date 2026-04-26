import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getAllCoupons, getCouponStats, getCouponById } from '@/lib/api/coupon';

export const useAdminCoupons = (params: { page?: number; limit?: number; search?: string; status?: string }) => {
  return useQuery({
    queryKey: ['admin', 'coupons', params],
    queryFn: () => getAllCoupons(params.page || 1, params.limit || 10, params.search, params.status),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useCouponStats = () => {
  return useQuery({
    queryKey: ['admin', 'coupon-stats'],
    queryFn: getCouponStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCouponById = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'coupon', id],
    queryFn: () => getCouponById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
