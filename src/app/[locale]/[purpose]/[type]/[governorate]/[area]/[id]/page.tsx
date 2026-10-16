import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { AD_PURPOSES, type AdPurpose } from "@/lib/ad-url";
import { AdDetailView, buildAdMetadata, canonicalAdPath, loadAd } from "@/lib/ad-page";
import { getCachedServerAdById } from "@/lib/api/server";

/**
 * SEO ad URL: /{purpose}/{type}/{governorate}/{area}/{id}
 * e.g. /rent/apartments/hawalli-governorate/salwa/4071
 *
 * Only {id} loads the ad. If the descriptive segments are out of date the
 * page 301-redirects to the current canonical URL, so each ad has exactly
 * one indexable address.
 */
type Props = {
  params: Promise<{
    locale: string;
    purpose: string;
    type: string;
    governorate: string;
    area: string;
    id: string;
  }>;
};

const isValidRequest = (purpose: string, id: string) =>
  AD_PURPOSES.includes(purpose as AdPurpose) && /^(\d+|[a-f0-9]{24})$/i.test(id);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale, purpose } = await params;
  if (!isValidRequest(purpose, id)) return {};
  return buildAdMetadata(await loadAd(id, locale), locale);
}

export default async function AdDetail({ params }: Props) {
  const { locale, purpose, type, governorate, area, id } = await params;
  if (!isValidRequest(purpose, id)) notFound();
  setRequestLocale(locale);

  // A missing ad is a real 404; a temporary API failure must not be (a 404
  // tells Google to drop the page) — let it surface as a 500 so it's retried.
  let ad;
  try {
    ad = await getCachedServerAdById(id, locale);
  } catch (err) {
    if (err instanceof Error && /status 404/.test(err.message)) notFound();
    throw err;
  }
  if (!ad) notFound();

  const canonical = await canonicalAdPath(ad, locale);
  const requested = `/${purpose}/${type}/${governorate}/${area}/${id}`;
  if (canonical !== requested && !canonical.startsWith("/ads/")) {
    permanentRedirect(canonical);
  }

  return <AdDetailView id={id} ad={ad} locale={locale} />;
}
