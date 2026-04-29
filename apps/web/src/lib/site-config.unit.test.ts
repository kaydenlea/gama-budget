import {
  buildCanonicalUrl,
  normalizePathname,
  normalizeSiteOrigin,
  resolveSiteEnvironment
} from "./site-config";

describe("site-config", () => {
  describe("normalizeSiteOrigin", () => {
    it("falls back for empty values", () => {
      expect(normalizeSiteOrigin(undefined)).toBe("https://gamabudget.com");
      expect(normalizeSiteOrigin("")).toBe("https://gamabudget.com");
      expect(normalizeSiteOrigin("   ")).toBe("https://gamabudget.com");
    });

    it("normalizes bare hosts to https origins", () => {
      expect(normalizeSiteOrigin("gamabudget.com")).toBe("https://gamabudget.com");
      expect(normalizeSiteOrigin("www.example.test/")).toBe("https://www.example.test");
    });

    it("normalizes loopback hosts to http origins", () => {
      expect(normalizeSiteOrigin("localhost:3000")).toBe("http://localhost:3000");
      expect(normalizeSiteOrigin("127.0.0.1:3000")).toBe("http://127.0.0.1:3000");
    });

    it("keeps valid fully-qualified origins and strips paths", () => {
      expect(normalizeSiteOrigin("https://preview.example.test/")).toBe("https://preview.example.test");
      expect(normalizeSiteOrigin("https://preview.example.test/path?q=1")).toBe("https://preview.example.test");
    });

    it("falls back for invalid values", () => {
      expect(normalizeSiteOrigin("nota url with spaces")).toBe("https://gamabudget.com");
      expect(normalizeSiteOrigin("mailto:test@example.com")).toBe("https://gamabudget.com");
    });
  });

  describe("normalizePathname", () => {
    it("strips query strings, fragments, and trailing slashes", () => {
      expect(normalizePathname("/waitlist/?utm_source=chatgpt#section")).toBe("/waitlist");
      expect(normalizePathname("privacy/")).toBe("/privacy");
      expect(normalizePathname("/")).toBe("/");
    });
  });

  describe("resolveSiteEnvironment", () => {
    it("fails safe outside production", () => {
      expect(
        resolveSiteEnvironment({
          rawOrigin: "https://preview.example.test",
          nodeEnv: "production"
        })
      ).toEqual({
        canonicalOrigin: "https://gamabudget.com",
        deploymentOrigin: "https://preview.example.test",
        environment: "production",
        isProduction: false,
        allowIndexing: false
      });
    });

    it("allows indexing only on the canonical production origin", () => {
      expect(
        resolveSiteEnvironment({
          rawOrigin: "https://gamabudget.com",
          nodeEnv: "production"
        })
      ).toEqual({
        canonicalOrigin: "https://gamabudget.com",
        deploymentOrigin: "https://gamabudget.com",
        environment: "production",
        isProduction: true,
        allowIndexing: true
      });
    });

    it("defaults local development to a non-indexable localhost origin", () => {
      expect(
        resolveSiteEnvironment({
          nodeEnv: "development"
        })
      ).toEqual({
        canonicalOrigin: "https://gamabudget.com",
        deploymentOrigin: "http://localhost:3000",
        environment: "development",
        isProduction: false,
        allowIndexing: false
      });
    });

    it("fails closed for production builds when the public origin is missing", () => {
      expect(
        resolveSiteEnvironment({
          nodeEnv: "production"
        })
      ).toEqual({
        canonicalOrigin: "https://gamabudget.com",
        deploymentOrigin: "https://gamabudget.com",
        environment: "production",
        isProduction: false,
        allowIndexing: false
      });
    });

    it("fails closed for production builds when the public origin is invalid", () => {
      expect(
        resolveSiteEnvironment({
          rawOrigin: "nota url with spaces",
          nodeEnv: "production"
        })
      ).toEqual({
        canonicalOrigin: "https://gamabudget.com",
        deploymentOrigin: "https://gamabudget.com",
        environment: "production",
        isProduction: false,
        allowIndexing: false
      });
    });

    it("supports explicit indexing disablement", () => {
      expect(
        resolveSiteEnvironment({
          rawOrigin: "https://gamabudget.com",
          nodeEnv: "production",
          disableIndexing: "true"
        }).allowIndexing
      ).toBe(false);
    });
  });

  describe("buildCanonicalUrl", () => {
    it("always targets the canonical origin and normalized path", () => {
      expect(buildCanonicalUrl("/privacy/?utm_source=chatgpt")).toBe("https://gamabudget.com/privacy");
    });
  });
});
