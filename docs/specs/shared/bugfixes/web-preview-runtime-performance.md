# web-preview-runtime-performance

Created: 2026-05-01
Document Type: Bugfix Spec
Status: Implemented
Lane: web

# Bugfix Spec

## Overview

The web landing page visibly lags on lower-performing devices and in Edge when hardware acceleration is disabled. The site should keep the product mockup previews visually rich without forcing the browser to run many offscreen iframe documents and animation loops at once.

## Failure Context

Observed behavior: scrolling and page interaction can become visibly janky on lower-powered laptops, especially in Edge with hardware acceleration disabled.

Follow-up observed behavior: after reducing preview concurrency, screen previews can briefly show a blank surface or a premature unscaled/unsettled mockup before changing to the final correct version during walkthrough and trust-carousel screen changes.

Second follow-up observed behavior: after additional lifecycle changes, the hero section phone screen can sometimes remain blank during quick browser reloads.

Third follow-up observed behavior: once preview scripts are allowed to run again, the default `fit` scaler can letterbox device-frame previews with empty top/bottom space when the host mask aspect ratio differs from the source preview canvas.

Expected behavior: the landing page should remain responsive across normal browser settings, including software-rendered fallback paths. Offscreen marketing previews should not consume meaningful rendering or animation budget.

Follow-up expected behavior: active screen changes should keep the prior correct preview visible until the next preview document is ready, then crossfade smoothly. The generated preview document should not reveal body content until its scale, crop, typography normalization, and ready signal have run.

Second follow-up expected behavior: the hero visual should not reveal an empty phone shell during quick reloads. Its iframe should be treated as visually ready only after the preview document has run its stabilization script.

Third follow-up expected behavior: device-frame previews should fill the phone screen mask without letterboxing while still keeping the ready-gated transition and bounded iframe lifecycle.

Impact: the web growth lane creates a poor first impression and undermines trust before users reach the product value proposition.

## Reproduction

Direct reproduction on Edge with hardware acceleration disabled is not available inside this coding environment. Current reproduction is indirect through static inspection and local verification:

- Count live iframe preview mounts on the landing page.
- Identify animation and compositing work that continues while hidden or offscreen.
- Verify that the fix reduces concurrent preview documents and pauses preview work outside the viewport.

## Evidence

Initial evidence:

- `ScrollFeatureShowcase` eagerly primes all desktop walkthrough preview iframes because `hasPrimedDesktopPreviews` is always `true`.
- `TrustFeatureCarousel` renders one eager iframe per trust slide even though only one slide is visible.
- `ProductVisuals` and signature cards mount additional live iframe preview documents throughout the landing page.
- `mockup-preview-html.ts` injects a scaling script and `will-change: transform` into every preview root.
- Several mockups contain infinite CSS animations; hidden iframes and offscreen iframes can continue consuming CPU/paint work.
- The host CSS also has multiple long-running transform animations and forced compositing hints.

Follow-up evidence:

- Desktop walkthrough previews keyed the active preview component, so each screen change destroyed the previous iframe before the next one could load.
- Trust-carousel previews only mounted inside the active slide branch, so the new slide could fade in before the iframe document was visually ready.
- Desktop and trust transitions had no host-level ready state, so a newly mounted iframe could become visible before the browser finished loading its document.
- The current layered preview lifecycle regressed to using iframe `load` plus an 80ms timer as the ready signal.
- The current iframe sandbox was empty, so generated preview scripts could not run inside the sandboxed preview document.

## Root-Cause Statement

Root cause: the web page treated iframe-backed mockups as cheap static visuals, but they are live documents with their own CSS, layout, font, image, transform, and animation work. Desktop walkthrough and trust carousel code multiplied this cost by keeping hidden previews mounted and eager-loaded. Mobile walkthrough cards also bypassed viewport suspension. Generated preview documents carried permanent transform compositing hints even though the root scale only needs to be applied on load and resize. When hardware acceleration is disabled, that workload falls onto software rendering and becomes visible jank.

Follow-up root cause: the first performance fix removed hidden iframe concurrency but also exposed an immediate-teardown lifecycle. Screen changes no longer had an already-mounted next preview, and the previous preview was removed before the incoming iframe had loaded enough to display as a stable screen.

