# Implementation Plan

## Linked Context

- feature spec: [docs/specs/web/website-foundation.md](../website-foundation.md)
- PRD: [docs/product/web/website-prd.md](../../../product/web/website-prd.md)
- likely release gate: Gate A

## Scope

Create a minimal but production-minded website foundation for PocketCurb by modernizing the `apps/web` scaffold, adding the first real landing and waitlist routes, preparing metadata and content structure for future SEO surfaces, and reconciling the supporting docs.

## Preconditions

- web product and architecture docs remain the source of truth for the lane
- official Next.js and Tailwind guidance are used for the framework-baseline decisions
- the work remains intentionally limited to foundation and does not expand into backend waitlist implementation

## File-Level Plan

- `docs/specs/web/website-foundation.md`: active spec status and reconciliation
- `docs/specs/web/plans/website-foundation.md`: active plan and slice progress
- `apps/web/package.json`: web dependency baseline
- `apps/web/postcss.config.*`, `apps/web/app/globals.css`, `apps/web/next.config.*`: modern Tailwind and metadata-ready scaffold wiring
- `apps/web/app/layout.tsx`, `apps/web/app/page.tsx`, `apps/web/app/waitlist/page.tsx`: route foundation
- `apps/web/app/robots.ts`, `apps/web/app/sitemap.ts`: search-surface groundwork
- `apps/web/src/content/*`, `apps/web/src/lib/*`, `apps/web/src/components/*`: typed content, metadata helpers, and composable website sections
- `packages/ui-web/src/index.tsx`: reusable web-only primitives for the foundation
- `scripts/check-framework-baselines.mjs`: verification aligned with the chosen baseline
- `docs/product/web/*`, `docs/architecture/web/*`, `docs/agent-workflows/*`, `apps/web/README.md`: roadmap and standards reconciliation

## Interfaces and Data Structures

- `SiteMetadata` or equivalent helper inputs for page titles, descriptions, canonical paths, and social previews
- typed content objects for landing sections, waitlist framing, trust pillars, and future content buckets
- future `WaitlistSubmission` remains a documented placeholder interface only unless backend work is explicitly added

## Design Choices

- use the App Router as the durable route and metadata boundary
- adopt the current official Tailwind integration shape rather than keeping the older Tailwind 3-only scaffold
- keep the first foundation mostly static and server-rendered; avoid speculative client-side state until the real website work needs it
- model future SEO surfaces through route structure and content typing, not through premature page volume

## Edge Cases and Failure Modes

- dependency uplift may require verification updates if the repo currently encodes the older scaffold assumptions
- Tailwind migration must not break existing `packages/ui-web` class usage
- future content pages must not accidentally inherit mobile language or unsupported product claims
- placeholder waitlist UI must remain honest about availability and follow-up expectations

## Slice Plan

- Slice 1: spec and planning artifacts
  - files to change: `docs/specs/web/website-foundation.md`, `docs/specs/web/plans/website-foundation.md`
  - interfaces or contracts affected: none
  - design choice for the slice: lock the scope before touching framework code
  - edge cases or failure modes touched: scope creep, website vs mobile lane drift
  - verification required before moving on: self-review of scope against product and architecture docs

- Slice 2: framework baseline uplift
  - files to change: `apps/web/package.json`, `apps/web/postcss.config.*`, `apps/web/app/globals.css`, `apps/web/next.config.*`, `scripts/check-framework-baselines.mjs`
  - interfaces or contracts affected: framework and verifier expectations
  - design choice for the slice: adopt the current official-style Tailwind wiring and update repo checks to match
  - edge cases or failure modes touched: workspace dependency drift, broken lint or typecheck, stale verifier assumptions
  - verification required before moving on: targeted web verification and framework-baseline check

- Slice 3: landing, waitlist, metadata, and UI foundation
  - files to change: `apps/web/app/**`, `apps/web/src/**`, `packages/ui-web/src/index.tsx`
  - interfaces or contracts affected: typed website content and metadata helpers
  - design choice for the slice: build only the route, section, and content primitives needed for a truthful website foundation
  - edge cases or failure modes touched: unsupported claims, weak metadata defaults, visual inconsistency
  - verification required before moving on: lint, typecheck, tests, and route-content review

- Slice 4: roadmap and standards reconciliation
  - files to change: `docs/product/web/*`, `docs/architecture/web/*`, `docs/agent-workflows/*`, `apps/web/README.md`
  - interfaces or contracts affected: documentation and workflow expectations
  - design choice for the slice: make future website work easier by documenting the foundation now
  - edge cases or failure modes touched: docs drift, unclear roadmap ownership, SEO guidance ambiguity
  - verification required before moving on: repo verification and final review

## Plan Review

- independent review or cross-model review needed: yes, after implementation
- review findings before implementation: none before coding; post-implementation review required a repo-wide install reification so the final React graph stayed coherent after the Next.js uplift

## Failure and Rollback Considerations

- if the dependency uplift destabilizes the workspace, revert the web-lane package and scaffold changes together rather than leaving mixed old and new Tailwind assumptions
- if a metadata or route decision proves wrong, revert to the prior placeholder route structure while keeping the planning artifacts

## Re-Planning Triggers

- official framework guidance requires materially different scaffold files than expected
- web dependency upgrades break shared workspace assumptions beyond the web lane
- user requirements expand into a real waitlist backend or analytics-vendor integration
- website copy needs unresolved product decisions that are not yet documented

## Completion Evidence

- `node ./scripts/verify-web.mjs` passes
- `node ./scripts/verify.mjs` passes
- `node ./scripts/pnpm.mjs --dir apps/web build` passes
- spec checklist is updated to reflect actual shipped scope
- docs accurately describe the new website foundation and roadmap

## Documentation Reconciliation

- `docs/specs/web/website-foundation.md`
- `docs/product/web/website-prd.md`
- `docs/product/web/seo-content-strategy.md`
- `docs/architecture/web/web-architecture.md`
- `docs/architecture/web/seo-architecture.md`
- `apps/web/README.md`
- any newly added roadmap or standard doc required to make future website work clearer
