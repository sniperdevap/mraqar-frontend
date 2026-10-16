import type { APIRoute } from "astro";
import { apiPost, kwPhone, setSession, safeNext } from "@/lib/auth";

/** Google sign-in from the Astro pages: verifies through the API and stores the session cookies. */
export const POST: APIRoute = async ({ request, cookies, url }) => {
  const body = (await request.json().catch(() => ({}))) as Record<string, string>;
  if (!body.credential) return Response.json({ ok: false }, { status: 400 });
  const phoneNumber = body.phone ? kwPhone(body.phone) : undefined;
  if (body.phone && !phoneNumber) return Response.json({ ok: false, message: "phone" }, { status: 400 });
  const r = await apiPost("/users/google", {
    credential: body.credential, phoneNumber,
    name: body.name || undefined, accountType: body.accountType || undefined,
    userType: body.userType || undefined, licenseNumber: body.licenseNumber || undefined,
  });
  if (!r.ok) return Response.json({ ok: false, message: r.message }, { status: r.status || 502 });
  if (r.data?.needsPhone) return Response.json({ ok: true, needsPhone: true, name: r.data.name });
  setSession(cookies, r.data.token, r.data.user, url.protocol === "https:" || request.headers.get("x-forwarded-proto") === "https");
  return Response.json({ ok: true, redirect: r.data.user?.role === "super_admin" ? "/admin" : safeNext(body.next) });
};
