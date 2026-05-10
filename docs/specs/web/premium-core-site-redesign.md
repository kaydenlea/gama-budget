# Feature Spec

## Linked Context

- product brief: [docs/product/shared/gama-product-brief.md](../../product/shared/gama-product-brief.md)
- product thesis: [docs/product/shared/product-thesis.md](../../product/shared/product-thesis.md)
- personas: [docs/product/shared/personas-and-use-cases.md](../../product/shared/personas-and-use-cases.md)
- web PRD: [docs/product/web/website-prd.md](../../product/web/website-prd.md)
- landing strategy: [docs/product/web/landing-page-strategy.md](../../product/web/landing-page-strategy.md)
- waitlist strategy: [docs/product/web/waitlist-strategy.md](../../product/web/waitlist-strategy.md)
- SEO strategy: [docs/product/web/seo-content-strategy.md](../../product/web/seo-content-strategy.md)
- web architecture: [docs/architecture/web/web-architecture.md](../../architecture/web/web-architecture.md)
- SEO architecture: [docs/architecture/web/seo-architecture.md](../../architecture/web/seo-architecture.md)
- likely release gate: Gate A

## Overview

Turn the current web foundation into a premium, coherent public launch lane across `/`, `/waitlist`, and `/privacy`. The redesign must make Gama feel like a serious pre-launch product while staying grounded in repo truth: Safe-to-Spend, forward-looking cash flow, shared-spend correctness, event receipts, place-aware context, privacy-first trust, and less admin work.

This pass does not add live waitlist capture, analytics vendors, or speculative product claims. It strengthens content, layout, responsiveness, accessibility, and SEO within the existing web-lane architecture.

## User or Problem Context

The current web lane is structurally sound but narratively thin. It explains the website foundation more than it sells the product, which leaves the public surface too generic for a premium launch page and too weak to communicate why Gama is different.

Visitors need a clear answer to four questions quickly:

- what kind of product this is
- why it is different from budgeting homework
- why the product feels desirable before launch
- why the waitlist and trust posture are worth engaging with

## Scope

- redesign `/`, `/waitlist`, and `/privacy` as one coherent launch lane
- make `/waitlist` the flagship long-form product and conversion page
- keep `/` as the concise front door into the flagship experience
- upgrade `/privacy` into a polished trust page with product-language clarity
- refactor website copy into route-owned or section-owned structures
- add reusable premium visual compositions and truthful product vignette components
- preserve and refine existing metadata, canonical, sitemap, robots, breadcrumb, and schema ownership
- improve responsive behavior across desktop, tablet, and mobile
- improve motion, accessibility, and conversion quality without adding speculative dependencies
- document the redesign and verification evidence in a new spec and implementation plan

## Non-Goals

- implementing a live waitlist backend, CRM integration, or thank-you flow persistence
- shipping analytics vendors or attribution tooling
- publishing educational, comparison, or SEO-volume content beyond the three existing routes
- inventing product features, launch windows, or social proof
- treating composed vignettes as real production screenshots

## UX and Behavior

- the site must feel calm, premium, modern, and intentional rather than template-like
- `/waitlist` must immediately communicate the product category and the emotional promise of short-term clarity without bookkeeping homework
- `/waitlist` must use editorial product-story compositions to explain:
  - Safe-to-Spend and daily clarity
  - forward-looking cash flow
  - shared-spend correctness and privacy
  - event receipts and place-aware context
- `/` must summarize the thesis quickly and route traffic into `/waitlist`
- `/privacy` must explain privacy-first posture, data-minimization intent, and pre-launch honesty in product language rather than legalese
- CTA placement must feel premium and frequent enough to convert, without fake urgency or spammy treatment
- motion must enhance hierarchy and perceived quality while remaining reduced-motion safe

## Requirements

