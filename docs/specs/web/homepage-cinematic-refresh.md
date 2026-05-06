# Feature Spec

## Linked Context

- product brief: [docs/product/shared/gama-product-brief.md](../../product/shared/gama-product-brief.md)
- product thesis: [docs/product/shared/product-thesis.md](../../product/shared/product-thesis.md)
- web PRD: [docs/product/web/website-prd.md](../../product/web/website-prd.md)
- landing strategy: [docs/product/web/landing-page-strategy.md](../../product/web/landing-page-strategy.md)
- web architecture: [docs/architecture/web/web-architecture.md](../../architecture/web/web-architecture.md)
- UI design standard: [docs/agent-workflows/ui-design-standard.md](../../agent-workflows/ui-design-standard.md)
- likely release gate: Gate A

## Overview

Refresh the home page so it feels premium, visual-first, and properly composed instead of copy-heavy after the hero. The redesign should replace the dense section stack with a clearer story rhythm, a hero tail that blends smoothly into the next section, a marquee for account connection breadth, a darker signature-features section built from distinctive product surfaces, a larger screen-led gallery, and a scroll-driven product walkthrough where the right-side device stays fixed while the left-side text advances through key product moments.

## User or Problem Context

The current homepage already has a custom premium visual system, but the structure below the hero still reads like stacked content blocks. There is too much explanatory copy, not enough product surface, and not enough intentional hierarchy between the key moments Gama needs to sell:

- short-term clarity
- forward-looking cash flow
- events and receipts
- shared-spend correctness
- privacy-first trust

The user feedback is explicit that this is not a polish pass. The page needs a more cinematic flow and a better balance between copy and product visuals.

## Scope

- redesign the homepage layout below the hero
- make the hero-to-body transition feel continuous instead of abrupt
- add a marquee under the hero that implies broad one-tap account connection support without turning into fake social proof
- add a dark post-hero section that showcases more unique product surfaces such as event context in the overview and map-based transaction views
- reduce copy density and replace it with more screen-led composition
- add a scroll-driven walkthrough section with changing left-side copy and a sticky right-side phone preview
- add a broader screen gallery that shows more of the available mockup surfaces
- keep the route grounded in current product truth and the existing web lane
- preserve the current hero intake and overall route architecture unless needed for design consistency

## Non-Goals

- redesigning `/waitlist` or `/privacy` in this pass
- adding new backend behavior, new routes, or live waitlist capture
- introducing external animation or scrolling libraries
- inventing unsupported product claims, launch dates, or social proof

## UX and Behavior

- the homepage must feel calmer, cleaner, and more editorial after the hero
- the hero handoff into the next section should feel blended, not like two unrelated surfaces stacked together
- the first section after the hero should be visually stronger than a proof strip and should introduce distinctive product moments in a darker contrasting band
- the bottom of the hero should include a restrained marquee that communicates broad account connectivity
- the scroll walkthrough must:
  - present multiple product steps with concise text on the left
  - keep a phone preview visually anchored on the right on desktop
  - change the visible preview as the active step changes
  - remain usable on tablet and mobile without relying on sticky desktop behavior
- the screen gallery should use multiple previews so the site no longer feels like it only has one or two hero screens
- trust messaging should stay visible but more composed and less blocky than the current dark-band layout

## Requirements

- homepage copy must stay faithful to Safe-to-Spend, forward-looking cash flow, event context, shared spending, and privacy-first trust
- the scroll walkthrough must use existing repo mockup previews rather than external assets
- motion must be subtle and reduced-motion safe
- keyboard focus, semantic headings, and readable text hierarchy must remain intact
- the redesign must not depend on a client-only render of the whole page; only the interactive walkthrough should require client state

## Acceptance Criteria

- the homepage feels materially more visual and less copy-dense below the hero
- the new walkthrough keeps a device preview anchored on desktop while the narrative steps advance beside it
- the walkthrough preview swaps between multiple screens cleanly with no broken state
- the page shows materially more of the available mockup screens than before
- desktop, tablet, and mobile layouts remain intentional and uncluttered
- `pnpm --dir apps/web lint` passes
- `pnpm --dir apps/web typecheck` passes
- `pnpm --dir apps/web test` passes

