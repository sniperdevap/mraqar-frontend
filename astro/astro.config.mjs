// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";

// Server-rendered: ads change constantly, so pages are built per request
// (with short caching) instead of at build time.
export default defineConfig({
  // Production domain for canonicals, hreflang, sitemaps and schema. Override with SITE_URL for staging.
  site: process.env.SITE_URL || "https://mr-aqar.com",
  output: "server",
  adapter: node({ mode: "standalone" }),
  trailingSlash: "never",
  // Origin is checked in src/middleware.ts against the proxied host (Astro's own check
  // compares with the internal http://localhost URL behind nginx and rejects every form).
  security: { checkOrigin: false },
  compressHTML: true,
  prefetch: { prefetchAll: false, defaultStrategy: "viewport" },
  build: { inlineStylesheets: "auto" },
  vite: { plugins: [tailwindcss()] },
});
