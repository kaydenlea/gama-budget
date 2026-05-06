import path from "node:path";
import { fileURLToPath } from "node:url";
import nextConfigHelpers from "./src/lib/next-config-helpers.cjs";

const { buildSecurityHeaders } = nextConfigHelpers;
const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  poweredByHeader: false,
  trailingSlash: false,
  outputFileTracingRoot: workspaceRoot,
  turbopack: {
    root: workspaceRoot
  },
  allowedDevOrigins: ["192.168.1.88"],
  async headers() {
    const defaultHeaders = buildSecurityHeaders({
      nodeEnv: process.env.NODE_ENV,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL
    });
    const embeddedPreviewHeaders = buildSecurityHeaders({
      nodeEnv: process.env.NODE_ENV,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      allowEmbeddedPreview: true,
      allowRemoteAssets: true
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
