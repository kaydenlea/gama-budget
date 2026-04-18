import type { MetadataRoute } from "next";
import {
  aiCrawlerPolicy,
  buildCanonicalUrl,
  crawlDisallowPaths,
  siteEnvironment,
  type SiteEnvironment
} from "../src/lib/site-config";

export function createRobotsMetadata(environment: SiteEnvironment = siteEnvironment): MetadataRoute.Robots {
  if (!environment.allowIndexing) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/"
      },
      sitemap: buildCanonicalUrl("/sitemap.xml"),
      host: new URL(environment.canonicalOrigin).host
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...crawlDisallowPaths]
      },
      ...aiCrawlerPolicy.searchBots.map((bot) => ({
        userAgent: bot,
        allow: "/",
        disallow: [...crawlDisallowPaths]
      })),
      ...aiCrawlerPolicy.trainingBots.map((bot) => ({
        userAgent: bot,
        disallow: "/"
      }))
    ],
    sitemap: buildCanonicalUrl("/sitemap.xml"),
    host: new URL(environment.canonicalOrigin).host
  };
}

export default function robots(): MetadataRoute.Robots {
  return createRobotsMetadata();
}
