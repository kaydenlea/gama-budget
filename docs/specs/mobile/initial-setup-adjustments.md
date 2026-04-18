# Feature Spec

## Linked Context

- product brief: n/a
- PRD: [docs/product/mobile/prd.md](../../product/mobile/prd.md)
- likely release gate: Gate A

## Overview

Bring the repository foundation from the first bootstrap commit to a contributor-ready baseline that is safer to use in day-to-day feature delivery. The scope includes correcting the local-vs-PR AI review boundary, tightening local review evidence, and re-baselining the mobile and web scaffolds where the framework setup had drifted from the intended official-tooling shape.

This work is infrastructure-facing, but it materially affects future delivery quality. The desired outcome is that contributors can clone the repo, work locally with strong deterministic proof, rely on PR-stage AI review, and build on an Expo-based mobile lane and Next.js web lane that do not fight their documented frameworks.

## User or Problem Context

The immediate problem is contributor reliability rather than a user-facing product feature. The initial scaffold had three trust issues:

1. local push-time AI review was brittle and blocked publication when Codex connectivity failed
2. the mobile lane was manually scaffolded in a way that did not fully reflect the official Expo + Expo Router + NativeWind baseline
3. the repo’s stricter local workflow gate required spec and plan evidence that had not been written for the setup-adjustment pass itself

If left unresolved, future contributors would inherit a shaky baseline, which would undermine both product velocity and trust in the guardrails.

## Scope

- move Codex review responsibility to PR stage while keeping strong local proof
- tighten local workflow-evidence enforcement before work is considered ready to publish
- align the Expo mobile lane more closely with the official Expo Router and NativeWind setup model
- keep the web lane on a stable Tailwind path compatible with the overall workspace
- add the missing spec and implementation-plan artifacts for this infrastructure adjustment pass

## Non-Goals

- rebuilding the entire repo from scratch
- changing the product direction, mobile information architecture, or security model
- adding a second separate workflow for Claude vs Codex
- forcing the web lane onto Tailwind 4 if that would destabilize the shared workspace

## UX and Behavior

- contributors should still get strict local verification before commit and push
- contributors should no longer have branch publication blocked by local `codex review`
- PRs should clearly remain the stage where independent AI review belongs
- the mobile lane should continue to use Expo Router app-directory routing and provider-based app setup

## Requirements

- local `pre-push` must enforce deterministic proof and workflow evidence without requiring live Codex connectivity
- PR-stage Codex review must remain documented as required where configured
- mobile Expo config, Babel config, Tailwind config, and typed environment setup must be coherent with Expo Router and NativeWind expectations
- web Tailwind setup must remain coherent and workspace-compatible
- repo docs must describe the new local-vs-PR review boundary accurately

## Acceptance Criteria

- `node ./scripts/verify.mjs` passes
- `node ./scripts/verify-mobile.mjs` passes
- `node ./scripts/verify-web.mjs` passes
- `pnpm review:ready` passes without requiring local Codex review
- docs consistently describe PR-stage Codex review rather than push-time Codex review

## Clarifying Questions

- None remain for this pass. The architecture is stable enough to proceed because the work is bounded to repo workflow and framework-baseline corrections.

## File Plan

- `docs/specs/mobile/initial-setup-adjustments.md`: feature-spec record for the setup-adjustment pass
- `docs/specs/shared/plans/initial-setup-adjustments.md`: execution plan record for the same work
- `scripts/pre-push.mjs`, `scripts/local-review.mjs`, `scripts/review-ready.mjs`, `scripts/review-ai.mjs`: local-vs-PR review boundary and workflow-evidence enforcement
- `apps/mobile/*`: Expo baseline alignment
- `apps/web/*`: stable Tailwind path and doc reconciliation
- `README.md`, `docs/getting-started.md`, `docs/runbooks/*`, `docs/agent-workflows/*`, `AGENTS.md`: workflow reconciliation

## Interfaces and Types

- `Gama` local review artifact shape remains the same, but Codex status is now deferred until PR stage
- `EdgeInvoker` payload contract in `packages/api-client` is narrowed to object payloads so the mobile Supabase invoke path typechecks correctly
- Expo typed environment coverage now includes `expo-env.d.ts` and `.expo/types`

## Edge Cases

- local review commands may run in environments where Node-to-Git subprocess access is restricted
- contributors may not have Codex configured locally even though PR-stage review is still required where configured
- web framework upgrades must not break NativeWind compatibility in the mobile lane

## Security and Privacy Implications

- no secrets or privileged keys move into the client
- local review remains strict for security-sensitive paths
- moving Codex review to PR stage should not weaken security because deterministic checks, CI, PR review, and human review remain in place

## Future Extensibility Notes

- if a stable PR-stage Codex GitHub integration becomes standard for the repo, local docs can point to that more explicitly without changing the core workflow
- if the workspace later separates Tailwind versions safely, the web lane can revisit a Tailwind 4 upgrade independently

## Verification Plan

- run repo-wide verification
- run mobile lane verification
- run web lane verification
- run `review:ready` to prove the local publication path
- validate that the unsynced branch can push once spec and plan artifacts are present

## Implementation Plan Link

- [docs/specs/shared/plans/initial-setup-adjustments.md](../shared/plans/initial-setup-adjustments.md)

## Checklist

- [x] identify the local push blocker
- [x] move Codex review requirement to PR stage
- [x] strengthen local workflow-evidence enforcement
- [x] align the mobile scaffold with official Expo expectations
- [x] keep the web lane on a stable Tailwind path
- [x] verify repo, mobile, and web checks
- [ ] push the updated feature branch
- [ ] create `origin/main`

## Design Decisions

- PR-stage Codex review is safer than push-time Codex review because it avoids blocking branch publication on live AI connectivity while preserving the full review stack before merge
- the web lane remains on Tailwind 3 for now because forcing Tailwind 4 created avoidable workspace friction with NativeWind 4

## Review Notes

- local verification passed after the mobile and web baseline corrections
- the push gate correctly rejected the previous commit until this spec and the matching implementation plan existed

## Final Reconciliation

This pass tightened the workflow boundary, corrected the mobile Expo baseline, kept the web lane stable, and supplied the missing workflow artifacts required by the repo’s own guardrails. The remaining operational step is to push the updated feature branch and then create `origin/main`.
