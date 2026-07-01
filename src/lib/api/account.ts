import axiosWrapper from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import { Ad, GetAdsResult } from '@/types/ad';
import { PropertyType, Area } from './metadata';

export interface Profile {
  _id: string;
  name: string;
  phoneNumber: string;
  avatar?: string;
  instagram?: string;
  tiktok?: string;
  description?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phoneNumber?: string;
  avatar?: string;
  instagram?: string;
  tiktok?: string;
  description?: string;
}

export interface Wishlist {
  _id: string;
  user: string;
  purpose?: 'sale' | 'rent' | 'exchange';
  propertyType?: PropertyType;
  area?: Area;
  minPrice?: number;
  maxPrice?: number;
  status: 'active' | 'completed' | 'cancelled';
  matchedAd?: Ad;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWishlistRequest {
  purpose?: string;
  propertyType?: string;
  area?: string;
  minPrice?: number;
  maxPrice?: number;
}

// Profile
export const getProfile = async (): Promise<Profile> => {
  const response = await axiosWrapper<Profile>('get', API_ENDPOINTS.ACCOUNT.PROFILE);
  return response.data;
};

export const updateProfile = async (data: UpdateProfileRequest): Promise<Profile> => {
  const response = await axiosWrapper<Profile>('put', API_ENDPOINTS.ACCOUNT.PROFILE, data);
  return response.data;
};

// My Ads
export const getMyAds = async (status?: string, page: number = 1, limit: number = 12): Promise<GetAdsResult> => {
  const params: { page?: number; limit?: number; status?: string } = { page, limit };
  if (status) {
    params.status = status as string;
  }
  const response = await axiosWrapper<GetAdsResult>('get', API_ENDPOINTS.ACCOUNT.MY_ADS, params);
  return response.data;
};

// Wishlist
export const createWishlist = async (data: CreateWishlistRequest): Promise<Wishlist> => {
  const payload = {
    ...data,
    ...(data.propertyType ? { propertyType: Number(data.propertyType) } : {}),
    ...(data.area ? { area: Number(data.area) } : {}),
  };
  const response = await axiosWrapper<Wishlist>('post', API_ENDPOINTS.ACCOUNT.WISHLIST.CREATE, payload);
  return response.data;
};

export const getWishlists = async (status?: string): Promise<Wishlist[]> => {
  const params = status ? { status } : {};
  const response = await axiosWrapper<Wishlist[]>('get', API_ENDPOINTS.ACCOUNT.WISHLIST.GET_ALL, params);
  return response.data;
};

export const updateWishlist = async (id: string, data: Partial<CreateWishlistRequest & { status?: string }>): Promise<Wishlist> => {
  const payload = {
    ...data,
    ...(data.propertyType ? { propertyType: Number(data.propertyType) } : {}),
    ...(data.area ? { area: Number(data.area) } : {}),
  };
  const response = await axiosWrapper<Wishlist>('put', API_ENDPOINTS.ACCOUNT.WISHLIST.UPDATE(id), payload);
  return response.data;
};

export const deleteWishlist = async (id: string): Promise<void> => {
  await axiosWrapper('delete', API_ENDPOINTS.ACCOUNT.WISHLIST.DELETE(id));
};

// Favorites
export const addFavorite = async (adId: number): Promise<void> => {
  await axiosWrapper('post', API_ENDPOINTS.ACCOUNT.FAVORITES.ADD, { adId });
};

export const removeFavorite = async (adId: number): Promise<void> => {
  await axiosWrapper('delete', API_ENDPOINTS.ACCOUNT.FAVORITES.REMOVE(adId));
};

export const getFavorites = async (page: number = 1, limit: number = 12): Promise<GetAdsResult> => {
  const response = await axiosWrapper<{ favorites: Ad[]; total: number; page: number; totalPages: number }>('get', API_ENDPOINTS.ACCOUNT.FAVORITES.GET_ALL, { page, limit });
  // Transform favorites array to ads array for consistency
  return {
    ads: response.data.favorites || [],
    total: response.data.total,
    page: response.data.page,
    totalPages: response.data.totalPages,
  };
};

export const checkIsFavorite = async (adId: number): Promise<boolean> => {
  const response = await axiosWrapper<{ isFavorite: boolean }>('get', API_ENDPOINTS.ACCOUNT.FAVORITES.CHECK(adId));
  return response.data.isFavorite;
};

export const deleteAccount = async (): Promise<void> => {
  await axiosWrapper('delete', API_ENDPOINTS.ACCOUNT.DELETE_ACCOUNT);
};

export interface ContactRequest {
  fullName: string;
  email: string;
  subject: string;
  message: string;
  action?: string;
}

export const createContact = async (data: ContactRequest): Promise<void> => {
  await axiosWrapper('post', API_ENDPOINTS.CONTACT, data);
};

// Notifications
export interface Notification {
  _id: string;
  user: string;
  type: 'wish_matched' | 'ad_approved' | 'ad_rejected' | 'subscription_activated' | 'premium_ad_expired' | 'general';
  title: { en: string; ar: string };
  message: { en: string; ar: string };
  redirectUrl?: string;
  relatedAd?: Ad;
  relatedWishlist?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetNotificationsResult {
  notifications: Notification[];
  total: number;
  page: number;
  totalPages: number;
}

export const getNotifications = async (page: number = 1, limit: number = 20): Promise<GetNotificationsResult> => {
  const response = await axiosWrapper<GetNotificationsResult>('get', API_ENDPOINTS.ACCOUNT.NOTIFICATIONS.GET_ALL, { page, limit });
  return response.data;
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  await axiosWrapper('put', API_ENDPOINTS.ACCOUNT.NOTIFICATIONS.MARK_READ(id));
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await axiosWrapper('put', API_ENDPOINTS.ACCOUNT.NOTIFICATIONS.MARK_ALL_READ);
};

export const deleteNotification = async (id: string): Promise<void> => {
  await axiosWrapper('delete', API_ENDPOINTS.ACCOUNT.NOTIFICATIONS.DELETE(id));
};

export const deleteAllNotifications = async (): Promise<void> => {
  await axiosWrapper('delete', API_ENDPOINTS.ACCOUNT.NOTIFICATIONS.DELETE_ALL);
};

export const getUnreadNotificationCount = async (): Promise<number> => {
  const response = await axiosWrapper<{ count: number }>('get', API_ENDPOINTS.ACCOUNT.NOTIFICATIONS.UNREAD_COUNT);
  return response.data.count;
};
