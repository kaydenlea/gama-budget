# repo-setup-hardening

Created: 2026-04-05
Document Type: Bugfix Spec
Status: Implemented
Lane: shared

# Bugfix Spec

## Overview

Harden the repository setup so the workspace is safer and less ambiguous before substantive product implementation accelerates. This work focuses on concrete repo-level gaps already confirmed by the review pass: missing environment example files, missing baseline web security headers, under-scoped CI workflow defaults, missing automated dependency-update configuration, and missing root-level vulnerability disclosure guidance.

The goal is to improve operational safety, onboarding clarity, and security posture without pretending unfinished product work is a repo-setup defect. This pass should stay narrowly focused on the setup layer and avoid drifting into feature backlog such as mobile auth flows, real telemetry rollout, or real Supabase schema delivery.

## Failure Context

Observed behavior:

- the mobile and web lanes read required public environment variables, but the repo does not provide lane-specific `.env.example` files
- the public web lane has no baseline response security headers in `apps/web/next.config.mjs`
- the CI workflow does not set explicit `permissions` or `concurrency`
- the repo has no Dependabot or equivalent dependency-update automation
- the repo has comprehensive `docs/security/*` content but no root `SECURITY.md`

Expected behavior:

- new contributors should be able to discover required public environment variables without guessing
- the web lane should ship with low-risk baseline response security headers that do not break the current Next.js setup
- CI should use explicit least-privilege defaults and avoid wasting runs on superseded commits
- dependency updates should have a repo-owned automation baseline
- the repository should expose a truthful, non-placeholder vulnerability reporting path

Impact:

- missing env examples slow onboarding and increase configuration mistakes
- missing baseline web headers leave obvious hardening value on the table
- missing CI defaults increase operational looseness and wasted runner time
- missing update automation makes dependency hygiene more manual than necessary
- missing `SECURITY.md` weakens disclosure readiness and GitHub-native security visibility

## Reproduction

1. Open `apps/mobile/src/config/env.ts`.
2. Observe that required public Expo variables are read but no `apps/mobile/.env.example` exists.
3. Open `apps/web/src/lib/site-config.ts`.
4. Observe that `NEXT_PUBLIC_SITE_URL` is consumed but no `apps/web/.env.example` exists.
5. Open `apps/web/next.config.mjs`.
6. Observe that no baseline security headers are configured.
7. Open `.github/workflows/ci.yml`.
8. Observe that the workflow has no explicit `permissions` or `concurrency`.
9. Inspect `.github/`.
10. Observe that there is no `dependabot.yml`.
11. Inspect the repo root.
12. Observe that there is no `SECURITY.md`.

## Evidence

- [repo-review-2025-04-05.md](../../reviews/repo-review-2025-04-05.md) classifies these items as the highest-value immediate repo-setup work
- `node ./scripts/verify.mjs` passed before implementation, confirming the current repo is stable enough for bounded setup hardening
- `apps/mobile/src/config/env.ts` and `apps/web/src/lib/site-config.ts` prove the env-example gap is real
- `.github/workflows/ci.yml` proves the missing CI `permissions` and `concurrency`
- `apps/web/next.config.mjs` proves the missing web headers baseline

## Root-Cause Statement

Confirmed root cause:

- the repo already has strong workflow and security documentation, but some practical setup hardening steps were left as follow-up work while the initial scaffold prioritized lane structure, verification, and documentation coverage

Contributing factors:

- early scaffold work favored operational foundations over policy polish
- some recommendations from the review are setup tasks, while others are product backlog; without a scoped implementation pass they stay mixed together
- security guidance exists in durable docs, but a few repo-owned enforcement or discoverability surfaces are still missing

## File Plan

- `docs/specs/shared/bugfixes/repo-setup-hardening.md`
- `docs/specs/shared/plans/repo-setup-hardening.md`
- `apps/mobile/.env.example`
- `apps/web/.env.example`
- `docs/getting-started.md`
- `apps/web/README.md`
- `apps/web/next.config.mjs`
- `.github/workflows/ci.yml`
- `.github/dependabot.yml`
- `SECURITY.md`
- `README.md`
- `docs/reviews/repo-review-2025-04-05.md`

## Minimal Fix Plan

1. Add truthful lane-specific env example files and update the onboarding docs that mention environment setup.
2. Add low-risk baseline web security headers in `apps/web/next.config.mjs` using official Next.js header configuration, while avoiding brittle CSP work in this pass.
3. Harden CI with explicit least-privilege `permissions` and `concurrency`, then add Dependabot for npm/pnpm and GitHub Actions.
4. Add a root `SECURITY.md` with a truthful private-reporting path and reconcile repo docs where the new setup surfaces matter.

## Edge Cases

- do not add placeholder secret values that look privileged or authoritative
- do not add a CSP policy that breaks current Next.js runtime behavior without a nonce strategy and verification
- do not claim a public security contact that the repo does not actually operate
- keep dependency automation scoped enough that the repo is not flooded with noisy update PRs
- ensure new docs do not overstate launch readiness or imply that feature-dependent controls are now complete

## Verification Plan

- run `node ./scripts/check-docs.mjs` after doc and policy-file changes
- run `node ./scripts/lint.mjs`
- run `node ./scripts/typecheck.mjs`
- run `node ./scripts/test.mjs`
- run `node ./scripts/verify.mjs`
- inspect the generated effective web header config statically through file review because no browser harness is configured for this repo setup pass
- perform a security review pass against `docs/agent-workflows/security-standard.md` and `docs/security/*`

## Review Notes

Residual risk to track during implementation:

- baseline web headers improve posture, but CSP and richer browser hardening still need a separate deliberate pass if the web lane gains live forms, analytics, or third-party embeds
- `SECURITY.md` improves disclosure routing, but human operational ownership still matters more than the file itself
- dependency automation reduces drift, but dependency triage discipline remains required

## Final Reconciliation

Actual root cause:

- the repo already had strong workflow and security standards, but several practical setup surfaces were still missing or implicit: env examples, baseline web header policy, explicit CI least-privilege defaults, dependency update automation, and root-level disclosure guidance

Repo fix:

- added `apps/mobile/.env.example` and `apps/web/.env.example`
- updated onboarding docs to point contributors at the committed env examples
- added low-risk baseline security headers to `apps/web/next.config.mjs`
- hardened `.github/workflows/ci.yml` with explicit `permissions` and `concurrency`
- added `.github/dependabot.yml`
- added root `SECURITY.md`
- updated the review artifact so it reflects what is now complete versus what remains future work

Verification:

- `node ./scripts/check-docs.mjs`
- `node ./scripts/lint.mjs`
- `node ./scripts/typecheck.mjs`
- `node ./scripts/verify.mjs`

Stable lessons:

- repo reviews should separate setup hardening from feature backlog so priority stays credible
- for early web hardening, conservative headers are often the right first step; CSP should be added only when the runtime strategy and verification path are clear
