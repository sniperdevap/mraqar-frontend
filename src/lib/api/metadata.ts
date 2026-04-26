import axiosWrapper from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';

export interface PropertyType {
  _id: string;
  label: string;
  labelAr: string;
  value: string;
  order: number;
}

export interface Area {
  _id: string;
  label: string;
  labelAr: string;
  value: string;
  governorate: string;
  governorateAr: string;
  order: number;
}

export const getPropertyTypes = async (): Promise<PropertyType[]> => {
  const response = await axiosWrapper<PropertyType[]>('get', API_ENDPOINTS.METADATA.PROPERTY_TYPES);
  return response.data;
};

export const getAreas = async (): Promise<Area[]> => {
  const response = await axiosWrapper<Area[]>('get', API_ENDPOINTS.METADATA.AREAS);
  return response.data;
};
