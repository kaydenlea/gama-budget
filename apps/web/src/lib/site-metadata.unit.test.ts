import { sitePages, resolveSiteEnvironment } from "./site-config";
import { createPageMetadata, createRootMetadata } from "./site-metadata";

describe("site-metadata", () => {
  const productionEnvironment = resolveSiteEnvironment({
    rawOrigin: "https://gama.money",
    nodeEnv: "production"
  });

  const nonProductionEnvironment = resolveSiteEnvironment({
    rawOrigin: "https://preview.example.test",
    nodeEnv: "production"
  });

  it("builds production page metadata with canonical URLs and indexable robots", () => {
    const metadata = createPageMetadata(sitePages.waitlist, productionEnvironment);

    expect(metadata.alternates?.canonical).toBe("https://gama.money/waitlist");
    expect(metadata.robots).toMatchObject({
      index: true,
      follow: true
    });
    expect(metadata.openGraph).toMatchObject({
      url: "https://gama.money/waitlist",
      title: "Waitlist | Gama"
    });
    expect(metadata).not.toHaveProperty("keywords");
  });

  it("builds non-production root metadata with noindex robots", () => {
    const metadata = createRootMetadata(nonProductionEnvironment);

    expect(metadata.robots).toMatchObject({
      index: false,
      follow: false
    });
    expect(metadata.manifest).toBe("/manifest.webmanifest");
    expect(metadata.icons).toMatchObject({
      icon: [{ url: "/icon.png", type: "image/png" }]
    });
  });
});
