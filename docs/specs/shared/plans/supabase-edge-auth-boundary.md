# supabase-edge-auth-boundary

Created: 2026-04-05
Document Type: Implementation Plan
Status: Implemented
Lane: shared

# Implementation Plan

## Linked Context

- feature spec: [docs/specs/shared/bugfixes/supabase-edge-auth-boundary.md](../bugfixes/supabase-edge-auth-boundary.md)
- PRD or bugfix doc: [docs/product/mobile/prd.md](../../../product/mobile/prd.md)
- likely release gate: Gate B

## Scope

Replace header-shape auth checks in the shared Supabase Edge Function scaffold with explicit JWT verification and authenticated-user extraction, then make the Supabase function lane a properly configured Deno workspace inside the repo.

## Preconditions

- the repo security baseline and Supabase boundary rules remain the source of truth
- Supabase's official Edge Function auth guidance is the external source of truth for the verification approach
- this pass is preparation hardening only and must not expand into real Safe-to-Spend feature logic

## File-Level Plan

- `supabase/functions/_shared/env.ts`: expose required auth-related function env helpers
- `supabase/functions/_shared/auth.ts`: add code-owned JWT verification and authenticated-user extraction
- `supabase/functions/safe-to-spend/index.ts`: require verified auth context before returning the scaffold response
- `supabase/functions/deno.json`: define the workspace-level Deno config used for mixed-editor support and whole-lane checking
- `supabase/functions/safe-to-spend/deno.json`: define the function-local Deno project and dependency resolution
- `supabase/config.toml`: make the function auth mode explicit
- `scripts/check-supabase-security.mjs`: enforce that the sensitive scaffold keeps its shared auth gate
- `scripts/check-supabase-functions.mjs`: run Deno-aware function checks
- `supabase/functions/_shared/auth.verify.ts`: exercise accepted and rejected JWT paths on the shared auth helper
- `scripts/verify.mjs`: include the Deno-aware function check in the main proof path
- `scripts/bootstrap-local.mjs`: surface the Deno prerequisite during bootstrap
- `scripts/repo-contract.mjs`: keep the new verifier in the required contract
- `.vscode/settings.json` and `.vscode/extensions.json`: align VS Code with the Deno runtime for `supabase/functions/**`
- `docs/security/security-review-baseline.md`: update the enforced baseline language
- `supabase/functions/README.md`: document the intended authenticated-function pattern
- `README.md` and `docs/getting-started.md`: document the Supabase-function Deno requirement
- `docs/specs/shared/bugfixes/supabase-edge-auth-boundary.md` and `docs/specs/shared/plans/supabase-edge-auth-boundary.md`: keep the planning artifacts current

## Interfaces and Data Structures

- `requireAuthenticatedUser(request): Promise<AuthenticatedUser>`
- `AuthenticatedUser` includes the verified bearer token, a required `userId`, and selected JWT claims needed for future function work
- `readSupabaseJwtVerificationConfig()` returns the issuer and JWKS endpoint derived from function env
- `supabase/functions/deno.json` owns workspace-level Deno editor and verification settings for the whole function lane
- `supabase/functions/safe-to-spend/deno.json` remains the function-local config for runtime parity
- `check-supabase-functions.mjs` fails closed when Deno is unavailable or the function lane does not typecheck or pass executable Deno tests under the shared workspace config and the function-local config

## Design Choices

- use Supabase's documented code-owned JWT verification pattern so the function boundary is explicit in repo code
- keep CORS preflight handling before auth enforcement
- return user-safe 401 responses for invalid auth and generic 500 responses for misconfigured server auth settings
- keep rate limiting untouched in this pass except for documentation clarity, since no real quota backend exists yet
- keep a shared `supabase/functions/deno.json` for mixed-editor support while retaining function-local `deno.json` files for Supabase runtime parity
- wire the Deno function check into the standard repo verifier so Supabase code cannot drift outside the proof set

## Edge Cases and Failure Modes

- requests without `Authorization`
- headers that are not `Bearer <token>`
- expired, forged, or malformed JWTs
- JWTs that verify but do not represent an authenticated user subject
- missing function env such as `SUPABASE_URL`
- accidental reliance on default gateway auth behavior instead of the function's own verification code
- local machines without Deno installed
- editor/type tooling that treats Deno files as generic Node TypeScript unless the repo provides explicit configuration
- VS Code workspaces that lack the official Deno extension and therefore keep showing generic tsserver diagnostics

