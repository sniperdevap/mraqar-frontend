import axiosWrapper from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';

export interface SubscriptionPlan {
  _id: string;
  name: string;
  nameAr: string;
  planType: 'month-plan' | 'office-plan';
  description: string;
  price: number;
  numberOfMonths: number;
  adCredits: number;
  discount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Get all subscription plans
export const getAllSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await axiosWrapper<SubscriptionPlan[]>('get', API_ENDPOINTS.SUBSCRIPTION_PLAN.GET_ALL);
  return response.data;
};

// Get subscription plan by ID
export const getSubscriptionPlanById = async (id: string): Promise<SubscriptionPlan> => {
  const response = await axiosWrapper<SubscriptionPlan>('get', API_ENDPOINTS.SUBSCRIPTION_PLAN.GET_BY_ID(id));
  return response.data;
};

// Subscribe to a plan (buy credits)
export const subscribeToPlan = async (planId: string, coupon?: string): Promise<UserSubscription> => {
  const response = await axiosWrapper<UserSubscription>('post', API_ENDPOINTS.SUBSCRIPTION_PLAN.SUBSCRIBE, { planId, coupon });
  return response.data;
};

export interface UserSubscription {
  user: string;
  plan: SubscriptionPlan;
  planType: string;
  credits: number;
  premiumCredits: number;
  purchaseCount?: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
}

// Get user subscriptions
export const getMySubscriptions = async (): Promise<UserSubscription[]> => {
  const response = await axiosWrapper<UserSubscription[]>('get', API_ENDPOINTS.SUBSCRIPTION_PLAN.MY_SUBSCRIPTIONS);
  return response.data;
};

export interface RemainingAdCreditsResponse {
  monthlyCredits: number;
  officeCredits: number;
  totalCredits: number;
}

export const getRemainingAdCredits = async (): Promise<RemainingAdCreditsResponse> => {
  const response = await axiosWrapper<RemainingAdCreditsResponse>('get', API_ENDPOINTS.SUBSCRIPTION_PLAN.REMAINING_CREDITS);
  return response.data;
};
