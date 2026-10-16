import type { APIRoute } from "astro";
import { getAds } from "@/lib/api";
import { ADS_PER_SITEMAP, xmlResponse, esc } from "@/lib/sitemap";

/**
 * Sitemap index. Split so Google re-reads the small, fast-changing files often:
 *   sitemap-latest.xml  ads from the last 3 days (check this one first)
 *   sitemap-pages.xml   home, searches, offices, blog, areas guide
 *   sitemap-ads-N.xml   every live ad, 5,000 per file
 */
export const GET: APIRoute = async ({ site }) => {
  const origin = site!.origin;
  const first = await getAds({ page: 1, limit: 1, status: "active" }, "ar").catch(() => null);
  const now = new Date().toISOString().slice(0, 19) + "+00:00";
  const newest = first?.ads[0]?.createdAt ? first.ads[0].createdAt.slice(0, 19) + "+00:00" : now;
  const files = Math.max(1, Math.ceil((first?.total || 0) / ADS_PER_SITEMAP));
  const maps = [
    { loc: "/sitemap-latest.xml", lastmod: newest },
    { loc: "/sitemap-pages.xml", lastmod: newest },
    ...Array.from({ length: files }, (_, i) => ({ loc: `/sitemap-ads-${i + 1}.xml`, lastmod: i === 0 ? newest : undefined })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${maps.map((m) => `<sitemap><loc>${esc(origin + m.loc)}</loc>${m.lastmod ? `<lastmod>${m.lastmod}</lastmod>` : ""}</sitemap>`).join("")}</sitemapindex>`;
  return xmlResponse(xml, 300);
};
