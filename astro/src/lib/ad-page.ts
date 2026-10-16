import type { Ad, Area, Lang } from "./api";
import { mediaUrl } from "./api";
import { adHref, findArea } from "./ad-url";
import { adTitle, dict } from "./i18n";

/** Breadcrumb + RealEstateListing structured data (Google shows the breadcrumb in results). */
export function adJsonLd(ad: Ad, areas: Area[], lang: Lang, site: string) {
  const t = dict(lang);
  const area = findArea(ad.area, areas) as (Area & { governorate?: string; governorateAr?: string }) | undefined;
  const url = `${site}${adHref(ad, areas)}`;
  const purposeName = (t as Record<string, string>)[ad.purpose];
  const typeName = lang === "ar" ? ad.propertyType?.labelAr : ad.propertyType?.label;
  const areaName = lang === "ar" ? area?.labelAr : area?.label;
  const govName = lang === "ar" ? area?.governorateAr : area?.governorate;
  const base = `${site}/search?purpose=${ad.purpose}`;
  const typeQ = ad.propertyType?.id ? `&propertyType=${ad.propertyType.id}` : "";
  const crumbs = [
    { name: t.breadcrumbHome, item: site },
    { name: purposeName, item: base },
    ...(typeName ? [{ name: typeName, item: `${base}${typeQ}` }] : []),
    ...(areaName ? [{ name: areaName, item: `${base}${typeQ}&area=${ad.area.id}` }] : []),
    { name: adTitle(ad, lang), item: url },
  ];
  const images = (ad.media || []).filter((m) => m.type === "image").map((m) => mediaUrl(m)).slice(0, 10);
  return [
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.item })) },
    {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      name: adTitle(ad, lang),
      description: (ad.description || adTitle(ad, lang)).slice(0, 500),
      url,
      image: images.length ? images : [`${site}/aqar-new-logo.png`],
      // One date for Google: when the ad was posted or last re-posted. updatedAt also
      // changes on every view, which made old ads look new in search results.
      datePosted: ad.createdAt,
      dateModified: ad.createdAt,
      identifier: String(ad.id),
      contentLocation: {
        "@type": "Place",
        name: [areaName, govName, t.kuwait].filter(Boolean).join(lang === "ar" ? "، " : ", "),
        address: { "@type": "PostalAddress", addressLocality: areaName, addressRegion: govName, addressCountry: "KW" },
      },
      offers: {
        "@type": "Offer",
        price: ad.priceUnit === "thousand" ? ad.price * 1000 : ad.price,
        priceCurrency: "KWD",
        ...(ad.purpose === "rent" ? { priceSpecification: { "@type": "UnitPriceSpecification", price: ad.price, priceCurrency: "KWD", unitCode: "MON" } } : {}),
        availability: ad.status === "active" ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
        seller: { "@type": ad.isOffice ? "RealEstateAgent" : "Person", name: ad.user?.name },
      },
    },
  ];
}
