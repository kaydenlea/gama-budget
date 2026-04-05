import type { Metadata } from "next";
import { buildSiteUrl, siteConfig } from "./site-config";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
};

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteConfig.origin),
  title: {
    default: siteConfig.title,
    template: "%s | PocketCurb"
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  alternates: {
    canonical: buildSiteUrl("/")
  },
  openGraph: {
    type: "website",
    url: buildSiteUrl("/"),
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description
  }
};

export function createPageMetadata(input: PageMetadataInput): Metadata {
  const url = buildSiteUrl(input.path);

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords ? [...input.keywords] : [...siteConfig.keywords],
    alternates: {
      canonical: url
    },
    openGraph: {
      type: "website",
      url,
      siteName: siteConfig.name,
      title: input.title,
      description: input.description
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description
    }
  };
}
