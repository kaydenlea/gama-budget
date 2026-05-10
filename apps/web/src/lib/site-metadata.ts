import type { Metadata, Viewport } from "next";
import {
  buildCanonicalUrl,
  siteConfig,
  siteEnvironment,
  type SiteEnvironment,
  type SitePageDefinition
} from "./site-config";

function createRobotsDirectives(indexable: boolean, environment: SiteEnvironment): Metadata["robots"] {
  if (!indexable || !environment.allowIndexing) {
    return {
      index: false,
      follow: false,
      noarchive: true,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
        "max-image-preview": "none",
        "max-snippet": 0,
        "max-video-preview": 0
      }
    };
  }

  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  };
}

function buildOpenGraphTitle(page: SitePageDefinition) {
  return page.path === "/" ? siteConfig.title : `${page.title} | ${siteConfig.titleBrand}`;
}

function buildBrowserTitle(page: SitePageDefinition) {
  return page.path === "/" ? siteConfig.title : `${siteConfig.titleBrand} | ${page.title}`;
}

const socialImageVersion = "20260509-01";

function buildSocialImageUrl(path: "/opengraph-image" | "/twitter-image") {
  const url = new URL(buildCanonicalUrl(path));
  url.searchParams.set("v", socialImageVersion);
  return url.toString();
}

export function createRootMetadata(environment: SiteEnvironment = siteEnvironment): Metadata {
  return {
    metadataBase: new URL(environment.canonicalOrigin),
    applicationName: siteConfig.name,
    title: {
      default: siteConfig.title,
      template: `${siteConfig.titleBrand} | %s`
    },
    description: siteConfig.description,
    category: siteConfig.category,
    alternates: {
      canonical: buildCanonicalUrl("/")
    },
    referrer: "strict-origin-when-cross-origin",
    manifest: "/manifest.webmanifest",
    robots: createRobotsDirectives(true, environment),
    icons: {
      icon: [{ url: "/icon.png", type: "image/png" }]
    },
    openGraph: {
      type: "website",
      url: buildCanonicalUrl("/"),
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      title: siteConfig.title,
      description: siteConfig.description,
      images: [
        {
          url: buildSocialImageUrl("/opengraph-image"),
          width: 1200,
          height: 630,
          alt: "Gama decision-first personal finance preview"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.title,
      description: siteConfig.description,
      images: [buildSocialImageUrl("/twitter-image")]
    }
  };
}

export const rootMetadata = createRootMetadata();

export const rootViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: siteConfig.themeColor,
  colorScheme: "light"
};

export function createPageMetadata(
  page: SitePageDefinition,
  environment: SiteEnvironment = siteEnvironment
): Metadata {
  const canonicalUrl = buildCanonicalUrl(page.path);
  const socialTitle = buildOpenGraphTitle(page);

  return {
    title: {
      absolute: buildBrowserTitle(page)
    },
    description: page.description,
    alternates: {
      canonical: canonicalUrl
    },
    robots: createRobotsDirectives(page.indexable, environment),
    openGraph: {
      type: "website",
      url: canonicalUrl,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      title: socialTitle,
      description: page.description,
      images: [
        {
          url: buildSocialImageUrl("/opengraph-image"),
          width: 1200,
          height: 630,
          alt: "Gama decision-first personal finance preview"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: page.description,
      images: [buildSocialImageUrl("/twitter-image")]
    }
  };
}
