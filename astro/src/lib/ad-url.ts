/**
 * SEO-friendly ad URLs:
 *   /{purpose}/{property-type-plural}/{governorate}-governorate/{area}/{id}
 *   e.g. /rent/apartments/hawalli-governorate/salwa/4071, /rent/offices/asimah-governorate/sharq/4100
 *
 * The numeric id at the end is the only part used to load the ad. The other
 * segments are descriptive keywords; if they don't match the ad's current
 * data (ad edited, area renamed), the page 301-redirects to the canonical URL.
 * Legacy /ads/{id} links 301-redirect here too.
 */

export const AD_PURPOSES = ["sale", "rent", "exchange"] as const;
export type AdPurpose = (typeof AD_PURPOSES)[number];

type Labelled = {
  id?: number | string;
  _id?: string;
  value?: string;
  label?: string;
  labelAr?: string;
};

type AreaLike = Labelled & { governorate?: string; governorateAr?: string };

export type AdUrlInput = {
  id: number | string;
  purpose?: string;
  propertyType?: Labelled | null;
  area?: AreaLike | null;
};

export const slugify = (input?: string | null): string =>
  (input || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

// Words that read better without an "s" in a listing URL.
const UNCOUNTABLE = new Set(["land", "farmland", "commercial", "real-estate", "property"]);

const pluralizeWord = (word: string): string => {
  if (!word || UNCOUNTABLE.has(word)) return word;
  if (/(s|x|z|ch|sh)$/.test(word)) return `${word}es`;
  if (/[^aeiou]y$/.test(word)) return `${word.slice(0, -1)}ies`;
  return `${word}s`;
};

/** "Apartment" -> "apartments", "Demolition house" -> "demolition-houses". */
export const pluralSlug = (label?: string | null): string => {
  const slug = slugify(label);
  if (!slug || UNCOUNTABLE.has(slug)) return slug;
  const parts = slug.split("-");
  parts[parts.length - 1] = pluralizeWord(parts[parts.length - 1]);
  return parts.join("-");
};

const firstSlug = (...candidates: Array<string | undefined | null>) => {
  for (const c of candidates) {
    const s = slugify(c);
    if (s) return s;
  }
  return "";
};

/** Find the full area record (with governorate) for the ad's area. */
export const findArea = (
  area: AreaLike | null | undefined,
  areas?: AreaLike[] | null,
): AreaLike | null | undefined => {
  if (!area) return area;
  if (area.governorate || !areas?.length) return area;
  const match = areas.find(
    (a) =>
      (area._id && a._id === area._id) ||
      (area.id !== undefined && String(a.id) === String(area.id)) ||
      (area.value && a.value === area.value),
  );
  return match ? { ...area, governorate: match.governorate, governorateAr: match.governorateAr } : area;
};

/** "Al-Asimah Governorate" -> "asimah-governorate", "Hawalli Governorate" -> "hawalli-governorate". */
export const governorateSlug = (governorate?: string | null): string => {
  const slug = slugify(governorate).replace(/^al-/, "");
  if (!slug) return "";
  return slug.endsWith("governorate") ? slug : `${slug}-governorate`;
};

/** Area slug from the area's stable value ("salwa", "sharq"), falling back to its English name. */
export const areaSlug = (area?: { value?: string; label?: string } | null): string =>
  firstSlug(area?.value, area?.label).replace(/^al-/, "");

/**
 * Canonical path for an ad. Falls back to /ads/{id} (which redirects) when
 * the ad is missing the data needed for the descriptive segments.
 */
export function adHref(ad: AdUrlInput, areas?: AreaLike[] | null): string {
  const purpose = AD_PURPOSES.includes(ad.purpose as AdPurpose) ? ad.purpose : null;
  const area = findArea(ad.area, areas);
  const type = pluralSlug(ad.propertyType?.label) || pluralSlug(ad.propertyType?.value);
  const areaPart = areaSlug(area);
  const govSlug = governorateSlug(area?.governorate);

  if (!purpose || !type || !areaPart || !govSlug) return `/ads/${ad.id}`;
  return `/${purpose}/${type}/${govSlug}/${areaPart}/${ad.id}`;
}

const AD_ID = "(\\d+|[a-f0-9]{24})";
const AD_DETAIL_PATTERNS = [
  new RegExp(`^/ads/${AD_ID}/?$`, "i"),
  new RegExp(`^/(${AD_PURPOSES.join("|")})/[^/]+/[^/]+/[^/]+/${AD_ID}/?$`, "i"),
];

/** True for an ad detail page path (with or without a locale prefix). */
export const isAdDetailPath = (pathname?: string | null): boolean => {
  if (!pathname) return false;
  const path = pathname.replace(/^\/(en|ar)(?=\/|$)/, "") || "/";
  return AD_DETAIL_PATTERNS.some((re) => re.test(path));
};
