/**
 * Pulls the key facts out of a free-text ad description (Arabic or English), so the
 * ad page can show them as tidy icon tiles above the full text. Only facts clearly
 * stated in the description are shown; nothing is guessed.
 */

export type KeyPointIcon = "bed" | "bath" | "area" | "floor" | "parking" | "maid" | "kitchen" | "living" | "plot" | "money" | "corner" | "street" | "deal" | "furnished" | "elevator" | "check";
export interface KeyPoint { icon: KeyPointIcon; label: string }

// Arabic-Indic digits → Latin, and number words commonly used in Kuwaiti ads.
const toLatin = (s: string) => s.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
const WORD_NUM: Record<string, number> = { واحد: 1, واحدة: 1, غرفتين: 2, غرفتان: 2, حمامين: 2, حمامان: 2, دورين: 2, دوران: 2, اثنين: 2, ثلاث: 3, ثلاثة: 3, أربع: 4, اربع: 4, أربعة: 4, اربعة: 4, خمس: 5, خمسة: 5, ست: 6, ستة: 6 };

const num = (s?: string) => (s ? Number(s.replace(/,/g, "")) : NaN);

export function extractKeyPoints(description: string, lang: "ar" | "en" = "ar"): KeyPoint[] {
  const text = toLatin((description || "").replace(/\s+/g, " "));
  const ar = lang === "ar";
  const out: KeyPoint[] = [];
  const add = (icon: KeyPointIcon, label: string) => {
    if (!out.some((p) => p.icon === icon)) out.push({ icon, label });
  };

  // Bedrooms: "3 غرف نوم", "غرفتين", "3 bedrooms"
  let m = text.match(/(\d+)\s*(?:غرف|غرفة)(?:\s*نوم)?/) || text.match(/(\d+)\s*(?:bed(?:room)?s?|br)\b/i);
  if (m) add("bed", ar ? `${m[1]} غرف نوم` : `${m[1]} bedrooms`);
  else if (/غرفتين|غرفتان/.test(text)) add("bed", ar ? "غرفتين نوم" : "2 bedrooms");

  m = text.match(/(\d+)\s*(?:حمامات|حمام|دورات مياه)/) || text.match(/(\d+)\s*(?:bath(?:room)?s?)\b/i);
  if (m) add("bath", ar ? `${m[1]} حمامات` : `${m[1]} bathrooms`);
  else if (/حمامين|حمامان/.test(text)) add("bath", ar ? "حمامين" : "2 bathrooms");

  m = text.match(/(?:المساحة|مساحة|مساحتها|بمساحة)?\s*(\d[\d,]*)\s*(?:م²|م2|متر مربع|مترمربع|م\s?مربع|sqm|m²|m2)/i);
  if (m && num(m[1]) >= 20) add("area", ar ? `${num(m[1]).toLocaleString("en-US")} م²` : `${num(m[1]).toLocaleString("en-US")} m²`);

  m = text.match(/(\d+)\s*(?:أدوار|ادوار|طوابق)/);
  if (m) add("floor", ar ? `${m[1]} أدوار` : `${m[1]} floors`);
  else if (/دور\s*أرضي|دور\s*ارضي|ground floor/i.test(text)) add("floor", ar ? "دور أرضي" : "Ground floor");
  else if ((m = text.match(/(دورين|دوران|ثلاث أدوار|ثلاثة أدوار)/))) add("floor", ar ? m[1].replace("دوران", "دورين") : `${WORD_NUM[m[1].split(" ")[0]] || 2} floors`);
  else if ((m = text.match(/(?:الدور|دور)\s*(\d+)/))) add("floor", ar ? `الدور ${m[1]}` : `Floor ${m[1]}`);

  m = text.match(/(\d+)\s*شقق|(\d+)\s*شقة/);
  if (m) add("living", ar ? `${m[1] || m[2]} شقة` : `${m[1] || m[2]} apartments`);
  else if (/صالة|صالتين|living/i.test(text)) add("living", ar ? (/صالتين/.test(text) ? "صالتين" : "صالة") : "Living room");

  if (/غرفة خادمة|غرفة خادم|maid/i.test(text)) add("maid", ar ? "غرفة خادمة" : "Maid's room");
  if (/مطبخ|kitchen/i.test(text)) add("kitchen", ar ? (/مطبخ\s*مجهز/.test(text) ? "مطبخ مجهز" : "مطبخ") : "Kitchen");
  if (/موقف|مواقف|كراج|parking|garage/i.test(text)) add("parking", ar ? (/مواقف/.test(text) ? "مواقف سيارات" : "موقف سيارة") : "Parking");
  if (/مصعد|اصانصير|elevator|lift/i.test(text)) add("elevator", ar ? "مصعد" : "Elevator");
  if (/مفروش|مؤثث|furnished/i.test(text)) add("furnished", ar ? "مفروش" : "Furnished");

  m = text.match(/قطعة\s*(\d+)/) || text.match(/block\s*(\d+)/i);
  if (m) add("plot", ar ? `قطعة ${m[1]}` : `Block ${m[1]}`);

  m = text.match(/(?:الدخل|دخل|مدخول|الإيجار الشهري|ايجار شهري)[^\d]{0,15}(\d[\d,]*)\s*(?:د\.?ك|دينار|KD)/i);
  if (m) add("money", ar ? `دخل ${num(m[1]).toLocaleString("en-US")} د.ك` : `Income ${num(m[1]).toLocaleString("en-US")} KD`);

  if (/زاوية|ركن|corner/i.test(text)) add("corner", ar ? "زاوية" : "Corner");
  m = text.match(/(ثلاث شوارع|ثلاثة شوارع|شارعين|3 شوارع|2 شارع)/);
  if (m) add("street", ar ? m[1] : m[1].includes("ثلاث") || m[1].startsWith("3") ? "3 streets" : "2 streets");
  else if ((m = text.match(/واجهة\s*(\d+)\s*(?:متر|م)/))) add("street", ar ? `واجهة ${m[1]} م` : `${m[1]} m frontage`);

  if (/قابل للتفاوض|قابل للنقاش|السعر قابل|negotiable/i.test(text)) add("deal", ar ? "السعر قابل للتفاوض" : "Negotiable");
  if (/بدون مخالفات|no violations/i.test(text)) add("check", ar ? "بدون مخالفات" : "No violations");

  return out.slice(0, 8);
}