- copy must remain faithful to the documented Gama thesis and MVP scope
- all route-level metadata must stay owned by the shared web metadata helpers and route registry
- sitemap, robots, canonical URLs, and schema output must continue to behave consistently with current architecture
- the redesign must improve clarity of H1 and H2 structure, internal linking, and route descriptions
- product visuals must be CSS-driven or composed from truthful repo-grounded states; `apps/web/app/test_screen.png` must not be used as the hero asset
- desktop, tablet, and mobile layouts must each be intentionally designed rather than relying on naive stacking
- the site must preserve visible focus states, semantic landmarks, and accessible CTA labeling
- the site must keep the pre-launch waitlist state explicit and honest
- no new remote font dependency or heavy motion dependency should be added unless clearly necessary

## Acceptance Criteria

- `/` functions as a concise premium front door with clear routing into `/waitlist`
- `/waitlist` presents a flagship long-form launch narrative with grounded product differentiation, editorial product-story sections, and a premium not-live-yet early-access panel
- `/privacy` functions as a polished trust page with product-language clarity about privacy, sharing, and launch expectations
- route copy, titles, and descriptions are more specific and consistent with the product docs
- responsive behavior is intentional on desktop, tablet, and mobile with no obvious overflow or crushed compositions
- motion is subtle, tasteful, and reduced-motion safe
- existing metadata, schema, robots, and sitemap architecture remains intact and truthful
- `pnpm --dir apps/web lint` passes
- `pnpm --dir apps/web typecheck` passes
- `pnpm --dir apps/web test` passes
- `pnpm --dir apps/web build` passes

## File Plan

- `docs/specs/web/premium-core-site-redesign.md`: active feature spec for this redesign
- `docs/specs/web/plans/premium-core-site-redesign.md`: slice plan and verification record
- `apps/web/src/content/site-copy.ts`: refactor into route-owned or section-owned content structures aligned with the new narrative
- `apps/web/src/components/LandingPage.tsx`: concise premium front door redesign
- `apps/web/src/components/WaitlistPage.tsx`: flagship long-form launch page redesign
- `apps/web/app/privacy/page.tsx`: trust page redesign
- `apps/web/src/components/SiteHeader.tsx`, `apps/web/src/components/SiteFooter.tsx`: shell updates that support the new route roles and CTA emphasis
- `apps/web/app/globals.css`: visual system, motion, and responsive-layout refinements
- `packages/ui-web/src/index.tsx`: optional reusable web-lane primitives only if repetition justifies them
- `apps/web/src/lib/site-config.ts`, `apps/web/src/lib/site-metadata.ts`: route copy and metadata reconciliation where needed
- `apps/web/src/content/site-copy.e2e.test.ts` and related tests: update assertions for the new content structure and messaging

## Interfaces and Types

- typed route content objects for home, waitlist, and privacy page sections
- typed product-vignette and trust-panel content definitions so page composition stays explicit and testable
- no new backend interfaces or submission payloads in this pass

## Edge Cases

- pre-launch messaging must stay honest and must not imply live signups or near-term app-store availability
- the lack of final screenshot assets must not force fake screenshots or vague non-product visuals
- SEO improvements must not drift into unsupported schema types or misleading metadata claims
- mobile layouts must remain legible even when editorial compositions simplify significantly
- the privacy route must stay a trust explainer and not present itself as a legal privacy policy

## Security and Privacy Implications

- no new secrets, tracking vendors, or live lead-capture plumbing are introduced
- waitlist and analytics remain deferred until disclosure and operational ownership are explicit
- privacy-first claims must stay aligned with the security docs and must not overstate current implementation maturity

## Future Extensibility Notes

- real screenshot or motion assets can replace the composed vignettes later without changing route structure
- later educational and comparison pages should inherit the stronger visual system and metadata defaults from this pass
- live waitlist capture should reuse the premium early-access panel structure but must add disclosure, retention, and backend ownership before launch

## Verification Plan

- update content-shape tests to reflect the new route-owned structures
- run `pnpm --dir apps/web lint`
- run `pnpm --dir apps/web typecheck`
- run `pnpm --dir apps/web test`
- run `pnpm --dir apps/web build`
- manually review desktop, tablet, and mobile layouts by code inspection and local rendering
- manually review motion, reduced-motion behavior, focus states, heading hierarchy, and CTA flow

## Implementation Plan Link

- [docs/specs/web/plans/premium-core-site-redesign.md](plans/premium-core-site-redesign.md)

