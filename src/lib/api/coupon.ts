import axiosWrapper, { ApiResponse } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';

export interface Coupon {
  _id: string;
  code: string;
  discountValue: number;
  userLimit: number;
  expiryDate: string;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllCouponsResponse {
  data: Coupon[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetCouponStatsResponse {
  total: number;
  active: number;
  inactive: number;
}

export interface CreateCouponRequest {
  code: string;
  discountValue: number;
  userLimit: number;
  expiryDate: string;
}

export interface UpdateCouponRequest {
  code?: string;
  discountValue?: number;
  userLimit?: number;
  expiryDate?: string;
  isActive?: boolean;
}

export interface ValidateCouponResponse {
  code: string;
  discountValue: number;
}
export const getAllCoupons = async (page: number = 1, limit: number = 10, search?: string, status?: string): Promise<ApiResponse<GetAllCouponsResponse>> => {
  return await axiosWrapper<GetAllCouponsResponse>('get', API_ENDPOINTS.COUPON.GET_ALL, { page, limit, search, status });
};

export const getCouponStats = async (): Promise<ApiResponse<GetCouponStatsResponse>> => {
  return await axiosWrapper<GetCouponStatsResponse>('get', API_ENDPOINTS.COUPON.GET_STATS);
};

export const getCouponById = async (id: string): Promise<ApiResponse<{ coupon: Coupon }>> => {
  return await axiosWrapper<{ coupon: Coupon }>('get', `${API_ENDPOINTS.COUPON.GET_ALL}/${id}`);
};

export const createCoupon = async (data: CreateCouponRequest): Promise<ApiResponse<{ coupon: Coupon }>> => {
  return await axiosWrapper<{ coupon: Coupon }>('post', API_ENDPOINTS.COUPON.GET_ALL, data);
};

export const updateCoupon = async (id: string, data: UpdateCouponRequest): Promise<ApiResponse<{ coupon: Coupon }>> => {
  return await axiosWrapper<{ coupon: Coupon }>('put', `${API_ENDPOINTS.COUPON.GET_ALL}/${id}`, data);
};

export const deleteCoupon = async (id: string): Promise<ApiResponse<void>> => {
  return await axiosWrapper<void>('delete', `${API_ENDPOINTS.COUPON.GET_ALL}/${id}`);
};

export const validateCoupon = async (code: string): Promise<ApiResponse<ValidateCouponResponse>> => {
  return await axiosWrapper<ValidateCouponResponse>('get', API_ENDPOINTS.COUPON.VALIDATE, { code });
};
