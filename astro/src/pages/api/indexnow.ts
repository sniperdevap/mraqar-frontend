import type { APIRoute } from "astro";
import { getAd, getAreas } from "@/lib/api";
import { adHref } from "@/lib/ad-url";
import { localePath } from "@/lib/i18n";

/**
 * POST /api/indexnow  (Authorization: Bearer $INDEXNOW_SECRET)
 * body: { ids?: number[], paths?: string[] }
 * The backend calls this when an ad is published, edited or removed. Each ad is
 * submitted in Arabic and English to IndexNow, which shares it with Bing, Yandex
 * and the other participating engines within minutes. Google finds it through
 * sitemap-latest.xml and the feed.
 */
export const POST: APIRoute = async ({ request, site }) => {
  const key = process.env.INDEXNOW_KEY || import.meta.env.INDEXNOW_KEY;
  const secret = process.env.INDEXNOW_SECRET || import.meta.env.INDEXNOW_SECRET;
  if (!key || !secret) return new Response("IndexNow is not configured", { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { ids?: Array<number | string>; paths?: string[] };
  const origin = site!.origin;
  const paths = new Set<string>((body.paths || []).filter((p) => typeof p === "string" && p.startsWith("/")));
  if (body.ids?.length) {
    const areas = await getAreas("ar").catch(() => []);
    for (const id of body.ids.slice(0, 500)) {
      const ad = await getAd(String(id), "ar").catch(() => null);
      paths.add(ad ? adHref(ad, areas) : `/ads/${id}`);
    }
  }
  const urlList = [...paths].flatMap((p) => [origin + localePath(p, "ar"), origin + localePath(p, "en")]).slice(0, 10000);
  if (!urlList.length) return Response.json({ submitted: 0 });

  const r = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: new URL(origin).host, key, keyLocation: `${origin}/indexnow.txt`, urlList }),
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  return Response.json({ submitted: urlList.length, status: r?.status ?? 0 });
};
