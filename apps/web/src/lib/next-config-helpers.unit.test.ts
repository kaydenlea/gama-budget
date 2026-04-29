import nextConfigHelpers from "./next-config-helpers.cjs";

const {
  buildSecurityHeaders,
  isIndexableProductionEnvironment
} = nextConfigHelpers;

describe("next-config helpers", () => {
  it("treats only an explicit canonical public origin as indexable production", () => {
    expect(
      isIndexableProductionEnvironment({
        nodeEnv: "production",
        siteUrl: "https://gamabudget.com"
      })
    ).toBe(true);

    expect(
      isIndexableProductionEnvironment({
        nodeEnv: "production",
        siteUrl: undefined
      })
    ).toBe(false);

    expect(
      isIndexableProductionEnvironment({
        nodeEnv: "production",
        siteUrl: "nota url with spaces"
      })
    ).toBe(false);
  });

  it("keeps non-indexable production-safe headers when the public origin is missing", () => {
    const headers = buildSecurityHeaders({
      nodeEnv: "production",
      siteUrl: undefined
    });

    expect(headers).toContainEqual({
      key: "X-Robots-Tag",
      value: "noindex, nofollow, noarchive"
    });
    expect(headers).not.toContainEqual(
      expect.objectContaining({
        key: "Strict-Transport-Security"
      })
    );
  });

  it("supports a route-scoped embedded preview policy without weakening the default site posture", () => {
    const headers = buildSecurityHeaders({
      nodeEnv: "production",
      siteUrl: "https://gamabudget.com",
      allowEmbeddedPreview: true
    });

    expect(headers).toContainEqual({
      key: "X-Frame-Options",
      value: "SAMEORIGIN"
    });
    expect(headers).toContainEqual({
      key: "Content-Security-Policy",
      value: expect.stringContaining("frame-ancestors 'self'")
    });
    expect(headers).toContainEqual({
      key: "Content-Security-Policy",
      value: expect.stringContaining("style-src 'self' 'unsafe-inline'")
    });
    expect(headers).toContainEqual({
      key: "Content-Security-Policy",
      value: expect.stringContaining("font-src 'self' data:")
    });
  });
});
