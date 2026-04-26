export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
