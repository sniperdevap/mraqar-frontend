import axiosWrapper, { ApiResponse } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';

export interface ServiceLine {
  _id: string;
  name: string;
  description?: string;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetAllServiceLinesResponse {
  data: ServiceLine[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateServiceLineRequest {
  name: string;
  description?: string;
  price: number;
}

export interface UpdateServiceLineRequest {
  name?: string;
  description?: string;
  price?: number;
}

export const getAllServiceLines = async (page: number = 1, limit: number = 10, search?: string): Promise<ApiResponse<GetAllServiceLinesResponse>> => {
  return await axiosWrapper<GetAllServiceLinesResponse>('get', API_ENDPOINTS.SERVICE_LINE.GET_ALL, { page, limit, search });
};

export const createServiceLine = async (data: CreateServiceLineRequest): Promise<ApiResponse<ServiceLine>> => {
  return await axiosWrapper<ServiceLine>('post', API_ENDPOINTS.SERVICE_LINE.GET_ALL, data);
};

export const updateServiceLine = async (id: string, data: UpdateServiceLineRequest): Promise<ApiResponse<ServiceLine>> => {
  return await axiosWrapper<ServiceLine>('put', `${API_ENDPOINTS.SERVICE_LINE.GET_ALL}/${id}`, data);
};

export const deleteServiceLine = async (id: string): Promise<ApiResponse<void>> => {
  return await axiosWrapper<void>('delete', `${API_ENDPOINTS.SERVICE_LINE.GET_ALL}/${id}`);
};
