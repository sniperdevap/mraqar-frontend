import axiosWrapper from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import { User } from '@/types/auth';

// Request Types
export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  phoneNumber: string;
  password: string;
}

// Response Types
export interface LoginResponse {
  token: string;
  user: User;
}

export type SignupResponse = User;

export interface ForgotPasswordRequest {
  phoneNumber: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface VerifyResetTokenRequest {
  token: string;
}

export interface VerifyResetTokenResponse {
  valid: boolean;
}

export interface VerifyOTPRequest {
  phoneNumber: string;
  code: string;
}

export interface VerifyOTPResponse {
  token: string;
  user: User;
}

// Auth API functions
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await axiosWrapper<LoginResponse>('post', API_ENDPOINTS.AUTH.SIGNIN, data);
  return response.data;
};

export const signup = async (data: SignupRequest): Promise<SignupResponse> => {
  const response = await axiosWrapper<SignupResponse>('post', API_ENDPOINTS.AUTH.SIGNUP, data);
  return response.data;
};

export const forgotPassword = async (data: ForgotPasswordRequest): Promise<void> => {
  await axiosWrapper('post', API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
};

export const resetPassword = async (data: ResetPasswordRequest): Promise<void> => {
  await axiosWrapper('post', API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
};

export const verifyResetToken = async (token: string): Promise<VerifyResetTokenResponse> => {
  const response = await axiosWrapper<VerifyResetTokenResponse>('get', API_ENDPOINTS.AUTH.VERIFY_RESET_TOKEN, { token });
  return response.data;
};

export const verifyOTP = async (data: VerifyOTPRequest): Promise<VerifyOTPResponse> => {
  const response = await axiosWrapper<VerifyOTPResponse>('post', API_ENDPOINTS.AUTH.VERIFY_OTP, data);
  return response.data;
};

export const resendOTP = async (phoneNumber: string): Promise<void> => {
  await axiosWrapper('post', API_ENDPOINTS.AUTH.RESEND_OTP, { phoneNumber });
};
