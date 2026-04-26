import { useQuery } from '@tanstack/react-query';
import { getAllSubscriptionPlans, getSubscriptionPlanById, SubscriptionPlan } from '@/lib/api/subscription-plan';

export const useSubscriptionPlans = () => {
  return useQuery<SubscriptionPlan[]>({
    queryKey: ['subscription-plans'],
    queryFn: getAllSubscriptionPlans,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

export const useSubscriptionPlanById = (id: string) => {
  return useQuery<SubscriptionPlan>({
    queryKey: ['subscription-plan', id],
    queryFn: () => getSubscriptionPlanById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