## Clarifying Questions

- none required before implementation; the requested direction is specific enough to execute within the current web-lane scope

## File Plan

- `docs/specs/web/homepage-cinematic-refresh.md`: feature spec for the homepage refresh
- `docs/specs/web/plans/homepage-cinematic-refresh.md`: slice plan and verification record
- `apps/web/src/content/site-copy.ts`: add homepage-specific walkthrough and gallery content structures
- `apps/web/src/content/site-copy.e2e.test.ts`: keep copy-shape assertions aligned with the new homepage content
- `apps/web/src/components/LandingPage.tsx`: rebuild the homepage section flow
- `apps/web/src/components/ScrollFeatureShowcase.tsx`: add the interactive sticky walkthrough component
- `apps/web/app/globals.css`: replace the old homepage-only layout rules with the new visual system and responsive behavior

## Interfaces and Types

- typed homepage walkthrough step objects with preview slugs and concise supporting bullets
- typed homepage marquee and signature-feature content structures
- typed homepage screen-gallery card objects with preview slugs and supporting metrics
- no backend interfaces or route contracts change in this pass

## Edge Cases

- the sticky walkthrough must degrade safely on smaller viewports where desktop stickiness is not appropriate
- preview swapping must not leave blank device states while iframes load
- the page should still read coherently if reduced motion disables the crossfade feel
- the larger visual section count must not make the homepage heavier to scan than the current version

## Security and Privacy Implications

- no auth, storage, schema, analytics, or tracking behavior changes
- no additional feature-dependent obligations from `docs/security/security-review-baseline.md` apply to this UI-only homepage refresh

## Future Extensibility Notes

- the walkthrough component can later support richer captions, progress indicators, or real product screenshots without changing the section structure
- the gallery rhythm can be reused on `/waitlist` later if the flagship route needs the same screen-led storytelling style
- the hero tail now assumes a continuous transition into a dark signature band. If a future redesign removes that contrast change, the marquee and overlap treatment should be re-specified rather than loosened ad hoc
- the pinned walkthrough now assumes a desktop-only sticky region with a single visible text panel at a time; if later design changes require multiple concurrent cards, the section should be re-specified instead of layered ad hoc
- the walkthrough visual language is now intentionally sparse: minimal left-copy stage, reduced chrome, and a right-side frame panel that behaves more like a pinned product mockup than a marketing card
- the final walkthrough implementation uses separate desktop and mobile structures instead of one hybrid layout. Desktop owns the pinned scrollytelling behavior; mobile falls back to a simpler stacked sequence
- the final walkthrough removes the standalone section header entirely. The band now begins directly with the pinned showcase, a compact progress indicator, and a clipped device viewport that preserves the phone size while only showing the visible portion that fits the stage
- the homepage now uses a hero-bottom marquee and a dark signature-features section immediately after the hero instead of the earlier proof-only strip

## Verification Plan

- verify homepage copy structure through the existing `site-copy` test
- run `pnpm --dir apps/web lint`
- run `pnpm --dir apps/web typecheck`
- run `pnpm --dir apps/web test`
- perform manual responsive review by code inspection and local rendering expectations for desktop, tablet, and mobile
- perform reduced-motion and focus-state review for the new walkthrough behavior

## Implementation Plan Link

- [docs/specs/web/plans/homepage-cinematic-refresh.md](plans/homepage-cinematic-refresh.md)

## Checklist

- [x] planning complete
- [x] feature spec and implementation plan added
- [x] homepage copy structures updated
- [x] homepage layout rebuilt
- [x] scroll walkthrough implemented
- [x] verification complete
- [x] independent review fallback recorded

## Design Decisions

- use the supplied reference image only for composition principles: split-scroll storytelling, restrained density, and anchored-device focus
- reject literal copying of the reference layout, fake enterprise branding, and generic onboarding language that does not match Gama
- keep the current hero framework but rebuild the post-hero narrative into fewer, stronger visual sections

