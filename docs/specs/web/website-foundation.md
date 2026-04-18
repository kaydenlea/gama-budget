# Feature Spec

## Linked Context

- product brief: n/a
- PRD: [docs/product/web/website-prd.md](../../product/web/website-prd.md)
- landing strategy: [docs/product/web/landing-page-strategy.md](../../product/web/landing-page-strategy.md)
- waitlist strategy: [docs/product/web/waitlist-strategy.md](../../product/web/waitlist-strategy.md)
- SEO strategy: [docs/product/web/seo-content-strategy.md](../../product/web/seo-content-strategy.md)
- likely release gate: Gate A

## Overview

Turn the web lane from a placeholder into a production-minded foundation that matches current official Next.js App Router plus Tailwind guidance closely enough to avoid framework drift later, while still keeping the actual website intentionally small until the MVP is ready.

The desired outcome is not a full marketing site. It is a clean, extensible website baseline for Gama's landing, waitlist, trust, and future SEO surfaces, with clear lane separation from mobile, strong metadata and content structure, and a premium design system that reflects the product thesis without overclaiming features.

## User or Problem Context

The web lane exists for discovery, trust, and conversion rather than day-to-day product usage. Right now `apps/web` is technically valid but underpowered: it still reflects an older Tailwind setup, has only a minimal placeholder page, and lacks the structural foundation needed for future landing, waitlist, privacy, and SEO work.

If left as-is, the team will eventually have to rework both the scaffold and the content model while trying to build real website features. That would create avoidable drift against official docs and make future web work less predictable.

## Scope

- align `apps/web` more closely with the current official Next.js App Router plus Tailwind baseline
- preserve the web lane as a distinct landing, waitlist, trust, and SEO surface
- establish a minimal landing page, waitlist page, and future-content foundation
- add route-level metadata and content structures that support truthful SEO later
- create or reconcile the web spec, implementation plan, design guidance, SEO plan, and roadmap

## Non-Goals

- building the full public website
- implementing the real waitlist backend or CRM integration
- shipping analytics vendors before privacy and disclosure details are intentionally chosen
- sharing mobile UI patterns directly into the web lane
- publishing SEO-heavy content before the product is ready to support those claims

## UX and Behavior

- the landing page should explain the decision-first thesis clearly and calmly
- the waitlist page should set expectations without pretending the product is already broadly available
- metadata, route structure, and content modules should support future educational or comparison content
- the web lane should feel premium, restrained, and trustworthy rather than growth-hacky

## Requirements

- framework setup must reflect current official guidance for Next.js App Router and Tailwind CSS closely enough to avoid stale scaffolding
- the web lane must remain separate from mobile UX assumptions, component patterns, and navigation structure
- landing-page messaging must stay faithful to actual product truth from the product and SEO docs
- waitlist and future content routes must be easy to extend without route or metadata rewrites
- metadata defaults must support title templates, canonical ownership, Open Graph basics, and robots handling
- content structure must be typed and reusable for landing, waitlist, trust, and future SEO surfaces
- privacy-safe analytics readiness may be documented and scaffolded, but no speculative tracking vendor integration should ship
- docs must make the website roadmap and SEO implementation path explicit

## Acceptance Criteria

- `apps/web` uses the modern official-style Tailwind wiring rather than the older Tailwind 3 scaffold shape
- `apps/web` exposes at least a landing page and waitlist page with truthful, premium baseline content
- route and metadata structure exists for future privacy, trust, and educational content surfaces
- `node ./scripts/verify-web.mjs` passes
- `node ./scripts/verify.mjs` passes
- web product and architecture docs reflect the new foundation accurately

## Clarifying Questions

- None remain for this foundation pass. The product role of the web lane is already documented clearly enough to proceed.

## File Plan

- `docs/specs/web/website-foundation.md`: active feature spec for this work
- `docs/specs/web/plans/website-foundation.md`: implementation plan with slice-level verification
- `apps/web/package.json`, `apps/web/postcss.config.*`, `apps/web/app/globals.css`, `apps/web/next.config.*`, `apps/web/tsconfig.json`: framework-baseline alignment
- `apps/web/app/**`, `apps/web/src/**`: minimal landing, waitlist, metadata, and SEO-ready content structure
- `packages/ui-web/src/index.tsx`: web-only primitives refined to support the new foundation
- `scripts/check-framework-baselines.mjs`: verifier updated to match the chosen official baseline
- `docs/product/web/*`, `docs/architecture/web/*`, `docs/agent-workflows/*`, `apps/web/README.md`: roadmap and standard reconciliation

## Interfaces and Types

- typed website content modules for hero, proof points, trust pillars, waitlist framing, and future SEO surface definitions
- shared metadata helpers or route metadata objects for canonical URL, Open Graph, and title-template ownership
- future waitlist form contracts must remain explicit and separate from mobile product data flows

## Edge Cases

- unsupported-feature claims must stay out of landing and waitlist copy
- waitlist messaging must not imply app-store availability or production-ready product flows
- future analytics hooks must not introduce hidden tracking or disclosure drift
- future SEO pages must not force marketing concerns into the mobile lane
- framework uplift must not destabilize the rest of the workspace or the existing verification stack

## Security and Privacy Implications

- no secrets, service credentials, or privileged backend keys belong in the web lane
- analytics readiness remains documentation and structural preparation only until privacy disclosures and tooling are intentionally selected
- waitlist and contact flows remain planned surfaces, not hidden ad hoc integrations

## Future Extensibility Notes

- future SEO or content work should add structured content modules and metadata at the route level rather than rewriting the layout foundation
- future waitlist implementation should reuse the typed content and page structure from this pass rather than introducing separate growth-only patterns
- if the marketing surface later gains analytics tooling, it should be added behind explicit disclosure and runbook updates

## Verification Plan

- run `node ./scripts/verify-web.mjs`
- run `node ./scripts/verify.mjs`
- verify framework baseline checks reflect the new official-style web setup
- verify landing and waitlist routes build and typecheck
- use explicit fallback visual review via code inspection and rendered page structure if browser tooling is unavailable

## Implementation Plan Link

- [docs/specs/web/plans/website-foundation.md](plans/website-foundation.md)

## Checklist

- [x] planning complete
- [x] product and content claims aligned with source docs
- [x] framework baseline uplift complete
- [x] landing and waitlist foundation implemented
- [x] metadata and SEO-ready content structure implemented
- [x] docs and roadmap reconciled
- [x] verification complete
- [x] independent review complete

## Design Decisions

- do the framework uplift now, while the web lane is still small, instead of carrying older scaffold decisions into real website work
- keep the implementation minimal and extensible rather than shipping speculative growth mechanics
- encode durable website truth in typed content and metadata structure, not one-off page prose

## Review Notes

- self-review completed across the touched web scaffold, content, verifier, and docs
- `node ./scripts/verify-web.mjs` passed
- `node ./scripts/verify.mjs` passed
- `node ./scripts/pnpm.mjs --dir apps/web build` passed after tightening typed-route link values

## Final Reconciliation

The web lane now has a production-minded foundation instead of a placeholder: Next.js 16 App Router, Tailwind 4 wiring, typed route metadata helpers, landing and waitlist and privacy routes, sitemap and robots support, stronger web-only primitives, and reconciled roadmap or standards docs.

The scope intentionally stopped short of a live waitlist backend, third-party analytics, or broad SEO page volume. Those remain future slices so the website can grow from a clean and truthful base instead of speculative scaffolding.
