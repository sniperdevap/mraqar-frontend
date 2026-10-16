import type { APIRoute } from "astro";
import { LEGACY_APP_URL } from "@/lib/legacy";
// Posting ads stays on the current app until Phase 3 (see src/lib/legacy.ts).
export const GET: APIRoute = ({ url, redirect }) => redirect(`${LEGACY_APP_URL}${url.pathname}${url.search}`, 302);
