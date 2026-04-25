import nextConfigHelpers from "./src/lib/next-config-helpers.cjs";
import os from "node:os";

const { buildSecurityHeaders } = nextConfigHelpers;

function getAllowedDevOrigins() {
  const origins = new Set(["localhost", "127.0.0.1"]);

  for (const addresses of Object.values(os.networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family === "IPv4" && !address.internal) {
        origins.add(address.address);
      }
    }
  }

  return Array.from(origins);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  poweredByHeader: false,
  allowedDevOrigins: getAllowedDevOrigins(),
  trailingSlash: false,
  async headers() {
    const defaultHeaders = buildSecurityHeaders({
      nodeEnv: process.env.NODE_ENV,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL
    });
    const embeddedPreviewHeaders = buildSecurityHeaders({
      nodeEnv: process.env.NODE_ENV,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      allowEmbeddedPreview: true
    });

    return [
      {
        source: "/((?!preview/).*)",
        headers: defaultHeaders
      },
      {
        source: "/preview/:path*",
        headers: embeddedPreviewHeaders
      }
    ];
  }
};

export default nextConfig;
