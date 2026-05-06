# Implementation Plan

## Linked Context

- feature spec: [docs/specs/web/homepage-cinematic-refresh.md](../homepage-cinematic-refresh.md)
- PRD: [docs/product/web/website-prd.md](../../../product/web/website-prd.md)
- likely release gate: Gate A

## Scope

Refresh the homepage experience under the hero so it feels more premium, more visual, and less text-led, while adding a sticky scroll walkthrough that advances screen previews as the user reads.

## Preconditions

- homepage messaging must stay grounded in the linked product docs
- only homepage files are in scope unless a narrower supporting change is needed
- no remaining feature-dependent obligations from `docs/security/security-review-baseline.md` apply to this UI-only change

## File-Level Plan

- `docs/specs/web/homepage-cinematic-refresh.md`: track the behavior and reconciliation
- `docs/specs/web/plans/homepage-cinematic-refresh.md`: track execution slices and proof
- `apps/web/src/content/site-copy.ts`: add home walkthrough and gallery content
- `apps/web/src/content/site-copy.ts`: add hero marquee and signature-feature content
- `apps/web/src/content/site-copy.e2e.test.ts`: update expectations for the new content shape
- `apps/web/src/components/LandingPage.tsx`: rebuild the post-hero section structure
- `apps/web/src/components/ScrollFeatureShowcase.tsx`: implement the interactive sticky walkthrough
- `apps/web/app/globals.css`: replace obsolete home-only layout rules and add the new responsive styling

## Interfaces and Data Structures

- `home.connectMarquee`: repeated account-connection names shown in the hero tail marquee
- `home.signatureFeatures`: dark post-hero feature cards for distinctive product surfaces
- `home.walkthrough`: heading content plus ordered walkthrough steps with preview slugs
- `home.screenGallery`: heading content plus editorial preview cards

## Design Choices

- keep the hero visually familiar enough to avoid broad route churn
- preserve the core hero composition but extend it into a smoother handoff instead of ending at a hard visual edge
- move the major novelty into one strong interactive section instead of many smaller gimmicks
- use CSS `position: sticky` for desktop anchoring and a small client component for active-step state
- use existing `/preview/[slug]` iframe routes in the client walkthrough so the preview can swap without server-only component constraints

## Edge Cases and Failure Modes

- if IntersectionObserver timing feels unstable, active-step selection must still settle on the most visible card
- if inactive preview iframes are hidden, the active preview must remain fully readable and not inherit stray pointer behavior
- on small screens, the walkthrough must remain legible when the sticky layout collapses to a linear flow

## Slice Plan

- Slice 1
  - files to change: `docs/specs/web/homepage-cinematic-refresh.md`, `docs/specs/web/plans/homepage-cinematic-refresh.md`, `apps/web/src/content/site-copy.ts`, `apps/web/src/content/site-copy.e2e.test.ts`
  - interfaces or contracts affected: homepage content structures only
  - design choice for the slice: define the new homepage narrative before touching layout code
  - edge cases or failure modes touched: avoid duplicate or contradictory homepage messaging
  - verification required before moving on: content test still passes or is updated alongside the shape change

- Slice 2
  - files to change: `apps/web/src/components/ScrollFeatureShowcase.tsx`, `apps/web/src/components/LandingPage.tsx`
  - interfaces or contracts affected: walkthrough step props and preview routing
  - design choice for the slice: isolate scroll-state logic in a single client component and keep the page shell mostly server-rendered
  - edge cases or failure modes touched: sticky behavior, active-step swapping, reduced-motion friendliness
  - verification required before moving on: typecheck and manual code review of the walkthrough logic

- Slice 3
  - files to change: `apps/web/src/components/LandingPage.tsx`, `apps/web/app/globals.css`
  - interfaces or contracts affected: homepage section markup and classes
  - design choice for the slice: replace the old stacked bands with a more editorial section rhythm and larger preview surfaces
  - edge cases or failure modes touched: responsive layout collapse, copy density, preview sizing
  - verification required before moving on: lint, typecheck, test, and manual responsive review

## Plan Review

- independent review or cross-model review needed: same-tool fresh-context review fallback after implementation
- review findings before implementation: none

## Failure and Rollback Considerations

- the change is isolated to homepage content, layout, and styling
- if the walkthrough introduces regressions, it can be removed without affecting routes, metadata, or backend behavior
- if the new CSS collides with shared rules, roll back the new home-only class block rather than shared primitives

## Re-Planning Triggers

