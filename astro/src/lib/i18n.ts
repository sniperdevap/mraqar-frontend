import type { AstroCookies } from "astro";
import type { Ad, Lang } from "./api";

/** Arabic by default; English when the visitor chose it (same cookie the Next.js site used). */
/** Page language comes from the URL (/en/… is English), set by the middleware. */
export function getLang(_cookies: AstroCookies, locals?: { lang?: Lang }): Lang {
  return locals?.lang === "en" ? "en" : "ar";
}

/** The same page in the other language: /x <-> /en/x. */
export const localePath = (path: string, lang: Lang) => {
  const bare = path === "/en" ? "/" : path.startsWith("/en/") ? path.slice(3) : path;
  return lang === "en" ? `/en${bare === "/" ? "" : bare}` : bare;
};

const ar = {
  siteName: "مستر عقار",
  home: "الرئيسية", offices: "المكاتب", blog: "المدونة", search: "بحث", account: "حسابي", menu: "القائمة",
  addAd: "أضف إعلان", addFreeAd: "أضف إعلانك مجانًا", login: "تسجيل الدخول", register: "إنشاء حساب",
  heroTitle: "ابحث عن عقارك في الكويت بسهولة",
  heroSub: "شقق، بيوت، أراضٍ، عمارات وشاليهات للبيع والإيجار والبدل",
  sale: "للبيع", rent: "للإيجار", exchange: "للبدل", allAreas: "جميع مناطق الكويت", typeArea: "اكتب المنطقة للبحث", propertyType: "نوع العقار",
  allTypes: "كل الأنواع", searchBtn: "بحث", latest: "أحدث الإعلانات", showMore: "عرض المزيد",
  featured: "مميز", monthly: "شهريًا", priceOnRequest: "السعر عند التواصل", adNo: "رقم الإعلان",
  views: "مشاهدة", description: "الوصف", contactAdvertiser: "اتصل بالمعلن", callNow: "اتصل الآن", whatsapp: "واتساب",
  safetyTitle: "نصيحة للأمان",
  safety: "تواصل مع المعلن عبر الأزرار فقط، ولا تدفع أي عربون قبل معاينة العقار والتأكد من هوية المعلن.",
  share: "مشاركة", copyLink: "نسخ الرابط", copied: "تم نسخ الرابط", telegram: "تيليجرام",
  report: "إبلاغ عن الإعلان", reportFraud: "احتيال", reportWrong: "معلومات خاطئة", reportSold: "مُباع / مؤجَّر", reportOther: "أخرى",
  reportDetails: "تفاصيل إضافية (اختياري)", sendReport: "إرسال البلاغ", cancel: "إلغاء", reportThanks: "شكرًا، تم استلام البلاغ وسنراجعه.",
  similar: "إعلانات مشابهة", officeAds: "إعلانات المكتب", noAds: "لا توجد إعلانات مطابقة", results: "نتيجة",
  officesTitle: "المكاتب العقارية", officesSub: "تواصل مع أفضل المكاتب والوسطاء العقاريين في الكويت",
  adsCount: "إعلان", searchOffices: "ابحث عن مكتب", viewOffice: "عرض المكتب",
  breadcrumbHome: "الرئيسية", kuwait: "الكويت", inWord: "في",
  footerAbout: "منصة عقارات الكويت لبيع وإيجار وبدل الشقق والبيوت والأراضي والعمارات، مع أفضل المكاتب العقارية.",
  propertyTypes: "أنواع العقارات", sitePages: "صفحات الموقع", getApp: "حمّل التطبيق", needHelp: "تحتاج مساعدة؟ تواصل معنا",
  support: "الدعم الفني", rights: "جميع الحقوق محفوظة", about: "من نحن", contact: "تواصل معنا", privacy: "سياسة الخصوصية",
  terms: "الشروط والأحكام", copyright: "إشعار حقوق النشر", language: "English", langCode: "EN", downloadOn: "متوفر على",
  openMenu: "فتح القائمة", closeMenu: "إغلاق القائمة", readMore: "اقرأ المزيد", minRead: "دقائق قراءة",
  blogTitle: "مدونة مستر عقار", blogSub: "دليلك لسوق العقار في الكويت: نصائح الشراء والإيجار، أسعار المناطق، والقوانين.",
  allPosts: "كل المقالات", relatedPosts: "مقالات ذات صلة", publishedOn: "نُشر في", backToBlog: "العودة إلى المدونة",
  priceFrom: "السعر من", priceTo: "إلى", clear: "مسح الكل", filters: "الفلاتر", page: "صفحة", next: "التالي", prev: "السابق",
};
type Dict = typeof ar;
const en: Dict = {
  siteName: "Mr Aqar",
  home: "Home", offices: "Offices", blog: "Blog", search: "Search", account: "Account", menu: "Menu",
  addAd: "Add ad", addFreeAd: "Post your ad for free", login: "Sign in", register: "Create account",
  heroTitle: "Find your property in Kuwait, easily",
  heroSub: "Apartments, houses, land, buildings and chalets for sale, rent and exchange",
  sale: "For sale", rent: "For rent", exchange: "For exchange", allAreas: "All areas of Kuwait", typeArea: "Type an area to search", propertyType: "Property type",
  allTypes: "All types", searchBtn: "Search", latest: "Latest ads", showMore: "Show more",
  featured: "Featured", monthly: "monthly", priceOnRequest: "Price on request", adNo: "Ad no.",
  views: "views", description: "Description", contactAdvertiser: "Contact the advertiser", callNow: "Call now", whatsapp: "WhatsApp",
  safetyTitle: "Safety tip",
  safety: "Contact the advertiser only through these buttons, and never pay a deposit before viewing the property and checking who the advertiser is.",
  share: "Share", copyLink: "Copy link", copied: "Link copied", telegram: "Telegram",
  report: "Report this ad", reportFraud: "Fraud", reportWrong: "Wrong information", reportSold: "Sold / rented", reportOther: "Other",
  reportDetails: "More details (optional)", sendReport: "Send report", cancel: "Cancel", reportThanks: "Thanks, we received your report and will review it.",
  similar: "Similar ads", officeAds: "Office ads", noAds: "No matching ads", results: "results",
  officesTitle: "Real estate offices", officesSub: "Contact Kuwait's best real estate offices and brokers",
  adsCount: "ads", searchOffices: "Search offices", viewOffice: "View office",
  breadcrumbHome: "Home", kuwait: "Kuwait", inWord: "in",
  footerAbout: "Kuwait's property platform to buy, rent and exchange apartments, houses, land and buildings, with the best real estate offices.",
  propertyTypes: "Property types", sitePages: "Site pages", getApp: "Get the app", needHelp: "Need help? Contact us",
  support: "Support", rights: "All rights reserved", about: "About us", contact: "Contact us", privacy: "Privacy policy",
  terms: "Terms & conditions", copyright: "Copyright notice", language: "العربية", langCode: "ع", downloadOn: "Available on",
  openMenu: "Open menu", closeMenu: "Close menu", readMore: "Read more", minRead: "min read",
  blogTitle: "Mr Aqar blog", blogSub: "Your guide to Kuwait's property market: buying and renting tips, area prices and the law.",
  allPosts: "All posts", relatedPosts: "Related posts", publishedOn: "Published", backToBlog: "Back to the blog",
  priceFrom: "Price from", priceTo: "to", clear: "Clear all", filters: "Filters", page: "Page", next: "Next", prev: "Previous",
};
export const dict = (lang: Lang): Dict => (lang === "en" ? en : ar);

