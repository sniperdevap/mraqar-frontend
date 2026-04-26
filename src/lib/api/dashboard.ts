import axiosWrapper, { ApiResponse } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';

export interface DashboardStatsResponse {
  totalSubscriptions: number;
  totalBusinesses: number;
  totalCoupons: number;
}

export const getDashboardStats = async (): Promise<ApiResponse<DashboardStatsResponse>> => {
  return await axiosWrapper<DashboardStatsResponse>('get', API_ENDPOINTS.DASHBOARD.GET_STATS);
};
