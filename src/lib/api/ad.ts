import axiosWrapper from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import { GetAdsParams, GetAdsResult, Ad, DetailAd } from '@/types/ad';

export interface CreateAdRequest {
  purpose: 'sale' | 'rent' | 'exchange';
  propertyType: string;
  area: string;
  price?: number;
  phoneNumber: string;
  isPhoneHidden?: boolean;
  alternativePhoneNumber?: string;
  premiumAd?: boolean;
  isPremium?: boolean;
  description: string;
  media: string[];
}

export const createAd = async (data: CreateAdRequest, userId?: string) => {
  const url = userId ? `${API_ENDPOINTS.AD.CREATE}?userId=${userId}` : API_ENDPOINTS.AD.CREATE;
  const response = await axiosWrapper('post', url, data);
  return response.data;
};

export const getAds = async (params?: GetAdsParams): Promise<GetAdsResult> => {
  const response = await axiosWrapper<GetAdsResult>('get', API_ENDPOINTS.AD.GET_ALL, params);
  return response.data;
};

export const getAdById = async (id: string, increment: boolean = false): Promise<DetailAd> => {
  const response = await axiosWrapper<DetailAd>('get', `${API_ENDPOINTS.AD.GET_BY_ID(id)}${increment ? '?increment=true' : ''}`);
  return response.data;
};

export const getMyAds = async (): Promise<Ad[]> => {
  const response = await axiosWrapper<Ad[]>('get', API_ENDPOINTS.AD.MY_ADS);
  return response.data;
};

export const updateAd = async (id: string, data: Partial<CreateAdRequest> & { status?: string; premiumAd?: boolean; isPremium?: boolean }, userId?: string) => {
  const url = userId ? `${API_ENDPOINTS.AD.UPDATE(id)}?userId=${userId}` : API_ENDPOINTS.AD.UPDATE(id);
  const response = await axiosWrapper('put', url, data);
  return response.data;
};

export const deleteAd = async (id: string) => {
  const response = await axiosWrapper('delete', API_ENDPOINTS.AD.DELETE(id));
  return response.data;
};
