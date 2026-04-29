# Implementation Plan

## Linked Context

- feature spec: [docs/specs/web/website-seo-hardening.md](../website-seo-hardening.md)
- PRD: [docs/product/web/website-prd.md](../../../product/web/website-prd.md)
- likely release gate: Gate A

## Scope

Implement a durable SEO and platform-safety baseline for the current Next.js web lane by centralizing canonical, metadata, robots, sitemap, schema, accessibility, and security defaults, then locking the behavior down with tests and doc updates.

## Preconditions

- the web lane remains a truthful landing, waitlist, and trust surface rather than a speculative marketing site
- the analytics disclosure obligation from `docs/security/security-review-baseline.md` is not applicable because this pass does not add analytics or tracking
- the site remains single-locale and content-light; hreflang and multi-region work stay out of scope

## File-Level Plan

- `docs/specs/web/website-seo-hardening.md`: maintain the active spec and final checklist
- `docs/specs/web/plans/website-seo-hardening.md`: maintain slice status and verification evidence
- `apps/web/src/lib/site-config.ts`: canonical domain, environment, route registry, breadcrumbs, and robots policy inputs
- `apps/web/src/lib/site-metadata.ts`: root/page metadata generator with canonical and robots handling
- `apps/web/src/lib/site-schema.ts`: JSON-LD factories and schema typing
- `apps/web/src/components/StructuredData.tsx`, `apps/web/src/components/Breadcrumbs.tsx`: shared schema and breadcrumb presentation
- `apps/web/app/layout.tsx`, `apps/web/app/page.tsx`, `apps/web/app/waitlist/page.tsx`, `apps/web/app/privacy/page.tsx`: metadata integration, schema output, and landmarks
- `apps/web/app/robots.ts`, `apps/web/app/sitemap.ts`, `apps/web/app/manifest.ts`, `apps/web/app/icon.svg`, `apps/web/app/opengraph-image.tsx`, `apps/web/app/twitter-image.tsx`, `apps/web/app/not-found.tsx`: search/discovery/media/status defaults
- `apps/web/app/globals.css`, `apps/web/src/components/SiteHeader.tsx`, `apps/web/src/components/SiteFooter.tsx`, `packages/ui-web/src/index.tsx`: accessibility and shared UI adjustments
- `apps/web/src/**/*.test.ts`: enforcement coverage
- `docs/architecture/web/*`, `docs/product/web/seo-content-strategy.md`, `apps/web/README.md`: durable doc reconciliation

## Interfaces and Data Structures

- `SiteEnvironment`
  - `canonicalOrigin`
  - `deploymentOrigin`
  - `environment`
  - `isProduction`
  - `allowIndexing`
- `SitePageDefinition`
  - `path`
  - `title`
  - `description`
  - `changeFrequency`
  - `priority`
  - `updatedAt`
  - `breadcrumbs`
  - `indexable`
- `SchemaNode`
  - JSON-LD object shape for Organization, WebSite, WebPage, and BreadcrumbList

## Design Choices

- keep page ownership in a single route registry to drive metadata and sitemap together
- use explicit `updatedAt` values instead of build-time timestamps so sitemap freshness matches real content edits
- generate metadata and schema server-side from shared helpers so search-critical output does not depend on client execution
- add a compatible CSP instead of a brittle strict CSP that would break Next.js rendering

## Edge Cases and Failure Modes

- invalid env values can otherwise create broken canonical URLs or false production indexability
- local or synthetic non-production builds can otherwise expose production canonicals plus indexable pages
- breadcrumb schema can drift from visible breadcrumbs unless both derive from the same registry
- Next.js metadata route output can drift silently unless tested directly
- social image routes must stay lightweight and not rely on unavailable fonts or assets

## Slice Plan

- Slice 1: create the shared SEO registry and metadata/crawl utilities
  - files to change: `apps/web/src/lib/site-config.ts`, `apps/web/src/lib/site-metadata.ts`
  - interfaces or contracts affected: `SiteEnvironment`, `SitePageDefinition`, metadata helpers
  - design choice for the slice: centralize canonical and indexability logic first so later route changes reuse it
  - edge cases or failure modes touched: origin normalization, preview safety, query-stripping, canonical consistency
  - verification required before moving on: unit tests for config and metadata helpers

