// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";

// Server-rendered: ads change constantly, so pages are built per request
// (with short caching) instead of at build time.
export default defineConfig({
  site: "https://mr-aqar.com",
  output: "server",
  adapter: node({ mode: "standalone" }),
  trailingSlash: "never",
  compressHTML: true,
  prefetch: { prefetchAll: false, defaultStrategy: "viewport" },
  build: { inlineStylesheets: "auto" },
  vite: { plugins: [tailwindcss()] },
});