## Slice Plan

- Slice 1: shared auth verification helper
  - files: `supabase/functions/_shared/auth.ts`, `supabase/functions/_shared/env.ts`
  - interfaces: authenticated-user context and env-derived verification config
  - design: verify Supabase JWTs against the project JWKS and require a user `sub`
  - edge cases: malformed headers, invalid JWTs, missing env
  - verification: static review of negative paths plus repo verification after integration

- Slice 2: function wiring, explicit config, and repo guardrail
  - files: `supabase/functions/safe-to-spend/index.ts`, `supabase/config.toml`, `scripts/check-supabase-security.mjs`
  - interfaces: authenticated-user gate before scaffold response
  - design: authenticate before rate-limit and business-logic placeholder execution; make function auth mode explicit in config; fail verification if the sensitive scaffold drops the shared auth gate
  - edge cases: OPTIONS requests, unauthorized POSTs, misconfigured env
  - verification: repo verification and touched-file review

- Slice 3: Deno workspace and verification wiring
  - files: `supabase/functions/deno.json`, `supabase/functions/safe-to-spend/deno.json`, `.vscode/settings.json`, `.vscode/extensions.json`, `scripts/check-supabase-functions.mjs`, `supabase/functions/_shared/auth.verify.ts`, `scripts/verify.mjs`, `scripts/bootstrap-local.mjs`, `scripts/repo-contract.mjs`
  - interfaces: workspace-level Deno config, function-local Deno config, and repo verification contract
  - design: make Deno-aware function checking explicit, fail closed when the required toolchain is missing, exercise the shared auth boundary with executable negative-path coverage, and route `supabase/functions/**` through the Deno language server in VS Code
  - edge cases: missing Deno binary, missing VS Code Deno extension, function imports that only resolve under the Deno runtime, bootstrap behavior on machines that have not installed Deno yet
  - verification: run the repo verifier and record whether the local machine still needs the Deno prerequisite installed

- Slice 4: docs reconciliation
  - files: `docs/security/security-review-baseline.md`, `supabase/functions/README.md`, `README.md`, `docs/getting-started.md`, planning artifacts
  - interfaces: documentation truthfulness only
  - design: describe the actual shared auth boundary, the Deno runtime requirement, and the remaining rate-limit gap clearly
  - edge cases: do not overclaim production readiness or claim full function proof without Deno
  - verification: docs checks and final search/touched-file review

## Plan Review

- independent review or cross-model review needed: fresh-context same-tool review fallback after implementation
- review findings before implementation:
  - the hardening should remain preparation work and not introduce partial business logic
  - explicit code-owned auth is safer than relying on a header-presence check or undocumented defaults

## Failure and Rollback Considerations

- if the verification helper breaks the scaffold unexpectedly, revert the auth-helper and function-wiring files together
- if explicit config causes local serving friction, keep the config but document the required env instead of silently weakening auth
- do not weaken the function back to header-shape auth as a rollback shortcut

## Re-Planning Triggers

- Supabase's current official auth guidance requires a materially different verification pattern than expected
- the hardening requires new secrets or deployment plumbing beyond a bounded auth-prep change
- verification exposes broader Supabase function infrastructure gaps than the current shared boundary

## Completion Evidence

- `safe-to-spend` no longer treats any `Bearer`-shaped header as sufficient auth
- repo verification includes a Supabase-function-specific check
- repo verification includes executable auth-path coverage for accepted user JWTs and rejected malformed or non-user JWTs
- repo verification passes
- security baseline docs match the actual boundary
- repo security checks enforce the shared auth gate on the sensitive scaffold
- residual risks explicitly call out that rate limiting remains scaffolded

## Documentation Reconciliation

- `docs/specs/shared/bugfixes/supabase-edge-auth-boundary.md`
- `docs/specs/shared/plans/supabase-edge-auth-boundary.md`
- `docs/security/security-review-baseline.md`
- `supabase/functions/README.md`
- `scripts/check-supabase-security.mjs`
- `scripts/check-supabase-functions.mjs`
- `README.md`
- `docs/getting-started.md`
