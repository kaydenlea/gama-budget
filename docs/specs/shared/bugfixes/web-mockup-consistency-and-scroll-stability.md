# Bugfix Spec

## Overview

Fix web-lane mockup inconsistencies across the mobile preview surfaces and address the shared rendering instability causing sections to disappear or partially paint while scrolling.

## Failure Context

Observed behavior:
- The lower sheet/background color is inconsistent across the Accounts, Bills, Cash Flow, and Overview mockup surfaces.
- The top-nav center pill is visually inconsistent across those same surfaces, with Accounts and Cash Flow inheriting incorrect letter spacing and Overview rendering wider than its text.
- The browser tab title can render page titles without `Gama` leading the title.
- Multiple website visuals intermittently disappear, partially paint, or reload while scrolling, including the Place Context card and hero waitlist input text.
- Event Details quick-action icons render slightly too large.
- The `Moments ready to share` and `Stories explain the shift` signature cards visibly ease, pause, or bounce during their embedded scroll sequences; the stories button scales awkwardly; and the stories success state appears as a smaller card instead of a stable full-device screen.
- In Firefox, Place Context map marker emoji glyphs can sit down and right of center, and the `Selected` marker pill text can sit too high in the pill.
- On initial page open, the hero Overview preview can appear blank while the eager iframe waits for its ready path.
- The first three `Budget your life moments` cards can show visible, mismatched visual-window background panels behind their mockup visuals.
- Trust carousel device previews can diverge from the Scroll Showcase geometry because trust-only preview variants change content scale and Accounts padding, and the trust-specific mask uses different inset/radius values.

Expected behavior:
- The lower sheet color should consistently match the Accounts reference surface.
- The top-nav center pill should match the Bills reference surface.
- Browser tab titles should begin with `Gama`.
- Signature visuals, walkthrough previews, and hero waitlist content should stay visibly rendered during scroll.
- Event Details quick-action icons should be slightly smaller.
- Signature-card mockup motion should remain smooth and compositor-friendly, with no visible bounce, button text scaling, or success-screen layout shift.
- Map marker emoji and selected-pill text should be visually centered across Edge and Firefox.
- The hero Overview preview should be visible on initial page open instead of opacity-gated to blank.
- The first three signature-card visual wells should blend into the card instead of reading as separate panels. The Map Context card should keep its current treatment.
- Trust carousel previews should preserve the existing cropped presentation while matching the Scroll Showcase frame/mask geometry and source mockup content scale.

## Reproduction

Direct browser reproduction was not run before editing in this pass. The bug report came from user observation, and static inspection identified concrete style mismatches plus shared rendering-risk patterns in the web lane.

## Evidence

- `apps/web/src/content/mockups/accounts.html` uses the intended lower-sheet background `#f2f5f7`.
- `apps/web/src/content/mockups/bills.html` and `apps/web/src/content/mockups/cash-flow.html` use `#d7e4ed` for the lower sheet instead.
- `apps/web/src/content/mockups/accounts.html` and `apps/web/src/content/mockups/cash-flow.html` both include broad `.text-[10px].font-extrabold` overrides that force negative letter spacing on the nav title.
- `apps/web/src/lib/site-metadata.ts` uses the root title template `%s | Gama`, which puts `Gama` last in browser tab titles.
- `apps/web/app/globals.css` contains a `contain: paint` mask around walkthrough iframes and several continuous animated, filtered, or composited hero/signature layers that increase scroll-time paint risk.

## Root-Cause Statement

This regression is a combination of local style drift in the mockup HTML sources and shared rendering fragility in the marketing page. The mockup drift comes from divergent hard-coded background values and broad text overrides. The scroll instability is likely driven by aggressive compositing and animation choices across walkthrough masks, animated signature visuals, and the hero waitlist shell, which makes multiple unrelated sections susceptible to partial repaint or disappearance during scroll.

## File Plan

