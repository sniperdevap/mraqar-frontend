import type { APIRoute } from "astro";
import { LEGACY_APP_URL } from "@/lib/legacy";
// Still served by the current Next.js app during the migration (see src/lib/legacy.ts).
export const GET: APIRoute = ({ url, redirect }) => redirect(`${LEGACY_APP_URL}${url.pathname}${url.search}`, 302);
