# supabase-edge-auth-boundary

Created: 2026-04-05
Document Type: Bugfix Spec
Status: Implemented
Lane: shared

# Bugfix Spec

## Linked Context

- product brief: n/a
- PRD: [docs/product/mobile/prd.md](../../../product/mobile/prd.md)
- likely release gate: Gate B

## Overview

Harden the shared Supabase Edge Function auth boundary so authenticated functions do not rely on the mere presence of a `Bearer` header. The result should be a code-owned JWT verification path, explicit function auth configuration, and shared helpers that future privileged function work can reuse safely.

## Failure Context

Observed behavior:

- `supabase/functions/safe-to-spend/index.ts` accepted any request that included a `Bearer` token-shaped header without verifying the JWT.
- the current shared rate-limit helper marks sensitive functions but does not enforce a concrete quota backend yet.
- the current function configuration does not document the intended auth mode for `safe-to-spend`.

Expected behavior:

- authenticated Edge Functions should verify Supabase-issued JWTs before executing function logic
- user-scoped privileged scaffolds should require a verified user subject, not only a token-shaped header
- the auth mode should be explicit in repo-owned function configuration so future implementation does not accidentally depend on hidden defaults

Impact:

- the current scaffold is safe only because it returns a fixed placeholder response
- if real decision logic were added without fixing this boundary first, unauthorized callers could reach privileged code paths

## Root-Cause Statement

Confirmed root cause:

- the shared auth helper only parses the authorization header and never verifies the JWT against Supabase signing keys or asserts a valid user subject

Contributing factors:

- the scaffold relied on a placeholder auth helper while the function still sat behind a security-sensitive boundary
- rate limiting is explicitly scaffolded but not yet backed by a concrete provider, which increases the importance of a correct auth gate

## Scope

- add code-owned Supabase JWT verification for authenticated Edge Function requests
- require a verified user subject before `safe-to-spend` proceeds
- make the `safe-to-spend` auth mode explicit in `supabase/config.toml`
- add a repo security check that keeps the sensitive scaffold wired to the shared auth gate
- add proper Deno function-project configuration so Supabase function files are typechecked in their intended runtime
- add repo verification wiring for the Supabase function lane instead of leaving it outside the standard proof path
- update the minimal docs/specs that describe the shared Edge Function security baseline

## Non-Goals

- implementing the real Safe-to-Spend business logic
- introducing service-role database access for this scaffold
- implementing persistent rate limiting in this pass
- changing mobile or web client auth flows

## Requirements

- follow Supabase's official Edge Function auth guidance rather than inventing a custom token format
- fail closed when the authorization header is missing, malformed, or invalid
- fail closed when the function environment is not configured to verify Supabase JWTs
- keep user-facing errors generic and avoid leaking verification internals
- preserve the scaffold response for authenticated callers so this remains preparation work, not product-feature implementation

## Acceptance Criteria

- `safe-to-spend` requires a verified Supabase JWT with a user `sub` claim before reaching the scaffold response
- the auth helper verifies tokens against Supabase signing keys derived from function environment configuration
- `supabase/config.toml` explicitly records the intended auth behavior for `safe-to-spend`
- repo security checks fail if the sensitive scaffold stops calling the shared authenticated-user gate
- Supabase function files have a repo-owned Deno config instead of relying on untyped editor fallbacks
- the repo exposes an explicit Supabase function verification step
- the repo enforces executable auth-path verification for accepted and rejected JWT scenarios on the shared auth helper
- the shared security baseline docs match the shipped boundary
- repo verification still passes after the hardening change

## Clarifying Questions

- None block execution. This pass hardens the boundary without implementing real business logic or real quota storage.

## File Plan

