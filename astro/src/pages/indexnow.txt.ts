import type { APIRoute } from "astro";
/** IndexNow key file (Bing, Yandex, Seznam, Naver…). Set INDEXNOW_KEY to any 32+ character hex string. */
export const GET: APIRoute = () => {
  const key = process.env.INDEXNOW_KEY || import.meta.env.INDEXNOW_KEY;
  if (!key) return new Response("Not found", { status: 404 });
  return new Response(key, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
