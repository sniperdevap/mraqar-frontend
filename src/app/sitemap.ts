import type { MetadataRoute } from 'next';
import { getAds } from '@/lib/api/ad';
import { getOffices, officeHref } from '@/lib/api/office';
import { SITE_URL } from '@/lib/seo';
import { adHref } from '@/lib/ad-url';
import { getServerAreas } from '@/lib/api/server';

export const revalidate = 3600;

const PAGE_LIMIT = 100;

const STATIC_ROUTES: {
  path: string;
  priority: number;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;
}[] = [
  { path: '/', priority: 1, changeFrequency: 'daily' },
  { path: '/search', priority: 0.9, changeFrequency: 'daily' },
  { path: '/offices', priority: 0.8, changeFrequency: 'daily' },
  { path: '/evaluation', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/copyright', priority: 0.3, changeFrequency: 'yearly' },
];

const IMAGE_HOST = (process.env.NEXT_PUBLIC_IMAGE_HOST || '').trim().replace(/\/$/, '');

/** First photo of an ad, for Google Images (image sitemap). */
const adImage = (ad: { media?: Array<{ url: string; type: string; thumbnail?: string }> }) => {
  const m = ad.media?.[0];
  if (!m) return null;
  const path = m.type === 'video' ? m.thumbnail || '' : m.url;
  if (!path) return null;
  return path.startsWith('http') ? path : `${IMAGE_HOST}/${path.replace(/^\//, '')}`;
};

async function getActiveAdEntries(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  let page = 1;
  let totalPages = 1;
  // Areas carry the governorate used in the SEO ad URL.
  const areas = await getServerAreas('ar').catch(() => []);

  do {
    const result = await getAds({ page, limit: PAGE_LIMIT, status: 'active' });
    totalPages = result.totalPages;
    for (const ad of result.ads) {
      entries.push({
        url: `${SITE_URL}${adHref(ad, areas)}`,
        lastModified: ad.updatedAt,
        changeFrequency: 'daily',
        priority: 0.7,
        ...(adImage(ad) ? { images: [adImage(ad) as string] } : {}),
      });
    }
    page += 1;
  } while (page <= totalPages);

  return entries;
}

async function getOfficeEntries(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  let page = 1;
  let totalPages = 1;

  do {
    const result = await getOffices({ page, limit: PAGE_LIMIT });
    totalPages = result.totalPages;
    for (const office of result.offices) {
      entries.push({
        url: `${SITE_URL}${officeHref(office)}`,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
    page += 1;
  } while (page <= totalPages);

  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  const [adEntries, officeEntries] = await Promise.all([
    getActiveAdEntries().catch(() => []),
    getOfficeEntries().catch(() => []),
  ]);

  return [...staticEntries, ...adEntries, ...officeEntries];
}
