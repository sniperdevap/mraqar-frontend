export const CATEGORIES = {
  renting: { ar: "الإيجار", en: "Renting" },
  buying: { ar: "الشراء", en: "Buying" },
  areas: { ar: "دليل المناطق", en: "Area guides" },
  selling: { ar: "البيع والإعلان", en: "Selling" },
  safety: { ar: "الأمان", en: "Safety" },
} as const;
export type Category = keyof typeof CATEGORIES;

/** Arabic reads ~180 words/min on screen. */
export const readingMinutes = (body = "") => Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 180));

export const formatDate = (d: Date, lang: "ar" | "en") =>
  new Intl.DateTimeFormat(lang === "ar" ? "ar-KW-u-nu-latn" : "en-GB", { day: "numeric", month: "long", year: "numeric" }).format(d);