Second follow-up root cause: iframe `load` is not the right readiness boundary for the generated mockup documents. On fast reloads, the host can treat the hero iframe as ready before the preview document has wrapped the body, applied scaling, normalized typography, and waited for fonts. With scripts disallowed by the sandbox, the generated preview runtime cannot provide a stable readiness signal.

Third follow-up root cause: allowing preview scripts restored the generated scaler, but the scaler's default non-cropped mode still used `fit`. In a phone mask this preserves the entire source canvas instead of filling the destination screen, so aspect-ratio differences become visible as top/bottom gaps.

## File Plan

- `apps/web/src/components/ProductVisuals.tsx`
- `apps/web/src/components/ScrollFeatureShowcase.tsx`
- `apps/web/src/components/TrustFeatureCarousel.tsx`
- `apps/web/src/lib/mockup-preview-html.ts`
- `apps/web/app/globals.css`
- `docs/specs/shared/bugfixes/web-preview-runtime-performance.md`

## Minimal Fix Plan

1. Add a first-class preview runtime mode instead of relying on ad hoc iframe behavior:
   - `interactive` for visible/active previews.
   - `static` for inactive previews, with preview CSS animations and transitions disabled.
2. Mount only the active desktop walkthrough iframe instead of all walkthrough iframes.
3. Mount only the active trust carousel preview iframe instead of eager-loading every hidden slide preview.
4. Suspend iframe preview work when preview hosts leave the viewport.
5. Remove unnecessary permanent compositor hints from generated previews.
6. Keep mobile/web UI boundaries unchanged and avoid replacing product previews with misleading static art.

Follow-up fix plan:

1. Keep the strict sandboxed preview rendering path that preserves the existing fitting behavior.
2. Add a host-side crossfade lifecycle that keeps the previous ready iframe visible while the next iframe loads hidden.
3. Keep the concurrency bound to one active plus one incoming/outgoing iframe during transitions.
4. Preserve reduced-motion behavior by disabling the crossfade transition when requested.

Second follow-up fix plan:

1. Restore a child-to-parent ready message from generated preview documents.
2. Allow scripts in preview iframes while keeping the sandbox otherwise constrained.
3. Mark frames ready from `gama-preview-ready`, not from iframe `load`.
4. Keep a conservative load fallback only as a last-resort blank-screen escape hatch.
5. Delay the hero visual fallback so the screen layer has time to stabilize first.

Third follow-up fix plan:

1. Use cover scaling for standard device-frame previews.
2. Keep `cover-top` only for the stories signature crop.
3. Preserve the existing fit branch only as an unused fallback path for future non-device surfaces.

## Edge Cases

- Active slide transitions must not flash blank content.
- Active slide transitions must not expose an unscaled or partially normalized preview document.
- Lazy preview mounting must still preserve visual layout dimensions.
- Cropped preview routes must keep their current crop behavior.
- Reduced-motion users should continue to see stable previews.
- Security headers for `/preview/*` must not be weakened.
- Fast reloads must not depend on parent render timing or callback identity to preserve a pending load timer.
- Device-frame previews must not letterbox inside the phone mask.

## Verification Plan

- Run targeted static checks for iframe count and preview mode propagation.
- Run web lint/typecheck/tests.
- Build the web app if local dependencies allow it.
- Use visual/browser verification if a local browser automation path is available; otherwise record the fallback.
- Review all touched files for hidden iframe regressions, security header drift, and stale spec content.

## Active Checklist

- [x] Establish current iframe/animation root-cause evidence.
- [x] Implement bounded preview runtime modes.
- [x] Reduce desktop walkthrough preview concurrency.
- [x] Reduce trust carousel preview concurrency.
- [x] Add ready-gated iframe reveal and bounded crossfade transitions.
- [x] Restore generated-preview ready signal for fast reload stability.
- [x] Restore fill-the-device cover scaling for standard previews.
- [x] Verify lint/typecheck/tests/build where available.
- [x] Reconcile final root cause, fix, residual risk, and review notes.

## Verification Evidence

