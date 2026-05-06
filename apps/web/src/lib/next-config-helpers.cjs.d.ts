declare const nextConfigHelpers: {
  buildContentSecurityPolicy(
    nodeEnv: string | undefined,
    options?: {
      allowEmbeddedPreview?: boolean;
      allowRemoteAssets?: boolean;
    }
  ): string;
  isIndexableProductionEnvironment(input: {
    nodeEnv: string | undefined;
    siteUrl: string | undefined;
  }): boolean;
  buildSecurityHeaders(input: {
    nodeEnv: string | undefined;
    siteUrl: string | undefined;
    allowEmbeddedPreview?: boolean;
    allowRemoteAssets?: boolean;
  }): Array<{
    key: string;
    value: string;
  }>;
};

export = nextConfigHelpers;
