import type { APIRoute } from "astro";
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /account\nDisallow: /auth\nDisallow: /api/\nDisallow: /notifications\nDisallow: /*?*minPrice=\nDisallow: /*?*maxPrice=\n\nSitemap: ${site!.origin}/sitemap.xml\nSitemap: ${site!.origin}/feed.xml\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
