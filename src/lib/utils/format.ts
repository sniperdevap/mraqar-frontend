export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/** Lightweight relative time (avoids date-fns on critical paths). */
export function formatDistanceToNow(
  date: string | Date,
  locale: string = "en",
): string {
  const then = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.round((then.getTime() - Date.now()) / 1000);
  const abs = Math.abs(seconds);
  const rtf = new Intl.RelativeTimeFormat(locale === "ar" ? "ar" : "en", {
    numeric: "auto",
  });

  const divisions: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];

  for (const [unit, secondsInUnit] of divisions) {
    if (abs >= secondsInUnit || unit === "second") {
      return rtf.format(Math.round(seconds / secondsInUnit), unit);
    }
  }

  return rtf.format(0, "second");
}

export type PriceUnit = 'kd' | 'thousand';

export function priceUnitLabel(unit: PriceUnit | undefined, locale: string): string {
  if (unit === 'thousand') return locale === 'ar' ? 'الف' : 'K';
  return locale === 'ar' ? 'د.ك' : 'KD';
}

// Empty string for 0/missing — "0 د.ك" reads as a real price, so ads with no
// price stated just show nothing.
export function formatAdPrice(price: number | undefined, unit: PriceUnit | undefined, locale: string): string {
  const value = Number(price || 0);
  if (!value) return '';
  return `${value.toLocaleString('en-US')} ${priceUnitLabel(unit, locale)}`;
}

/**
 * Normalizes a phone number to include the Kuwait country code (+965).
 * Handle cases:
 * - 12345678 -> +96512345678
 * - 96512345678 -> +96512345678
 * - +96512345678 -> +96512345678
 * - 0096512345678 -> +96512345678
 */
export function normalizeKuwaitPhone(phone: string): string {
  if (!phone) return phone;

  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // Handle various start patterns
  if (cleaned.startsWith('00965')) {
    cleaned = cleaned.substring(2);
  } else if (!cleaned.startsWith('965')) {
    cleaned = '965' + cleaned;
  }

  return '+' + cleaned;
}