## Review Notes

- the supplied reference image was used only for composition principles: split-scroll storytelling, lower copy density, and a right-side anchored device. The implementation intentionally rejected generic onboarding copy, fake brand logos, and literal duplication of the reference layout
- same-tool review fallback was used after implementation to check for stale homepage classes, responsive ordering issues in the walkthrough, and encoding or motion issues in the client component
- a follow-up correction replaced the initially stacked left-column walkthrough with the intended pinned-sequence behavior: one visible step at a time, desktop scroll progress driving the active card, and a frame that remains in view while only the screen content changes
- a second follow-up correction simplified the walkthrough to better match the reference: the band no longer clips sticky behavior, the right side is mostly just the device stage, and heading scales across the page were reduced to avoid excessive line wrapping
- the final corrective pass replaced the fragile hybrid walkthrough implementation with a simpler architecture: one desktop pinned timeline with a single active text card and anchored device frame, plus a separate stacked mobile variant
- the latest corrective pass fixed the desktop/mobile visibility split, removed the leftover walkthrough intro, added a clearer progress rail plus step labels, and changed the right-side stage to clip the full-size device instead of shrinking it to fit
- the latest homepage structure pass removed the abrupt hero-to-body break by adding a darker hero tail, a restrained account-connection marquee, and a new dark signature-features section that uses existing overview, map, and stories previews
- the latest visual refinement removed the harsh dark hero gradient, replaced the pill-style marquee with centered logo-and-name marks, and tightened the signature-features section into a more editorial dark board closer to the supplied reference composition
- the latest layout refinement makes the marquee a continuous looping strip and removes visible light-section band styling so the page reads as one continuous background, with only the dark contrasting sections presenting as rounded containers
- the latest feature-board refinement replaces full-phone drops with cropped product surfaces, shortens the signature copy, restores edge spacing on the dark rounded sections, and lets the floating nav switch into a darker treatment when crossing those sections
- the latest refinement removes the split signature header and separate gallery band on the homepage, replacing them with a four-card dark product board that uses mostly cropped framed screens with concise icon-led captions, while the trust section now reduces into an auto-rotating carousel with lighter copy and explicit progress indication
- the latest corrective pass restores framed device containment inside the signature and trust sections, simplifies the walkthrough header to current-step progress only, removes extra hero CTA text in favor of a stronger waitlist input treatment, upgrades the shared button system toward a glossier brand-aligned style, and rebuilds the footer into a branded premium close instead of a thin text strip
- the latest polish pass softens the button palette and hover behavior, removes the header subtitle in favor of a cleaner single-line brand, introduces a responsive overflow menu for the nav, widens and recrops the walkthrough and signature devices to match the hero phone more closely, updates the trust carousel to emphasize account setup, correction, and previewable sharing, and reduces visible hero-to-footer background seams so the page reads as one continuous surface
- the latest corrective pass replaces the broken mixed-mode header with a true desktop row plus mobile drawer, reduces CTA bulk in the hero input, tightens the phone preview overscan to remove resize-edge gaps, increases signature and walkthrough phone widths to the hero scale, recrops the signature tiles toward top and bottom details, and removes the extra trust-stage chrome so the trust section reads closer to the page surface instead of another nested card
- the latest corrective pass fixes the narrow-screen nav shell so the menu trigger stays on the far right with proper page insets, removes the remaining walkthrough stage backdrop, rebuilds the trust carousel around one shared slide container, widens the signature and trust phones again, and restyles the primary CTA system toward calmer glassier pills with cleaner hover states
- the latest containment pass restores a visible rounded walkthrough stage, makes each trust slide container explicitly hold both the copy and phone visual, and replaces the signature-card phone offsets with wider, consistent crop geometry so the framed previews fit cleanly inside each card
- the latest signature-board refinement differentiates the four card crops by intent: overview now uses a bottom-of-phone crop that peeks from the top edge toward the events timeline, map context uses a top-of-phone crop that peeks from the bottom edge, and the other cards use center crops that span the preview well while the copy and dark tile styling were tightened toward the supplied reference mood
- the latest cleanup pass removes the signature-card eyebrow label row, switches the four signature cards back to one consistent full-height device treatment, widens the preview compositions, shifts only the overview iframe viewport downward to target the events timeline section specifically, and makes the trust carousel leaner with shorter copy, a removed section subhead, top-aligned text, and wider top-focused device crops
- the latest corrective sizing pass makes the signature cards materially taller so the device frames render wider without distorting aspect ratio, clamps the signature descriptions to a consistent two-line rhythm, pushes the overview viewport farther down so the events timeline region becomes the visible target, increases vertical separation between the trust header and slide controls, and expands the trust slide stage plus device column so the left copy stays top-aligned while the right device shows a wider top-focused crop
- the latest signature-card correction reverses the too-tall board experiment: the cards now use a shorter fixed preview well with a wider cropped phone, single-line titles, a larger icon, wider copy allowance, and consistent preview heights while the overview card keeps its dedicated iframe viewport shift so the events timeline remains the intended visible content
- the latest reference-alignment pass removes the nested signature-card visual container so the product crop and copy now read as one blended surface, tightens the card text rhythm toward the supplied reference, and switches the web root to Manrope so the site typography matches the product mockups more closely
- the latest signature composition pass pushes the cards closer to the supplied reference by shrinking and placing the phone toward the upper-left of each card, restoring more empty dark field around it, and narrowing the copy column so the section feels more premium, minimal, and editorial
- the walkthrough was kept isolated in a single client component so the route remains mostly server-rendered and the sticky preview logic does not leak into unrelated homepage sections
- verification completed with `pnpm.cmd --dir apps/web lint`, `pnpm.cmd --dir apps/web typecheck`, `pnpm.cmd --dir apps/web test`, and `pnpm.cmd --dir apps/web build`
- the first sandboxed production build failed with Windows `spawn EPERM`; rerunning the same build outside the sandbox completed successfully, and the Manrope font import also required unrestricted network access for final production verification

