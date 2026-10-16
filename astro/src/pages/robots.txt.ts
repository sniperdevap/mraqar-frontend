import type { APIRoute } from "astro";
export const GET: APIRoute = ({ site }) => {
  const o = site!.origin;
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin", "Disallow: /account", "Disallow: /auth", "Disallow: /api/", "Disallow: /notifications",
    "Disallow: /en/admin", "Disallow: /en/account", "Disallow: /en/auth",
    "Disallow: /*?*minPrice=", "Disallow: /*?*maxPrice=", "Disallow: /*?*q=",
    "",
    `Sitemap: ${o}/sitemap.xml`,
    `Sitemap: ${o}/sitemap-latest.xml`,
    `Sitemap: ${o}/feed.xml`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
};
