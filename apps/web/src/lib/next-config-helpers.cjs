const { isCanonicalProductionOrigin } = require("./site-origin.cjs");

function buildContentSecurityPolicy(nodeEnv, options = {}) {
  const isDevelopment = nodeEnv !== "production";
  const { allowEmbeddedPreview = false, allowRemoteAssets = false } = options;
  const previewStyleSources = ["https://fonts.googleapis.com"];
  const previewFontSources = ["https://fonts.gstatic.com"];
  const previewScriptSources = ["https://cdn.tailwindcss.com"];
  const scriptSources = [
    "'self'",
    "'unsafe-inline'",
    ...(allowRemoteAssets ? previewScriptSources : []),
    ...(isDevelopment ? ["'unsafe-eval'"] : [])
  ];
  const styleSources = ["'self'", "'unsafe-inline'", ...(allowRemoteAssets ? previewStyleSources : [])];
  const fontSources = ["'self'", "data:", ...(allowRemoteAssets ? previewFontSources : ["https:"])];
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    `connect-src ${["'self'", "https:", ...(isDevelopment ? ["http:", "ws:", "wss:"] : [])].join(" ")}`,
    `font-src ${fontSources.join(" ")}`,
    "form-action 'self'",
    `frame-ancestors ${allowEmbeddedPreview ? "'self'" : "'none'"}`,
    "img-src 'self' data: blob: https:",
    "object-src 'none'",
    `script-src ${scriptSources.join(" ")}`,
    `style-src ${styleSources.join(" ")}`
  ];

  if (!isDevelopment) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

function isIndexableProductionEnvironment({ nodeEnv, siteUrl }) {
  return nodeEnv === "production" && isCanonicalProductionOrigin(siteUrl);
}

function buildSecurityHeaders({ nodeEnv, siteUrl, allowEmbeddedPreview = false, allowRemoteAssets = false }) {
  const indexableProductionEnvironment = isIndexableProductionEnvironment({ nodeEnv, siteUrl });
  const headers = [
    {
      key: "Content-Security-Policy",
      value: buildContentSecurityPolicy(nodeEnv, { allowEmbeddedPreview, allowRemoteAssets })
    },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
    { key: "Origin-Agent-Cluster", value: "?1" },
    { key: "Permissions-Policy", value: "accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-DNS-Prefetch-Control", value: "off" },
    { key: "X-Frame-Options", value: allowEmbeddedPreview ? "SAMEORIGIN" : "DENY" },
    { key: "X-Permitted-Cross-Domain-Policies", value: "none" }
  ];

  if (indexableProductionEnvironment) {
    headers.push({ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" });
  }

  if (!indexableProductionEnvironment) {
    headers.push({ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" });
  }

  return headers;
}

module.exports = {
  buildContentSecurityPolicy,
  isIndexableProductionEnvironment,
  buildSecurityHeaders
};