## Final Reconciliation

The homepage now uses a more cinematic post-hero flow with stronger section transitions instead of the previous stacked copy-heavy bands:

- a hero tail that blends into the body with a restrained account-connection marquee
- a dark signature-features band immediately under the hero that highlights overview event context, map-based transaction context, and narrative stories
- a split-scroll walkthrough with a sticky right-side device and a single visible left-side step that advances as scroll progress moves through the section
- a four-tile signature board that absorbs the previous gallery storytelling into cropped framed product moments
- a darker trust close that keeps privacy posture visible through a lighter, rotating carousel instead of a stack of text-heavy note cards

Homepage content now includes dedicated marquee, signature-feature, walkthrough, and gallery structures in `site-copy`, and the interactive walkthrough swaps existing mockup previews through the existing `/preview/[slug]` route rather than introducing new asset infrastructure.

The walkthrough is now intentionally more minimal than earlier iterations: no separate heading block, smaller titles, less chrome around the pinned device, a visible scroll progress treatment, and clearer separation between the storytelling text and the demo frame. The desktop device remains fixed while scroll progress advances the active step, and the phone can now be partially cropped by the stage without resizing the device itself. The shipped change stays within homepage scope. `/waitlist`, `/privacy`, metadata, schema, and backend behavior remain unchanged.

The current pass also re-centers the UI system around a more restrained shared primitive set: calmer CTA gradients, non-shifting hover states, consistent phone-frame proportions across hero, walkthrough, signature, and trust sections, a real slide container in the trust carousel, and a cleaner footer with explicit contact access instead of a generic text block. The preview scaling script was tightened so the iframe content slightly overscans and centers horizontally, which removes the white-edge gaps that appeared around the hero device during resize.

The latest refinement specifically moves the signature cards closer to the supplied reference by removing the feeling of a separate visual box inside each card. Each card is now one dark board with the product crop fading directly into the copy, larger Manrope-set headings, and tighter caption spacing so the section feels more minimal, blended, and editorial without changing the actual product claims or card content.
