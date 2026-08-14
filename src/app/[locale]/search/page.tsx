import { SearchPage } from '@/components/search/search-page';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  createServerQueryClient,
  prefetchPublicMetadata,
  prefetchSearchAds,
  prefetchWithinBudget,
} from '@/lib/query-prefetch';
import { getServerAreas, getServerPropertyTypes } from '@/lib/api/server';
import { SITE_URL } from '@/lib/seo';
import type { Area } from '@/lib/api/metadata';
import type { GetAdsParams } from '@/types/ad';

type SearchProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const parseFilters = (raw: Record<string, string | string[] | undefined>): GetAdsParams => {
  const area = raw.area;
  return {
    purpose: typeof raw.purpose === 'string' ? raw.purpose : undefined,
    propertyType: typeof raw.propertyType === 'string' ? raw.propertyType : undefined,
    area: Array.isArray(area) ? area : typeof area === 'string' ? [area] : undefined,
    minPrice: typeof raw.minPrice === 'string' ? Number(raw.minPrice) : undefined,
    maxPrice: typeof raw.maxPrice === 'string' ? Number(raw.maxPrice) : undefined,
  };
};

const purposeKey = (purpose?: string) =>
  purpose === 'sale' || purpose === 'rent' || purpose === 'exchange'
    ? (`purpose${purpose[0].toUpperCase()}${purpose.slice(1)}` as const)
    : ('purposeAny' as const);

/**
 * Search results are the main organic landing page, so the heading, breadcrumb
 * and title spell out purpose + property type + area instead of "Search".
 */
async function buildSearchSeo(filters: GetAdsParams, locale: string) {
  const t = await getTranslations({ locale, namespace: 'common.search.seo' });
  const tNav = await getTranslations({ locale, namespace: 'common.nav' });
  const isAr = locale === 'ar';

  const [propertyTypes, areas] = await Promise.all([
    getServerPropertyTypes(locale).catch(() => []),
    getServerAreas(locale).catch(() => []),
  ]);

  const propertyType = propertyTypes.find(item => String(item.id) === filters.propertyType);
  const areaIds = Array.isArray(filters.area) ? filters.area : filters.area ? [filters.area] : [];
  const selectedAreas = areaIds
    .map(id => areas.find(item => String(item.id) === id))
    .filter((item): item is Area => Boolean(item));

  const values = {
    propertyType: propertyType
      ? isAr
        ? propertyType.labelAr
        : propertyType.label
      : t('allProperties'),
    purpose: t(purposeKey(filters.purpose)),
    area: selectedAreas.length
      ? selectedAreas.map(item => (isAr ? item.labelAr : item.label)).join(isAr ? '، ' : ', ')
      : t('kuwait'),
  };

  const purposeUrl = filters.purpose ? `/search?purpose=${filters.purpose}` : undefined;
  const crumbs: Array<{ name: string; href?: string }> = [
    { name: tNav('home'), href: '/' },
    ...(filters.purpose ? [{ name: values.purpose, href: purposeUrl }] : []),
    ...(propertyType
      ? [
          {
            name: values.propertyType,
            href: `${purposeUrl || '/search?'}${purposeUrl ? '&' : ''}propertyType=${propertyType.id}`,
          },
        ]
      : []),
    ...(selectedAreas[0]
      ? [{ name: isAr ? selectedAreas[0].governorateAr : selectedAreas[0].governorate }]
      : []),
    ...(selectedAreas.length ? [{ name: values.area }] : []),
  ];

  return { heading: t('heading', values), crumbs, values };
}

export async function generateMetadata({ params, searchParams }: SearchProps): Promise<Metadata> {
  const { locale } = await params;
  const filters = parseFilters(await searchParams);
  const { heading, values } = await buildSearchSeo(filters, locale);
  const t = await getTranslations({ locale, namespace: 'common.search.seo' });

  return {
    title: heading,
    description: t('description', values),
    alternates: { canonical: `${SITE_URL}/search` },
  };
}

export default async function Search({ params, searchParams }: SearchProps) {
  const { locale: routeLocale } = await params;
  const rawSearchParams = await searchParams;
  const locale = await getLocale();
  const queryClient = createServerQueryClient();
  const filters = parseFilters(rawSearchParams);

  const [{ heading, crumbs }] = await Promise.all([
    buildSearchSeo(filters, locale),
    prefetchWithinBudget(
      [
        prefetchPublicMetadata(queryClient, locale),
        prefetchSearchAds(queryClient, filters, 10, locale),
      ],
      400,
    ),
  ]);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      ...(crumb.href ? { item: `${SITE_URL}/${routeLocale}${crumb.href}` } : {}),
    })),
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SearchPage>
        <section className="mb-3 rounded-2xl bg-[#f4f6f8] px-4 py-3">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-[#66758b]">
              {crumbs.map((crumb, index) => (
                <li key={`${crumb.name}-${index}`} className="flex items-center gap-1.5">
                  {index > 0 && <span aria-hidden="true">›</span>}
                  {crumb.href ? (
                    <Link href={`/${routeLocale}${crumb.href}`} className="hover:underline">
                      {crumb.name}
                    </Link>
                  ) : (
                    <span>{crumb.name}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <h1 className="mt-1.5 text-lg font-bold text-[#243449] sm:text-xl">{heading}</h1>
        </section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      </SearchPage>
    </HydrationBoundary>
  );
}
