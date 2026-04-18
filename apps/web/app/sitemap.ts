import type { MetadataRoute } from "next";
import { buildCanonicalUrl, indexablePages, siteEnvironment, type SiteEnvironment } from "../src/lib/site-config";

export function createSitemapEntries(environment: SiteEnvironment = siteEnvironment): MetadataRoute.Sitemap {
  if (!environment.allowIndexing) {
    return [];
  }

  return indexablePages.map((page) => ({
    url: buildCanonicalUrl(page.path),
    lastModified: page.updatedAt,
    changeFrequency: page.changeFrequency,
    priority: page.priority
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  return createSitemapEntries();
}
