import axiosWrapper, { ApiResponse } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import type { CreateCheckoutSessionResponse, VerifySessionResponse, GetAllSubscriptionsResponse, SubscriptionApiResponse, GetPaymentMethodsResponse } from '@/types/subscription';

// Subscription API functions
export const createCheckoutSession = async (stripeCouponId?: string): Promise<CreateCheckoutSessionResponse> => {
  const response = await axiosWrapper<CreateCheckoutSessionResponse>('post', API_ENDPOINTS.SUBSCRIPTION.CREATE_CHECKOUT_SESSION, { stripeCouponId });
  return response.data;
};

export const verifySession = async (sessionId: string): Promise<ApiResponse<VerifySessionResponse>> => {
  const response = await axiosWrapper<VerifySessionResponse>('get', API_ENDPOINTS.SUBSCRIPTION.VERIFY_SESSION, { session_id: sessionId });
  return response;
};

export const getAllSubscriptions = async (page: number = 1, limit: number = 10, search?: string): Promise<ApiResponse<GetAllSubscriptionsResponse>> => {
  return await axiosWrapper<GetAllSubscriptionsResponse>('get', API_ENDPOINTS.SUBSCRIPTION.GET_ALL, { page, limit, search });
};

export const getCurrentSubscription = async (): Promise<ApiResponse<{ subscription: SubscriptionApiResponse | null }>> => {
  return await axiosWrapper<{ subscription: SubscriptionApiResponse | null }>('get', API_ENDPOINTS.SUBSCRIPTION.GET_CURRENT);
};

export const cancelSubscription = async (): Promise<ApiResponse<{ subscription: SubscriptionApiResponse }>> => {
  return await axiosWrapper<{ subscription: SubscriptionApiResponse }>('post', API_ENDPOINTS.SUBSCRIPTION.CANCEL);
};

export const renewSubscription = async (): Promise<ApiResponse<{ subscription: SubscriptionApiResponse }>> => {
  return await axiosWrapper<{ subscription: SubscriptionApiResponse }>('post', API_ENDPOINTS.SUBSCRIPTION.RENEW);
};

export const getPaymentMethods = async (): Promise<ApiResponse<GetPaymentMethodsResponse>> => {
  return axiosWrapper<GetPaymentMethodsResponse>('get', API_ENDPOINTS.SUBSCRIPTION.GET_PAYMENT_METHODS);
};

export const createPaymentMethodSetupIntent = async (): Promise<ApiResponse<{ clientSecret: string }>> => {
  return await axiosWrapper<{ clientSecret: string }>('post', API_ENDPOINTS.SUBSCRIPTION.CREATE_SETUP_INTENT);
};

export const attachPaymentMethod = async (setupIntentId: string, paymentMethodId: string): Promise<ApiResponse<{ paymentMethodId: string }>> => {
  return await axiosWrapper<{ paymentMethodId: string }>('post', API_ENDPOINTS.SUBSCRIPTION.ATTACH_PAYMENT_METHOD, {
    setupIntentId,
    paymentMethodId,
  });
};

export const updateDefaultPaymentMethod = async (paymentMethodId: string): Promise<ApiResponse<void>> => {
  return await axiosWrapper<void>('put', API_ENDPOINTS.SUBSCRIPTION.UPDATE_DEFAULT_PAYMENT_METHOD, {
    paymentMethodId,
  });
};

export const deletePaymentMethod = async (paymentMethodId: string): Promise<ApiResponse<void>> => {
  return await axiosWrapper<void>('delete', API_ENDPOINTS.SUBSCRIPTION.DELETE_PAYMENT_METHOD, {
    paymentMethodId,
  });
};
