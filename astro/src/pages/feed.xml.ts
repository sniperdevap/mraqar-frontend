import type { APIRoute } from "astro";
import { getAds, getAreas, mediaUrl } from "@/lib/api";
import { adHref } from "@/lib/ad-url";
import { adTitle, formatPrice } from "@/lib/i18n";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Atom feed of the 100 newest ads. Submit it in Google Search Console next to
 * sitemap.xml: Google re-reads feeds often, so new ads get found within hours.
 */
export const GET: APIRoute = async ({ site }) => {
  const origin = site!.origin;
  const [areas, r] = await Promise.all([getAreas("ar").catch(() => []), getAds({ page: 1, limit: 100, status: "active" }, "ar").catch(() => null)]);
  const ads = r?.ads ?? [];
  const updated = ads[0]?.createdAt ?? new Date().toISOString();
  const entries = ads.map((ad) => {
    const url = origin + adHref(ad, areas);
    const title = adTitle(ad, "ar");
    const price = formatPrice(ad, "ar");
    const img = mediaUrl(ad.media?.[0], true);
    return `<entry><id>${esc(url)}</id><title>${esc(title + (price ? ` — ${price}` : ""))}</title><link href="${esc(url)}"/><published>${ad.createdAt}</published><updated>${ad.createdAt}</updated><summary>${esc((ad.description || title).slice(0, 300))}</summary>${img.startsWith("http") ? `<link rel="enclosure" type="image/jpeg" href="${esc(img)}"/>` : ""}</entry>`;
  });
  const xml = `<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="ar"><id>${origin}/</id><title>مستر عقار — أحدث الإعلانات</title><link href="${origin}/feed.xml" rel="self"/><link href="${origin}/"/><updated>${updated}</updated>${entries.join("")}</feed>`;
  return new Response(xml, { headers: { "Content-Type": "application/atom+xml; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=300" } });
};
