import axiosWrapper from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import { Ad, GetAdsParams } from '@/types/ad';

export interface Office {
  publicId?: number;
  _id: string;
  name: string;
  phoneNumber: string;
  avatar?: string;
  instagram?: string;
  tiktok?: string;
  description?: string;
  email?: string;
  twitter?: string;
  adsCount?: number;
}

export const officeHref = (office: { publicId?: number; _id: string }) =>
  `/offices/${office.publicId ?? office._id}`;

export interface GetOfficesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetOfficesResult {
  offices: Office[];
  total: number;
  page: number;
  totalPages: number;
}

export interface GetOfficeByIdResult {
  office: Office;
  ads: Ad[];
  totalAds: number;
  page: number;
  totalPages: number;
}

// Get all offices
export const getOffices = async (params?: GetOfficesParams): Promise<GetOfficesResult> => {
  const response = await axiosWrapper<GetOfficesResult>('get', API_ENDPOINTS.OFFICE.GET_ALL, params);
  return response.data;
};

// Get office by ID with ads
export const getOfficeById = async (id: string, adFilters?: GetAdsParams): Promise<GetOfficeByIdResult> => {
  const response = await axiosWrapper<GetOfficeByIdResult>('get', API_ENDPOINTS.OFFICE.GET_BY_ID(id), adFilters);
  return response.data;
};