## Checklist

- [x] planning complete
- [x] spec and implementation plan added
- [x] route content structures redesigned
- [x] visual system and shared shell updated
- [x] `/`, `/waitlist`, and `/privacy` rebuilt
- [x] tests and metadata reconciled
- [x] verification complete
- [x] independent review complete

## Design Decisions

- make `/waitlist` the flagship route instead of forcing the same narrative depth onto `/`
- use composed product vignettes based on repo truth rather than inventing screenshot assets
- preserve the existing SEO platform layer and improve the surfaces that sit on top of it
- favor warm premium editorial design over louder fintech tropes or generic SaaS layouts

## Review Notes

- route copy was reviewed against the linked product brief, product thesis, web PRD, landing strategy, and waitlist strategy to keep the narrative grounded in decision-first clarity, shared-spend correctness, event receipts, place-aware context, and privacy-first trust
- the redesign intentionally avoided live waitlist plumbing, analytics integrations, fake social proof, unsupported launch claims, and use of `apps/web/app/test_screen.png`
- a follow-up polish pass tightened the home-page heading rhythm, reduced overlong copy in key home sections, and rebuilt the three-story product glimpse into a larger editorial layout so the device previews read clearly instead of feeling squashed
- a later branch polish pass refined the preview-system behavior and mockup fidelity across the hero, scroll showcase, trust carousel, and social preview surfaces without changing product scope. That pass focused on device-shell fit, preview loading handoff, scroll-showcase step behavior, and higher-fidelity mockup details for Overview, Accounts, Bills, Cash Flow, Stories, and Event Details
- the latest metadata follow-up aligned the root social title and description with the newer homepage positioning and added versioned Open Graph and Twitter image URLs so external scrapers do not keep showing stale cached cards after visual updates
- a follow-up bugfix removed resize-fragile offscreen suspension and overly aggressive paint containment from the dark signature-feature cards after those cards could render with missing chunks or incomplete content when the browser was resized while the section was offscreen
- a later follow-up narrowed the viewport-motion pause behavior so the `Budget your life moments` signature-card visuals no longer freeze their animated internals while offscreen. That section had been especially prone to partial repaint corruption after offscreen resize, most visibly in the place-context map card
- reference intake for the polish pass borrowed rounded premium section shells, larger screen-led storytelling, and lower copy density from the supplied inspiration while explicitly rejecting fake social proof, pricing blocks, and unsupported breadth claims that would distort repo truth
- verification ran with `pnpm --dir apps/web lint`, `pnpm --dir apps/web typecheck`, `pnpm --dir apps/web test`, and `pnpm --dir apps/web build`
- the production build initially failed inside the sandbox with Windows `spawn EPERM`; rerunning the same build outside the sandbox completed successfully and confirmed the final static routes
- same-tool fresh-context review was used as the independent review fallback for responsive coverage, accessibility, trust posture, and SEO alignment

## Final Reconciliation

The web lane now presents a coherent launch story instead of a foundation-placeholder story. `/` is the concise premium front door, `/waitlist` is the flagship long-form product and conversion route, and `/privacy` is a polished trust explainer that stays product-language clear without pretending to be a legal-policy page.

The implementation preserves the existing SEO architecture while making the visible surfaces materially stronger. Metadata, canonical URLs, breadcrumb/schema ownership, robots posture, and sitemap behavior remain centralized. The route copy, hierarchy, internal linking, and CTA flow now better match the actual product thesis and the launch-lane role of the site.

Subsequent branch-only polish kept the same launch-lane scope but materially improved how the product-story surfaces feel in use. The shared preview system now carries more of the UX burden: device visuals use stronger loading-to-ready handoff behavior, the scroll showcase has more explicit step progression and reload handling, and the trust carousel plus social preview better match the visual language already established by the mockup screens. The underlying product claims and route roles did not change, but the surface quality, continuity, and fidelity of the previewed states did.

The remaining intentional gaps are unchanged: real screenshot assets still do not exist in the repo, and live early-access capture remains deferred until privacy disclosures, retention language, and backend ownership are ready.
