import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getAds, getAreas, getOffices, getPropertyTypes, mediaUrl, type Ad } from "@/lib/api";
import { adHref } from "@/lib/ad-url";
import { adTitle } from "@/lib/i18n";
import { areaGuidePath } from "@/lib/area-guides";
import { ADS_PER_SITEMAP, urlset, xmlResponse, iso, type Entry } from "@/lib/sitemap";

const adEntry = (ad: Ad, areas: Awaited<ReturnType<typeof getAreas>>, priority = 0.7): Entry => {
  const img = ad.media?.[0] ? mediaUrl(ad.media[0], true) : undefined;
  return { path: adHref(ad, areas), lastmod: iso(ad.createdAt), freq: "daily", priority, image: img?.startsWith("http") ? img : undefined, imageTitle: adTitle(ad, "ar") };
};

/** Pages ads 100 at a time from the API (the API caps page size). */
async function adsRange(from: number, count: number) {
  const out: Ad[] = [];
  const per = 100;
  for (let page = Math.floor(from / per) + 1; out.length < count; page++) {
    const r = await getAds({ page, limit: per, status: "active" }, "ar").catch(() => null);
    if (!r?.ads.length) break;
    out.push(...r.ads);
    if (page >= r.totalPages) break;
  }
  return out.slice(0, count);
}

export const GET: APIRoute = async ({ params, site }) => {
  const origin = site!.origin;
  const name = params.name || "";
  const areas = await getAreas("ar").catch(() => []);

  if (name === "latest") {
    const since = Date.now() - 3 * 24 * 3600 * 1000;
    const ads = (await adsRange(0, 1000)).filter((a) => +new Date(a.createdAt) >= since);
    return xmlResponse(urlset(origin, ads.map((a) => adEntry(a, areas, 0.9))), 120);
  }

  if (name === "pages") {
    const entries: Entry[] = [{ path: "/", freq: "hourly", priority: 1 }];
    const types = await getPropertyTypes("ar").catch(() => []);
    for (const p of ["sale", "rent", "exchange"]) {
      entries.push({ path: `/search?purpose=${p}`, freq: "hourly", priority: 0.9 });
      for (const ty of types) entries.push({ path: `/search?purpose=${p}&propertyType=${ty.id}`, freq: "daily", priority: 0.7 });
    }
    entries.push({ path: "/offices", freq: "daily", priority: 0.8 }, { path: "/blog", freq: "weekly", priority: 0.7 }, { path: "/request-property", freq: "monthly", priority: 0.6 });
    for (const path of new Set(areas.filter((a) => a.governorate).map(areaGuidePath))) entries.push({ path, freq: "daily", priority: 0.6 });
    for (const post of await getCollection("blog")) entries.push({ arOnly: true, path: `/blog/${post.id}`, lastmod: (post.data.updatedAt || post.data.publishedAt).toISOString().slice(0, 10), freq: "monthly", priority: 0.6, image: post.data.cover ? origin + post.data.cover : undefined });
    for (let page = 1, total = 1; page <= total && page <= 50; page++) {
      const r = await getOffices({ page, limit: 100 }, "ar").catch(() => null);
      if (!r) break;
      total = r.totalPages;
      for (const o of r.offices) if (o.publicId) entries.push({ path: `/offices/${o.publicId}`, freq: "weekly", priority: 0.6 });
    }
    for (const p of ["/about", "/contact", "/privacy", "/terms", "/copyright"]) entries.push({ path: p, freq: "yearly", priority: 0.3 });
    return xmlResponse(urlset(origin, entries), 900);
  }

  const m = name.match(/^ads-(\d+)$/);
  if (m) {
    const n = Number(m[1]);
    const ads = await adsRange((n - 1) * ADS_PER_SITEMAP, ADS_PER_SITEMAP);
    if (!ads.length && n > 1) return new Response(null, { status: 404 });
    return xmlResponse(urlset(origin, ads.map((a) => adEntry(a, areas))), 900);
  }
  return new Response(null, { status: 404 });
};
