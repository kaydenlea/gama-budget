declare const siteOriginHelpers: {
  canonicalOrigin: string;
  defaultDevelopmentOrigin: string;
  parseConfiguredSiteOrigin(rawOrigin: string | undefined | null): string | undefined;
  normalizeSiteOrigin(rawOrigin: string | undefined | null): string;
  resolveDeploymentOrigin(rawOrigin: string | undefined | null, environment: string): string;
  isCanonicalProductionOrigin(rawOrigin: string | undefined | null): boolean;
};

export = siteOriginHelpers;
