# repo-review-followup-closure

Created: 2026-04-05
Document Type: Implementation Plan
Status: Implemented
Lane: shared

# Implementation Plan

## Linked Context

- feature spec: [docs/specs/shared/bugfixes/repo-review-followup-closure.md](../bugfixes/repo-review-followup-closure.md)
- PRD or bugfix doc: [docs/reviews/repo-review-2025-04-05.md](../../../reviews/repo-review-2025-04-05.md)
- likely release gate: Gate B

## Scope

Close the remaining setup-scope review items that are still worth implementing now: CORS tightening, auth-mode rationale, MMKV guard hardening, coverage reporting support, and review-status reconciliation.

This plan is reopened for the final closure slice:

- allow loopback browser origins only when the Edge Function runtime itself is local
- cache configured CORS origins once per env state instead of per request
- warn safely when CORS env access falls back to defaults
- update the follow-up review and security release checklist so the remaining repo-setup items are fully classified

## Preconditions

- preserve the current code-owned JWT verification and explicit rate-limit blocker
- keep this pass out of feature backlog such as auth UI, migrations, and telemetry rollout
- prefer small shared-helper changes with direct verification

## File-Level Plan

- `docs/specs/shared/bugfixes/repo-review-followup-closure.md`
- `docs/specs/shared/plans/repo-review-followup-closure.md`
- `supabase/functions/_shared/cors.ts`
- `supabase/functions/_shared/cors.verify.ts`
- `supabase/functions/_shared/response.ts`
- `supabase/functions/_shared/auth.ts`
- `supabase/functions/safe-to-spend/index.ts`
- `supabase/config.toml`
- `apps/mobile/src/lib/storage/mmkv.ts`
- `docs/security/secure-storage.md`
- `packages/config-jest/base.cjs`
- `package.json`
- `scripts/test-coverage.mjs`
- `docs/reviews/repo-review-2025-04-05.md`
- `docs/reviews/repo-review-followup-2025-04-05.md`
- `docs/runbooks/security-release-checklist.md`

## Interfaces and Data Structures

- shared function CORS helper becomes request-aware instead of static wildcard-only
- response helpers and unauthorized responses accept the current request so CORS headers can be resolved safely
- MMKV cache keys must satisfy both:
  - no sensitive-word pattern match
  - approved non-sensitive prefix contract
- root script surface gains `test:coverage`

## Design Choices

- use a request-aware allowlist CORS helper rather than a global wildcard
- allow loopback browser origins only when the function runtime itself is also loopback, instead of allowing them in every environment
- document `verify_jwt = false` in `config.toml` rather than creating a full new ADR for a known already-documented boundary choice
- prefer a simple approved-prefix MMKV policy because there are no current call sites to migrate
- add coverage reporting support without turning coverage thresholds into a blocking gate yet
- treat unsupported Dependabot coverage for Deno lockfiles as a manual triage obligation, not as a fake automation guarantee

## Edge Cases and Failure Modes

- responses without request-aware CORS headers after the helper change
- preflight requests from disallowed origins
- future MMKV callers using unprefixed keys and hitting the stricter guard
- coverage command drift from the current Jest project structure

## Checklist

- [x] planning complete
- [x] clarifying questions resolved or recorded as open decisions
- [x] slice 1 complete
- [x] slice 2 complete
- [x] slice 3 complete
- [x] slice 4 complete
- [x] slice 5 complete
- [x] verification completed
- [x] docs reconciled
- [x] review complete

## Slice Plan

- Slice 1: request-aware CORS helper
  - files: `supabase/functions/_shared/cors.ts`, `supabase/functions/_shared/cors.verify.ts`, `supabase/functions/_shared/response.ts`, `supabase/functions/_shared/auth.ts`, `supabase/functions/safe-to-spend/index.ts`
  - interfaces: function responses become request-aware for CORS
  - design: allowlist-oriented CORS with loopback support and safe fallback for non-browser callers
  - verification: `node ./scripts/check-supabase-functions.mjs`

