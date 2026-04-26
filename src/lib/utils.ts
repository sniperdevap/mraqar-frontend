import { clsx, type ClassValue } from 'clsx';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Modern clipboard API first (works on HTTPS/localhost)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard');
      return true;
    }

    // Fallback for HTTP/non-secure contexts (http://167.114.144.249:3096/)
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      return document.execCommand('copy');
    } finally {
      toast.success('Link copied to clipboard');
      document.body.removeChild(textArea);
    }
  } catch {
    toast.error('Failed to copy link');
    return false;
  }
}

export function formatPrice(price: number | string): string {
  // If it's already a number, format it directly
  if (typeof price === 'number') {
    return `$${price.toFixed(2)}`;
  }

  // If it's a string and already has $ sign, return as is
  if (typeof price === 'string' && price.startsWith('$')) {
    return price;
  }

  // Try to parse the string as a number
  const numericValue = parseFloat(price);
  if (isNaN(numericValue)) {
    // If parsing fails, return the original string
    return price;
  }

  return `$${numericValue.toFixed(2)}`;
}

export function truncate(text: string, limit: number): string {
  if (!text || text.length <= limit) {
    return text;
  }
  return text.slice(0, limit) + '...';
}
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${month}/${day}/${year}`;
}
export const formatDisplayPhone = (phone?: string) => {
  if (!phone) return '';
  return phone.replace(/^(\+965|00965|965)/, '').trim();
};
