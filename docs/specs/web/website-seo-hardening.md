# Feature Spec

## Linked Context

- product brief: [docs/product/shared/gama-product-brief.md](../../product/shared/gama-product-brief.md)
- PRD: [docs/product/web/website-prd.md](../../product/web/website-prd.md)
- SEO strategy: [docs/product/web/seo-content-strategy.md](../../product/web/seo-content-strategy.md)
- SEO architecture: [docs/architecture/web/seo-architecture.md](../../architecture/web/seo-architecture.md)
- likely release gate: Gate A

## Overview

Turn the current website foundation into an SEO-complete and production-safer web platform baseline for the existing landing, waitlist, and privacy pages. The goal is not to publish more content volume. The goal is to make the existing and future web pages discoverable, canonical, measurable, accessible, and hard to misconfigure.

This pass should centralize metadata, canonical URL generation, crawl controls, structured data, sitemap ownership, OG assets, and route-level content freshness signals so future engineers inherit good defaults instead of remembering SEO details manually.

## User or Problem Context

The current web lane is a small static App Router site with route-level metadata, robots, and sitemap support, but the implementation is thin and easy to drift. It defaults to a production canonical origin even in non-production environments, lacks durable page registries and schema factories, has no environment-aware crawl safety, no breadcrumb system, no favicon or manifest support, and limited verification around search-facing output.

For a product that depends on trust and truthful discovery, this is a structural risk. The web lane needs to be indexable and rich-result eligible where appropriate once the public domain exists, while also preventing staging or other non-production indexing, keeping unsupported claims out of schema, and preserving security and accessibility as first-class constraints.

## Scope

- centralize route metadata, canonical URL rules, and indexability controls for the existing web routes
- add environment-aware robots behavior so local, preview, and non-production deployments do not index accidentally
- add durable sitemap generation based on explicit route registry data instead of build timestamps
- add typed JSON-LD schema factories for the site and current page templates
- add visible breadcrumb navigation where hierarchy exists and align it with structured data
- add manifest, icons, and social-image defaults owned by the App Router
- strengthen accessibility and security defaults in the shared layout and HTTP headers
- add automated tests for metadata, schema, robots, and sitemap behavior
- reconcile web architecture and SEO docs so future work starts from the new defaults

## Non-Goals

- publishing new editorial, comparison, ecommerce, local-business, news, or video page templates
- shipping analytics vendors, waitlist backend plumbing, or attribution tooling
- adding unsupported schema types such as FAQ, Product, Review, JobPosting, or LocalBusiness
- implementing IndexNow submission automation without an operational owner and delivery hook
- introducing locale routing before the product has real multi-locale content

## UX and Behavior

- every current indexable route should have one stable canonical URL on the production domain
- the eventual production deployment at `gama.money` should expose indexable metadata, sitemap entries, and permissive robots rules for real pages
- non-production deployments should be explicitly non-indexable and should disallow crawling
- waitlist and privacy pages should show user-visible breadcrumbs that reflect the site hierarchy
- structured data should only describe visible, truthful content already present on the page
- the layout should expose skip navigation, semantic landmarks, and clearer navigation labels

## Requirements

- canonical URL generation must strip query strings and fragments, normalize root and trailing-slash behavior, and stay owned by a shared utility
- route metadata must be generated from a shared page registry with title, description, path, robots posture, social image, and last-modified ownership
- sitemap generation must include only canonical, indexable routes with explicit last-modified values tied to real content updates
- robots generation must expose sitemap location and must block non-production deployments from indexing
- AI crawler controls must distinguish search inclusion from training access where possible without affecting classic search indexing
- schema markup must use JSON-LD, be typed, and match visible page content only
- the layout must include manifest, favicon, Open Graph, and Twitter metadata defaults
- security headers must improve baseline hardening without breaking Next.js rendering
- accessibility fixes must preserve semantic structure and keyboard usability
- tests must fail if canonical URLs, robots posture, sitemap entries, or schema output drift

## Acceptance Criteria

- all existing public routes use a shared metadata generator and shared canonical URL utility
- non-production environments emit `noindex, nofollow` metadata and `Disallow: /` robots output
- production robots output includes the sitemap location and intentional AI crawler rules
- sitemap output is derived from the canonical route registry and explicit content update values
- the layout includes visible skip navigation, semantic landmarks, icons, manifest support, and social image defaults
- waitlist and privacy routes expose breadcrumb navigation plus matching breadcrumb structured data
- Organization, WebSite, WebPage, and BreadcrumbList schema output is present only where accurate
- automated tests cover metadata, sitemap, robots, and schema factories
- `pnpm verify:web` passes

## Clarifying Questions

- None remain for this implementation pass. The site is currently single-locale, static, and content-light enough that the correct baseline can be implemented without changing product truth.

## File Plan

