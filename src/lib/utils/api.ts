import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { ROUTES } from '@/constants/routes';
import AR_API_MESSAGES from '../../../public/locales/ar/api.json';

const translateApiMessage = (message: string): string => {
  if ((Cookies.get('NEXT_LOCALE') ?? 'ar') !== 'ar') return message;
  return (AR_API_MESSAGES as Record<string, string>)[message] ?? message;
};

// Custom params serializer to handle arrays properly (without brackets)
const paramsSerializer = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();

  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(item => {
        if (item !== undefined && item !== null) {
          searchParams.append(key, String(item));
        }
      });
    } else {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
};

// Create axios instance with base configuration
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 300000, // 5 minutes default timeout (300s)
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: paramsSerializer,
});

// Request interceptor to attach token
axiosInstance.interceptors.request.use(
  config => {
    const token = Cookies.get('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const locale = Cookies.get('NEXT_LOCALE');
    if (locale) {
      config.headers['Accept-Language'] = locale;
    }
    // For FormData, remove Content-Type to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Constants for error handling
const SUBSCRIPTION_ERROR_KEYWORDS = ['subscription', 'past_due', 'unpaid', 'canceled'] as const;

// Custom error class for subscription errors (to prevent component error handling)
class SubscriptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubscriptionError';
  }
}

export const getErrorCode = (error: unknown): string | undefined => {
  // Check if error has code property (from axiosWrapper)
  if (error && typeof error === 'object' && 'code' in error) {
    return (error as { code?: string }).code;
  }
  // Check if it's an AxiosError with response
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<ApiResponse>;
    return axiosError.response?.data?.code;
  }
  return undefined;
};

export const getErrorData = <T = unknown>(error: unknown): T | undefined => {
  if (error && typeof error === 'object' && 'data' in error) {
    return (error as { data?: T }).data;
  }
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<ApiResponse<T>>;
    return axiosError.response?.data?.data;
  }
  return undefined;
};

const isSubscriptionError = (status: number | undefined, errorMessage: string): boolean => {
  if (status !== 403) return false;
  return SUBSCRIPTION_ERROR_KEYWORDS.some(keyword => errorMessage.toLowerCase().includes(keyword));
};

const clearAuthData = (): void => {
  Cookies.remove('auth-token');
  Cookies.remove('auth-user');
};

const redirectIfNeeded = (route: string): void => {
  if (typeof window === 'undefined') return;
  if (window.location.pathname.includes(route)) return;
  window.location.href = route;
};

const handleUnauthorizedError = (): void => {
  clearAuthData();
  redirectIfNeeded(ROUTES.SIGNIN);
};

const handleSubscriptionError = (): void => {
  redirectIfNeeded(ROUTES.BUSINESS_SETTINGS);
};

const handleForbiddenError = (): void => {
  clearAuthData();
  redirectIfNeeded(ROUTES.SIGNIN);
};

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.message || '';

    if (status === 401) {
      handleUnauthorizedError();
      return Promise.reject(error);
    } else if (isSubscriptionError(status, errorMessage)) {
      handleSubscriptionError();
      // Throw custom error to prevent component error handling
      return Promise.reject(new SubscriptionError(errorMessage));
    } else if (status === 403) {
      handleForbiddenError();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// API Response type
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  code?: string;
}

// Axios wrapper function
const axiosWrapper = async <T = unknown>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  data?: unknown,
  token?: string | null,
  options?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  const config: AxiosRequestConfig = {
    method,
    url,
    ...options,
  };

  // Attach token if provided (overrides interceptor)
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  // Attach data based on method
  if (method === 'get') {
    config.params = data;
  } else {
    config.data = data;
  }

  try {
    const response: AxiosResponse<ApiResponse<T>> = await axiosInstance.request(config);
    return response.data;
  } catch (error) {
    if (error instanceof SubscriptionError) {
      return { success: false, message: '', data: null } as ApiResponse<T>;
    }

    const axiosError = error as AxiosError<ApiResponse>;

    // Extract error message from backend response
    if (axiosError.response?.data) {
      const errorData = axiosError.response.data;
      const errorMessage = translateApiMessage(errorData.message || 'An error occurred');
      const error = new Error(errorMessage);
      // Attach error code to preserve it
      if (errorData.code) {
        (error as Error & { code?: string }).code = errorData.code;
      }
      (error as Error & { data?: unknown }).data = errorData.data;
      throw error;
    }

    // Handle network errors or other axios errors
    if (axiosError.message) {
      throw new Error(translateApiMessage(axiosError.message));
    }

    throw new Error(translateApiMessage('Network error occurred'));
  }
};

// Utility function to extract error message from axios errors
export const getErrorMessage = (error: unknown, defaultMessage = translateApiMessage('An error occurred')): string => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    const { message, data } = error.response.data;
    const issues = Array.isArray(data)
      ? data
          .map((issue: { path?: unknown[]; message?: string }) => {
            const text = issue?.message ? translateApiMessage(issue.message) : undefined;
            return issue?.path?.length ? `${issue.path[issue.path.length - 1]}: ${text}` : text;
          })
          .filter(Boolean)
      : [];
    const translated = translateApiMessage(message);
    return issues.length ? `${translated} — ${issues.join(', ')}` : translated;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
};

export default axiosWrapper;