/** Small line icons (24×24, stroke) for each key point. */
export const KEY_POINT_ICONS: Record<KeyPointIcon, string> = {
  bed: '<path d="M3 18V7M21 18v-5a3 3 0 0 0-3-3h-8v6M3 14h18M7 11.5a1.5 1.5 0 1 0 0-.01"/>',
  bath: '<path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM6 12V6a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2"/>',
  area: '<path d="M4 4h6M4 4v6M20 20h-6M20 20v-6M4 4l6 6M20 20l-6-6M14 4h6v6M10 20H4v-6"/>',
  floor: '<path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-6h6v6M9 11h1M14 11h1"/>',
  parking: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M10 16V8h3a2.5 2.5 0 0 1 0 5h-3"/>',
  maid: '<circle cx="12" cy="7" r="3"/><path d="M6 21v-2a6 6 0 0 1 12 0v2M9 14l3 3 3-3"/>',
  kitchen: '<path d="M6 3v7a2 2 0 0 0 4 0V3M8 10v11M16 21V3c2 1 3 4 3 7h-3"/>',
  living: '<path d="M4 11V9a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v2M3 18v-5a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v5zM6 18v2M18 18v2"/>',
  plot: '<path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3zM9 4v13M15 7v13"/>',
  money: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M7 12h.01M17 12h.01"/>',
  corner: '<path d="M4 20V4h16"/><path d="M8 20V8h12"/>',
  street: '<path d="M8 3 5 21M16 3l3 18M12 4v3M12 11v3M12 18v2"/>',
  deal: '<path d="M12 3v18M17 7.5C17 5.6 14.8 5 12 5s-5 .9-5 3 2 2.6 5 3.3 5 1.4 5 3.5-2.2 3.2-5 3.2-5-.8-5-2.7"/>',
  furnished: '<path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M3 17v-4a2 2 0 0 1 4 0v1h10v-1a2 2 0 0 1 4 0v4zM5 17v3M19 17v3"/>',
  elevator: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="m9 9 3-3 3 3M9 15l3 3 3-3"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
};
