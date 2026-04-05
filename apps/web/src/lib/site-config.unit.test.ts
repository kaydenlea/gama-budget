import { normalizeSiteOrigin } from "./site-config";

describe("normalizeSiteOrigin", () => {
  it("falls back for empty values", () => {
    expect(normalizeSiteOrigin(undefined)).toBe("https://pocketcurb.com");
    expect(normalizeSiteOrigin("")).toBe("https://pocketcurb.com");
    expect(normalizeSiteOrigin("   ")).toBe("https://pocketcurb.com");
  });

  it("normalizes bare production hosts to https origins", () => {
    expect(normalizeSiteOrigin("pocketcurb.com")).toBe("https://pocketcurb.com");
    expect(normalizeSiteOrigin("www.pocketcurb.com/")).toBe("https://www.pocketcurb.com");
  });

  it("normalizes loopback hosts to http origins", () => {
    expect(normalizeSiteOrigin("localhost:3000")).toBe("http://localhost:3000");
    expect(normalizeSiteOrigin("127.0.0.1:3000")).toBe("http://127.0.0.1:3000");
  });

  it("keeps valid fully-qualified origins and strips paths", () => {
    expect(normalizeSiteOrigin("https://preview.pocketcurb.com/")).toBe("https://preview.pocketcurb.com");
    expect(normalizeSiteOrigin("https://preview.pocketcurb.com/path?q=1")).toBe("https://preview.pocketcurb.com");
  });

  it("falls back for invalid values", () => {
    expect(normalizeSiteOrigin("nota url with spaces")).toBe("https://pocketcurb.com");
    expect(normalizeSiteOrigin("mailto:test@example.com")).toBe("https://pocketcurb.com");
  });
});
