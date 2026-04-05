# PocketCurb Repository Review — Follow-Up Pass

Second-pass review on 2026-04-05 after adjustments from commits `2940754` and `d4b7b1b`.

## Verification

Full `node ./scripts/verify.mjs` run on 2026-04-05 — **all checks pass**:
- ESLint, policy checks, Supabase security checks, Deno function checks, TypeScript, docs checks, repo contract, all tests (unit, integration, e2e)
- 42 checks passed, 0 failed

---

## Scorecard: Original Findings

### Resolved (10 of 20)

| # | Finding | Resolution | Quality |
|---|---|---|---|
| 1 | CORS wildcard `*` | Replaced with origin allowlist + loopback dev support + `Vary: Origin` + 403 on disallowed preflight | **Solid** |
| 5 | No `.env.example` files | Mobile and web `.env.example` created with all public vars | **Good** |
| 6 | CI missing concurrency | `concurrency` block with `cancel-in-progress: true` added | **Good** |
| 6 | CI missing permissions | `permissions: contents: read` added (least-privilege) | **Good** |
| 7 | `verify_jwt = false` undocumented | Comment added in `supabase/config.toml` explaining rationale | **Good** |
| 11 | No dependency update automation | Dependabot config with npm + GitHub Actions + semver-tiered cooldown | **Good** |
| 12 | Web has no security headers | 6 headers added (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COOP, HSTS) | **Solid** |
| 13 | MMKV sensitive key guard too narrow | Regex expanded to 10+ keywords + allowlist prefix enforcement + fail-closed | **Excellent** |
| 16 | CI missing `concurrency` | See #6 above | **Good** |
| 20 | No `SECURITY.md` | Honest pre-launch disclosure policy added | **Good** |

### Properly Deferred (6 of 20)

| # | Finding | Decision | Rationale |
|---|---|---|---|
| 2 | Rate limiting is a stub | Kept as fail-closed blocker | Correct — implementing backend state before the feature that needs it would be premature scaffold churn. The verifier enforces the blocker stays explicit. |
| 3 | No real database migrations | Deferred to first schema feature | Correct — template-only state is expected at scaffold stage. |
| 4 | No authentication flow | Deferred to feature delivery | Correct — product work, not repo setup. |
| 8 | No error boundary in mobile | Deferred to product work | Acceptable — should use Expo Router's route error-boundary pattern when implemented. |
| 9 | Monitoring is stub only | Deferred to telemetry/disclosure work | Correct — monitoring rollout should follow disclosure planning. |
| 15 | No coverage thresholds | Coverage script exists (`pnpm test:coverage`), thresholds intentionally not enforced yet | Acceptable at current test volume. |

### Closed Without Change (4 of 20)

| # | Finding | Reason |
|---|---|---|
| 10 | `skipLibCheck: true` | Industry standard; no practical risk at current scale |
| 14 | Custom git hooks instead of Husky | Deliberate choice; automated via `bootstrap:local` |
| 17 | NativeWind/Tailwind version split | Required by current toolchain (NativeWind needs TW3) |
| 18 | Supabase types placeholder | Already contains curated types; original finding was inaccurate |
| 19 | Edge Function import maps | Stylistic; no meaningful risk |

---

## New Findings From This Pass

### N1. CORS Loopback Allowed in Production (Medium)

**File:** `supabase/functions/_shared/cors.ts`

```typescript
function isLoopbackOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return /^(localhost|127(?:\.\d{1,3}){3}|::1)$/iu.test(url.hostname);
  } catch {
    return false;
  }
}
```

`isLoopbackOrigin()` allows **any** localhost port and runs in production Edge Functions, not just locally. An attacker running a malicious service on `http://localhost:*` on the same machine as a user's browser could craft requests that pass the CORS check.

**Practical risk is low** because:
- Edge Functions run server-side, not in the browser
- The browser enforces CORS; the server just sets headers
- JWT auth is still required for data access

