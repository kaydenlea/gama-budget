# expo-sdk-54-upgrade

Created: 2026-04-05
Document Type: Feature Spec
Status: Implemented
Lane: mobile

# Feature Spec

## Linked Context

- product brief: n/a
- PRD: [docs/product/mobile/prd.md](../../product/mobile/prd.md)
- likely release gate: Gate A

## Overview

Upgrade the mobile lane from Expo SDK 52 to Expo SDK 54 using Expo's documented one-SDK-at-a-time workflow, and make the repo-owned pnpm wrappers actually sanitize broken proxy and offline environment variables so Expo and pnpm commands run reliably on this machine. The outcome is that the app is compatible with Expo Go for SDK 54 again, the mobile verification path is aligned with Expo 54-compatible package versions, and contributors can use the repo-owned commands without proxy-induced false failures.

## User or Problem Context

Local mobile testing is blocked because the project currently uses Expo SDK 52 while the installed Expo Go uses SDK 54. The current repo also has a reliability gap in `scripts/common.mjs`: `runPnpm()` computes a sanitized environment but `runCommand()` reintroduces the stripped process environment values, which defeats the intended protection against dead proxy and offline settings. Without addressing both issues, the app remains hard to run and upgrade on this machine.

## Scope

- fix repo-owned pnpm and Expo command environment sanitization
- upgrade `apps/mobile` from Expo SDK 52 to Expo SDK 53 and then SDK 54
- reconcile Expo-managed dependency versions, related testing packages, and any shared mobile package version constraints affected by the React / React Native bump
- update framework-baseline checks and start-path docs to match the upgraded mobile lane
- verify the mobile start path, mobile typecheck/tests, and lane-targeted workspace checks after the upgrade

## Non-Goals

- upgrading the web lane to React 19 unless required by shared tooling compatibility
- converting the app from Expo Go to a development-build-first workflow in this pass
- broad UI refactors unrelated to SDK compatibility
- upgrading past SDK 54 in the same pass

## UX and Behavior

- contributors should be able to start the mobile app from the repo root with the repo-owned command path
- the app should launch under Expo SDK 54 without the current Expo Go version mismatch
- if the machine environment still contains dead proxy or forced-offline settings, repo-owned package-manager commands should neutralize them instead of failing for misleading reasons
- the upgrade should preserve current app routes, providers, and product behavior unless a framework-level change requires a narrowly scoped compatibility adjustment

## Requirements

- follow Expo's official one-SDK-at-a-time upgrade process
- keep `apps/mobile` on Expo Router and the existing provider-based composition
- align Expo-managed packages to SDK 54-compatible versions
- keep shared mobile package dependencies compatible with the mobile app's React and React Native versions
- ensure repo-owned command wrappers pass the sanitized environment through to child processes
- keep documentation and the feature spec aligned with the shipped result

## Acceptance Criteria

- `apps/mobile/package.json` reflects Expo SDK 54-compatible package versions
- `packages/ui-mobile/package.json` and any related shared config are compatible with the upgraded mobile dependency graph
- `node ./scripts/mobile-start.mjs` reaches Expo startup without the SDK-version mismatch and without dead-proxy fetch failures caused by the wrapper itself
- `node ./scripts/verify-mobile.mjs` passes
- any additional repo verification needed for shared-package impact passes or is recorded explicitly if blocked by a known unrelated issue
- the spec and implementation plan reflect the actual shipped changes

## Clarifying Questions

- None block execution. This spec assumes SDK 54 is the target because it restores compatibility with the installed Expo Go while keeping scope smaller than jumping directly to the latest SDK.

## File Plan

- `docs/specs/mobile/expo-sdk-54-upgrade.md`: feature-spec record for the upgrade
- `docs/specs/mobile/plans/expo-sdk-54-upgrade.md`: implementation slices and verification checkpoints
- `scripts/common.mjs`: fix sanitized environment propagation for repo-owned commands
- `scripts/check-framework-baselines.mjs`: update mobile baseline assertions to SDK 54 expectations
- `scripts/mobile-start.mjs`: keep the root mobile start path working against the upgraded mobile lane
- `apps/mobile/package.json`: Expo SDK and Expo-managed package versions
- `apps/mobile/tsconfig.json`, `apps/mobile/app.config.ts`, `apps/mobile/babel.config.js`, `apps/mobile/metro.config.js`, and related config files only if the official upgrade path requires changes
- `packages/ui-mobile/package.json`: shared mobile UI dependency compatibility
- `package.json` and `packages/config-jest/package.json` only if test or shared tool versions must move for SDK 54 compatibility
- `README.md`, `docs/getting-started.md`, and `docs/runbooks/local-development-flow.md` if contributor instructions need reconciliation after the upgrade

