import type { NextConfig } from 'next';
import { RemotePattern } from 'next/dist/shared/lib/image-config';
import { URL } from 'url';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const IMAGE_HOST = process.env.NEXT_PUBLIC_IMAGE_HOST;

const remotePatterns = IMAGE_HOST
  ? [
      (() => {
        const url = new URL(IMAGE_HOST);
        return {
          protocol: url.protocol.replace(':', ''), // "http" or "https"
          hostname: url.hostname, // IP or domain
          port: url.port || undefined, // only if port exists
          pathname: '/**', // allow all paths
        };
      })(),
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-c839aceddc8d42a3ae148c2001b4ed58.r2.dev',
        pathname: '/**',
      },
    ]
  : [];
const nextConfig: NextConfig = {
  images: {
    remotePatterns: remotePatterns as RemotePattern[],
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);
