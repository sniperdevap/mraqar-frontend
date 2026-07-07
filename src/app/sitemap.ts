import type { MetadataRoute } from 'next';
import { getAds } from '@/lib/api/ad';
import { getOffices } from '@/lib/api/office';
import { SITE_URL } from '@/lib/seo';

export const revalidate = 3600;

const PAGE_LIMIT = 100;

const STATIC_ROUTES: {
  path: string;
  priority: number;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;
}[] = [
  { path: '/', priority: 1, changeFrequency: 'daily' },
  { path: '/search', priority: 0.9, changeFrequency: 'daily' },
  { path: '/ads', priority: 0.9, changeFrequency: 'daily' },
  { path: '/offices', priority: 0.8, changeFrequency: 'daily' },
  { path: '/evaluation', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/copyright', priority: 0.3, changeFrequency: 'yearly' },
];

async function getActiveAdEntries(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  let page = 1;
  let totalPages = 1;

  do {
    const result = await getAds({ page, limit: PAGE_LIMIT, status: 'active' });
    totalPages = result.totalPages;
    for (const ad of result.ads) {
      entries.push({
        url: `${SITE_URL}/ads/${ad.id}`,
        lastModified: ad.updatedAt,
        changeFrequency: 'daily',
        priority: 0.7,
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
        url: `${SITE_URL}/offices/${office._id}`,
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