## Interfaces and Types

- `runPnpm(args, options)` in `scripts/common.mjs` must pass a truly sanitized env to child processes
- mobile dependency contracts in `apps/mobile/package.json` and `packages/ui-mobile/package.json` must align on React / React Native major versions
- Jest and type packages that touch the mobile lane may need version alignment if SDK 54 changes the supported testing stack

## Edge Cases

- Expo 53 or 54 may require config changes that are not obvious from package versions alone
- shared React version changes could affect workspace tooling or the web lane even if web runtime behavior is unchanged
- Expo CLI may perform network fetches during dependency validation; stale proxy env must not leak back into those child processes
- partial upgrades can leave the lockfile or workspace in a mixed SDK state if verification is skipped between steps

## Security and Privacy Implications

- no auth, RLS, secret, or storage-boundary changes are intended
- the command-wrapper fix reduces the chance of developers applying unsafe local workarounds to environment problems
- release gate remains Gate A because this is framework and tooling maintenance, not a sensitive data-boundary change

## Future Extensibility Notes

- once the app is stable on SDK 54, a later pass can decide whether to move to the latest SDK and a development-build-first workflow
- the wrapper sanitization fix should continue to help any future network-sensitive pnpm or Expo operations, not only this upgrade

## Verification Plan

- Slice 1: verify the env sanitization fix with a repo-owned command path that previously leaked the bad proxy env
- Slice 2: after the SDK 53 step, run targeted mobile verification to catch intermediate incompatibilities before moving to SDK 54
- Slice 3: after the SDK 54 step, run `node ./scripts/verify-mobile.mjs` and confirm the root mobile start path no longer fails for the old SDK mismatch
- if the upgrade changes shared workspace dependencies, run the relevant additional checks and record any residual issues explicitly

## Implementation Plan Link

- [docs/specs/mobile/plans/expo-sdk-54-upgrade.md](plans/expo-sdk-54-upgrade.md)

## Checklist

- [x] write the upgrade spec and implementation plan
- [x] fix repo-owned command env sanitization
- [x] upgrade Expo SDK 52 -> 53 and verify the intermediate state
- [x] upgrade Expo SDK 53 -> 54 and reconcile dependent package versions
- [x] run mobile verification and start-path verification
- [x] review touched files and reconcile docs/specs

## Design Decisions

- target SDK 54 first instead of the latest SDK to restore compatibility with the currently installed Expo Go while keeping the change bounded
- include the wrapper env fix in the same pass because the official upgrade commands are not trustworthy on this machine until that bug is removed
- prefer Expo's package management commands and version guidance over manual guessed version bumps

## Review Notes

- plan-review fallback: fresh-context same-tool review after implementation because no second model/tool is guaranteed in this environment
- shipped package alignment includes Expo SDK 54, React 19.1.0, React Native 0.81.5, `jest-expo` 54, and shared mobile package compatibility updates
- `scripts/common.mjs` now preserves sanitized child environments and honors the already-linked pnpm store directory instead of reintroducing dead proxy or forced-offline values
- `apps/mobile/src/features/transactions/components/TodayTransactionsCard.tsx` dropped `FlashList`'s removed `estimatedItemSize` prop for FlashList v2 compatibility

## Final Reconciliation

Implemented as planned with one important verification nuance:

- repo-owned mobile tooling now strips the dead process-level proxy and offline variables before invoking pnpm and Expo child processes
- the mobile lane was upgraded from Expo SDK 52 to SDK 54 through the documented one-SDK-at-a-time path
- `node ./scripts/verify-mobile.mjs` passes end to end
- `node ./scripts/mobile-start.mjs` was validated outside the Codex sandbox, and `node ./scripts/run-pnpm-detached.mjs mobile:start -- --tunnel` reached `Tunnel ready.`

Residual note:

- inside the Codex sandbox, Metro startup cannot be used as proof because even a minimal Node child-process smoke test fails with `spawn EPERM`; the unrestricted local run does not exhibit that failure
