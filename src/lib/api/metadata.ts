import axiosWrapper from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';

export interface PropertyType {
  id: number;
  publicId?: number;
  _id: string;
  label: string;
  labelAr: string;
  value: string;
  order: number;
}

export interface Area {
  id: number;
  publicId?: number;
  _id: string;
  label: string;
  labelAr: string;
  value: string;
  governorate: string;
  governorateAr: string;
  order: number;
}

export const getPropertyTypes = async (): Promise<PropertyType[]> => {
  const response = await axiosWrapper<Array<PropertyType & { id?: number }>>('get', API_ENDPOINTS.METADATA.PROPERTY_TYPES);
  return normalizeMetadataIds(response.data, 'property type');
};

export const getAreas = async (): Promise<Area[]> => {
  const response = await axiosWrapper<Array<Area & { id?: number }>>('get', API_ENDPOINTS.METADATA.AREAS);
  return normalizeMetadataIds(response.data, 'area');
};

const normalizeMetadataIds = <T extends { id?: number; publicId?: number }>(items: T[], entityName: string): Array<T & { id: number }> => {
  const seen = new Set<number>();

  return items.map(item => {
    const id = Number(item.publicId ?? item.id);
    if (!Number.isSafeInteger(id) || id < 1) {
      throw new Error(`Invalid ${entityName} ID returned by the server`);
    }
    if (seen.has(id)) {
      throw new Error(`Duplicate ${entityName} ID returned by the server`);
    }
    seen.add(id);
    return { ...item, id };
  });
};
