import axiosWrapper from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import { GetAdsParams, GetAdsResult, Ad, DetailAd } from '@/types/ad';

export interface CreateAdRequest {
  purpose: 'sale' | 'rent' | 'exchange';
  propertyType: number;
  area: number;
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
  const normalizedParams = params
    ? {
        ...params,
        ...(params.propertyType ? { propertyType: Number(params.propertyType) } : {}),
        ...(params.area
          ? { area: Array.isArray(params.area) ? params.area.map(Number) : Number(params.area) }
          : {}),
      }
    : undefined;
  const response = await axiosWrapper<GetAdsResult>('get', API_ENDPOINTS.AD.GET_ALL, normalizedParams);
  return response.data;
};

export const getAdById = async (id: string): Promise<DetailAd> => {
  const response = await axiosWrapper<DetailAd>('get', API_ENDPOINTS.AD.GET_BY_ID(id));
  return response.data;
};

export const getMyAds = async (): Promise<Ad[]> => {
  const response = await axiosWrapper<Ad[]>('get', API_ENDPOINTS.AD.MY_ADS);
  return response.data;
};

export const updateAd = async (id: number, data: Partial<CreateAdRequest> & { status?: string; premiumAd?: boolean; isPremium?: boolean }, userId?: string) => {
  const url = userId ? `${API_ENDPOINTS.AD.UPDATE(id)}?userId=${userId}` : API_ENDPOINTS.AD.UPDATE(id);
  const response = await axiosWrapper('put', url, data);
  return response.data;
};

export const repostAd = async (id: number) => {
  const response = await axiosWrapper('post', API_ENDPOINTS.AD.REPOST(id));
  return response.data;
};

export const deleteAd = async (id: number) => {
  const response = await axiosWrapper('delete', API_ENDPOINTS.AD.DELETE(id));
  return response.data;
};
