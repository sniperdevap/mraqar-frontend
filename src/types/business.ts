import { PaginationResponse } from './common';

export interface BusinessApiResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  subscription?: {
    _id: string;
    stripeSubscriptionId: string;
    startDate: string;
    endDate: string;
    status: string;
    amount: number;
  } | null;
  profile?: {
    _id: string;
    businessName: string;
    businessAddress?: string;
    phoneNumber?: string;
    taxId?: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllBusinessesResponse {
  data: BusinessApiResponse[];
  pagination: PaginationResponse;
}

export interface GetBusinessStatsResponse {
  total: number;
  active: number;
  inactive: number;
}
