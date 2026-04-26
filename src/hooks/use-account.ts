import { useQuery } from '@tanstack/react-query';
import { getProfile, Profile, getWishlists, Wishlist, getFavorites } from '@/lib/api/account';
import { getMyAds } from '@/lib/api/ad';
import { getMySubscriptions, UserSubscription } from '@/lib/api/subscription-plan';
import { Ad, GetAdsResult } from '@/types/ad';

export const useProfile = () => {
  return useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: getProfile,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useMySubscriptions = () => {
  return useQuery<UserSubscription[]>({
    queryKey: ['my-subscriptions'],
    queryFn: getMySubscriptions,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useMyAds = () => {
  return useQuery<Ad[]>({
    queryKey: ['my-ads'],
    queryFn: getMyAds,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useWishlists = (status?: string) => {
  return useQuery<Wishlist[]>({
    queryKey: ['wishlists', status],
    queryFn: () => getWishlists(status),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useFavorites = (page: number = 1, limit: number = 12) => {
  return useQuery<GetAdsResult>({
    queryKey: ['favorites', page, limit],
    queryFn: () => getFavorites(page, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
