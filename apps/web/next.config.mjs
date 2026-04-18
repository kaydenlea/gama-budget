import nextConfigHelpers from "./src/lib/next-config-helpers.cjs";

const { buildSecurityHeaders } = nextConfigHelpers;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  poweredByHeader: false,
  trailingSlash: false,
  async headers() {
    const headers = buildSecurityHeaders({
      nodeEnv: process.env.NODE_ENV,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL
    });

    return [
      {
        source: "/:path*",
        headers
      }
    ];
  }
};

export default nextConfig;
