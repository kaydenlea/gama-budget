# expo-sdk-54-upgrade

Created: 2026-04-05
Document Type: Implementation Plan
Status: Implemented
Lane: mobile

# Implementation Plan

## Linked Context

- feature spec: [docs/specs/mobile/expo-sdk-54-upgrade.md](../expo-sdk-54-upgrade.md)
- PRD or bugfix doc: [docs/product/mobile/prd.md](../../../product/mobile/prd.md)
- likely release gate: Gate A

## Scope

Execute a safe Expo SDK 52 -> 54 upgrade for the mobile lane and remove the wrapper bug that currently re-injects broken proxy and offline environment variables into repo-owned pnpm and Expo commands.

## Preconditions

- official Expo upgrade guidance is the source of truth for the SDK step order and package alignment
- current workspace install is present and linked
- the worktree already contains unrelated setup-adjustment changes, so edits must avoid reverting user or prior-agent work
- PowerShell execution-policy limitations mean repo-owned Node entrypoints and `corepack pnpm` are safer than raw `npx`

## File-Level Plan

- `scripts/common.mjs`: make `runCommand()` and `spawnCommand()` honor sanitized child environments
- `apps/mobile/package.json`: SDK and Expo-managed dependency updates
- `packages/ui-mobile/package.json`: align shared mobile UI dependencies with the upgraded mobile app
- `package.json`: adjust shared root testing/types only if required by the SDK upgrade
- `packages/config-jest/package.json`: align `jest-expo` peer range if needed
- `scripts/check-framework-baselines.mjs`: assert the new mobile baseline
- `scripts/mobile-start.mjs`: validate the upgraded start path still works from repo root
- `docs/specs/mobile/expo-sdk-54-upgrade.md` and `docs/specs/mobile/plans/expo-sdk-54-upgrade.md`: keep planning artifacts current
- `README.md`, `docs/getting-started.md`, `docs/runbooks/local-development-flow.md`: reconcile docs only if the contributor workflow materially changes

## Interfaces and Data Structures

- `runPnpm()` uses `runCommand()` with `options.env`; the env-merging logic must preserve removals instead of reintroducing bad process-level values
- mobile dependency graph contracts across:
  - `apps/mobile`
  - `packages/ui-mobile`
  - root dev/test tooling where React or `jest-expo` versions must align
- framework baseline assertions in `scripts/check-framework-baselines.mjs`

## Design Choices

- perform the upgrade one SDK at a time instead of a direct 52 -> 54 jump
- use Expo-managed installation commands for package alignment rather than hand-editing every Expo-managed version
- keep the web lane unchanged unless a shared workspace dependency absolutely requires a coordinated update
- verify after the SDK 53 checkpoint before proceeding to SDK 54

## Edge Cases and Failure Modes

- Expo CLI may refuse to proceed if a dependency mismatch exists during an intermediate step
- the lockfile may change more broadly than the mobile app because workspace hoisting reflects the new dependency graph
- React major-version changes could surface type or test breakage in shared tooling
- network-sensitive Expo or pnpm commands may still fail if the wrapper fix is incomplete

## Slice Plan

- Slice 1: wrapper reliability
  - files: `scripts/common.mjs`
  - interfaces: child-process env propagation for repo-owned pnpm/Expo commands
  - design: pass the sanitized env through without layering the original `process.env` back on top
  - edge cases: preserve `COREPACK_HOME` and any explicitly supplied child env while still removing broken proxy/offline values
  - verification: run a repo-owned command path and confirm the stripped env no longer leaks back into child processes

- Slice 2: Expo SDK 53 checkpoint
  - files: `apps/mobile/package.json`, `packages/ui-mobile/package.json`, any config files required by Expo's SDK 53 guidance, plus lockfile updates
  - interfaces: mobile React / React Native / Expo package compatibility
  - design: use Expo's official upgrade path and package reconciliation for SDK 53 first
  - edge cases: intermediate package peer conflicts and testing stack alignment
  - verification: targeted mobile typecheck or doctor/start-path validation before moving to SDK 54

- Slice 3: Expo SDK 54 completion
  - files: same areas as Slice 2 plus any baseline-check or doc reconciliations required by SDK 54
  - interfaces: final mobile dependency graph and framework-baseline assertions
  - design: repeat the official SDK upgrade process for the next step and then run the repo's mobile verification
  - edge cases: Expo Go compatibility restored but start path still broken for unrelated config reasons
  - verification: `node ./scripts/verify-mobile.mjs`, root start-path verification, and any necessary shared-package checks

- Slice 4: review and reconciliation
  - files: spec/plan and any docs that materially changed
  - interfaces: none beyond documentation truthfulness
  - design: fresh-context same-tool review fallback if no second model is available
  - edge cases: residual non-mobile workspace issues must be called out explicitly rather than hidden
  - verification: manual touched-file review and final diff sanity pass

## Plan Review

- independent review or cross-model review needed: fresh-context same-tool review fallback after implementation
- review findings before implementation:
  - the repo-owned env sanitization bug should be fixed before trusting any network-sensitive upgrade command
  - the upgrade should stay bounded to SDK 54 first to reduce risk and restore immediate Expo Go compatibility

## Failure and Rollback Considerations

- if SDK 53 introduces broad incompatibility, stop there and reassess rather than forcing SDK 54
- if the wrapper env fix causes unexpected command regressions, revert that file independently from the dependency upgrade
- if the final dependency graph destabilizes shared tooling, roll back the package changes while preserving documentation and wrapper fixes only if they are independently valid

## Re-Planning Triggers

- Expo's current official upgrade guidance requires a materially different package or config path than expected
- web or shared packages need runtime upgrades beyond limited dependency alignment
- the mobile lane requires development-build-only changes to test under SDK 54
- verification exposes a broader template mismatch than a bounded SDK upgrade

## Completion Evidence

- successful execution of the official one-step-at-a-time Expo upgrade flow through SDK 54
- `node ./scripts/verify-mobile.mjs` passes
- repo-root mobile start verified outside the Codex sandbox via `node ./scripts/run-pnpm-detached.mjs mobile:start`, with Metro listening on `localhost:8081`
- repo-root tunnel start verified outside the Codex sandbox via `node ./scripts/run-pnpm-detached.mjs mobile:start -- --tunnel`, which reached `Tunnel ready.`
- reconciled spec and plan files now match the shipped result

## Documentation Reconciliation

- `docs/specs/mobile/expo-sdk-54-upgrade.md`
- `docs/specs/mobile/plans/expo-sdk-54-upgrade.md`
- `README.md` if the recommended mobile start flow changes materially
- `docs/getting-started.md` and `docs/runbooks/local-development-flow.md` if contributor startup or install guidance changes materially

## Final Notes

- the previously observed `spawn EPERM` during Metro startup is reproducible only inside the Codex sandbox, where even direct Node child-process spawn and fork smoke tests fail
- outside the sandbox, the same repo-owned start path launches Expo and Metro normally, so no further repo code change is required for that failure mode
