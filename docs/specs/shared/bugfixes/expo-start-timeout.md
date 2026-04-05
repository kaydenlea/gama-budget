# expo-start-timeout

Created: 2026-04-05
Document Type: Bugfix Spec
Status: Draft
Lane: shared

# Bugfix Spec

## Overview

The mobile app start path was unreliable and misleading. Running `npx expo start` from PowerShell either timed out or failed before launch, which blocked local mobile development and made it unclear whether the problem was the app, the repo bootstrap, or the PowerShell entrypoint itself.

## Failure Context

Observed behavior:

- `npx expo start` from `apps/mobile` did not produce a reliable Expo startup path.
- PowerShell resolves `npx` through `npx.ps1`, which is blocked on this machine by execution policy.
- the workspace currently has `node_modules/.pnpm` content but is missing the linked `node_modules/.bin` and `apps/mobile/node_modules/expo` layout that Expo expects

Expected behavior:

- contributors should have a repo-owned command that starts Expo without depending on raw `npx`
- when the workspace links are incomplete, the command should fail immediately with an actionable message instead of appearing to hang

Impact:

- mobile development is blocked
- the failure mode looks like an Expo/app problem even when the real blocker is the entrypoint or bootstrap state

## Reproduction

1. Open PowerShell in `apps/mobile`.
2. Run `npx expo start`.
3. On this machine, PowerShell rejects `npx.ps1` before Expo starts.
4. Even when bypassing `npx`, the workspace cannot launch Expo because `apps/mobile/node_modules/expo` is not linked.

Direct full reproduction of a healthy Expo launch is currently unavailable in this checkout because the workspace install is incomplete.

## Evidence

- `npx expo --version` in PowerShell fails with an execution-policy error for `C:\Program Files\nodejs\npx.ps1`
- `node_modules/.pnpm` contains Expo packages, but `node_modules/.bin` and `apps/mobile/node_modules/expo/package.json` are missing
- direct execution of the Expo CLI from the pnpm virtual store fails because its linked dependency graph is incomplete
- interrupted pnpm install logs show the workspace relink step never finished cleanly

## Root-Cause Statement

Confirmed root causes:

- raw `npx expo start` is the wrong repo entrypoint for this project on Windows because it depends on PowerShell execution policy and bypasses the repo-owned pnpm wrapper
- the current workspace dependency graph is only partially installed, so Expo cannot resolve from the mobile app even though package content exists in `node_modules/.pnpm`

The repo-side fix is to provide a supported mobile start command that uses the pinned pnpm toolchain and fails fast when the workspace link layout is incomplete.

## File Plan

- `scripts/mobile-start.mjs`
- `package.json`
- `README.md`
- `docs/getting-started.md`
- `docs/runbooks/local-development-flow.md`

## Minimal Fix Plan

1. Add a repo-owned mobile start wrapper that uses `runPnpm`.
2. Validate the linked dependency layout before invoking Expo so the failure is immediate and descriptive.
3. Update repo docs to steer contributors toward `pnpm mobile:start` and `pnpm mobile:dev` instead of raw `npx expo start`.

## Edge Cases

- contributors may have the pnpm store populated but still lack linked workspace binaries after an interrupted install
- contributors may still try `npx expo start` from PowerShell and hit execution-policy issues unrelated to the app

## Verification Plan

- run `node ./scripts/mobile-start.mjs` in the current degraded checkout and confirm it fails fast with the new actionable dependency-link message
- run `pnpm mobile:start` and confirm it reaches the same controlled failure path without using raw `npx`
- once the workspace is fully bootstrapped on a healthy machine, confirm `pnpm mobile:start` launches Expo successfully

## Review Notes

Residual risk:

- this repo-side fix does not complete the interrupted workspace install by itself
- a healthy Expo launch still requires the workspace install to finish cleanly

## Final Reconciliation

Actual root cause:

- the reported Expo timeout was primarily a bootstrap and machine-environment failure, not evidence of a mobile app code regression

Repo fix:

- added a supported repo-owned mobile start path and documented it

Stable lessons:

- avoid raw `npx expo start` as the primary repo instruction on Windows
- treat partial pnpm link state as a bootstrap failure before debugging app code
