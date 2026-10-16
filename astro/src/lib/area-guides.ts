/** Area guide pages: /areas/{governorate}-governorate/{area}. Text lives in src/data/area-guides.json. */
import guides from "@/data/area-guides.json";
import type { Area, Lang } from "@/lib/api";
import { governorateSlug, areaSlug } from "@/lib/ad-url";

const text = guides as Record<string, { ar: string; en: string }>;

export const areaGuidePath = (a: Pick<Area, "governorate" | "value" | "label">) =>
  `/areas/${governorateSlug(a.governorate)}/${areaSlug(a)}`;

export const areaBlurb = (a: Area, lang: Lang): string => {
  const t = text[a.value];
  if (t) return lang === "ar" ? t.ar : t.en;
  return lang === "ar"
    ? `${a.labelAr} من مناطق ${a.governorateAr} في الكويت.`
    : `${a.label} is an area of ${a.governorate}, Kuwait.`;
};

export const hasGuideText = (a: Area) => Boolean(text[a.value]);

/** Areas grouped by governorate, in the order the API returns them. */
export const byGovernorate = (areas: Area[]) => {
  const groups = new Map<string, Area[]>();
  const seen = new Set<string>();
  for (const a of areas) {
    if (!a.governorate) continue;
    const key = areaGuidePath(a);
    if (seen.has(key)) continue;
    seen.add(key);
    (groups.get(a.governorate) || groups.set(a.governorate, []).get(a.governorate)!).push(a);
  }
  return [...groups.entries()].map(([gov, list]) => ({ gov, govAr: list[0].governorateAr, slug: governorateSlug(gov), areas: list }));
};