- Slice 2: auth-mode documentation
  - files: `supabase/config.toml`, `docs/reviews/repo-review-2025-04-05.md`
  - interfaces: documentation only
  - design: make the custom auth boundary explicit where future maintainers will look first
  - verification: docs review plus `node ./scripts/check-docs.mjs`

- Slice 3: MMKV guard hardening
  - files: `apps/mobile/src/lib/storage/mmkv.ts`, `docs/security/secure-storage.md`
  - interfaces: approved non-sensitive MMKV key contract
  - design: combine stronger sensitive-key rejection with explicit non-sensitive prefixes
  - verification: `node ./scripts/lint.mjs`, `node ./scripts/typecheck.mjs`, `node ./scripts/test.mjs`

- Slice 4: coverage reporting and review tracking
  - files: `packages/config-jest/base.cjs`, `package.json`, `scripts/test-coverage.mjs`, `docs/reviews/repo-review-2025-04-05.md`
  - interfaces: root `test:coverage` command and updated review status tracking
  - design: add reporting support without making coverage thresholds release-blocking yet
  - verification: `node ./scripts/test-coverage.mjs`, `node ./scripts/verify.mjs`

- Slice 5: final closure hardening and durable docs
  - files: `supabase/functions/_shared/cors.ts`, `supabase/functions/_shared/cors.verify.ts`, `docs/reviews/repo-review-2025-04-05.md`, `docs/reviews/repo-review-followup-2025-04-05.md`, `docs/runbooks/security-release-checklist.md`
  - interfaces: loopback CORS allowance becomes local-runtime-only; release evidence calls out manual Deno dependency triage when automation coverage is missing
  - design: solve the remaining CORS concern at the root without introducing extra config burden, then close the review artifact with explicit classifications
  - verification: `node ./scripts/check-supabase-functions.mjs`, `node ./scripts/check-docs.mjs`, `node ./scripts/verify.mjs`

## Plan Review

- independent review or cross-model review needed: fresh-context same-tool fallback after implementation
- review findings before implementation:
  - keep the CORS change minimal and verifiable
  - do not overcomplicate coverage into a policy gate in the same pass
  - use the review doc to mark items as implemented, deferred to feature delivery, or no-action-needed

## Failure and Rollback Considerations

- if request-aware CORS causes drift, revert the helper changes as one slice
- if MMKV prefix enforcement proves too strict, narrow the approved-prefix contract rather than removing the guard improvement entirely
- if coverage reporting is noisy, keep the command but avoid pushing it into default verification
- if local-runtime detection for loopback CORS proves unreliable, fall back to an explicit env gate rather than reopening broad wildcard behavior

## Re-Planning Triggers

- the shared response-helper change broadens into a larger Edge Function interface redesign
- current local or CI tooling cannot run the added CORS verification cleanly
- a review item thought to be setup-scope turns out to need product or operational decisions first

## Completion Evidence

- shared function CORS no longer uses wildcard `*`
- `verify_jwt = false` rationale is explicit near the config
- MMKV guard requires approved non-sensitive key shape
- `node ./scripts/test-coverage.mjs` works
- the review artifact clearly tracks implemented versus deferred items
- `node ./scripts/verify.mjs` passes

## Documentation Reconciliation

- `docs/specs/shared/bugfixes/repo-review-followup-closure.md`
- `docs/specs/shared/plans/repo-review-followup-closure.md`
- `docs/security/secure-storage.md`
- `docs/reviews/repo-review-2025-04-05.md`

## Final Reconciliation

- Slice 1 shipped with request-aware shared CORS handling plus Deno verification coverage
- Slice 2 shipped with a direct `verify_jwt = false` rationale comment in `supabase/config.toml`
- Slice 3 shipped with stricter MMKV non-sensitive key rules and secure-storage doc updates
- Slice 4 shipped with `pnpm test:coverage`, Jest coverage reporting configuration, and explicit review-item tracking in the review artifact
- Slice 5 shipped with local-runtime-only loopback CORS, cached configured origins, a safe env-fallback warning path, updated follow-up review closure, and a release-checklist requirement for manual Deno dependency triage when relevant
- full proof completed with `node ./scripts/verify.mjs`
