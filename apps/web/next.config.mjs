const canonicalHost = "gama.money";
const canonicalOrigin = `https://${canonicalHost}`;

function normalizeOrigin(rawOrigin) {
  if (!rawOrigin) {
    return canonicalOrigin;
  }

  try {
    const candidate = /^[a-z][a-z\d+\-.]*:\/\//i.test(rawOrigin) ? rawOrigin : `https://${rawOrigin}`;
    return new URL(candidate).origin;
  } catch {
    return canonicalOrigin;
  }
}

function buildContentSecurityPolicy() {
  const isDevelopment = process.env.NODE_ENV !== "production";
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    `connect-src ${["'self'", "https:", ...(isDevelopment ? ["http:", "ws:", "wss:"] : [])].join(" ")}`,
    "font-src 'self' https: data:",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data: blob: https:",
    "object-src 'none'",
    `script-src ${["'self'", "'unsafe-inline'", ...(isDevelopment ? ["'unsafe-eval'"] : [])].join(" ")}`,
    "style-src 'self' 'unsafe-inline'"
  ];

  if (!isDevelopment) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

function isIndexableProductionEnvironment() {
  return process.env.NODE_ENV === "production" && normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL) === canonicalOrigin;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  poweredByHeader: false,
  trailingSlash: false,
  async headers() {
    const headers = [
      { key: "Content-Security-Policy", value: buildContentSecurityPolicy() },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
      { key: "Origin-Agent-Cluster", value: "?1" },
      { key: "Permissions-Policy", value: "accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-DNS-Prefetch-Control", value: "off" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Permitted-Cross-Domain-Policies", value: "none" }
    ];

    if (isIndexableProductionEnvironment()) {
      headers.push({ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" });
    }

    if (!isIndexableProductionEnvironment()) {
      headers.push({ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" });
    }

    return [
      {
        source: "/:path*",
        headers
      }
    ];
  }
};

export default nextConfig;
