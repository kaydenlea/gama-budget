declare const nextConfigHelpers: {
  buildContentSecurityPolicy(nodeEnv: string | undefined): string;
  isIndexableProductionEnvironment(input: {
    nodeEnv: string | undefined;
    siteUrl: string | undefined;
  }): boolean;
  buildSecurityHeaders(input: {
    nodeEnv: string | undefined;
    siteUrl: string | undefined;
  }): Array<{
    key: string;
    value: string;
  }>;
};

export = nextConfigHelpers;
