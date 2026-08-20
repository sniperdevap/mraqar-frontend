import type { NextConfig } from "next";
import { RemotePattern } from "next/dist/shared/lib/image-config";
import path from "path";
import { URL } from "url";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const IMAGE_HOST = process.env.NEXT_PUBLIC_IMAGE_HOST;

const NEXT_POLYFILL_MODULE = path.resolve(
  process.cwd(),
  "node_modules/next/dist/build/polyfills/polyfill-module.js",
);

const remotePatterns = IMAGE_HOST
  ? [
      (() => {
        const url = new URL(IMAGE_HOST);
        return {
          protocol: url.protocol.replace(":", ""), // "http" or "https"
          hostname: url.hostname, // IP or domain
          port: url.port || undefined, // only if port exists
          pathname: "/**", // allow all paths
        };
      })(),
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.r2.dev", // any Cloudflare R2 public bucket subdomain
        pathname: "/**",
      },
    ]
  : [];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: remotePatterns as RemotePattern[],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [
      {
        source: "/_next/image",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
  experimental: {
    staleTimes: {
      dynamic: 180,
      static: 300,
    },
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "@radix-ui/react-dialog",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-slider",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      [NEXT_POLYFILL_MODULE]: false,
    };
    return config;
  },
};

export default withNextIntl(nextConfig);
