import type { MetadataRoute } from "next";
import { buildSiteUrl, siteConfig, siteEnvironment, type SiteEnvironment } from "../src/lib/site-config";

export function createManifest(environment: SiteEnvironment = siteEnvironment): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: buildSiteUrl("/", environment.deploymentOrigin),
    scope: buildSiteUrl("/", environment.deploymentOrigin),
    display: "standalone",
    background_color: "#faf7f0",
    theme_color: siteConfig.themeColor,
    categories: ["finance", "productivity"],
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      }
    ]
  };
}

export default function manifest(): MetadataRoute.Manifest {
  return createManifest();
}