- Slice 2: add schema, breadcrumbs, manifest, icons, OG media, and route integration
  - files to change: `apps/web/src/lib/site-schema.ts`, `apps/web/src/components/StructuredData.tsx`, `apps/web/src/components/Breadcrumbs.tsx`, `apps/web/app/**`, `apps/web/src/components/SiteHeader.tsx`, `apps/web/src/components/SiteFooter.tsx`, `apps/web/app/globals.css`
  - interfaces or contracts affected: schema factories, breadcrumb chains, layout semantics
  - design choice for the slice: keep page markup truthful and derive hierarchy from the route registry
  - edge cases or failure modes touched: breadcrumb/schema mismatch, missing landmarks, poor fallback social metadata
  - verification required before moving on: static review of page structure plus tests for schema factories

- Slice 3: strengthen robots, sitemap, not-found, and security headers
  - files to change: `apps/web/app/robots.ts`, `apps/web/app/sitemap.ts`, `apps/web/app/not-found.tsx`, `apps/web/next.config.mjs`
  - interfaces or contracts affected: `RobotsPolicy`, sitemap output, response headers
  - design choice for the slice: fail safe outside production and keep search-facing responses deterministic
  - edge cases or failure modes touched: accidental staging indexation, CSP breakage, soft-404 regressions
  - verification required before moving on: tests for robots and sitemap outputs plus local build or verify run

- Slice 4: add enforcement tests and reconcile docs
  - files to change: `apps/web/src/**/*.test.ts`, `docs/architecture/web/seo-architecture.md`, `docs/architecture/web/web-architecture.md`, `docs/product/web/seo-content-strategy.md`, `apps/web/README.md`, spec/plan docs
  - interfaces or contracts affected: proof expectations and durable engineering guidance
  - design choice for the slice: document the new defaults where future engineers will actually read them
  - edge cases or failure modes touched: docs drift and incomplete proof
  - verification required before moving on: `pnpm verify:web`

## Slice Status

- Slice 1 complete: shared route registry, canonical helpers, and environment-aware metadata utilities shipped
- Slice 2 complete: schema factories, breadcrumb UI, manifest/icon routes, OG image routes, and page integration shipped
- Slice 3 complete: robots, sitemap, custom 404, redirect, and security-header hardening shipped
- Slice 4 complete: automated tests, verifier update, and architecture/doc reconciliation shipped
- Post-review bugfix complete: missing or invalid `NEXT_PUBLIC_SITE_URL` no longer upgrades `NODE_ENV=production` into an indexable deployment

## Plan Review

- independent review or cross-model review needed: yes
- review findings before implementation: same-tool fresh-context fallback required if a second model is not requested

## Failure and Rollback Considerations

- if metadata or robots behavior is wrong, revert the shared registry and metadata routes together so canonical ownership does not split
- if CSP or additional headers break rendering, back out only the header changes and keep the non-security SEO improvements intact
- if schema output proves mismatched, remove the affected schema type rather than keep misleading structured data live

## Re-Planning Triggers

- new route types or multi-locale content are introduced during implementation
- the web lane adds analytics, forms, or third-party embeds that materially change security posture
- Next.js image or metadata route behavior requires a materially different implementation shape than expected

## Completion Evidence

- `pnpm verify:web` passes
- `pnpm --dir apps/web build` passes
- `pnpm verify` passes
- metadata, robots, sitemap, and schema tests pass
- regression tests cover missing-origin production behavior for both shared site-environment logic and Next header decisions
- spec and plan checklists reflect the final shipped scope
- architecture and SEO docs describe the new centralized defaults accurately
- non-production examples use localhost or reserved synthetic hosts instead of implying a real preview subdomain deployment

## Documentation Reconciliation

- `docs/specs/web/website-seo-hardening.md`
- `docs/specs/web/plans/website-seo-hardening.md`
- `docs/architecture/web/seo-architecture.md`
- `docs/architecture/web/web-architecture.md`
- `docs/product/web/seo-content-strategy.md`
- `apps/web/README.md`
