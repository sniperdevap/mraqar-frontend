import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getDashboardStats, getAdsOverTime, getAdminUsers, getAdminUserDetails, getAdminAds, getAdminSubscriptions, getFailedAds, getFailedAdById, getSubscriptionPlans } from '@/lib/api/admin';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: getDashboardStats,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useAdsOverTime = (period: 'weekly' | 'monthly' | 'yearly') => {
  return useQuery({
    queryKey: ['admin', 'ads-over-time', period],
    queryFn: () => getAdsOverTime(period),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAdminUsers = (params: { page?: number; limit?: number; search?: string; status?: string }) => {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => getAdminUsers(params),
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};

export const useAdminUserDetails = (id: string, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['admin', 'user-details', id, page, limit],
    queryFn: () => getAdminUserDetails(id, page, limit),
    enabled: !!id,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAdminAds = (params: { page?: number; limit?: number; purpose?: string; propertyType?: string; area?: string | string[]; status?: string; isPremium?: string }) => {
  return useQuery({
    queryKey: ['admin', 'ads', params],
    queryFn: () => getAdminAds(params),
    staleTime: 1000 * 60 * 1, // 1 minute
    placeholderData: keepPreviousData,
  });
};

export const useAdminSubscriptions = (params: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: ['admin', 'subscriptions', params],
    queryFn: () => getAdminSubscriptions(params),
    staleTime: 1000 * 60 * 1, // 1 minute
    placeholderData: keepPreviousData,
  });
};

export const useAdminFailedAds = (params: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: ['admin', 'failed-ads', params],
    queryFn: () => getFailedAds(params),
    staleTime: 1000 * 60 * 1, // 1 minute
    placeholderData: keepPreviousData,
  });
};

export const useAdminFailedAdDetails = (id: string | null) => {
  return useQuery({
    queryKey: ['admin', 'failed-ad-details', id],
    queryFn: () => getFailedAdById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAdminPlans = () => {
  return useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: getSubscriptionPlans,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
