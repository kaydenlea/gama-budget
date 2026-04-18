import { sitePages } from "./site-config";
import { buildPageSchemas, buildSiteSchemas } from "./site-schema";

describe("site-schema", () => {
  it("builds site-level organization and website schema", () => {
    const schemas = buildSiteSchemas();

    expect(schemas).toHaveLength(2);
    expect(schemas[0]).toMatchObject({
      "@type": "Organization",
      url: "https://gama.money/"
    });
    expect(schemas[1]).toMatchObject({
      "@type": "WebSite",
      url: "https://gama.money/"
    });
  });

  it("builds breadcrumb schema only for hierarchical pages", () => {
    const homeSchemas = buildPageSchemas(sitePages.home);
    const waitlistSchemas = buildPageSchemas(sitePages.waitlist);

    expect(homeSchemas).toHaveLength(1);
    expect(waitlistSchemas).toHaveLength(2);
    expect(waitlistSchemas[1]).toMatchObject({
      "@type": "BreadcrumbList"
    });
  });

  it("keeps breadcrumb schema aligned with visible breadcrumbs", () => {
    const [, breadcrumbSchema] = buildPageSchemas(sitePages.privacy);
    expect(breadcrumbSchema).toBeDefined();

    if (!breadcrumbSchema) {
      throw new Error("Expected breadcrumb schema for the privacy page.");
    }

    const breadcrumbItems = breadcrumbSchema.itemListElement as Array<Record<string, unknown>>;

    expect(breadcrumbItems).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://gama.money/"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Privacy and Trust",
        item: "https://gama.money/privacy"
      }
    ]);
  });
});
