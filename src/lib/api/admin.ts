import axiosWrapper from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import { Subscription } from '@/types/auth';
import { Ad } from '@/types/ad';

// Types
export interface DashboardStats {
  totalUsers: number;
  totalAds: number;
  totalSubscriptions: number;
  activeUsers: number;
  activeAds: number;
  activeSubscriptions: number;
}

export interface AdsOverTimeEntry {
  label: string;
  count: number;
}

export interface AdminUser {
  _id: string;
  name: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  instagram?: string;
  tiktok?: string;
  description?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUsersResponse {
  data: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ToggleStatusResponse {
  userId: string;
  isActive: boolean;
}

export interface ToggleVerifiedResponse {
  userId: string;
  isVerified: boolean;
}

// API Functions
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await axiosWrapper<DashboardStats>('get', API_ENDPOINTS.ADMIN.DASHBOARD);
  return response.data;
};

export const getAdsOverTime = async (period: 'weekly' | 'monthly' | 'yearly'): Promise<AdsOverTimeEntry[]> => {
  const response = await axiosWrapper<AdsOverTimeEntry[]>('get', `${API_ENDPOINTS.ADMIN.ADS_OVER_TIME}?period=${period}`);
  return response.data;
};

export interface AdminUserDetailsResponse {
  user: AdminUser & {
    instagram?: string;
    tiktok?: string;
    description?: string;
    avatar?: string;
  };
  subscriptions: Subscription[];
  ads: Ad[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    totalAds: number;
    totalViews: number;
  };
}

export const getAdminUsers = async (params: { page?: number; limit?: number; search?: string; status?: string }): Promise<AdminUsersResponse> => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.search) queryParams.set('search', params.search);
  if (params.status) queryParams.set('status', params.status);

  const response = await axiosWrapper<AdminUsersResponse>('get', `${API_ENDPOINTS.ADMIN.USERS}?${queryParams.toString()}`);
  return response.data;
};

export const getAdminUserDetails = async (id: string, page: number = 1, limit: number = 10): Promise<AdminUserDetailsResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.set('page', page.toString());
  queryParams.set('limit', limit.toString());
  const response = await axiosWrapper<AdminUserDetailsResponse>('get', `${API_ENDPOINTS.ADMIN.USER_DETAILS(id)}?${queryParams.toString()}`);
  return response.data;
};

export const deleteAdminUser = async (id: string): Promise<void> => {
  await axiosWrapper<void>('delete', API_ENDPOINTS.ADMIN.DELETE_USER(id));
};

export const toggleUserStatus = async (id: string): Promise<ToggleStatusResponse> => {
  const response = await axiosWrapper<ToggleStatusResponse>('patch', API_ENDPOINTS.ADMIN.TOGGLE_USER_STATUS(id));
  return response.data;
};

export const toggleUserVerified = async (id: string): Promise<ToggleVerifiedResponse> => {
  const response = await axiosWrapper<ToggleVerifiedResponse>('patch', API_ENDPOINTS.ADMIN.TOGGLE_USER_VERIFIED(id));
  return response.data;
};

export const changeUserPassword = async (id: string, newPassword: string): Promise<void> => {
  await axiosWrapper<void>('patch', API_ENDPOINTS.ADMIN.CHANGE_USER_PASSWORD(id), { newPassword });
};

export const updateAdminUser = async (id: string, data: Partial<AdminUser & { instagram?: string; tiktok?: string; description?: string; avatar?: string }>): Promise<AdminUser> => {
  const response = await axiosWrapper<AdminUser>('put', API_ENDPOINTS.ADMIN.USER_DETAILS(id), data);
  return response.data;
};

export interface AdminAdsResponse {
  ads: Ad[];
  total: number;
  page: number;
  totalPages: number;
}

