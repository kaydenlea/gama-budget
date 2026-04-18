import siteOriginHelpers from "./site-origin.cjs";

const {
  canonicalOrigin,
  isCanonicalProductionOrigin,
  normalizeSiteOrigin: normalizeConfiguredSiteOrigin,
  resolveDeploymentOrigin
} = siteOriginHelpers;

export type SitePath = "/" | "/waitlist" | "/privacy";

export type SiteChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export type BreadcrumbDefinition = {
  label: string;
  path: SitePath;
};

export type SitePageDefinition = {
  path: SitePath;
  title: string;
  description: string;
  updatedAt: string;
  changeFrequency: SiteChangeFrequency;
  priority: number;
  indexable: boolean;
  breadcrumbLabel: string;
  breadcrumbs: readonly BreadcrumbDefinition[];
};

export type SiteEnvironment = {
  canonicalOrigin: string;
  deploymentOrigin: string;
  environment: string;
  isProduction: boolean;
  allowIndexing: boolean;
};

type ResolveSiteEnvironmentInput = {
  rawOrigin?: string | undefined | null;
  nodeEnv?: string | undefined | null;
  vercelEnv?: string | undefined | null;
  disableIndexing?: string | undefined | null;
};

function parseBooleanFlag(rawValue: string | undefined | null) {
  const value = rawValue?.trim().toLowerCase();

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

export function normalizePathname(rawPath = "/") {
  const trimmed = rawPath.trim();
  const withoutSearch = trimmed.split("?")[0]?.split("#")[0] ?? "/";
  let normalized = withoutSearch || "/";

  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  normalized = normalized.replace(/\/{2,}/gu, "/");

  if (normalized !== "/" && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

export function normalizeSiteOrigin(rawOrigin: string | undefined | null) {
  return normalizeConfiguredSiteOrigin(rawOrigin);
}

export function resolveSiteEnvironment(input: ResolveSiteEnvironmentInput = {}): SiteEnvironment {
  const environment = (input.vercelEnv ?? input.nodeEnv ?? "development").trim() || "development";
  const deploymentOrigin = resolveDeploymentOrigin(input.rawOrigin, environment);
  const disableIndexing = parseBooleanFlag(input.disableIndexing) === true;
  const isProduction = environment === "production" && isCanonicalProductionOrigin(input.rawOrigin);

  return {
    canonicalOrigin,
    deploymentOrigin,
    environment,
    isProduction,
    allowIndexing: isProduction && !disableIndexing
  };
}

export const siteEnvironment = resolveSiteEnvironment({
  rawOrigin: process.env.NEXT_PUBLIC_SITE_URL,
  nodeEnv: process.env.NODE_ENV,
  vercelEnv: process.env.VERCEL_ENV,
  disableIndexing: process.env.GAMA_DISABLE_INDEXING
});

export const siteConfig = {
  name: "Gama",
  title: "Gama | Clarity before cleanup.",
  description:
    "Gama is building a decision-first personal finance product centered on Safe-to-Spend, forward-looking cash flow, shared-spending correctness, and less admin work.",
  category: "personal finance",
  themeColor: "#faf7f0",
  locale: "en_US",
  language: "en-US"
} as const;

const homeBreadcrumb = { label: "Home", path: "/" } as const;

export const sitePages = {
  home: {
    path: "/",
    title: "Clarity Before Cleanup",
    description:
      "Gama is building a premium decision-first finance product for Safe-to-Spend, forward-looking cash flow, shared-spending correctness, and less admin work.",
    updatedAt: "2026-04-18",
    changeFrequency: "monthly",
    priority: 1,
    indexable: true,
    breadcrumbLabel: "Home",
    breadcrumbs: [homeBreadcrumb]
  },
  waitlist: {
    path: "/waitlist",
    title: "Waitlist",
    description:
      "Gama's waitlist lane is being prepared for the MVP window with honest expectations, structured intake fields, and privacy-first follow-up.",
    updatedAt: "2026-04-18",
    changeFrequency: "monthly",
    priority: 0.8,
    indexable: true,
    breadcrumbLabel: "Waitlist",
    breadcrumbs: [homeBreadcrumb, { label: "Waitlist", path: "/waitlist" }]
  },
  privacy: {
    path: "/privacy",
    title: "Privacy and Trust",
    description:
      "Gama's web lane is built to explain the product honestly, prepare for privacy-safe growth, and keep trust ahead of conversion pressure.",
    updatedAt: "2026-04-18",
    changeFrequency: "monthly",
    priority: 0.6,
    indexable: true,
    breadcrumbLabel: "Privacy and Trust",
    breadcrumbs: [homeBreadcrumb, { label: "Privacy and Trust", path: "/privacy" }]
  }
} as const satisfies Record<string, SitePageDefinition>;

export const sitePageList = Object.values(sitePages);
export const indexablePages = sitePageList.filter((page) => page.indexable);
export const crawlDisallowPaths = ["/api/", "/preview/", "/draft/", "/private/"] as const;

export const aiCrawlerPolicy = {
  searchBots: ["OAI-SearchBot", "ChatGPT-User"] as const,
  trainingBots: ["GPTBot", "Google-Extended"] as const
} as const;

export function getPageByPath(path: string) {
  const normalizedPath = normalizePathname(path);

  return sitePageList.find((page) => page.path === normalizedPath);
}

export function buildSiteUrl(path = "/", origin = canonicalOrigin) {
  return new URL(normalizePathname(path), `${origin}/`).toString();
}

export function buildCanonicalUrl(path = "/") {
  return buildSiteUrl(path, canonicalOrigin);
}
