import { API_ENDPOINTS } from "@/lib/constants/api";
import type { Ad, GetAdsParams, GetAdsResult, DetailAd } from "@/types/ad";
import type { Area, PropertyType } from "@/lib/api/metadata";
import type {
  GetOfficeByIdResult,
  GetOfficesParams,
  GetOfficesResult,
} from "@/lib/api/office";
import type { SubscriptionPlan } from "@/lib/api/subscription-plan";
import type { UserSubscription } from "@/lib/api/subscription-plan";
import type {
  GetNotificationsResult,
  Profile,
  Wishlist,
} from "@/lib/api/account";
import { cache } from "react";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type ServerFetchOptions = {
  locale?: string;
  revalidate?: number;
  timeoutMs?: number;
};

const buildQueryString = (params?: object) => {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") {
          searchParams.append(key, String(item));
        }
      });
      return;
    }

    searchParams.append(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

const getApiBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
  return baseUrl.replace(/\/$/, "");
};

export async function serverApiGet<T>(
  endpoint: string,
  params?: object,
  options?: ServerFetchOptions,
): Promise<T> {
  const url = `${getApiBaseUrl()}${endpoint}${buildQueryString(params)}`;
  const timeoutMs = options?.timeoutMs ?? 2000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options?.locale ? { "Accept-Language": options.locale } : {}),
      },
      next: { revalidate: options?.revalidate ?? 60 },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Server API request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as ApiResponse<T>;
    return payload.data;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function serverApiPost<T>(
  endpoint: string,
  options?: ServerFetchOptions & { forwardedFor?: string },
): Promise<T> {
  const url = `${getApiBaseUrl()}${endpoint}`;
  const timeoutMs = options?.timeoutMs ?? 2000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(options?.locale ? { "Accept-Language": options.locale } : {}),
        // Forward the real visitor IP — this fetch runs on the Next.js
        // server, so without it the backend's per-viewer dedup would see
        // every visitor as this server's own IP.
        ...(options?.forwardedFor
          ? { "X-Forwarded-For": options.forwardedFor }
          : {}),
      },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Server API request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as ApiResponse<T>;
    return payload.data;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function privateServerApiGet<T>(
  endpoint: string,
  token: string,
  params?: object,
  locale?: string,
): Promise<T> {
  const url = `${getApiBaseUrl()}${endpoint}${buildQueryString(params)}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(locale ? { "Accept-Language": locale } : {}),
      },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Private server API request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as ApiResponse<T>;
    return payload.data;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const countServerAdView = (
  id: string,
  locale?: string,
  forwardedFor?: string,
) =>
  serverApiPost<{ counted: boolean; views: number }>(API_ENDPOINTS.AD.VIEW(id), {
    locale,
    forwardedFor,
  });

export const getServerPropertyTypes = (locale?: string) =>
  serverApiGet<PropertyType[]>(API_ENDPOINTS.METADATA.PROPERTY_TYPES, undefined, {
    locale,
  });

export const getServerAreas = (locale?: string) =>
  serverApiGet<Area[]>(API_ENDPOINTS.METADATA.AREAS, undefined, {
    locale,
  });

export const getServerAds = (params?: GetAdsParams, locale?: string) =>
  serverApiGet<GetAdsResult>(API_ENDPOINTS.AD.GET_ALL, params, {
    locale,
  });

export const getServerAdById = (id: string, locale?: string) =>
  serverApiGet<DetailAd>(API_ENDPOINTS.AD.GET_BY_ID(id), undefined, {
    locale,
  });

// generateMetadata and the page render both need the same ad. React cache is
// request-scoped on the server, so this removes the duplicate API round trip
// without sharing ad data between visitors or changing its revalidation.
export const getCachedServerAdById = cache(getServerAdById);

export const getServerOffices = (params?: GetOfficesParams, locale?: string) =>
  serverApiGet<GetOfficesResult>(API_ENDPOINTS.OFFICE.GET_ALL, params, {
    locale,
  });

export const getServerOfficeById = (
  id: string,
  adFilters?: GetAdsParams,
  locale?: string,
) =>
  serverApiGet<GetOfficeByIdResult>(
    API_ENDPOINTS.OFFICE.GET_BY_ID(id),
    adFilters,
    {
      locale,
    },
  );

export const getServerSubscriptionPlans = (locale?: string) =>
  serverApiGet<SubscriptionPlan[]>(
    API_ENDPOINTS.SUBSCRIPTION_PLAN.GET_ALL,
    undefined,
    {
      locale,
    },
  );

export const getServerSubscriptionPlanById = (id: string, locale?: string) =>
  serverApiGet<SubscriptionPlan>(
    API_ENDPOINTS.SUBSCRIPTION_PLAN.GET_BY_ID(id),
    undefined,
    {
      locale,
    },
  );

export const getPrivateServerProfile = (token: string, locale?: string) =>
  privateServerApiGet<Profile>(API_ENDPOINTS.ACCOUNT.PROFILE, token, undefined, locale);

export const getPrivateServerSubscriptions = (token: string, locale?: string) =>
  privateServerApiGet<UserSubscription[]>(
    API_ENDPOINTS.SUBSCRIPTION_PLAN.MY_SUBSCRIPTIONS,
    token,
    undefined,
    locale,
  );

export const getPrivateServerMyAds = (token: string, locale?: string) =>
  privateServerApiGet<Ad[]>(API_ENDPOINTS.AD.MY_ADS, token, undefined, locale);

export const getPrivateServerWishlists = (token: string, locale?: string) =>
  privateServerApiGet<Wishlist[]>(
    API_ENDPOINTS.ACCOUNT.WISHLIST.GET_ALL,
    token,
    undefined,
    locale,
  );

export const getPrivateServerFavorites = async (token: string, locale?: string) => {
  const result = await privateServerApiGet<{
    favorites: Ad[];
    total: number;
    page: number;
    totalPages: number;
  }>(API_ENDPOINTS.ACCOUNT.FAVORITES.GET_ALL, token, { page: 1, limit: 12 }, locale);

  return {
    ads: result.favorites || [],
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
  } satisfies GetAdsResult;
};

export const getPrivateServerNotifications = (token: string, locale?: string) =>
  privateServerApiGet<GetNotificationsResult>(
    API_ENDPOINTS.ACCOUNT.NOTIFICATIONS.GET_ALL,
    token,
    { page: 1, limit: 15 },
    locale,
  );

export const getPrivateServerAdById = (id: string, token: string, locale?: string) =>
  privateServerApiGet<Ad>(API_ENDPOINTS.AD.GET_BY_ID(id), token, undefined, locale);