- `docs/specs/shared/bugfixes/web-mockup-consistency-and-scroll-stability.md`
- `apps/web/src/content/mockup-previews.ts`
- `apps/web/src/content/mockups/accounts.html`
- `apps/web/src/content/mockups/bills.html`
- `apps/web/src/content/mockups/cash-flow.html`
- `apps/web/src/content/mockups/overview-screen.html`
- `apps/web/src/content/mockups/event-details.html`
- `apps/web/src/content/mockups/stories.html`
- `apps/web/app/globals.css`
- `apps/web/src/components/LandingPage.tsx`
- `apps/web/src/components/ProductVisuals.tsx`
- `apps/web/src/lib/mockup-preview-html.ts`
- `apps/web/src/lib/site-metadata.ts`
- `apps/web/src/lib/site-metadata.unit.test.ts`

## Minimal Fix Plan

- Align mockup lower-sheet colors with the Accounts reference value.
- Align nav center pills with the Bills reference pill and explicitly restore correct header letter spacing where broad rules were overriding it.
- Tighten the Overview pill width so it hugs its content.
- Make the browser title template lead with `Gama`.
- Reduce rendering-risk on the website by removing the walkthrough paint containment, calming the heaviest continuous signature/hero animations, and forcing a stable visible state for the Place Context card.
- Reduce the Event Details quick-action icon size slightly.
- Convert Event Details and Stories preview scroll timelines to constant-rate `translate3d` transforms.
- Replace the Stories button scale pulse with non-layout-affecting color and shadow feedback.
- Make the Stories success state fill the preview frame and reveal through opacity/translate only.
- Keep the Stories signature-crop success metric card from inheriting the broader `.glass-ios` crop sizing override.
- Bump the preview cache key so the corrected embedded mockup HTML is requested by the website.
- Wrap Place Context marker emoji in a targetable span and center the marker/pill with browser-stable grid alignment plus a Firefox-specific glyph correction.
- Make eager preview frames visible immediately and remove the hero visual opacity gate that can leave the initial Overview screen blank.
- Remove the first three signature-card visual-window panel overlays while preserving the Map Context card styling.
- Preserve trust-carousel cropped sizing, use the same preview-mask inset/radius as Scroll Showcase, and remove trust-only mockup scale/padding variants so Accounts, categorized movement, review, and add-transaction previews share source geometry.

## Edge Cases

- Preview surfaces must still crop and scale correctly inside the `/preview/[slug]` route after background changes.
- Reduced-motion behavior must continue to show visible content, not reintroduce hidden states.
- Stabilizing the Place Context card should not collapse its layout or hide its action text.
- The title change must not break canonical or Open Graph metadata expectations.

## Verification Plan

- Run targeted metadata tests for the title template.
- Run a targeted web typecheck or test command if available in the workspace.
- Manually inspect the changed mockup files for consistent lower-sheet colors, nav pill sizing, and icon scale.
- Compare the Place Context, hero waitlist, and walkthrough rendering code before and after to ensure the new defaults favor stable visibility over animation-heavy states.

## Review Notes

