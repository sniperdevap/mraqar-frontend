import axiosWrapper, { ApiResponse } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateSubscriptionAmountRequest {
  amount: number;
}

export interface SubscriptionPlan {
  _id: string;
  name: string;
  price: number;
  stripeProductId: string;
  stripePriceId: string;
  createdAt: string;
  updatedAt: string;
}

export const updatePassword = async (data: UpdatePasswordRequest): Promise<ApiResponse<void>> => {
  return await axiosWrapper<void>('put', API_ENDPOINTS.SETTINGS.UPDATE_PASSWORD, data);
};

export const getSubscriptionPlan = async (): Promise<ApiResponse<{ plan: SubscriptionPlan | null }>> => {
  return await axiosWrapper('get', API_ENDPOINTS.SUBSCRIPTION_PLAN.GET);
};

export const updateSubscriptionAmount = async (data: UpdateSubscriptionAmountRequest): Promise<ApiResponse<{ plan: SubscriptionPlan }>> => {
  return await axiosWrapper('put', API_ENDPOINTS.SUBSCRIPTION_PLAN.UPDATE_AMOUNT, data);
};

export interface AppSettings {
  _id: string;
  vinSearchLimit: number;
  chargePerRequest: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAppSettingsRequest {
  vinSearchLimit?: number;
  chargePerRequest?: number;
}

export const getAppSettings = async (): Promise<ApiResponse<{ settings: AppSettings }>> => {
  return await axiosWrapper('get', API_ENDPOINTS.APP_SETTINGS.GET);
};

export const updateAppSettings = async (data: UpdateAppSettingsRequest): Promise<ApiResponse<{ settings: AppSettings }>> => {
  return await axiosWrapper('put', API_ENDPOINTS.APP_SETTINGS.UPDATE, data);
};
