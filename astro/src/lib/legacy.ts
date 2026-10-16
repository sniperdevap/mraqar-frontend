/**
 * During the migration, sign-in, accounts, posting ads, plans/KNET payment and the
 * admin dashboard keep running on the current Next.js app. In production nginx
 * sends those paths straight to it (see astro/README.md); this fallback only
 * matters when Astro is reached directly (local dev, previews).
 */
export const LEGACY_APP_URL = (import.meta.env.LEGACY_APP_URL || process.env.LEGACY_APP_URL || "https://mr-aqar.com").replace(/\/$/, "");
