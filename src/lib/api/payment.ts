import axiosWrapper from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';

export type Checkout = { free: true } | { free: false; url: string; trackId: string };

export interface Payment {
  _id: string;
  trackId: string;
  amount: number;
  quantity?: number;
  plan?: { name: string; nameAr: string; adCredits: number };
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  receiptNo?: string;
  errorCode?: string;
  createdAt: string;
}

export const createCheckout = async (planId: string, coupon?: string, quantity = 1): Promise<Checkout> => {
  const response = await axiosWrapper<Checkout>('post', API_ENDPOINTS.PAYMENT.CHECKOUT, { planId, coupon, quantity });
  return response.data;
};

export const submitToGateway = (checkout: { url: string }) => {
  window.location.href = checkout.url;
};

export const getMyPayments = async (): Promise<Payment[]> => {
  const response = await axiosWrapper<Payment[]>('get', API_ENDPOINTS.PAYMENT.MY_PAYMENTS);
  return response.data;
};