- `docs/specs/shared/bugfixes/supabase-edge-auth-boundary.md`: bugfix spec for the auth-boundary hardening
- `docs/specs/shared/plans/supabase-edge-auth-boundary.md`: implementation slices and verification checkpoints
- `supabase/config.toml`: explicit per-function auth configuration
- `supabase/functions/deno.json`: workspace-level Deno config for mixed-editor support and whole-lane checking
- `supabase/functions/safe-to-spend/deno.json`: function-local Deno config for Supabase runtime parity
- `scripts/check-supabase-security.mjs`: ensure the sensitive scaffold keeps its shared auth gate
- `scripts/check-supabase-functions.mjs`: run Deno-aware Supabase function verification
- `supabase/functions/_shared/auth.verify.ts`: executable auth-path verification for the shared authenticated-user helper
- `scripts/verify.mjs`: include the Supabase function verifier in the main proof path
- `scripts/bootstrap-local.mjs`: surface the Deno prerequisite clearly during first-run setup
- `scripts/repo-contract.mjs`: keep the Supabase function verifier in the required repo contract
- `.vscode/settings.json` and `.vscode/extensions.json`: route `supabase/functions/**` through the official Deno language server in mixed-editor workspaces
- `supabase/functions/_shared/auth.ts`: shared JWT verification and authenticated-user extraction
- `supabase/functions/_shared/env.ts`: function-env helpers used by auth verification
- `supabase/functions/safe-to-spend/index.ts`: use verified auth context instead of header-shape checks
- `docs/security/security-review-baseline.md`: reconcile the current enforced baseline wording
- `supabase/functions/README.md`: clarify that authenticated functions own their JWT verification path in code
- `README.md` and `docs/getting-started.md`: document the Deno requirement for the Supabase function lane

## Interfaces and Types

- shared authenticated-user context returned by the function auth helper
- shared function-env helper for required Supabase auth settings
- `safe-to-spend` request gate remains `POST` plus authenticated user context before business logic executes

## Edge Cases

- missing authorization header
- malformed `Bearer` header
- invalid or expired JWT
- JWT that verifies structurally but lacks a user `sub`
- missing `SUPABASE_URL` or equivalent issuer configuration in the Edge Function runtime
- CORS preflight requests must continue to succeed without auth enforcement

## Security and Privacy Implications

- this is an auth-boundary hardening change and should be treated as Gate B work
- the function must not accept service-role or anonymous key material as a substitute for a verified user token
- the helper must avoid leaking validation details that would help an attacker distinguish failure modes
- this pass improves future implementation safety by making the privileged scaffold fail closed now

## Future Extensibility Notes

- future authenticated Edge Functions can reuse the shared JWT verification helper
- real decision logic can layer authorized Supabase clients or service-role integrations on top of this verified boundary later
- persistent rate limiting still needs a concrete backend before sensitive endpoints are production-ready

## Verification Plan

- Slice 1: add the shared auth and env helpers, then review the negative-path behavior
- Slice 2: switch `safe-to-spend` and `supabase/config.toml` to the explicit auth pattern, then run repo verification
- Slice 3: add Deno function-project config and repo verification wiring for the Supabase function lane
- Slice 3a: add executable Deno auth tests for the shared authenticated-user helper and enforce them in the Supabase function verifier
- Slice 4: reconcile docs/specs so the security baseline matches reality

## Implementation Plan Link

- [docs/specs/shared/plans/supabase-edge-auth-boundary.md](../plans/supabase-edge-auth-boundary.md)

## Checklist

- [x] write the bugfix spec and implementation plan
- [x] implement shared JWT verification helpers
- [x] switch `safe-to-spend` to the verified auth boundary
- [x] add Deno function-project config and repo verification wiring
- [x] reconcile security docs and function docs
- [x] run verification and record residual risks

## Design Decisions

- prefer Supabase's documented code-owned JWT verification pattern over header-presence checks
- keep the scaffold response unchanged for authenticated callers so this remains boundary preparation work
- leave rate limiting explicitly scaffolded rather than pretending a placeholder is a real control
- treat Deno as a first-class required runtime for Supabase function code instead of allowing that lane to escape standard typechecking

## Review Notes

- plan-review fallback: fresh-context same-tool review after implementation because no second model/tool is guaranteed in this environment

## Final Reconciliation

- implemented a shared JWT verification helper that derives the issuer and JWKS endpoint from function env and requires a verified user `sub`
- switched `safe-to-spend` to fail closed on invalid auth and made its auth mode explicit in `supabase/config.toml`
- added a repo security check so the sensitive scaffold cannot silently lose its shared auth gate without failing verification
- added workspace and function-local Deno configuration, VS Code Deno workspace settings, and a repo-owned Deno verifier so Supabase function files are checked in their actual runtime and stop surfacing generic tsserver false positives
- added executable Deno auth-path tests for the shared authenticated-user helper so accepted user JWTs and key rejection cases are enforced in repo verification
- installed Deno on this machine and confirmed the function graph with `deno check`
- `node ./scripts/verify.mjs` now passes with the Supabase-function-specific Deno check included
- residual risk remains: function-level rate limiting is still scaffolded and not backed by a concrete quota store
