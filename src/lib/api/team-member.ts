import axiosWrapper, { ApiResponse } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import type { TeamMember } from '@/types/team';

export type { TeamMember };

export interface GetAllTeamMembersResponse {
  data: TeamMember[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetTeamMemberStatsResponse {
  total: number;
  active: number;
  inactive: number;
}

export interface CreateTeamMemberRequest {
  name: string;
  email: string;
  canEditQuoteServiceLineItem?: boolean;
}

export interface UpdateTeamMemberRequest {
  name?: string;
  email?: string;
  canEditQuoteServiceLineItem?: boolean;
  isActive?: boolean;
}

export const getAllTeamMembers = async (page: number = 1, limit: number = 10, search?: string, status?: string): Promise<ApiResponse<GetAllTeamMembersResponse>> => {
  return await axiosWrapper<GetAllTeamMembersResponse>('get', API_ENDPOINTS.TEAM_MEMBER.GET_ALL, { page, limit, search, status });
};

export const getTeamMemberStats = async (): Promise<ApiResponse<GetTeamMemberStatsResponse>> => {
  return await axiosWrapper<GetTeamMemberStatsResponse>('get', API_ENDPOINTS.TEAM_MEMBER.GET_STATS);
};

export const createTeamMember = async (data: CreateTeamMemberRequest): Promise<ApiResponse<TeamMember>> => {
  return await axiosWrapper<TeamMember>('post', API_ENDPOINTS.TEAM_MEMBER.GET_ALL, data);
};

export const updateTeamMember = async (id: string, data: UpdateTeamMemberRequest): Promise<ApiResponse<TeamMember>> => {
  return await axiosWrapper<TeamMember>('put', `${API_ENDPOINTS.TEAM_MEMBER.GET_ALL}/${id}`, data);
};

export const deleteTeamMember = async (id: string): Promise<ApiResponse<void>> => {
  return await axiosWrapper<void>('delete', `${API_ENDPOINTS.TEAM_MEMBER.GET_ALL}/${id}`);
};
