import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { AdDetailView, buildAdMetadata, canonicalAdPath, loadAd } from "@/lib/ad-page";
import { getCachedServerAdById } from "@/lib/api/server";

type Props = {
  params: Promise<{ id: string; locale: string }>;
};

/**
 * Legacy ad URL (/ads/{id}). Permanently redirects to the SEO URL
 * (/{purpose}/{type}/{governorate}/{area}/{id}) so existing links, shares and
 * Google's index carry over. If the ad can't be loaded right now, the page
 * still renders here instead of failing.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params;
  return buildAdMetadata(await loadAd(id, locale), locale);
}

export default async function LegacyAdDetail({ params }: Props) {
  const { id, locale } = await params;
  setRequestLocale(locale);

  let ad = null;
  try {
    ad = await getCachedServerAdById(id, locale);
  } catch (err) {
    // Deleted ad → real 404. Any other API failure → still render the page
    // and let the client retry, as before.
    if (err instanceof Error && /status 404/.test(err.message)) notFound();
  }
  if (ad) {
    const target = await canonicalAdPath(ad, locale);
    // Legacy 24-char ids and fallback paths both resolve to the canonical numeric URL.
    if (target !== `/ads/${id}`) permanentRedirect(target);
  }

  return <AdDetailView id={id} ad={ad} locale={locale} />;
}
