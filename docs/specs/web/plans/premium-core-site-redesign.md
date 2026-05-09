# Implementation Plan

## Objective

Implement the premium core-site redesign for `apps/web` as a coherent, SEO-safe public launch lane across `/`, `/waitlist`, and `/privacy`, while keeping the site pre-launch only and grounded in documented product truth.

## Constraints and Defaults

- no live waitlist submission or CRM wiring
- no analytics-vendor integration
- no unsupported feature claims or fake social proof
- no reliance on `apps/web/app/test_screen.png`
- real screenshot assets do not exist yet; use truthful composed preview surfaces instead
- preserve the existing metadata, robots, sitemap, canonical, and schema architecture

## Slice 1: Add docs and content architecture

### Outcome

The redesign is documented in-repo and the site copy moves from one broad placeholder structure to route-owned, section-owned content that supports the new narrative cleanly.

### Files

- `docs/specs/web/premium-core-site-redesign.md`
- `docs/specs/web/plans/premium-core-site-redesign.md`
- `apps/web/src/content/site-copy.ts`
- `apps/web/src/content/site-copy.e2e.test.ts`

### Notes

- define typed content for home, waitlist, privacy, product vignettes, scenario cards, trust statements, and CTA language
- keep route copy tightly aligned with product docs

### Verification

- targeted content-shape test updates
- manual copy review against linked product docs

## Slice 2: Shared shell and visual system

### Outcome

The shared web lane gets the stronger premium visual foundation needed by all three routes: better backgrounds, rhythm, CTA styling, motion-safe utilities, and shell emphasis toward `/waitlist`.

### Files

- `apps/web/app/globals.css`
- `apps/web/src/components/SiteHeader.tsx`
- `apps/web/src/components/SiteFooter.tsx`
- `packages/ui-web/src/index.tsx` if reusable primitives are warranted

### Notes

- improve tablet and mobile behavior explicitly, not as an afterthought
- add tasteful motion and reduced-motion fallbacks
- keep reusable primitives narrow and avoid speculative abstraction

### Verification

- visual inspection of shared shell behavior across route compositions
- reduced-motion and focus-style review

## Slice 3: Rebuild `/waitlist` as the flagship page

### Outcome

`/waitlist` becomes the primary premium launch experience with a full narrative arc, editorial product-story sections, trust messaging, and the premium not-live early-access panel.

### Files

- `apps/web/src/components/WaitlistPage.tsx`
- optional new supporting presentational components if needed

### Notes

- hero must communicate category and promise immediately
- product-story scenes must map to documented product truths:
  - daily clarity
  - forward-looking cash flow
  - shared-spend correctness
  - event receipts / place-aware context
- repeat CTA language at key points without hype

### Verification

- manual review of hierarchy, CTA flow, and content truthfulness
- local layout review for desktop, tablet, and mobile

## Slice 4: Rebuild `/` and `/privacy`

### Outcome

`/` becomes the premium front door and `/privacy` becomes a polished trust route, both aligned with the flagship waitlist experience.

### Files

- `apps/web/src/components/LandingPage.tsx`
- `apps/web/app/privacy/page.tsx`
- related supporting components if needed

### Notes

- `/` should summarize and route, not duplicate the full flagship story
- `/privacy` should be calm, product-language trust content rather than a skeletal support page
- ensure stronger internal linking between routes

### Verification

- manual review of narrative consistency and route roles
- heading-structure and internal-link review

## Slice 5: Metadata, tests, and verification

### Outcome

Copy, metadata, tests, and proof all align with the redesigned public surfaces.

### Files

- `apps/web/src/lib/site-config.ts`
- `apps/web/src/lib/site-metadata.ts` if route descriptions need adjustment
- relevant tests in `apps/web/src/lib/*.test.ts` and `apps/web/src/content/site-copy.e2e.test.ts`

### Notes

- update route descriptions only where the page intent materially improved
- preserve existing fail-closed SEO behavior and truthful schema scope

### Verification

- `pnpm --dir apps/web lint`
- `pnpm --dir apps/web typecheck`
- `pnpm --dir apps/web test`
- `pnpm --dir apps/web build`
- manual final review for responsiveness, accessibility, trust, and SEO alignment

## Re-Plan Triggers

- if the redesign requires new assets or external libraries to meet the quality bar
- if metadata or schema architecture needs broader changes than content-level reconciliation
- if responsive layouts require a larger component-system refactor than currently planned

## Review Notes

- fresh-context same-tool review was used after implementation because no second model was requested in this session
- review focus areas were unsupported-claim risk, responsive layout quality, reduced-motion safety, CTA honesty, and preservation of the existing SEO platform layer
- the home-page polish follow-up focused specifically on heading balance, copy density, editorial card rhythm, and device-preview readability in the product-glimpse section
- a later branch polish follow-up stayed inside the existing scope but refined the preview stack and mockup fidelity: shared device loading states, scroll-showcase step behavior, trust-carousel preview containment, social preview composition, and multiple mockup-level layout and alignment corrections
- a later bugfix follow-up kept the signature-feature previews mounted through resize and removed paint-containment from the shared card viewport layers so offscreen resize no longer leaves partially rendered or clipped card content behind
- a subsequent follow-up kept the signature-card viewport gates from pausing their internal animations while offscreen. That change was specifically to stabilize offscreen resize behavior in the `Budget your life moments` cards, where paused map/timeline layers could resume in a partially corrupted visual state
- the supplied inspiration was used only for composition principles: rounded section shells, visual-first device staging, and calmer density. It was not used as truth for pricing, testimonials, or feature breadth
- no re-plan trigger was hit; the redesign stayed within the planned file scope and did not require external assets or new dependencies

## Checklist

- [x] Slice 1 complete
- [x] Slice 2 complete
- [x] Slice 3 complete
- [x] Slice 4 complete
- [x] Slice 5 complete

## Verification Record

- `pnpm --dir apps/web lint`: passed
- `pnpm --dir apps/web typecheck`: passed
- `pnpm --dir apps/web test`: passed
- `pnpm --dir apps/web build`: passed after rerunning outside the sandbox because the first sandboxed attempt hit Windows `spawn EPERM`
- manual review completed for route roles, heading hierarchy, CTA flow, reduced-motion handling, and desktop/tablet/mobile layout intent
- later branch polish iterations were rechecked repeatedly with `pnpm.cmd --filter @gama/web typecheck` while refining preview loading, scroll behavior, and mockup fidelity without changing route scope
- the signature-feature resize fix re-ran `pnpm.cmd --filter @gama/web typecheck`; browser visual verification is still required for final confirmation because the original bug is resize and viewport-state dependent