- Applied the mockup fixes at the HTML source level instead of relying only on preview-route normalization so the source-of-truth files now match the intended visual system.
- Reduced the heaviest scroll-time rendering risk by removing walkthrough paint containment and freezing the Place Context card into a stable visible state rather than cycling animated popup states.
- Added a focused metadata unit assertion so the browser-title fix is covered by an automated check.
- Follow-up motion fix on 2026-05-02: Event Details and Stories preview scroll shells now use constant-rate `translate3d(...)` transforms with short settle bands before each hold; Event Details now uses a longer timeline and final-content dwell before returning; Stories no longer scrolls the underlying content back up while the success overlay is visible; the Stories button no longer animates scale and now signals the press through color and shadow; the Stories success screen fills the full preview frame while keeping the content top-weighted for the visible signature-card crop; the Stories signature crop no longer enlarges the success metric card through the generic `.glass-ios` override; `PREVIEW_BUST` was updated so the corrected iframe source is requested. Targeted verification: `pnpm.cmd --filter @gama/web typecheck`.
- Follow-up rendering fix on 2026-05-02: Place Context marker emoji are wrapped and centered with a Firefox-specific glyph correction, the `Selected` pill uses grid centering, the hero reveal again waits for the iframe load or a short fallback so intermediate preview/chip states are not exposed, and the first three signature-card visual-window overlays were removed so their backgrounds blend into the card. Targeted verification: `pnpm.cmd --filter @gama/web typecheck`, `pnpm.cmd --filter @gama/web lint`.
- Follow-up trust-carousel fit fix on 2026-05-02: Reverted the full-phone sizing attempt and preserved the existing cropped trust-carousel presentation. The actual fix now removes trust-only mockup scaling/padding variants and keeps a trust-only preview mask with a slightly safer inset plus inherited iframe radius/clip so screen content is not pressed into the device edges, while preventing the Accounts bridge asset/debt component from being hidden or displaced by the `accounts-trust` variant. Targeted verification: `pnpm.cmd --filter @gama/web typecheck`, `pnpm.cmd --filter @gama/web lint`.
- Follow-up trust-carousel spacing fix on 2026-05-02: Increased only the trust-carousel preview mask horizontal inset slightly so slide visuals have a little more side breathing room without changing the Scroll Showcase or preview-route geometry. Reduced vertical padding and internal spacing only for the `review-transaction-trust` category/event cards used by the `Corrected efficiently` slide.
- Follow-up trust-carousel source-inset fix on 2026-05-02: Added a trust-only preview variant so the embedded mockup canvas itself renders with horizontal inset inside the trust carousel, moving screen UI such as the top nav buttons away from the clipped device edges without affecting Scroll Showcase or normal preview routes. Removed the forced square shape from the `review-transaction-trust` category/event fields and gave them compact fixed height plus smaller icon/chip spacing.
- Follow-up trust-carousel nav/padding correction on 2026-05-02: Restored modest vertical padding to the `review-transaction-trust` category/event fields after the compact pass became too tight, while keeping them smaller than the original square cards. Added a trust-only `transactions-categorized` top-nav override so the `Sorted transparently` slide uses the same compact dark island treatment as the `Connected deliberately` accounts slide without changing other uses of the categorized transactions mockup.
- Follow-up trust-carousel nav/padding correction on 2026-05-02: Increased the compact `review-transaction-trust` category/event card height enough for the intended vertical padding to be visible. Adjusted the trust-only `transactions-categorized` top-nav override to preserve the original light premium container styling and only normalize size, pill padding, and title tracking.
- Follow-up trust-carousel categorized nav placement fix on 2026-05-02: Adjusted only the trust-variant `transactions-categorized` header wrapper/header vertical padding so the `Sorted transparently` top nav sits at the same height as the accounts slide instead of lower in the map section.
- Follow-up trust-carousel horizontal fit fix on 2026-05-02: Increased the trust-only embedded preview source inset from 22px to 36px per side so every trust slide has more horizontal clearance inside the device frame without affecting Scroll Showcase or standard preview routes.
- Follow-up trust-carousel horizontal fit correction on 2026-05-02: Changed the trust-only preview variant to scale from the available width instead of cover-scaling from height, because cover scaling ignored the horizontal inset whenever the cropped trust frame height dominated. Bumped the preview cache key so trust iframe URLs request the corrected renderer.
- Follow-up trust-carousel component-inset correction on 2026-05-02: Reverted the trust renderer back to cover scaling so each screen fills the device frame again. Moved the trust-only horizontal fix to internal content padding for the mockup containers, headers, sheet content, and bottom navs so components sit farther from the device edges without changing the screen width.
- Follow-up walkthrough synchronization fix on 2026-05-02: Added a preview-ready callback from `EmbeddedPreviewFrame` and now keep Scroll Showcase and Trust carousel copy synced to the active ready iframe instead of the requested target. Added a Scroll Showcase `walkthrough` preview variant to give non-Accounts walkthrough screens account-like internal side padding without changing device-frame width, plus a restrained step marker row to make step changes legible.
- Follow-up mockup contrast and icon sizing fix on 2026-05-02: Added an Overview-specific walkthrough inset to align its horizontal spacing with the other Scroll Showcase screens. Made walkthrough bridge/glass bridge surfaces opaque and increased contrast between section containers and inner cards. Reduced Event Details top-nav/action/map/View All icon sizing and adjusted its section container contrast at the source mockup level. Bumped the preview cache key.
- Follow-up visual polish correction on 2026-05-02: Increased Cash Flow bridge selector/highlight contrast, aligned the Overview walkthrough inset back to the shared walkthrough value, moved Scroll Showcase step markers beside the step label, raised Event Details icon sizes slightly from the prior too-small pass, added a fourth Overview timeline event to fill the lower scroll dwell, and replaced the redundant footer contact label with `Email the founder`.
- Follow-up correction on 2026-05-02: Removed the mistakenly added `Saturday Market` entry from the actual Overview mockup and kept it only in the `Events stay in the daily view` signature-card visual. Replaced the extra beside-label Scroll Showcase marker row with the main segmented progress track, softened the broad walkthrough bridge/card contrast overrides after they made Cash Flow surfaces too outlined, narrowed only the Overview walkthrough inset because its viewport-mode mockup was receiving extra internal padding versus the other showcase screens, changed the footer Contact value to an icon-only email control, and normalized the Overview walkthrough green pill/chart treatment to the Accounts green. Targeted verification: `Select-String` placement checks plus web typecheck/lint.
- Follow-up correction on 2026-05-02: Made the Scroll Showcase progress track explicitly segmented and visible with one segment per step instead of a thin line that could read as empty. Further reduced only the Overview walkthrough inset after identifying the remaining mismatch as the Overview source mockup's viewport wrapper plus section `px-3` content path, not the device frame. Removed hover translate movement from primary CTA/button treatments to avoid Firefox text-position jitter. Re-anchored hero floating chips to the centered device width during the 720-1119px stacked breakpoint so they stay attached to the phone instead of the wider visual container.
- Follow-up correction on 2026-05-02: Restored continuous Scroll Showcase progress by reintroducing scroll progress state and filling each segment proportionally while preserving segmented step boundaries. Moved the Overview green normalization outside the walkthrough-only branch so the hero Overview iframe and Scroll Showcase Overview iframe use the same green. Adjusted the 720-1119px hero chip offsets farther out from the centered device and raised them above the device in that breakpoint so they remain visible. Tightened the footer brand copy line-height/max-width/min-height so the logo and two-line brand text align vertically.
- Follow-up correction on 2026-05-02: Corrected the segmented progress fill formula to map scroll progress across the transitions between steps, not across a static completed-step display. Footer brand copy now uses the footer note, is constrained to the logo's 52px height, line-clamped to two rows, and the copyright includes the current year. Footer social/contact icons now use solid colored treatments instead of dotted placeholder outlines. The 720-1119px hero chip offset and stacking order were increased so chips protrude from the sides of the phone instead of sitting under the device layer.
- Follow-up correction on 2026-05-02: Changed Scroll Showcase progress to render transition segments only, so it starts empty and each segment fills during the scroll interval into the next step instead of starting with the first bar filled. Footer icon treatments now use platform-appropriate Instagram/TikTok/X/email colors instead of shared random blue/green styling, and the footer brand note is shorter with a more compact max width. The 720-1119px hero chip offsets were moved farther out and lowered from the top edge so chips are visible from the sides rather than appearing above or under the phone. Bills `View All` was marked transparent and protected from the shared glass-island button background override.
- Follow-up correction on 2026-05-02: Restored four Scroll Showcase progress segments while keeping the initial state empty by mapping each bar to a quarter of continuous scroll progress. Reverted footer social/contact icon color overrides to neutral styling, tightened the footer into a compact single-row layout on wider widths with responsive stacking, and narrowed the footer brand note. Lowered only the 720-1119px hero chip top positions so they sit below the device's top edge.
- Follow-up correction on 2026-05-02: Synced Scroll Showcase step thresholds to the same four-segment progress math used by the progress bars, replacing the old `round(progress * (steps - 1))` threshold that caused the step to lag after segment completion. Changed the footer container to span the full viewport width and use explicit brand/meta columns so social and contact occupy the row instead of bunching together with empty center space. In the 720-1119px hero range, chips now sit below the device layer (`z-index: 2`) and are offset farther outside the phone so the device covers only the intended inner edge.
- Follow-up correction on 2026-05-02: Merged footer Social and Contact into one `Social and contact` group containing all four icons. Reduced only the 720-1119px hero chip side offset while preserving the below-device layering so the chips stay attached to the device instead of drifting too far outward while scrolling.
- Follow-up correction on 2026-05-02: Renamed the merged footer icon group back to `Social` and restored the footer card to the centered site-shell layout after the full-bleed treatment created left-edge imbalance. Added a static, CSS-only highlight behind the hero device with gradients and box-shadow, avoiding new animation or runtime work.
- Follow-up correction on 2026-05-02: Replaced the hero-device pseudo-element highlight with a static stage-level highlight behind both the floating chips and the device. The highlight now uses lightweight gradients and shadow at `z-index: 1`, with chips above it and the device above the chips, so it adds subtle depth without covering the chips.
- Follow-up correction on 2026-05-02: Removed the framed/outlined hero highlight treatment and replaced it with a larger static radial-gradient burst that blends into the page background behind both the floating chips and device. Kept it CSS-only and non-animated to avoid adding runtime or scroll performance cost.
- Follow-up correction on 2026-05-02: Restored the signature and trust band dark/premium treatments after confirming the continuity issue belonged to the global page/footer background, not the feature section surfaces. Changed the body background to a single base color, softened the fixed top ambient gradients, removed the footer ambient panel, and replaced the circular hero burst with a wider static organic gradient behind the device/chips.
- Follow-up correction on 2026-05-02: Removed the hero visual highlight/gradient shape entirely, leaving the existing device and floating chip presentation without an added burst layer.
- Follow-up correction on 2026-05-02: Removed the existing `premium-hero-halo` element from `ProductHeroVisual` after confirming that the remaining visible hero gradient was coming from the component markup, not the deleted CSS pseudo-element.
- Residual risk: no browser screenshot or live scroll recording was captured in this pass, so the rendering-stability fix is proven by code-path reduction plus targeted automated checks rather than visual automation. A local dev-server start was attempted for visual inspection but was blocked by sandbox process-spawn restrictions and the escalated retry was not approved.

