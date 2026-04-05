# expo-sdk-54-bundling-regressions

Created: 2026-04-05
Document Type: Bugfix Spec
Status: Implemented
Lane: shared

# Bugfix Spec

## Overview

The mobile app now starts under Expo SDK 54, but iOS bundling still fails during actual route compilation. The failure blocks device testing even though the Metro server itself can launch.

## Failure Context

Observed behavior:

- `npx expo start --tunnel` reports `expo-router/babel` deprecation warnings repeatedly during bundling
- iOS bundling fails with `Unable to resolve module react-native-css-interop/jsx-runtime`
- the failure occurs while compiling app routes, not while booting Metro itself

Expected behavior:

- Babel config should match Expo Router's current SDK 54 expectations
- NativeWind's JSX runtime dependency should resolve during app bundling from the workspace package layout

Impact:

- mobile testing on iOS is blocked after the Expo SDK upgrade
- the upgrade appears incomplete even though verification and Metro startup succeeded

## Reproduction

1. From repo root, run `node ./scripts/pnpm.mjs --dir apps/mobile exec expo export --platform ios`
2. Observe repeated `expo-router/babel` deprecation warnings
3. Observe bundling fail on `apps/mobile/app/(app)/_layout.tsx`
4. Error: `Unable to resolve module react-native-css-interop/jsx-runtime`

## Evidence

- `apps/mobile/babel.config.js` still lists `expo-router/babel`
- `apps/mobile/package.json` depends on `nativewind`, but `react-native-css-interop` is not directly linked in `apps/mobile/node_modules` or workspace-root `node_modules`
- the Metro resolver error shows the transformed import is being resolved from app source files, where only direct package dependencies are searched

## Root-Cause Statement

Confirmed root causes:

- `apps/mobile/babel.config.js` still included deprecated `expo-router/babel`, which produced repeated warnings during bundling and reflected stale Expo Router configuration
- NativeWind's JSX transform emitted `react-native-css-interop/jsx-runtime`, but `react-native-css-interop` was only present as a transitive dependency under NativeWind's pnpm virtual-store tree, not as a direct Metro-resolvable dependency from `apps/mobile` or `packages/ui-mobile` source compilation

## File Plan

- `apps/mobile/babel.config.js`
- `apps/mobile/package.json`
- `packages/ui-mobile/package.json`
- `pnpm-lock.yaml`

## Minimal Fix Plan

1. Remove deprecated `expo-router/babel` from the mobile Babel config.
2. Add `react-native-css-interop` as a direct dependency where Metro must resolve transformed JSX runtime imports.
3. Reinstall the workspace links and rerun an iOS export to confirm bundling completes.

## Edge Cases

- shared mobile source under `packages/ui-mobile` may also need the runtime package if Babel transforms its JSX with the same import source
- additional Expo SDK 54 config mismatches may surface only after the JSX runtime resolution issue is fixed

## Verification Plan

- rerun `node ./scripts/pnpm.mjs --dir apps/mobile exec expo export --platform ios`
- rerun `node ./scripts/verify-mobile.mjs`
- rerun the repo-root mobile tunnel start path if the export succeeds

## Review Notes

- the fix stayed bounded to configuration and dependency visibility; no route, navigation, or product behavior changes were required
- `pnpm install` completed without additional downloads because the package already existed in the lockfile and store

## Final Reconciliation

Actual fix:

- removed `expo-router/babel` from `apps/mobile/babel.config.js`
- added direct `react-native-css-interop` dependencies to `apps/mobile/package.json` and `packages/ui-mobile/package.json`
- relinked the workspace with `node ./scripts/pnpm.mjs install --ignore-scripts --config.confirmModulesPurge=false`

Verification:

- `node ./scripts/verify-mobile.mjs` passes
- `node ./scripts/pnpm.mjs --dir apps/mobile exec expo export --platform ios` now bundles and exports successfully
- `node ./scripts/run-pnpm-detached.mjs mobile:start -- --tunnel` reaches `Tunnel ready.`

Stable lesson:

- in this pnpm workspace, NativeWind's JSX runtime package must be directly resolvable from the source packages Metro compiles, not only available as a transitive dependency under NativeWind