**Recommendation:** Consider gating loopback allowance behind an environment variable (e.g., `ALLOW_LOOPBACK_CORS=true`) that's only set in local/development Supabase environments. This is a defense-in-depth improvement, not urgent.

### N2. CORS Allowed Origins Set Rebuilt Per Request (Low)

**File:** `supabase/functions/_shared/cors.ts`

`readAllowedOrigins()` creates a new `Set` and re-reads `ALLOWED_ORIGINS` env var on every request. For the expected request volume this is negligible, but could be cached at module scope.

**Recommendation:** Cache the computed `Set` in a module-level variable, refreshed only when the environment changes (or just once at cold start). Not urgent at current scale.

### N3. Silent CORS Environment Fallback (Low)

**File:** `supabase/functions/_shared/cors.ts`

If `ALLOWED_ORIGINS` env var parsing fails, the catch block silently falls back to defaults with no logging. This makes misconfiguration hard to debug.

**Recommendation:** Add `console.warn()` in the catch block to alert operators.

### N4. CSP Not Yet Implemented on Web (Noted, Intentionally Deferred)

**File:** `apps/web/next.config.mjs`

Content-Security-Policy is absent from the security headers. Per the implementation plan, this is intentionally deferred until a deliberate nonce strategy is designed. This is the correct approach — a misconfigured CSP is worse than no CSP for a pre-launch marketing site.

### N5. Coverage Threshold Not Enforced (Low)

**Files:** `jest.config.cjs`, `packages/config-jest/base.cjs`

The `pnpm test:coverage` script works, but no `coverageThreshold` is defined anywhere. The coverage runs but doesn't fail CI on regression.

**Recommendation:** Add a conservative threshold once test volume grows. Current test suite (10 unit + 1 integration + 1 e2e) is too small for meaningful thresholds.

### N6. Dependabot Does Not Cover Deno/Supabase Functions (Low)

**File:** `.github/dependabot.yml`

The Dependabot config covers npm and GitHub Actions but not the Deno ecosystem used by Supabase Edge Functions (`deno.json`, `deno.lock` files).

**Recommendation:** Monitor for Dependabot Deno support or manually audit Deno dependencies periodically. Low priority since the Edge Functions have minimal dependencies (currently just `jose`).

---

## Items Still on the Horizon (Feature-Dependent)

These are **not repo setup issues** but are explicit release blockers documented in `docs/security/security-review-baseline.md`:

1. **Production schema and table-by-table RLS** — triggers when first schema migration lands
2. **Real rate limiting backend** — triggers when first sensitive function ships to users
3. **App Attest / Play Integrity** — triggers before launch of sensitive mobile flows
4. **Feature-specific audit-event coverage** — triggers as financial flows are implemented

All four are tracked with explicit verifier enforcement (the rate-limit blocker) or documented trigger rules in the security baseline.

---

## Summary

The repo is in strong shape for its stage. The adjustments addressed the legitimate repo-setup gaps cleanly:

- **Security posture improved:** CORS restricted, web headers added, MMKV guard hardened, CI permissions locked down
- **DX improved:** `.env.example` files, `SECURITY.md`, Dependabot, `test:coverage` script
- **Appropriate deferrals:** Feature-dependent items (auth, migrations, monitoring, error boundary) correctly left for feature delivery rather than premature scaffolding

**Remaining actionable items by priority:**

| Priority | Item | Effort |
|---|---|---|
| 1 | Gate loopback CORS to dev-only env (N1) | Small |
| 2 | Add console.warn for CORS env parse failure (N3) | Tiny |
| 3 | Cache CORS allowed origins Set (N2) | Tiny |
| 4 | Add coverage threshold when test volume grows (N5) | Small |
| 5 | Monitor Dependabot Deno support (N6) | None (track) |
| 6 | Add CSP when nonce strategy is designed (N4) | Medium (planned) |

No critical or high-severity issues remain in the repo setup layer.
