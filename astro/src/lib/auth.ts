/**
 * Sign-in for the Astro pages. The session is the same pair of cookies the
 * Next.js app uses (auth-token, auth-user), so signing in here also signs the
 * visitor in on /account, /ads/create and the other pages still on Next.
 */
import type { AstroCookies } from "astro";

const API_URL = (import.meta.env.API_URL || process.env.API_URL || "http://localhost:4064/api/v1").replace(/\/$/, "");
const DAYS = 400;

export type ApiResult<T = any> = { ok: boolean; status: number; data?: T; message?: string; code?: string };

export async function apiPost<T = any>(path: string, body: unknown, lang = "ar"): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", "Accept-Language": lang },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    const json = (await res.json().catch(() => ({}))) as { data?: T; message?: string; code?: string; errorCode?: string };
    return { ok: res.ok, status: res.status, data: json.data, message: json.message, code: json.code || json.errorCode };
  } catch {
    return { ok: false, status: 0, message: "network" };
  }
}

export const kwPhone = (raw: string) => {
  const d = (raw || "").replace(/\D/g, "").replace(/^(00)?965/, "");
  return /^\d{8}$/.test(d) ? `+965${d}` : "";
};

export function setSession(cookies: AstroCookies, token: string, user: Record<string, unknown>, secure: boolean) {
  const opts = { path: "/", maxAge: DAYS * 86400, sameSite: "lax" as const, secure, httpOnly: false };
  cookies.set("auth-token", token, opts);
  // Keep the user cookie small (browsers cap cookies at ~4 KB).
  const { password, __v, ...rest } = user as Record<string, unknown>;
  cookies.set("auth-user", JSON.stringify(rest), opts);
}

export const signedIn = (cookies: AstroCookies) => Boolean(cookies.get("auth-token")?.value);

export const safeNext = (next: string | null | undefined) => (next && next.startsWith("/") && !next.startsWith("//") ? next : "/");
