import type { APIRoute } from "astro";

const API_URL = (import.meta.env.API_URL || process.env.API_URL || "http://localhost:4064/api/v1").replace(/\/$/, "");
const REASONS = new Set(["fraud", "wrong", "sold", "other"]);

/**
 * "Report this ad". Forwards to the backend's POST /ads/{id}/report
 * (added in the Laravel backend); if the backend doesn't have it yet the
 * report is written to the server log so nothing is lost.
 */
export const POST: APIRoute = async ({ params, request, clientAddress }) => {
  const form = await request.formData();
  const reason = String(form.get("reason") || "other");
  const details = String(form.get("details") || "").slice(0, 500);
  if (!/^\d+$/.test(params.id || "") || !REASONS.has(reason)) return new Response(null, { status: 400 });
  const body = JSON.stringify({ reason, details });
  const res = await fetch(`${API_URL}/ads/${params.id}/report`, {
    method: "POST", headers: { "Content-Type": "application/json", "X-Forwarded-For": clientAddress }, body, signal: AbortSignal.timeout(3000),
  }).catch(() => null);
  if (!res || !res.ok) console.warn("[ad-report]", JSON.stringify({ ad: params.id, reason, details, at: new Date().toISOString() }));
  return new Response(null, { status: 204 });
};