const PURPOSE_TITLE = { ar: { sale: "للبيع", rent: "للايجار", exchange: "للبدل" }, en: { sale: "for sale", rent: "for rent", exchange: "for exchange" } };

/** "شقة للايجار في سلوى" / "Apartment for rent in Salwa" — the same order Awwad and Google searchers use. */
export function adTitle(ad: Ad, lang: Lang): string {
  const type = lang === "ar" ? ad.propertyType?.labelAr || ad.propertyType?.label : ad.propertyType?.label;
  const area = lang === "ar" ? ad.area?.labelAr || ad.area?.label : ad.area?.label;
  return lang === "ar"
    ? `${type || "عقار"} ${PURPOSE_TITLE.ar[ad.purpose]} في ${area || "الكويت"}`
    : `${type || "Property"} ${PURPOSE_TITLE.en[ad.purpose]} in ${area || "Kuwait"}`;
}

/** Same rules as the current site: "450 د.ك", "1,850 الف"; empty when no price. */
export function formatPrice(ad: Pick<Ad, "price" | "priceUnit">, lang: Lang): string {
  const v = Number(ad.price || 0);
  if (!v) return "";
  const unit = ad.priceUnit === "thousand" ? (lang === "ar" ? "الف" : "K") : lang === "ar" ? "د.ك" : "KD";
  return `${v.toLocaleString("en-US")} ${unit}`;
}

export function timeAgo(date: string, lang: Lang): string {
  const s = Math.round((new Date(date).getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60], ["second", 1],
  ];
  for (const [u, sec] of units) if (Math.abs(s) >= sec || u === "second") return rtf.format(Math.round(s / sec), u);
  return rtf.format(0, "second");
}

export const SUPPORT_PHONE = "+96590078005";
export const SUPPORT_WA = "https://wa.me/96590078005";
export const APP_STORE = "https://apps.apple.com/us/app/mr-aqar-%D9%85%D8%B3%D8%AA%D8%B1-%D8%B9%D9%82%D8%A7%D8%B1/id6786697649";
export const PLAY_STORE = "https://play.google.com/store/apps/details?id=com.mraqar.app&hl=en";

export const waNumber = (phone?: string) => (phone || "").replace(/\D/g, "").replace(/^00/, "");
