# security-baseline-closure

Created: 2026-04-05
Document Type: Implementation Plan
Status: Implemented
Lane: shared

# Implementation Plan

## Linked Context

- feature spec: [docs/specs/shared/bugfixes/security-baseline-closure.md](../bugfixes/security-baseline-closure.md)
- PRD or bugfix doc: [docs/product/mobile/prd.md](../../../product/mobile/prd.md)
- likely release gate: Gate B

## Scope

Close the currently known repo-level security baseline gaps by keeping sensitive-function rate limiting as an explicit fail-closed release blocker until feature delivery is ready to complete it, and by strengthening the release-blocking security contracts for the other items that cannot be fully implemented before specific product flows exist.

## Preconditions

- the repo remains Supabase-first for v1
- the auth-boundary hardening work remains the current shared function baseline
- this pass must not expand into real Safe-to-Spend business logic
- the repo should prefer official Supabase and Deno guidance plus the existing security standard over ad hoc infrastructure choices

## File-Level Plan

- `docs/specs/shared/bugfixes/security-baseline-closure.md`: active bugfix spec
- `docs/specs/shared/plans/security-baseline-closure.md`: active implementation plan
- `supabase/functions/_shared/rate-limit.ts`: keep the explicit release-blocker error and future policy definitions for sensitive functions
- `supabase/functions/_shared/response.ts`: keep the shared user-safe 429 response path
- `supabase/functions/safe-to-spend/index.ts`: enforce the shared auth gate and the explicit rate-limit blocker
- `scripts/check-supabase-security.mjs`: fail verification if the sensitive scaffold stops using the blocker or regresses to a silent placeholder
- `docs/security/security-model.md`: record the new enforced baseline
- `docs/security/security-review-baseline.md`: reconcile the closed and remaining gaps accurately
- `docs/security/data-retention-and-deletion.md`: define explicit retention windows for current baseline classes
- `docs/security/secure-storage.md`: upgrade device-integrity planning into a launch-blocking requirement for sensitive mobile flows
- `docs/runbooks/security-release-checklist.md`: require evidence for rate limiting, logging, retention, and mobile integrity readiness where relevant
- `docs/runbooks/release-gates.md`: make the feature-dependent launch blockers explicit at Gate C and Gate D
- `supabase/functions/README.md`: document the explicit rate-limit blocker for sensitive scaffolds

## Interfaces and Data Structures

- `SensitiveFunctionRateLimitNotImplementedError`: explicit blocker error for sensitive function scaffolds
- function rate-limit policy definitions keyed by function name

## Design Choices

- fail closed for sensitive function scaffolds until a real rate-limit backend is implemented as part of feature delivery
- do not introduce persistent backend state before the feature work that actually needs it
- convert feature-dependent controls such as the future real limiter and App Attest / Play Integrity into launch-blocking requirements, not soft future notes

## Edge Cases and Failure Modes

- future privileged logic being added while the rate-limit blocker is still present
- release reviewers treating launch-blocking requirements as optional because the feature is not yet shipped

## Slice Plan

- Slice 1: planning artifacts and blocker design
  - files: spec, plan
  - design: define the explicit release blocker for sensitive function rate limiting and the minimum repo guardrails around it
  - verification: touched-file review against security standard

- Slice 2: function shared helpers and sensitive-function wiring
  - files: `_shared/rate-limit.ts`, `_shared/response.ts`, `safe-to-spend/index.ts`
  - design: fail closed on sensitive functions until a real limiter is implemented, while keeping the shared auth boundary intact
  - verification: Deno-aware function checks plus repo verification

- Slice 3: repo guardrails
  - files: `scripts/check-supabase-security.mjs`
  - design: verification should fail if sensitive functions lose their rate-limit call or the explicit blocker text regresses into a silent placeholder
  - verification: `node ./scripts/check-supabase-security.mjs`

- Slice 4: security docs and release-gate reconciliation
  - files: security docs, runbooks, function README, planning artifacts
  - design: close the current known repo gaps where possible and convert the remaining feature-dependent items into explicit launch blockers
  - verification: docs review plus `node ./scripts/verify.mjs`

## Plan Review

- independent review or cross-model review needed: fresh-context same-tool review fallback after implementation
- review findings before implementation:
- do not introduce real product logic or user-facing Safe-to-Spend behavior
- do not claim full completion for controls that are inseparable from future feature implementation
- keep what is still feature-dependent as an explicit blocker instead of sneaking in backend state early

## Failure and Rollback Considerations

- do not silently fall back to `allowed: true`
- if docs or release-gate rules prove too weak, strengthen them rather than removing the requirement

## Re-Planning Triggers

- the chosen Supabase-native rate-limit design cannot be implemented safely with the current function/runtime constraints
- function verification reveals a broader shared-helper redesign is needed
- the work requires a new external service or deployment dependency that was not part of the bounded security-prep scope

## Completion Evidence

- sensitive Edge Functions keep an explicit fail-closed blocker instead of a silent placeholder limiter
- the repo verifier fails if the sensitive scaffold loses that blocker
- explicit retention windows exist in repo-owned security docs
- mobile integrity requirements are represented as launch-blocking controls rather than soft future notes
- `node ./scripts/verify.mjs` passes

## Documentation Reconciliation

- `docs/specs/shared/bugfixes/security-baseline-closure.md`
- `docs/specs/shared/plans/security-baseline-closure.md`
- `docs/security/security-model.md`
- `docs/security/security-review-baseline.md`
- `docs/security/data-retention-and-deletion.md`
- `docs/security/secure-storage.md`
- `docs/runbooks/security-release-checklist.md`
- `docs/runbooks/release-gates.md`
- `supabase/functions/README.md`

## Final Reconciliation

- reverted the premature Supabase-backed limiter implementation and removed the migration so no backend state is created before feature work begins
- updated the shared rate-limit helper so sensitive function scaffolds now fail closed with an explicit release-blocker error instead of silently allowing requests
- strengthened `scripts/check-supabase-security.mjs` so verification fails if the sensitive scaffold loses that blocker or regresses back to an unconditional placeholder
- kept the stronger retention-window and release-gate docs so the real limiter, mobile device integrity, and future feature-specific security controls remain explicit blockers instead of being forgotten
- final proof: `node ./scripts/check-supabase-security.mjs`, `node ./scripts/check-supabase-functions.mjs`, and `node ./scripts/verify.mjs` all pass