export const getAdminAds = async (params: {
  page?: number;
  limit?: number;
  purpose?: string;
  propertyType?: string;
  area?: string | string[];
  status?: string;
  isPremium?: string;
}): Promise<AdminAdsResponse> => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.purpose) queryParams.set('purpose', params.purpose);
  if (params.propertyType) queryParams.set('propertyType', params.propertyType);
  if (params.status && params.status !== 'all') queryParams.set('status', params.status);
  if (params.isPremium && params.isPremium !== 'all') queryParams.set('isPremium', params.isPremium);

  if (params.area) {
    if (Array.isArray(params.area)) {
      params.area.forEach(a => queryParams.append('area', a));
    } else {
      queryParams.set('area', params.area);
    }
  }

  const response = await axiosWrapper<AdminAdsResponse>('get', `${API_ENDPOINTS.ADMIN.ADS}?${queryParams.toString()}`);
  return response.data;
};

export interface AdminSubscription extends Subscription {
  user: {
    _id: string;
    name: string;
    phoneNumber: string;
  };
}

export interface AdminSubscriptionsResponse {
  data: AdminSubscription[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getAdminSubscriptions = async (params: { page?: number; limit?: number; search?: string }): Promise<AdminSubscriptionsResponse> => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.search) queryParams.set('search', params.search);

  const response = await axiosWrapper<AdminSubscriptionsResponse>('get', `${API_ENDPOINTS.ADMIN.SUBSCRIPTIONS}?${queryParams.toString()}`);
  return response.data;
};

export const cancelSubscription = async (id: string): Promise<void> => {
  await axiosWrapper<void>('patch', API_ENDPOINTS.ADMIN.CANCEL_SUBSCRIPTION(id));
};

export interface FailedAd {
  _id: string;
  user: {
    _id: string;
    name: string;
    phoneNumber: string;
  };
  purpose: string;
  propertyType?: {
    _id: string;
    label: string;
    labelAr: string;
    value: string;
  };
  area?: {
    _id: string;
    label: string;
    labelAr: string;
    value: string;
    governorateAr?: string;
  };
  price?: number;
  description?: string;
  phoneNumber?: string;
  isPhoneHidden?: boolean;
  alternativePhoneNumber?: string;
  error?: string;
  media?: Array<{
    _id: string;
    url: string;
    type: 'image' | 'video';
    thumbnail?: string;
  }>;
  isPremium: boolean;
  createdAt: string;
}

export interface FailedAdsResponse {
  data: FailedAd[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getFailedAds = async (params: { page?: number; limit?: number; search?: string }): Promise<FailedAdsResponse> => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.search) queryParams.set('search', params.search);

  const response = await axiosWrapper<FailedAdsResponse>('get', `${API_ENDPOINTS.ADMIN.FAILED_ADS}?${queryParams.toString()}`);
  return response.data;
};

export const getFailedAdById = async (id: string): Promise<FailedAd> => {
  const response = await axiosWrapper<FailedAd>('get', API_ENDPOINTS.ADMIN.FAILED_AD_DETAILS(id));
  return response.data;
};

export const deleteFailedAd = async (id: string): Promise<void> => {
  await axiosWrapper<void>('delete', API_ENDPOINTS.ADMIN.FAILED_AD_DETAILS(id));
};

export interface SubscriptionPlan {
  _id: string;
  name: string;
  nameAr: string;
  planType: 'month-plan' | 'office-plan';
  description: string;
  price: number;
  numberOfMonths: number;
  normalAds: number;
  premiumAds: number;
  discount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await axiosWrapper<SubscriptionPlan[]>('get', API_ENDPOINTS.ADMIN.PLANS);
  return response.data;
};

export const updateSubscriptionPlan = async (id: string, data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> => {
  const response = await axiosWrapper<SubscriptionPlan>('put', API_ENDPOINTS.ADMIN.UPDATE_PLAN(id), data);
  return response.data;
};

export const toggleSubscriptionPlanStatus = async (id: string): Promise<SubscriptionPlan> => {
  const response = await axiosWrapper<SubscriptionPlan>('patch', API_ENDPOINTS.ADMIN.TOGGLE_PLAN_STATUS(id));
  return response.data;
};
