/** Sitemap helpers: every URL is listed in Arabic with its English twin as an hreflang alternate. */
import { localePath } from "@/lib/i18n";

export const ADS_PER_SITEMAP = 5000;
export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export type Entry = { arOnly?: boolean; path: string; lastmod?: string; freq?: string; priority?: number; image?: string; imageTitle?: string };

export function urlset(origin: string, entries: Entry[]) {
  const body = entries.map((e) => {
    const ar = esc(origin + localePath(e.path, "ar"));
    const en = esc(origin + localePath(e.path, "en"));
    const alt = `<xhtml:link rel="alternate" hreflang="ar-KW" href="${ar}"/><xhtml:link rel="alternate" hreflang="en" href="${en}"/><xhtml:link rel="alternate" hreflang="x-default" href="${ar}"/>`;
    const meta = `${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}${e.freq ? `<changefreq>${e.freq}</changefreq>` : ""}${e.priority ? `<priority>${e.priority}</priority>` : ""}`;
    const img = e.image ? `<image:image><image:loc>${esc(e.image)}</image:loc>${e.imageTitle ? `<image:title>${esc(e.imageTitle)}</image:title>` : ""}</image:image>` : "";
    if (e.arOnly) return `<url><loc>${ar}</loc>${meta}${img}</url>`;
    return `<url><loc>${ar}</loc>${meta}${alt}${img}</url><url><loc>${en}</loc>${meta}${alt}</url>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${body}</urlset>`;
}

export const xmlResponse = (xml: string, maxAge = 900) =>
  new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": `public, max-age=0, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 4}` } });

export const iso = (d?: string) => (d ? d.slice(0, 19) + "+00:00" : undefined);
