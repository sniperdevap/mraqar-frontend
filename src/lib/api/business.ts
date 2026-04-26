import axiosWrapper, { ApiResponse, axiosInstance } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import type { GetAllBusinessesResponse, GetBusinessStatsResponse } from '@/types/business';

export interface BusinessInfo {
  ownerName: string;
  businessName: string;
  businessAddress: string;
  phoneNumber: string;
  taxId: string;
  logoUrl: string;
}

export interface UpdateBusinessInfoRequest {
  ownerName?: string;
  businessName?: string;
  businessAddress?: string;
  phoneNumber?: string;
  taxId?: string;
  logoUrl?: string;
}

export const getAllBusinesses = async (page: number = 1, limit: number = 10, search?: string, status?: string): Promise<ApiResponse<GetAllBusinessesResponse>> => {
  return await axiosWrapper<GetAllBusinessesResponse>('get', API_ENDPOINTS.USER.GET_ALL_BUSINESSES, { page, limit, search, status });
};

export const getBusinessStats = async (): Promise<ApiResponse<GetBusinessStatsResponse>> => {
  return await axiosWrapper<GetBusinessStatsResponse>('get', API_ENDPOINTS.USER.GET_BUSINESS_STATS);
};

export const toggleUserStatus = async (userId: string): Promise<ApiResponse<{ userId: string; isActive: boolean }>> => {
  return await axiosWrapper<{ userId: string; isActive: boolean }>('patch', `${API_ENDPOINTS.USER.TOGGLE_USER_STATUS}/${userId}`);
};

export const getBusinessInfo = async (): Promise<ApiResponse<BusinessInfo>> => {
  return await axiosWrapper<BusinessInfo>('get', API_ENDPOINTS.PROFILE.GET_BUSINESS_INFO);
};

export const updateBusinessInfo = async (data: UpdateBusinessInfoRequest): Promise<ApiResponse<BusinessInfo>> => {
  return await axiosWrapper<BusinessInfo>('put', API_ENDPOINTS.PROFILE.UPDATE_BUSINESS_INFO, data);
};

export const uploadLogo = async (file: File): Promise<ApiResponse<{ fileUrl: string }>> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosInstance.post<ApiResponse<{ fileUrl: string }>>(`${API_ENDPOINTS.MEDIA.UPLOAD}?isPrivate=false`, formData, {
    headers: {
      // Don't set Content-Type - let browser set it with boundary for multipart/form-data
    },
  });

  return response.data;
};

export interface CustomizationData {
  supplierMarkupType: 'percentage' | 'amount';
  supplierMarkupValue: string;
  taxValue: string;
  warrantyText: string;
  termsAndConditions: string;
}

export interface UpdateCustomizationRequest {
  supplierMarkupType?: 'percentage' | 'amount';
  supplierMarkupValue?: string;
  taxValue?: string;
  warrantyText?: string;
  termsAndConditions?: string;
}

export const getCustomization = async (): Promise<ApiResponse<CustomizationData>> => {
  return await axiosWrapper<CustomizationData>('get', API_ENDPOINTS.CUSTOMIZATION.GET);
};

export const updateCustomization = async (data: UpdateCustomizationRequest): Promise<ApiResponse<CustomizationData>> => {
  return await axiosWrapper<CustomizationData>('put', API_ENDPOINTS.CUSTOMIZATION.UPDATE, data);
};