## Final Reconciliation

- Actual root cause:
  - Bills and Cash Flow drifted to a different lower-sheet surface color than Accounts.
  - Accounts and Cash Flow both had broad `text-[10px] font-extrabold` rules that overrode intended nav-title tracking.
  - Overview carried a custom pill width that let the title container render wider than its content.
  - The browser title template placed `Gama` second.
  - Shared website rendering instability came from aggressive compositing choices such as walkthrough paint containment plus multiple continuous signature-layer animations.
- Fix shipped:
  - Normalized Bills and Cash Flow lower-sheet backgrounds to the Accounts reference color and aligned the Bills Upcoming container with the Cash Flow Income Flow container treatment.
  - Restored the intended nav-title tracking for Accounts and Cash Flow and tightened the Overview title pill to content width.
  - Reduced Event Details quick-action icon size.
  - Changed the root metadata title template to `Gama | %s`.
  - Removed `contain: paint` from the walkthrough preview mask, stabilized the hero email input paint path, and converted the Place Context signature visual into a stable always-visible state.
- Verification completed:
  - `pnpm.cmd --filter @gama/web test -- --runInBand apps/web/src/lib/site-metadata.unit.test.ts`
  - `pnpm.cmd --filter @gama/web typecheck`
- Stable lesson:
  - Avoid broad typography override selectors in mockup HTML when the top-nav title depends on explicit tracking values, and prefer stable visible states over decorative continuous animation on critical landing-page proof surfaces.
