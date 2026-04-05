# PocketCurb Repository Review - Follow-Up Pass

Second-pass review on 2026-04-05 after adjustments from commits `2940754` and `d4b7b1b`, then finalized with a bounded closure pass on 2026-04-05.

## Verification

Fresh `node ./scripts/verify.mjs` run on 2026-04-05 - **all checks pass**:
- ESLint, policy checks, Supabase security checks, Deno function checks, TypeScript, docs checks, repo contract, all tests (unit, integration, e2e)
- 42 checks passed, 0 failed

---

## Scorecard: Original Findings

### Resolved (10 of 20)

| # | Finding | Resolution | Quality |
|---|---|---|---|
| 1 | CORS wildcard `*` | Replaced with origin allowlist, local-runtime-only loopback support, `Vary: Origin`, and 403 on disallowed preflight | Solid |
| 5 | No `.env.example` files | Mobile and web `.env.example` created with all public vars | Good |
| 6 | CI missing concurrency | `concurrency` block with `cancel-in-progress: true` added | Good |
| 6 | CI missing permissions | `permissions: contents: read` added (least-privilege) | Good |
| 7 | `verify_jwt = false` undocumented | Comment added in `supabase/config.toml` explaining rationale | Good |
| 11 | No dependency update automation | Dependabot config with npm + GitHub Actions + semver-tiered cooldown | Good |
| 12 | Web has no security headers | 6 headers added (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COOP, HSTS) | Solid |
| 13 | MMKV sensitive key guard too narrow | Regex expanded to 10+ keywords + allowlist prefix enforcement + fail-closed | Excellent |
| 16 | CI missing `concurrency` | See #6 above | Good |
| 20 | No `SECURITY.md` | Honest pre-launch disclosure policy added | Good |

### Properly Deferred (6 of 20)

| # | Finding | Decision | Rationale |
|---|---|---|---|
| 2 | Rate limiting is a stub | Kept as fail-closed blocker | Correct - implementing backend state before the feature that needs it would be premature scaffold churn. The verifier enforces the blocker stays explicit. |
| 3 | No real database migrations | Deferred to first schema feature | Correct - template-only state is expected at scaffold stage. |
| 4 | No authentication flow | Deferred to feature delivery | Correct - product work, not repo setup. |
| 8 | No error boundary in mobile | Deferred to product work | Acceptable - should use Expo Router's route error-boundary pattern when implemented. |
| 9 | Monitoring is stub only | Deferred to telemetry/disclosure work | Correct - monitoring rollout should follow disclosure planning. |
| 15 | No coverage thresholds | Coverage script exists (`pnpm test:coverage`), thresholds intentionally not enforced yet | Acceptable at current test volume. |

### Closed Without Change (5 of 20)

| # | Finding | Reason |
|---|---|---|
| 10 | `skipLibCheck: true` | Industry standard; no practical risk at current scale |
| 14 | Custom git hooks instead of Husky | Deliberate choice; automated via `bootstrap:local` |
| 17 | NativeWind/Tailwind version split | Required by current toolchain (NativeWind needs TW3) |
| 18 | Supabase types placeholder | Already contains curated types; original finding was inaccurate |
| 19 | Edge Function import maps | Stylistic; no meaningful risk |

---

## Final Closure Update

On 2026-04-05, a bounded final-closure pass resolved the remaining setup-scope CORS follow-ups and reconciled the release docs so the rest of the items are no longer ambiguous.

### Resolved in the final closure pass

#### N1. Loopback CORS no longer applies in production runtimes

**File:** `supabase/functions/_shared/cors.ts`

Loopback browser origins are now allowed only when the Edge Function runtime itself is also running on a loopback host. This keeps local browser development working while removing the production-runtime allowance that the earlier follow-up flagged.

#### N2. Allowed origins are now cached by env state

**File:** `supabase/functions/_shared/cors.ts`

Configured CORS origins are now cached at module scope and only recomputed when the raw `ALLOWED_ORIGINS` value changes.

#### N3. CORS env fallback is no longer silent

**File:** `supabase/functions/_shared/cors.ts`

If `ALLOWED_ORIGINS` cannot be read, the helper now emits a generic one-time warning and falls back to the default production origins without logging configuration values.

### Explicitly deferred or tracked, not open setup defects

#### N4. CSP remains intentionally deferred

**File:** `apps/web/next.config.mjs`

This still belongs in a deliberate browser-hardening pass with a real nonce strategy. It is not an open repo-setup defect.

#### N5. Coverage thresholds remain intentionally deferred

**Files:** `jest.config.cjs`, `packages/config-jest/base.cjs`

`pnpm test:coverage` exists, but coverage thresholds still should not be made blocking at the current test volume.

#### N6. Deno dependency automation remains a tooling limitation, now covered by release review

**Files:** `.github/dependabot.yml`, `docs/runbooks/security-release-checklist.md`

Dependabot still does not provide equivalent coverage for the Deno/JSR function lane used by Supabase Edge Functions in this repo. That is now handled as an explicit manual dependency-triage obligation in the security release checklist whenever `supabase/functions/**/deno.json` or `deno.lock` changes are in scope.

## Repo-Setup Closure Status

| Item | Status | Note |
|---|---|---|
| N1 | Resolved | Loopback browser origins are accepted only for loopback-served function runtimes. |
| N2 | Resolved | Allowed origins are cached per env state instead of rebuilt per request. |
| N3 | Resolved | Env fallback now warns once without exposing configuration values. |
| N4 | Deferred by policy | CSP remains a deliberate later browser-hardening pass. |
| N5 | Deferred by policy | Coverage thresholds remain premature at the current test surface. |
| N6 | Tracked operationally | Manual Deno dependency triage is now required in release evidence when relevant files change. |

---

## Items Still on the Horizon (Feature-Dependent)

These are **not repo setup issues** but are explicit release blockers documented in `docs/security/security-review-baseline.md`:

1. **Production schema and table-by-table RLS** - triggers when first schema migration lands
2. **Real rate limiting backend** - triggers when first sensitive function ships to users
3. **App Attest / Play Integrity** - triggers before launch of sensitive mobile flows
4. **Feature-specific audit-event coverage** - triggers as financial flows are implemented

All four remain tracked with explicit verifier enforcement where applicable and durable trigger rules in the security baseline.

---

## Final Assessment

The repo setup layer is now closed for this review thread.

- **Security posture:** request-aware CORS is now tightened for real runtime context, web headers are in place, MMKV guardrails are hardened, and CI permissions remain least-privilege
- **Workflow posture:** release evidence now covers the unsupported Deno dependency-update lane explicitly instead of implying automation that does not exist
- **Remaining future work:** only the already-documented feature-delivery obligations and deliberate later passes such as CSP remain

No open repo-setup findings remain after this closure pass.
