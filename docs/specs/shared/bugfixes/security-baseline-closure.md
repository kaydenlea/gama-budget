# security-baseline-closure

Created: 2026-04-05
Document Type: Bugfix Spec
Status: Implemented
Lane: shared

# Bugfix Spec

## Overview

Close the remaining known repo-level security baseline gaps before product implementation builds on top of them. The goal is not to pretend every future feature-specific security decision can be made today. The goal is to implement the controls that are concrete now, and convert the still-feature-dependent requirements into explicit release blockers and repo-owned guidance so they cannot be forgotten later.

## Failure Context

Observed behavior:

- authenticated Supabase Edge Function scaffolds now verify JWTs, but the shared rate-limit helper still always allows requests
- the repo documents security logging, alerting, retention, and mobile integrity planning expectations, but some of those expectations are still guidance rather than enforced baseline
- the security baseline still records known gaps that could be forgotten later unless the repo converts them into explicit contracts

Expected behavior:

- sensitive Edge Functions should not be able to quietly proceed with only a placeholder limiter
- the repo should either implement a real limiter now or keep an explicit fail-closed blocker until feature delivery is ready to complete it
- retention windows and monitoring expectations should be explicit enough to support future implementation and release review
- mobile device-integrity controls that cannot be fully implemented yet should still become launch-blocking requirements for sensitive flows

Impact:

- leaving the placeholder limiter in place would allow future privileged logic to launch without a real abuse-control boundary
- leaving retention decisions vague increases the chance of under-scoped implementation and missing release evidence later
- leaving mobile integrity planning as a soft note makes it easier to defer a real decision until too late in the implementation cycle

## Reproduction

1. Open `supabase/functions/_shared/rate-limit.ts`.
2. Observe that sensitive functions are enumerated but always return `{ allowed: true }`.
3. Open `docs/security/security-review-baseline.md`.
4. Observe that function rate limiting, mobile integrity controls, and security logging/retention decisions are still listed as baseline gaps.

## Evidence

- `supabase/functions/_shared/rate-limit.ts` currently returns `allowed: true` for sensitive functions
- `docs/security/security-review-baseline.md` currently records rate limiting, App Attest/Play Integrity, and logging-retention decisions as known gaps
- `docs/runbooks/security-release-checklist.md` and `docs/runbooks/release-gates.md` describe the review expectations, but the repo does not yet fully enforce the implemented-now portion of those expectations

## Root-Cause Statement

Confirmed root cause:

- the repo hardened the auth boundary first, but intentionally deferred the remaining abuse-protection and baseline-closure work so privileged function scaffolds still depend on a placeholder limiter and partially documented security expectations

Contributing factors:

- some controls are immediately implementable, while others only make sense once specific product flows exist
- the existing docs call out the gap, but the repo has not yet converted all of those items into concrete code or launch-blocking contracts

## File Plan

- `docs/specs/shared/bugfixes/security-baseline-closure.md`
- `docs/specs/shared/plans/security-baseline-closure.md`
- `supabase/migrations/20260405193000_sensitive-function-rate-limit.sql`
- `supabase/functions/_shared/env.ts`
- `supabase/functions/_shared/response.ts`
- `supabase/functions/_shared/rate-limit.ts`
- `supabase/functions/_shared/security-events.ts`
- `supabase/functions/_shared/supabase-admin.ts`
- `supabase/functions/safe-to-spend/index.ts`
- `scripts/check-supabase-security.mjs`
- `docs/security/security-model.md`
- `docs/security/security-review-baseline.md`
- `docs/security/data-retention-and-deletion.md`
- `docs/security/secure-storage.md`
- `docs/runbooks/security-release-checklist.md`
- `docs/runbooks/release-gates.md`
- `docs/runbooks/monitoring-and-alerting.md`
- `supabase/functions/README.md`

## Minimal Fix Plan

1. Add a real Supabase-backed rate-limit backend for sensitive Edge Functions using an Edge-function-only operational table plus a privileged RPC helper.
2. Strengthen repo security checks so the sensitive scaffold cannot silently drop the auth gate or the explicit rate-limit blocker.
3. Convert the remaining feature-dependent baseline items into explicit launch-blocking requirements in security docs and release gates, including the real future limiter, mobile device-integrity requirements, and retention-window decisions.

## Edge Cases

- rate-limit backend failure must fail closed for sensitive functions
- repeated calls within the same window must increment atomically
- unauthorized requests should not leak validation or rate-limit internals
- local development still needs a documented path for required function secrets
- mobile integrity controls cannot be fully implemented without the corresponding product flows, so the repo must represent them as explicit blockers rather than pretending they are complete

## Verification Plan

- run `node ./scripts/check-supabase-security.mjs`
- run `node ./scripts/check-supabase-functions.mjs`
- run `node ./scripts/verify.mjs`
- review the new migration for table class, RLS posture, grants, and rollback safety
- review touched security docs and runbooks for consistency with the shipped baseline

## Review Notes

Residual risk to track during implementation:

- the repo now blocks sensitive function delivery until a real limiter exists, but the real limiter itself still needs to be implemented when the feature work begins
- mobile device-integrity enforcement remains feature-dependent and therefore must be represented as a release blocker rather than falsely marked complete

## Final Reconciliation

Actual root cause:

- the repo had hardened authentication for sensitive function scaffolds, but still left abuse protection and some baseline security requirements in a partly documented state rather than turning them into hard release blockers

Repo fix:

- kept the shared auth hardening in place
- replaced the rate-limit placeholder with an explicit fail-closed release-blocker error for sensitive functions instead of implementing backend state ahead of product work
- strengthened repo security checks so the sensitive scaffold must keep both the auth gate and the explicit rate-limit blocker until a real limiter is implemented later
- reconciled retention windows, release-gate wording, and mobile device-integrity requirements so the remaining future-dependent controls are explicit launch blockers rather than soft future notes

Stable lessons:

- a documented placeholder is still a security gap if the repo does not turn it into either a real control or an explicit blocker
- for pre-feature finance scaffolds, do not introduce persistent backend state prematurely just to feel complete; keep strong blockers in place and finish the real control together with feature delivery
