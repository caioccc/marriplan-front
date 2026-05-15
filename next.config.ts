import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    i18n: {
        locales: ['en', 'pt', 'es'],
        defaultLocale: 'pt',
        localeDetection: false,
    },
  /* config options here */
};

export default nextConfig;
