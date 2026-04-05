# repo-review-followup-closure

Created: 2026-04-05
Document Type: Bugfix Spec
Status: Implemented
Lane: shared

# Bugfix Spec

## Overview

Close the remaining repo-review items that are still setup-scope, low-risk, and realistically completable before substantive feature delivery. This pass should finish the remaining hardening work that belongs to repository setup itself, while explicitly recording which original review items remain future feature-delivery work instead of leaving the task in an ambiguous half-complete state.

This pass focuses on four concrete areas:

- tightening the shared Edge Function CORS policy without weakening the existing auth boundary
- documenting the intentional `verify_jwt = false` function-auth strategy where it is easiest to miss
- strengthening the mobile MMKV non-sensitive-key guard
- adding repo-owned coverage reporting support

The task is reopened for a final closure slice after the follow-up review identified a few remaining setup-scope items that still belong in repo hardening rather than feature delivery:

- restrict loopback browser origins so they only work when the Edge Function runtime itself is local
- cache configured CORS origins instead of rebuilding them on each request
- warn safely when CORS env access falls back to defaults
- reconcile the review and release docs so the remaining items are explicitly resolved, deferred, or tracked as tooling limitations

## Failure Context

Observed behavior:

- `supabase/functions/_shared/cors.ts` still uses wildcard `access-control-allow-origin`
- `supabase/config.toml` does not explain why `safe-to-spend` uses `verify_jwt = false`
- `apps/mobile/src/lib/storage/mmkv.ts` relies only on a best-effort sensitive-key pattern match
- Jest collects coverage candidates but the repo does not expose a coverage-reporting command or configured reporters
- the review artifact does not yet clearly distinguish which findings are now implemented, which are intentionally deferred to feature delivery, and which were closed as non-issues

Expected behavior:

- the shared Edge Function scaffold should use an allowlist-oriented CORS policy suitable for the current pre-feature repo state
- the function auth mode should be documented close to `supabase/config.toml` so future changes do not misread it as a public endpoint
- MMKV should enforce both stronger sensitive-key rejection and a simple approved non-sensitive key shape
- contributors should have a repo-owned way to generate coverage output without inventing ad hoc Jest flags
- the repo review should act as a completion tracker rather than a stale one-time note

## Reproduction

1. Open `supabase/functions/_shared/cors.ts`.
2. Observe that the shared response headers still use `access-control-allow-origin: *`.
3. Open `supabase/config.toml`.
4. Observe that `verify_jwt = false` has no adjacent explanation.
5. Open `apps/mobile/src/lib/storage/mmkv.ts`.
6. Observe that the guard rejects obvious sensitive words but does not require a clearly non-sensitive key namespace.
7. Open `package.json` and the Jest config files.
8. Observe that there is no coverage-reporting command and no configured coverage reporters.
9. Open `docs/reviews/repo-review-2025-04-05.md`.
10. Observe that it validates findings but does not yet act as a concrete completion tracker for implemented versus deferred items.

## Evidence

- `supabase/functions/_shared/cors.ts`
- `supabase/config.toml`
- `apps/mobile/src/lib/storage/mmkv.ts`
- `packages/config-jest/base.cjs`
- `package.json`
- `docs/reviews/repo-review-2025-04-05.md`

## Root-Cause Statement

Confirmed root cause:

- the first hardening batch closed the highest-value setup gaps, but some lower-risk setup items from the review were intentionally left for a follow-up pass so they could be implemented carefully instead of being bundled into one broader change

Contributing factors:

- CORS changes touch shared function response behavior and needed a narrower pass with Deno-side verification
- the auth-mode rationale and MMKV hardening are small but cross-cutting and easier to forget unless explicitly scheduled
- coverage support is valuable but not required for the first batch to be useful

## File Plan

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

## Minimal Fix Plan

1. Replace wildcard function CORS with a small allowlist-oriented shared helper and verify it with Deno tests.
2. Document the code-owned JWT verification rationale next to `verify_jwt = false`.
3. Strengthen MMKV guardrails so keys must both avoid sensitive patterns and use approved non-sensitive prefixes.
4. Add a repo-owned coverage-reporting command and make the review artifact track implementation status per review item.
5. Tighten loopback CORS so local browser origins are allowed only when the Edge Function runtime is also local, while caching configured origins and warning safely on env fallback.
6. Reconcile the follow-up review and security release checklist so no setup-scope item remains ambiguous.

## Edge Cases

- non-browser Edge Function callers may not send an `Origin` header and should keep working
- local browser development should still allow loopback origins, but production runtimes should not accept them
- disallowed preflight requests should not accidentally receive permissive CORS headers
- stronger MMKV key validation must not block current code paths
- coverage reporting should not change the default test path or make normal verification materially slower

## Completion Checklist

- [x] original follow-up hardening slices shipped
- [x] final CORS closure slice implemented
- [x] review artifact reconciled so remaining items are not overstated
- [x] release checklist updated for manual Deno dependency triage when applicable
- [x] final verification rerun

## Verification Plan

- run `node ./scripts/check-supabase-functions.mjs`
- run `node ./scripts/check-docs.mjs`
- run `node ./scripts/lint.mjs`
- run `node ./scripts/typecheck.mjs`
- run `node ./scripts/test.mjs`
- run `node ./scripts/test-coverage.mjs`
- run `node ./scripts/verify.mjs`

## Review Notes

Residual risk to track during implementation:

- this pass should not claim that all original review items became code changes; some still correctly remain future feature-delivery work
- allowlist-based CORS helps the browser boundary, but auth and rate-limit controls remain the primary server-side defenses

## Final Reconciliation

Actual root cause:

- after the first setup-hardening batch, a small number of review items still needed closure at the setup layer: CORS wildcard usage, missing nearby auth-mode rationale, MMKV guard softness, missing coverage command, and lack of explicit implemented-versus-deferred tracking in the review artifact

Repo fix:

- replaced wildcard function CORS with a request-aware allowlist helper and added `cors.verify.ts`
- updated shared response helpers and the scaffolded function path so responses now carry request-aware CORS headers
- documented the `verify_jwt = false` rationale directly in `supabase/config.toml`
- strengthened MMKV key validation with a wider sensitive-key pattern and approved non-sensitive prefixes
- added `pnpm test:coverage` plus repo-owned coverage reporting configuration
- updated the review artifact with an implementation-tracking table that marks items as implemented, partially resolved, deferred to feature delivery, or closed without action
- tightened loopback-origin handling so localhost browser origins are only accepted when the Edge Function runtime itself is also loopback
- cached configured CORS origins by env state and added a safe non-secret warning path for real env-read failures
- updated the security release checklist so Deno function dependency changes require explicit manual triage when automation coverage is unavailable

Verification:

- `node ./scripts/check-supabase-functions.mjs`
- `node ./scripts/check-docs.mjs`
- `node ./scripts/lint.mjs`
- `node ./scripts/typecheck.mjs`
- `node ./scripts/test-coverage.mjs`
- `node ./scripts/verify.mjs`

Stable lessons:

- if a repo review is being used as a work tracker, it needs explicit implemented-versus-deferred status, not just analysis
- request-aware shared helpers are safer than global wildcard defaults when browser-facing behavior could expand later
