const defaultSiteOrigin = "https://pocketcurb.com";

function isLoopbackHost(candidate: string) {
  return /^(localhost|127(?:\.\d{1,3}){3}|\[?::1\]?)(?::\d+)?(?:\/|$)/iu.test(candidate);
}

export function normalizeSiteOrigin(rawOrigin: string | undefined | null) {
  const candidate = rawOrigin?.trim();
  if (!candidate) {
    return defaultSiteOrigin;
  }

  const hasProtocol = /^[a-z][a-z\d+\-.]*:\/\//iu.test(candidate);
  const isLoopback = isLoopbackHost(candidate);

  if (!isLoopback && /^[a-z][a-z\d+\-.]*:/iu.test(candidate) && !hasProtocol) {
    return defaultSiteOrigin;
  }

  const withProtocol = hasProtocol
    ? candidate
    : `${isLoopback ? "http" : "https"}://${candidate}`;

  try {
    const url = new URL(withProtocol);
    if (!/^https?:$/iu.test(url.protocol) || !url.hostname) {
      throw new TypeError("Site origin must use http or https.");
    }

    return url.origin;
  } catch {
    return defaultSiteOrigin;
  }
}

export const siteConfig = {
  name: "PocketCurb",
  title: "PocketCurb | Clarity before cleanup.",
  description:
    "PocketCurb is building a decision-first personal finance product centered on Safe-to-Spend, forward-looking cash flow, shared-spending correctness, and less admin work.",
  origin: normalizeSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL),
  keywords: [
    "PocketCurb",
    "decision-first personal finance",
    "Safe-to-Spend",
    "forward-looking cash flow",
    "shared spending",
    "reimbursements",
    "privacy-first budgeting"
  ]
} as const;

export const indexableRoutes = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/waitlist", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/privacy", changeFrequency: "monthly" as const, priority: 0.6 }
];

export function buildSiteUrl(path = "/") {
  return new URL(path, `${siteConfig.origin}/`).toString();
}