- `docs/specs/web/website-seo-hardening.md`: active feature spec and final reconciliation
- `docs/specs/web/plans/website-seo-hardening.md`: slice plan and verification evidence
- `apps/web/src/lib/site-config.ts`: origin normalization, environment awareness, route registry, canonical URL helpers, and crawl-policy defaults
- `apps/web/src/lib/site-metadata.ts`: centralized metadata generation for root and page routes
- `apps/web/src/lib/site-schema.ts`: typed JSON-LD schema factories
- `apps/web/src/components/StructuredData.tsx`: shared JSON-LD renderer
- `apps/web/src/components/Breadcrumbs.tsx`: visible breadcrumb UI with crawlable internal links
- `apps/web/src/components/SiteHeader.tsx`, `apps/web/src/components/SiteFooter.tsx`, `apps/web/app/layout.tsx`, `apps/web/app/globals.css`: accessibility, landmarks, and shared layout defaults
- `apps/web/app/page.tsx`, `apps/web/app/waitlist/page.tsx`, `apps/web/app/privacy/page.tsx`: route-level metadata and page schema integration
- `apps/web/app/robots.ts`, `apps/web/app/sitemap.ts`, `apps/web/app/manifest.ts`, `apps/web/app/icon.svg`, `apps/web/app/opengraph-image.tsx`, `apps/web/app/twitter-image.tsx`, `apps/web/app/not-found.tsx`: crawl, discovery, media, and status-surface hardening
- `apps/web/src/**/*.test.ts`: route registry, metadata, robots, sitemap, and schema verification
- `docs/architecture/web/seo-architecture.md`, `docs/architecture/web/web-architecture.md`, `docs/product/web/seo-content-strategy.md`, `apps/web/README.md`: durable documentation updates

## Interfaces and Types

- `SiteEnvironment`: canonical origin, current deployment origin, environment name, and indexability posture
- `SitePageDefinition`: route path, title, description, change frequency, priority, updated-at signal, breadcrumb chain, and indexability flag
- `SchemaFactoryInput`: typed page inputs for Organization, WebSite, WebPage, and BreadcrumbList JSON-LD generation
- `RobotsPolicy`: production vs non-production crawl rules plus AI crawler policy choices

## Edge Cases

- `NEXT_PUBLIC_SITE_URL` may be blank, invalid, bare-host, loopback, synthetic non-production, or the eventual production origin
- local and synthetic non-production deployments must not accidentally emit production-indexable metadata
- canonical URLs must never include search params or hash fragments
- the privacy page is a trust explainer, not a legal privacy policy, so schema must not claim `PrivacyPolicy`
- AI crawler controls must not block classic search indexing unintentionally
- future multi-locale or analytics work must not be implied by this pass

## Security and Privacy Implications

- no secrets or privileged credentials are introduced
- analytics, tracking, and attribution remain intentionally unimplemented; the analytics disclosure obligation from `docs/security/security-review-baseline.md` is not applicable to this change
- security posture changes are limited to browser-facing hardening headers, non-production noindex defaults, and clearer route ownership
- CSP must remain compatible with current Next.js rendering and avoid brittle breakage

## Future Extensibility Notes

- future educational or comparison pages should register themselves in the shared page registry to inherit sitemap, metadata, and schema defaults automatically
- future multi-locale work should extend the page registry with locale-specific path ownership and reciprocal hreflang references instead of bolting them on ad hoc
- IndexNow submission remains a future operational integration once a content publishing lifecycle and deployment hook exist

## Verification Plan

- `pnpm verify:web`
- targeted Jest coverage for `apps/web/src/lib/site-config.unit.test.ts`
- new tests for metadata, schema, robots, and sitemap output
- manual code review of breadcrumb hierarchy, skip link, landmarks, and structured-data parity with visible content
- fallback visual verification by reviewing rendered component structure because browser automation is not currently wired for the web lane

## Implementation Plan Link

- [docs/specs/web/plans/website-seo-hardening.md](plans/website-seo-hardening.md)

## Checklist

- [x] planning complete
- [x] source docs reviewed
- [x] shared SEO platform utilities implemented
- [x] route integration and accessibility hardening implemented
- [x] automated verification coverage added
- [x] docs reconciled
- [x] verification complete
- [x] review complete

## Design Decisions

- centralize route ownership in code rather than duplicate title, canonical, and sitemap values across files
- use only schema types that match visible content already shipped
- default to non-indexable behavior outside production so safety does not depend on deployment memory
- keep the AI crawler policy conservative for training access while preserving search discovery eligibility

## Review Notes

- self-review completed across metadata, schema, robots, sitemap, layout, and security header changes
- same-tool fresh-context fallback was used for the planning and verification pass because no second model was requested explicitly in this session
- production build surfaced an OG-image rendering issue in `next/og`; the unsupported `inline-flex` value was removed and the build was rerun successfully
- follow-up review corrected a misleading assumption in non-production examples: `gama.money` is the only intended public domain, and synthetic hosts should be used for non-production tests and docs until the domain is provisioned
- post-implementation review found that missing `NEXT_PUBLIC_SITE_URL` still promoted production builds into indexable mode; the environment contract was tightened so indexing requires an explicit canonical public origin and otherwise fails closed

## Final Reconciliation

The web lane now has a centralized SEO platform layer instead of scattered per-page metadata. Canonical URLs, indexability posture, sitemap entries, breadcrumbs, schema output, manifest/icon handling, and social-image defaults all derive from shared web-lane utilities.

The implementation also hardened the public surface with skip navigation, clearer semantic landmarks, a custom 404 page, stronger browser security headers, non-production `noindex` defaults, and explicit AI crawler rules that keep search discovery available while blocking training crawlers.

After review, the deployment-origin contract was corrected to require an explicitly configured canonical public origin before any production deployment becomes indexable. Missing or invalid `NEXT_PUBLIC_SITE_URL` values now keep metadata, robots behavior, and response headers in fail-closed non-indexable mode even when `NODE_ENV=production`.

Verification completed with `node ./scripts/pnpm.mjs verify:web`, `node ./scripts/pnpm.mjs --dir apps/web build`, and `node ./scripts/pnpm.mjs verify`.
