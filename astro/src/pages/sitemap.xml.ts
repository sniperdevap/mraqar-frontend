import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getAds, getAreas, getOffices, mediaUrl } from "@/lib/api";
import { adHref } from "@/lib/ad-url";
import { areaGuidePath } from "@/lib/area-guides";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** One sitemap with every live ad (and its photo), office, blog post and key search page. */
export const GET: APIRoute = async ({ site }) => {
  const origin = site!.origin;
  const urls: string[] = [];
  const add = (loc: string, opts: { lastmod?: string; freq?: string; priority?: number; image?: string } = {}) =>
    urls.push(`<url><loc>${esc(origin + loc)}</loc>${opts.lastmod ? `<lastmod>${opts.lastmod}</lastmod>` : ""}${opts.freq ? `<changefreq>${opts.freq}</changefreq>` : ""}${opts.priority ? `<priority>${opts.priority}</priority>` : ""}${opts.image ? `<image:image><image:loc>${esc(opts.image)}</image:loc></image:image>` : ""}</url>`);

  add("/", { freq: "hourly", priority: 1 });
  for (const p of ["sale", "rent", "exchange"]) add(`/search?purpose=${p}`, { freq: "hourly", priority: 0.9 });
  add("/offices", { freq: "daily", priority: 0.8 });
  add("/blog", { freq: "weekly", priority: 0.7 });
  for (const p of ["/about", "/contact", "/privacy", "/terms", "/copyright"]) add(p, { freq: "yearly", priority: 0.3 });

  const areas = await getAreas("ar").catch(() => []);
  add("/areas", { freq: "weekly", priority: 0.7 });
  for (const path of new Set(areas.filter((a) => a.governorate).map(areaGuidePath))) add(path, { freq: "daily", priority: 0.6 });
  for (let page = 1, total = 1; page <= total && page <= 200; page++) {
    const r = await getAds({ page, limit: 100, status: "active" }, "ar").catch(() => null);
    if (!r) break;
    total = r.totalPages;
    for (const ad of r.ads) {
      const img = ad.media?.[0] ? mediaUrl(ad.media[0], true) : undefined;
      add(adHref(ad, areas), { lastmod: ad.createdAt?.slice(0, 19) + "+00:00", freq: "daily", priority: 0.7, image: img?.startsWith("http") ? img : undefined });
    }
  }
  for (let page = 1, total = 1; page <= total && page <= 50; page++) {
    const r = await getOffices({ page, limit: 100 }, "ar").catch(() => null);
    if (!r) break;
    total = r.totalPages;
    for (const o of r.offices) if (o.publicId) add(`/offices/${o.publicId}`, { freq: "weekly", priority: 0.6 });
  }
  for (const post of await getCollection("blog")) add(`/blog/${post.id}`, { lastmod: (post.data.updatedAt || post.data.publishedAt).toISOString().slice(0, 10), freq: "monthly", priority: 0.6 });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls.join("")}</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=900" } });
};
