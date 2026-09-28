import axiosWrapper, { ApiResponse } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';

export interface InvoiceSubscription {
  _id: string;
  startDate: string;
  endDate: string;
  status: string;
  amount: number;
  canceledAt?: string;
}

export interface InvoiceCoupon {
  couponId: string;
  code: string;
  discountValue: number;
}

export interface Invoice {
  _id: string;
  userId: string;
  subscriptionId: InvoiceSubscription | string;
  amount: number;
  invoiceUrl: string;
  createdDate: string;
  createdAt: string;
  status: string;
  coupon?: InvoiceCoupon | null;
}

export interface GetUserInvoicesResponse {
  data: Invoice[];
}

export const getUserInvoices = async (userId?: string, search?: string): Promise<ApiResponse<GetUserInvoicesResponse>> => {
  return await axiosWrapper<GetUserInvoicesResponse>('get', API_ENDPOINTS.INVOICE.GET_USER_INVOICES, { userId, search });
};
