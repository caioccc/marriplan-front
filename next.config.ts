import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    i18n: {
        locales: ['en', 'pt', 'es'],
        defaultLocale: 'pt',
        localeDetection: false,
    },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/freelancerinc/image/upload/**',
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