- the walkthrough requires new preview infrastructure beyond the existing preview route
- the redesign expands into waitlist or privacy route changes
- verification reveals that the sticky layout is not viable without larger structural changes
- the walkthrough implementation shows multiple left-side cards in normal flow instead of a single pinned step viewport
- the walkthrough band clips sticky behavior or carries too much visual chrome to match the intended minimal reference
- the walkthrough implementation still depends on a single hybrid DOM structure for both desktop pinning and mobile fallback, increasing the risk of broken visibility or sticky behavior
- the walkthrough still renders its mobile fallback alongside the desktop experience, lacks a clear progress cue for step timing, or resizes the device instead of clipping it within a fixed stage
- the hero still breaks abruptly into a separate body surface, the marquee feels like fake-logo clutter, or the first dark section fails to showcase truly distinctive product moments

## Completion Evidence

- updated homepage spec and plan
- homepage content test aligned with the new content structures
- passing `pnpm --dir apps/web lint`
- passing `pnpm --dir apps/web typecheck`
- passing `pnpm --dir apps/web test`
- manual review notes for layout rhythm, motion, and reduced-motion behavior

## Documentation Reconciliation

- reconcile the feature spec checklist and final reconciliation after implementation
- keep the review notes explicit about the supplied inspiration and what was borrowed versus rejected

## Verification Record

- `pnpm.cmd --dir apps/web lint`: passed
- `pnpm.cmd --dir apps/web typecheck`: passed
- `pnpm.cmd --dir apps/web test`: passed
- `pnpm.cmd --dir apps/web build`: passed after rerunning outside the sandbox because the first sandboxed attempt hit Windows `spawn EPERM`
- same-tool review fallback completed against the touched homepage files and the new walkthrough component
- follow-up correction completed: desktop walkthrough now uses a pinned scroll region with one visible left-side step at a time instead of stacked cards in normal flow
- follow-up polish completed: walkthrough band no longer uses clipping that interferes with sticky behavior, right-side stage chrome was reduced, and home heading scales were tightened
- final corrective rebuild completed: desktop and mobile walkthrough structures are now separate, reducing interaction fragility and making the desktop pinned frame behavior simpler to reason about
- latest refinement completed: the walkthrough intro header was removed, the mobile fallback selector mismatch was corrected, the left side now exposes explicit progress state, and the right-side stage clips the full-size device instead of shrinking it
- hero continuity pass completed: the hero now carries a marquee tail, the first post-hero section is a darker signature-features band instead of a proof strip, and the new section is built from real overview, map, and stories previews
- marquee and signature-board refinement completed: the marquee now uses centered logo-plus-name marks without pill containers, the hero fade is softer, and the dark signature section was tightened toward a more reference-like editorial board
- latest section redesign completed: the signature band now uses a full-width inset rounded shell with a single full-width heading and a 2x2 cropped-device board, while the trust band now swaps the old pillar stack for a smaller auto-rotating carousel with explicit indicators
- containment refinement completed: the walkthrough phone now sits inside a visible rounded stage again, each trust slide uses one shared content container that also contains the device visual, and the signature cards use wider consistent phone crops plus larger copy padding so the framed screens sit cleanly within each card
- signature crop refinement completed: overview now crops toward the events timeline from the top edge, map context now crops from the bottom edge to show the top of that screen, receipt and stories now use center crops, and the signature copy plus dark tile styling were tightened toward the supplied reference
- full-height board refinement completed: the signature cards now use one consistent full-height device treatment with icon-only metadata, a wider preview area, and an overview-specific iframe viewport shift to show the events timeline portion of the overview screen, while the trust section now removes the extra header paragraph, shortens slide copy, top-aligns the slide text, and uses wider top-focused device crops
- final sizing refinement completed: the signature board now uses taller cards and taller preview wells so the devices render wider, the card descriptions are clamped to a consistent two-line height, the overview viewport shift is stronger to target the events timeline region, and the trust section now has more space between its heading and tabs plus a larger slide stage and wider device column so the left copy remains top-aligned and the right device no longer reads as a narrow center crop
- signature board rollback-and-fix completed: the cards now use shorter fixed-height preview wells with wider cropped devices, the titles were shortened and forced onto one line, the icon size was increased, the copy column width was loosened to prevent early wrapping, and the preview wells are again consistent across all four cards while the overview iframe keeps its dedicated shift toward the events timeline
- signature reference alignment completed: the distinctive-product-moments cards now use one continuous interior surface instead of a nested visual tile, the phone crop blends into the copy area with a softer fade, and the web root now loads Manrope so the site typography aligns with the mockup/reference family
- signature composition refinement completed: the cards now treat the phone as a smaller placed object in the upper-left of each board with more negative space, quieter gradients, and tighter copy width so the section reads closer to the supplied premium reference instead of like a cropped screenshot block
