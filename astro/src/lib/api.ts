/**
 * Server-side client for the Mr Aqar API (Express today, Laravel later —
 * both expose the same /api/v1 endpoints and { success, message, data } shape).
 */

const API_URL = (import.meta.env.API_URL || process.env.API_URL || "http://localhost:4064/api/v1").replace(/\/$/, "");
export const IMAGE_HOST = (import.meta.env.IMAGE_HOST || process.env.IMAGE_HOST || "").replace(/\/$/, "");

export type Lang = "ar" | "en";

export interface Area {
  id: number; publicId?: number; _id: string; label: string; labelAr: string; value: string;
  governorate: string; governorateAr: string;
}
export interface PropertyType { id: number; publicId?: number; _id: string; label: string; labelAr: string; value: string }
export interface Media { _id: string; url: string; type: "image" | "video"; thumbnail?: string }
export interface AdUser { publicId?: number; _id: string; name: string; phoneNumber: string; avatar?: string }
export interface Ad {
  id: number; _id: string; user: AdUser; purpose: "sale" | "rent" | "exchange";
  propertyType: PropertyType; area: Partial<Area> & { id: number; label: string; labelAr: string; value: string };
  price: number; priceUnit?: "kd" | "thousand"; phoneNumber: string; isPhoneHidden: boolean;
  premiumAd?: boolean; isPremium?: boolean; description: string; media: Media[];
  status: "active" | "inactive" | "sold"; views?: number; createdAt: string; updatedAt: string; isOffice?: boolean;
}
export interface AdsPage { ads: Ad[]; total: number; page: number; totalPages: number }
export interface Office { publicId?: number; _id: string; name: string; phoneNumber: string; avatar?: string; description?: string; instagram?: string; tiktok?: string; adsCount?: number }
export interface OfficesPage { offices: Office[]; total: number; page: number; totalPages: number }
export interface OfficeDetail { office: Office; ads: Ad[]; totalAds: number; page: number; totalPages: number }

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

type Query = Record<string, string | number | undefined | null | Array<string | number>>;

const qs = (params?: Query) => {
  if (!params) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v)) v.forEach((x) => sp.append(k, String(x)));
    else sp.append(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
};

// Small in-process cache: metadata changes rarely, lists change by the minute.
const cache = new Map<string, { at: number; value: unknown }>();

async function get<T>(path: string, params?: Query, opts: { lang?: Lang; ttl?: number; timeout?: number } = {}): Promise<T> {
  const url = `${API_URL}${path}${qs(params)}`;
  const key = `${opts.lang || ""}|${url}`;
  const hit = cache.get(key);
  if (opts.ttl && hit && Date.now() - hit.at < opts.ttl * 1000) return hit.value as T;

  const res = await fetch(url, {
    headers: { Accept: "application/json", ...(opts.lang ? { "Accept-Language": opts.lang } : {}) },
    signal: AbortSignal.timeout(opts.timeout ?? 4000),
  });
  if (!res.ok) throw new ApiError(res.status, `API ${res.status} for ${path}`);
  const body = (await res.json()) as { data: T };
  if (opts.ttl) cache.set(key, { at: Date.now(), value: body.data });
  return body.data;
}

const normalizeIds = <T extends { id?: number; publicId?: number }>(items: T[]) =>
  items.map((it) => ({ ...it, id: Number(it.publicId ?? it.id) })) as Array<T & { id: number }>;

export const getAreas = async (lang: Lang) => normalizeIds(await get<Area[]>("/metadata/areas", undefined, { lang, ttl: 3600 }));
export const getPropertyTypes = async (lang: Lang) =>
  normalizeIds(await get<PropertyType[]>("/metadata/property-types", undefined, { lang, ttl: 3600 }));

export const getAds = (params: { page?: number; limit?: number; purpose?: string; propertyType?: string; area?: string[]; minPrice?: number; maxPrice?: number; status?: string }, lang: Lang) =>
  get<AdsPage>("/ads", params as Query, { lang, ttl: 30 });

export const getAd = (id: string, lang: Lang) => get<Ad>(`/ads/${id}`, undefined, { lang, ttl: 30 });

export const countAdView = (id: string, forwardedFor?: string) =>
  fetch(`${API_URL}/ads/${id}/view`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(forwardedFor ? { "X-Forwarded-For": forwardedFor } : {}) },
    signal: AbortSignal.timeout(2000),
  }).catch(() => undefined);

export const getOffices = (params: { page?: number; limit?: number; search?: string }, lang: Lang) =>
  get<OfficesPage>("/offices", params as Query, { lang, ttl: 120 });

export const getOffice = (id: string, params: { page?: number; limit?: number; purpose?: string; propertyType?: string; area?: string[] }, lang: Lang) =>
  get<OfficeDetail>(`/offices/${id}`, params as Query, { lang, ttl: 60 });

/** Absolute URL for an ad photo or video thumbnail. */
export function mediaUrl(m?: Media | null, preferThumb = false): string {
  if (!m) return "/DefaultAdImage.jpeg";
  const path = (m.type === "video" || preferThumb) && m.thumbnail ? m.thumbnail : m.url;
  if (!path) return "/DefaultAdImage.jpeg";
  return path.startsWith("http") ? path : `${IMAGE_HOST}/${path.replace(/^\/+/, "")}`;
}