- `pnpm.cmd --filter @gama/web lint`: pass.
- `pnpm.cmd --filter @gama/web typecheck`: pass.
- `pnpm.cmd --filter @gama/web test`: pass, 12 suites and 56 tests.
- `pnpm.cmd --filter @gama/web verify`: pass.
- `pnpm.cmd --filter @gama/web build`: pass after allowing the configured Google font fetch needed by Next production build.
- `pnpm.cmd verify`: pass.
- `pnpm.cmd review:local`: pass with reduced coverage warning because changed files could not be derived automatically in this environment.
- Static check: only `ProductVisuals.tsx` owns a direct `<iframe>`; previous raw trust-carousel iframe and desktop walkthrough multi-iframe priming path are removed.
- Follow-up: `pnpm.cmd --filter @gama/web lint`: pass.
- Follow-up: `pnpm.cmd --filter @gama/web typecheck`: pass.
- Follow-up: `pnpm.cmd --filter @gama/web test`: pass, 12 suites and 56 tests.
- Follow-up: `pnpm.cmd --filter @gama/web verify`: pass.
- Second follow-up: `pnpm.cmd --filter @gama/web lint`: pass.
- Second follow-up: `pnpm.cmd --filter @gama/web typecheck`: pass.
- Second follow-up: `pnpm.cmd --filter @gama/web verify`: pass, 12 suites and 56 tests.
- Second follow-up: `pnpm.cmd --filter @gama/web build`: pass after allowing the configured Google font fetch needed by Next production build.
- Third follow-up: `pnpm.cmd --filter @gama/web lint`: pass.
- Third follow-up: `pnpm.cmd --filter @gama/web typecheck`: pass.
- Third follow-up: `pnpm.cmd --filter @gama/web verify`: pass, 12 suites and 56 tests.

Browser visual verification: not run. The environment does not provide an Edge/Playwright path with hardware acceleration toggles. The fallback proof is static workload reduction plus full repo/web verification.

## Review Notes

- Release gate: Gate A. No auth, RLS, secret, storage, privacy, deletion, or data-boundary behavior changed.
- Follow-up release gate: Gate A. The iframe sandbox remains strict; no user data, secrets, auth, RLS, or storage behavior changed.
- Second follow-up release gate: Gate A. `sandbox="allow-scripts"` is required for the generated preview document to run its local stabilization script, but the iframe still does not receive same-origin access, form submission, popups, top-navigation, or storage privileges.
- Residual risk: without a real Edge software-rendering profile or browser recording, the exact frame-time improvement and visual transition are not numerically measured. The removed failure modes are still direct: hidden and offscreen iframe documents no longer continue running, unnecessary compositor hints were removed, previous ready previews remain visible during screen changes, and incoming documents stay hidden until iframe load readiness.

## Final Reconciliation

Implemented root-cause fix:

- `EmbeddedPreviewFrame` now owns preview URL construction, viewport-aware mounting, and placeholders.
- Desktop walkthrough renders only the active preview iframe instead of all walkthrough previews.
- Trust carousel renders only the active slide preview and uses the shared preview lifecycle.
- Mobile walkthrough previews no longer bypass viewport suspension with eager loading.
- Preview route supports `motion=static`, preserves crop behavior including `storiesSignature`, and uses long-lived production caching for versioned preview URLs.
- Generated preview HTML no longer forces permanent root `will-change: transform`; static mode disables animation and transition work.
- Host motion gates now start paused until observed and pause descendant animations while out of view.

Follow-up root-cause fix:

- `EmbeddedPreviewFrame` now owns a bounded crossfade lifecycle with one active frame and, during a screen change, one incoming/outgoing frame.
- Preview frames initially kept `sandbox=""`, but the second follow-up changed this to `sandbox="allow-scripts"` because the generated preview runtime must execute before the host can receive a stable ready signal.
- The host keeps incoming iframes hidden until iframe load readiness.
- Desktop walkthrough no longer keys the active preview component, so the host transition lifecycle survives screen changes.
- Trust carousel uses one persistent active preview host instead of mounting a new preview branch per active slide.

Second follow-up root-cause fix:

- Generated preview HTML now posts `gama-preview-ready` after applying managed scale, typography normalization, font readiness, and two animation frames.
- Preview iframes now use `sandbox="allow-scripts"` so the generated preview runtime can run while remaining otherwise sandbox-restricted.
- `PreviewFrameLayer` now marks readiness from the child ready message and keeps callback refs stable across parent renders.
- The old 80ms iframe-load ready timer is replaced with a slower last-resort fallback to avoid permanent blank screens if a browser drops the ready message.
- The hero visual fallback reveal now waits longer than the iframe fallback so quick reloads do not expose an empty phone before the screen layer has stabilized.
- Standard preview scaling now uses cover mode so device-frame previews fill the phone mask instead of letterboxing with empty top/bottom space.
