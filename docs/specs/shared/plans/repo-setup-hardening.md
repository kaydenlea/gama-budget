# repo-setup-hardening

Created: 2026-04-05
Document Type: Implementation Plan
Status: Implemented
Lane: shared

# Implementation Plan

## Linked Context

- feature spec: [docs/specs/shared/bugfixes/repo-setup-hardening.md](../bugfixes/repo-setup-hardening.md)
- PRD or bugfix doc: [docs/reviews/repo-review-2025-04-05.md](../../../reviews/repo-review-2025-04-05.md)
- likely release gate: Gate C

## Scope

Implement the highest-value immediate repo-setup hardening items confirmed by the Codex-validated review: env examples, baseline web security headers, CI workflow hardening, dependency update automation, and root-level security disclosure guidance.

## Preconditions

- keep this pass focused on repo setup rather than feature backlog
- prefer official Next.js, GitHub Actions, GitHub security policy, and Dependabot guidance over ad hoc patterns
- do not introduce product-facing analytics, authentication, or schema work in this pass
- keep mobile and web lane boundaries intact

## File-Level Plan

- `docs/specs/shared/bugfixes/repo-setup-hardening.md`: active bugfix spec
- `docs/specs/shared/plans/repo-setup-hardening.md`: active implementation plan
- `apps/mobile/.env.example`: document required Expo public env variables used by the mobile lane
- `apps/web/.env.example`: document the current public web env variable used by the web lane
- `docs/getting-started.md`: document the new env example files in first-run guidance
- `apps/web/README.md`: document the web lane env example explicitly
- `apps/web/next.config.mjs`: add low-risk baseline response security headers
- `.github/workflows/ci.yml`: add least-privilege `permissions` and `concurrency`
- `.github/dependabot.yml`: add dependency update automation for npm/pnpm and GitHub Actions
- `SECURITY.md`: add a truthful vulnerability reporting policy
- `README.md`: mention the security policy in the repo entrypoint when useful
- `docs/reviews/repo-review-2025-04-05.md`: reconcile the review status once implementation lands

## Interfaces and Data Structures

- `.env.example` files define the documented public configuration surface for current lanes
- `next.config.mjs` `headers()` becomes the web lane policy surface for baseline response headers
- GitHub Actions workflow metadata gains:
  - `permissions`
  - `concurrency`
- `.github/dependabot.yml` becomes the repo-owned dependency update policy surface
- `SECURITY.md` becomes the GitHub-native vulnerability disclosure surface

## Design Choices

- add lane-specific env examples rather than a single root example so responsibility stays explicit
- add conservative security headers that are low-risk for the current marketing lane
- defer CSP until there is a deliberate nonce or script-style strategy and browser verification
- keep CI as a single job in this pass; harden defaults first before considering structural job splitting
- use Dependabot because it is GitHub-native and fits the current repo hosting assumptions
- keep `SECURITY.md` truthful and non-ceremonial; do not invent unsupported SLAs or contact channels

## Edge Cases and Failure Modes

- headers that interfere with Next.js or future embedded preview behavior
- Dependabot config that opens too many PRs or ignores the workspace layout
- security policy language that implies public bug bounty or staffed security operations when none exist
- docs drift where examples mention env files that are not actually committed

## Checklist

- [x] planning complete
- [x] clarifying questions resolved or recorded as open decisions
- [x] slice 1 complete
- [x] slice 2 complete
- [x] slice 3 complete
- [x] slice 4 complete
- [x] verification completed
- [x] docs reconciled
- [x] review complete

## Slice Plan

- Slice 1: environment examples and onboarding docs
  - files: `apps/mobile/.env.example`, `apps/web/.env.example`, `docs/getting-started.md`, `apps/web/README.md`
  - interfaces: documented public env variables only
  - design: keep examples lane-local, minimal, and truthful
  - edge cases: no secret-like placeholders, no undocumented required vars
  - verification: docs review plus `node ./scripts/check-docs.mjs`

- Slice 2: web header hardening
  - files: `apps/web/next.config.mjs`
  - interfaces: Next.js `headers()` response policy
  - design: add low-risk headers now; defer CSP
  - edge cases: avoid breaking local/dev behavior or future preview flows
  - verification: `node ./scripts/lint.mjs`, `node ./scripts/typecheck.mjs`, touched-file review against Next.js docs

- Slice 3: CI and dependency automation
  - files: `.github/workflows/ci.yml`, `.github/dependabot.yml`
  - interfaces: GitHub Actions workflow policy and Dependabot schedule
  - design: least privilege, cancel superseded runs, keep update cadence manageable
  - edge cases: expressions in `concurrency`, workspace dependency coverage, GitHub Actions ecosystem coverage
  - verification: `node ./scripts/check-docs.mjs`, `node ./scripts/verify.mjs`

- Slice 4: security policy and reconciliation
  - files: `SECURITY.md`, `README.md`, `docs/reviews/repo-review-2025-04-05.md`, planning artifacts
  - interfaces: disclosure guidance and durable review status
  - design: truthful private reporting path, no invented support promises
  - edge cases: no false public-contact claims, no launch-readiness overstatement
  - verification: `node ./scripts/check-docs.mjs`, `node ./scripts/verify.mjs`

## Plan Review

- independent review or cross-model review needed: fresh-context same-tool review fallback after implementation because only one local agent tool is being used in this turn
- review findings before implementation:
  - do not overreach into product backlog items from the review
  - prefer minimal hardening that is clearly correct over aggressive policy additions that are hard to validate
  - keep browser security advice grounded in the current web lane rather than generic finance-site checklists

## Failure and Rollback Considerations

- header additions can be rolled back by removing the `headers()` block if verification reveals unexpected breakage
- CI hardening should be limited to metadata changes that are easy to revert
- if `SECURITY.md` wording proves inaccurate, tighten or simplify the language rather than adding unsupported process commitments

## Re-Planning Triggers

- a required web header change needs runtime verification the repo cannot currently provide
- current GitHub workflow assumptions are wrong for the repo's actual hosting or contribution model
- adding `SECURITY.md` requires an organizational contact path that does not yet exist

## Completion Evidence

- lane-specific env examples exist and are documented
- the web lane has baseline response security headers without introducing brittle CSP policy
- CI includes explicit `permissions` and `concurrency`
- Dependabot config exists for repo dependencies and GitHub Actions
- `SECURITY.md` exists and matches the repo's actual disclosure posture
- `node ./scripts/verify.mjs` passes

## Documentation Reconciliation

- `docs/specs/shared/bugfixes/repo-setup-hardening.md`
- `docs/specs/shared/plans/repo-setup-hardening.md`
- `docs/getting-started.md`
- `apps/web/README.md`
- `README.md`
- `docs/reviews/repo-review-2025-04-05.md`

## Final Reconciliation

- Slice 1 shipped as planned with lane-specific env examples plus onboarding doc updates
- Slice 2 shipped with conservative baseline web headers and intentionally deferred CSP to a later deliberate pass
- Slice 3 shipped with explicit CI `permissions`, `concurrency`, and a new Dependabot policy
- Slice 4 shipped with root `SECURITY.md` and review/doc reconciliation
- full proof completed with `node ./scripts/verify.mjs`
