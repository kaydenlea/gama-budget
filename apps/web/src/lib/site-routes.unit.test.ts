import { createManifest } from "../../app/manifest";
import { createRobotsMetadata } from "../../app/robots";
import { createSitemapEntries } from "../../app/sitemap";
import { resolveSiteEnvironment } from "./site-config";

describe("site routes", () => {
  const productionEnvironment = resolveSiteEnvironment({
    rawOrigin: "https://gamabudget.com",
    nodeEnv: "production"
  });

  const nonProductionEnvironment = resolveSiteEnvironment({
    rawOrigin: "https://preview.example.test",
    nodeEnv: "production"
  });

  it("generates a production robots policy with sitemap and AI crawler controls", () => {
    const robots = createRobotsMetadata(productionEnvironment);
    const rules = Array.isArray(robots.rules) ? robots.rules : [robots.rules];

    expect(robots.sitemap).toBe("https://gamabudget.com/sitemap.xml");
    expect(rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userAgent: "*", allow: "/" }),
        expect.objectContaining({ userAgent: "OAI-SearchBot", allow: "/" }),
        expect.objectContaining({ userAgent: "GPTBot", disallow: "/" }),
        expect.objectContaining({ userAgent: "Google-Extended", disallow: "/" })
      ])
    );
  });

  it("blocks all crawling in non-production robots output", () => {
    expect(createRobotsMetadata(nonProductionEnvironment)).toMatchObject({
      rules: {
        userAgent: "*",
        disallow: "/"
      }
    });
  });

  it("includes only canonical production pages in the sitemap", () => {
    expect(createSitemapEntries(productionEnvironment)).toEqual([
      expect.objectContaining({
        url: "https://gamabudget.com/",
        lastModified: "2026-04-18"
      })
    ]);
  });

  it("emits no sitemap entries outside production", () => {
    expect(createSitemapEntries(nonProductionEnvironment)).toEqual([]);
  });

  it("uses the active deployment origin for manifest navigation metadata", () => {
    expect(createManifest(productionEnvironment)).toMatchObject({
      start_url: "https://gamabudget.com/",
      scope: "https://gamabudget.com/"
    });

    expect(createManifest(nonProductionEnvironment)).toMatchObject({
      start_url: "https://preview.example.test/",
      scope: "https://preview.example.test/"
    });
  });
});
