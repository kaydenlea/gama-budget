import { buildCanonicalUrl, siteConfig, type SitePageDefinition } from "./site-config";

export type SchemaNode = Record<string, unknown>;

const schemaContext = "https://schema.org";

export function buildOrganizationSchema(): SchemaNode {
  return {
    "@context": schemaContext,
    "@type": "Organization",
    "@id": `${buildCanonicalUrl("/")}#organization`,
    name: siteConfig.name,
    url: buildCanonicalUrl("/"),
    description: siteConfig.description
  };
}

export function buildWebsiteSchema(): SchemaNode {
  return {
    "@context": schemaContext,
    "@type": "WebSite",
    "@id": `${buildCanonicalUrl("/")}#website`,
    name: siteConfig.name,
    url: buildCanonicalUrl("/"),
    description: siteConfig.description,
    inLanguage: siteConfig.language,
    publisher: {
      "@id": `${buildCanonicalUrl("/")}#organization`
    }
  };
}

export function buildWebPageSchema(page: SitePageDefinition): SchemaNode {
  const canonicalUrl = buildCanonicalUrl(page.path);

  return {
    "@context": schemaContext,
    "@type": "WebPage",
    "@id": `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: page.title,
    description: page.description,
    inLanguage: siteConfig.language,
    isPartOf: {
      "@id": `${buildCanonicalUrl("/")}#website`
    },
    about: {
      "@id": `${buildCanonicalUrl("/")}#organization`
    },
    primaryImageOfPage: {
      "@type": "ImageObject",
      "@id": `${buildCanonicalUrl("/opengraph-image")}#primary`,
      url: buildCanonicalUrl("/opengraph-image"),
      width: 1200,
      height: 630
    },
    breadcrumb:
      page.breadcrumbs.length > 1
        ? {
            "@id": `${canonicalUrl}#breadcrumb`
          }
        : undefined
  };
}

export function buildBreadcrumbSchema(page: SitePageDefinition): SchemaNode | null {
  if (page.breadcrumbs.length < 2) {
    return null;
  }

  const canonicalUrl = buildCanonicalUrl(page.path);

  return {
    "@context": schemaContext,
    "@type": "BreadcrumbList",
    "@id": `${canonicalUrl}#breadcrumb`,
    itemListElement: page.breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: breadcrumb.label,
      item: buildCanonicalUrl(breadcrumb.path)
    }))
  };
}

export function buildPageSchemas(page: SitePageDefinition) {
  const schemas = [buildWebPageSchema(page), buildBreadcrumbSchema(page)];

  return schemas.filter((schema): schema is SchemaNode => schema !== null);
}

export function buildSiteSchemas() {
  return [buildOrganizationSchema(), buildWebsiteSchema()];
}
