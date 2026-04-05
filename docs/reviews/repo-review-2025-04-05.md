# PocketCurb Repository Review — April 2025

## Executive Summary

PocketCurb is a remarkably well-architected early-stage monorepo for a decision-first personal finance mobile app (Expo/React Native) with a web marketing lane (Next.js), backed by Supabase. The project demonstrates unusually strong engineering discipline for its maturity, with comprehensive documentation, security-first design, layered verification, and a clear domain model.

That said, there are concrete gaps, risks, and improvements to address. This review is organized by severity: **Critical**, **High**, **Medium**, and **Low/Best Practice**.

---

## Overall Grades

| Area | Grade | Summary |
|---|---|---|
| Monorepo Structure | **A** | Clean apps/packages/supabase/docs separation. pnpm workspace properly configured. |
| Security Posture | **A-** | Excellent for early stage. CORS wildcard and missing rate-limit backend are the main gaps. |
| Documentation | **A+** | Exceptional. Product briefs, PRDs, ADRs, runbooks, threat model, templates — well beyond industry norm. |
| CI/CD | **B+** | Solid single-job pipeline. Lacks caching, parallelism, and deployment automation. |
| Code Quality | **A-** | Clean domain separation, strict TypeScript, Zod validation at boundaries. Minor gaps in test coverage. |
| Developer Experience | **A** | Bootstrap scripts, shared configs, pre-commit/pre-push hooks, repo-contract validation. |
| Dependency Management | **B+** | Locked, audited, engine-strict. Some dependencies are heavy or could be pinned tighter. |
| Production Readiness | **C+** | Expected at this stage — no real migrations, monitoring stubs, no deployment pipeline. |

---

## Critical Issues

### 1. CORS Wildcard on Edge Functions

**File:** `supabase/functions/_shared/cors.ts`

```typescript
"access-control-allow-origin": "*"
```

**Problem:** The wildcard `*` allows any origin to call your Edge Functions. While Supabase Auth + JWT verification protects the data path, this is still a security concern:
- Enables CSRF-adjacent attacks if combined with credential-bearing requests
- Allows any malicious site to probe your API surface for error messages or timing
- Will fail app store security reviews for production financial apps

**Recommendation:**
```typescript
const ALLOWED_ORIGINS = [
  "https://pocketcurb.com",
  "https://www.pocketcurb.com",
  // Add staging/preview URLs as needed
];

// For local development, read from env:
// Deno.env.get("ALLOWED_ORIGINS")?.split(",") ?? ALLOWED_ORIGINS

export function getCorsOrigin(request: Request): string {
  const origin = request.headers.get("origin") ?? "";
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  // In development, optionally allow localhost
  if (Deno.env.get("ENVIRONMENT") === "local" && origin.startsWith("http://localhost")) {
    return origin;
  }
  return ALLOWED_ORIGINS[0]; // Default to production
}
```

**Priority:** Must fix before any production deployment.

---

### 2. Rate Limiting is a Stub (Release Blocker)

**File:** `supabase/functions/_shared/rate-limit.ts`

```typescript
enforceFunctionRateLimit() {
  // THROWS SensitiveFunctionRateLimitNotImplementedError
}
```

**Problem:** This is documented as an intentional release blocker, which is good practice — but it means **no Edge Function can actually serve traffic**. The `safe-to-spend` function will 500 on every request.

**Recommendation:**
Choose an implementation strategy:

| Option | Complexity | Suitability |
|---|---|---|
| Supabase table + upsert counter | Low | Fine for MVP, 10-50 RPS |
| Upstash Redis (via REST API) | Medium | Better for production, sliding window |
| Deno KV (if available in Supabase) | Medium | Native to Deno runtime |

Simplest MVP approach — Supabase-backed rate limit:
```typescript
async function enforceFunctionRateLimit(
  functionName: string,
  userId: string
): Promise<{ allowed: boolean }> {
  const policy = readSensitiveFunctionRateLimitPolicy(functionName);
  if (!policy) return { allowed: true };

  // Use Supabase RPC or direct table query for rate check
  // Check count of requests in window, return allowed: false if exceeded
}
```

**Priority:** Must implement before any user-facing deployment.

---

## High Severity

### 3. No Real Database Migrations Exist

**Files:** `supabase/migrations/` (only templates, no timestamped migrations)

**Problem:** The migration directory contains only `_template.*` files. There are no actual tables, no `users` extension, no `household_membership`, no `transactions` — none of the entities defined in `docs/architecture/shared/data-model.md` exist in the database.

**Recommendation:** Before any feature implementation, create the foundational migration:
1. `20250405000000_create_core_tables.sql` — user profiles, accounts, transactions, events
2. Enable RLS on every table using the existing templates as patterns
3. Run `pnpm supabase:check-security` after each migration

This is expected at early stage but should be the first implementation priority.

---

### 4. No Authentication Flow in Mobile App

**Problem:** The Supabase client is wired up with `secureStoreSessionAdapter` and `autoRefreshToken`, but there is no sign-in/sign-up screen, no auth state management, no protected route guard, and no session handling in the mobile app.

**Recommendation:**
- Add auth screens (sign-in, sign-up, forgot password)
- Add an `AuthProvider` or hook that wraps Supabase auth state
- Add a route guard in the root layout that redirects unauthenticated users
- Consider Supabase Auth UI for React Native to speed up implementation

---

### 5. No `.env.example` Files

**Problem:** The policy check blocks `.env` files from being committed (good), but there are no `.env.example` files documenting required environment variables. New developers won't know what variables to set.

**Recommendation:** Create `.env.example` at the root and in `apps/mobile/`:
```env
# apps/mobile/.env.example
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
EXPO_PUBLIC_SENTRY_DSN=
EXPO_PUBLIC_POSTHOG_KEY=
EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY=
EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY=
```

---

### 6. CI Pipeline is a Single Job with No Caching

**File:** `.github/workflows/ci.yml`

**Problem:**
- All steps run sequentially in one job (~20 min timeout)
- No dependency caching beyond pnpm store
- No build artifact caching
- No parallel jobs for mobile vs. web verification
- No EAS build or preview deployment

**Recommendation:**
```yaml
jobs:
  install:
    # Cache deps, export as artifact
  lint-and-typecheck:
    needs: install
    # Fast feedback
  test-mobile:
    needs: install
    # Mobile tests in parallel
  test-web:
    needs: install
    # Web tests in parallel
  security:
    needs: install
    # Audit + policy checks
```

Also consider:
- Add `concurrency` group to cancel outdated runs on the same PR
- Add Expo EAS preview builds on PR
- Add Vercel/Netlify preview deployment for web

---

## Medium Severity

### 7. `safe-to-spend` Edge Function Has `verify_jwt = false`

**File:** `supabase/config.toml`

```toml
[functions.safe-to-spend]
verify_jwt = false
```

**Problem:** Supabase's built-in JWT verification is disabled. The function does its own JWT verification via `requireAuthenticatedUser()` which is correct and more flexible, but disabling the Supabase-level gate means misconfigured functions could accidentally serve unauthenticated traffic.

**Recommendation:** This is an acceptable pattern **if documented as an intentional decision** in an ADR. The custom auth implementation is solid (JWKS-based, issuer-validated, error-safe). Add a comment in `config.toml` explaining the rationale, or create `ADR-008-edge-function-auth-strategy.md`.

---

### 8. No Error Boundary in Mobile App

**File:** `apps/mobile/app/_layout.tsx`

**Problem:** The root layout has no error boundary. Unhandled JS errors will crash the app with a white screen or Expo's default error screen in production.

**Recommendation:**
```tsx
import { ErrorBoundary } from "react-error-boundary";

function AppErrorFallback({ error, resetErrorBoundary }) {
  return (
    <View>
      <Text>Something went wrong</Text>
      <Button onPress={resetErrorBoundary} title="Try Again" />
    </View>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary FallbackComponent={AppErrorFallback}>
      <AppProviders>
        {/* ... */}
      </AppProviders>
    </ErrorBoundary>
  );
}
```

---

### 9. Monitoring/Observability is Stub Only

**File:** `apps/mobile/src/lib/monitoring/bootstrap.ts`

**Problem:** The monitoring bootstrap only checks readiness of Sentry/PostHog/RevenueCat but doesn't initialize any of them. There is no:
- Sentry initialization
- PostHog initialization
- Error reporting integration
- Analytics event tracking

**Recommendation:** Implement initialization in `AppProviders.tsx` or a dedicated `MonitoringProvider`:
```tsx
import * as Sentry from "sentry-expo";

Sentry.init({
  dsn: mobileEnv.sentryDsn,
  enableInExpoDevelopment: false,
  debug: __DEV__,
});
```

---

### 10. TypeScript Config Uses `skipLibCheck: true`

**File:** `packages/config-typescript/base.json`

**Problem:** `skipLibCheck` skips type checking of `.d.ts` files. This can hide real type errors from dependencies, especially important in a monorepo where packages reference each other's types.

**Recommendation:** Keep `skipLibCheck: true` for now (it's standard practice for build performance), but add a periodic CI step or script that runs `tsc --noEmit --skipLibCheck false` to catch hidden issues. Not urgent, but worth tracking.

---

### 11. No Dependency Version Pinning Strategy

**File:** Root `package.json`, app `package.json` files

**Problem:** Dependencies use caret ranges (`^`) extensively. While `pnpm-lock.yaml` pins exact versions for reproducible installs, caret ranges mean:
- `pnpm update` could pull breaking changes
- Security patches may lag if lockfile isn't regularly refreshed

**Recommendation:**
- Add Renovate or Dependabot configuration for automated dependency updates
- Consider exact pinning (`"react": "19.1.0"`) for critical dependencies (React, Expo SDK, Supabase client)
- The existing `pnpm audit --audit-level=critical` in CI is good; consider also adding `--audit-level=high`

---

### 12. Web App Has No Middleware or Security Headers

**File:** `apps/web/next.config.mjs`

**Problem:** No `middleware.ts`, no security headers configured. For a financial product's public website:
- No `Content-Security-Policy`
- No `X-Frame-Options`
- No `Strict-Transport-Security`
- No `X-Content-Type-Options`

**Recommendation:** Add `next.config.mjs` headers:
```javascript
async headers() {
  return [{
    source: "/(.*)",
    headers: [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'" },
    ],
  }];
}
```

---

### 13. MMKV Sensitive-Key Guard is Pattern-Based

**File:** `apps/mobile/src/lib/storage/mmkv.ts`

**Problem:** The `assertNonSensitiveKey` function uses a regex pattern to block sensitive keys, which is a best-effort guard:
```typescript
const sensitiveKeyPattern = /(token|secret|session|password|credential|auth)/i;
```

This is creative but fragile — a key named `user-access-jwt` or `api_key` would pass the check.

**Recommendation:**
- Expand the pattern to include: `jwt`, `key`, `private`, `pin`, `biometric`
- Consider an allowlist approach instead — only permit known cache keys
- Document that this is a defense-in-depth guard, not a primary control

---

## Low Severity / Best Practices

### 14. No Husky — Custom Git Hooks

**Observation:** The project uses custom `.githooks/` with manual `git config core.hooksPath .githooks`. This is fine and avoids a Husky dependency, but:
- New developers must run `pnpm bootstrap:local` to activate hooks
- The hooks aren't automatically installed on `pnpm install`

**Recommendation:** Already handled by the bootstrap script. Consider adding `"prepare": "node ./scripts/install-hooks.mjs"` to root `package.json` for automatic hook setup on install.

---

### 15. No Test Coverage Reporting

**Problem:** Jest is configured but there's no coverage threshold or reporting. CI doesn't enforce minimum coverage.

**Recommendation:** Add to Jest config:
```javascript
coverageThreshold: {
  global: {
    branches: 60,
    functions: 60,
    lines: 70,
    statements: 70
  }
}
```

Start conservative and increase as coverage grows.

---

### 16. Missing `concurrency` in CI Workflow

**File:** `.github/workflows/ci.yml`

**Problem:** Multiple pushes to the same PR branch will run CI in parallel, wasting resources.

**Recommendation:**
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

---

### 17. NativeWind / Tailwind Version Alignment

**Files:** `apps/mobile/package.json`, `packages/ui-mobile/package.json`

**Problem:** The mobile app uses NativeWind with Tailwind CSS 3.x, while the industry has moved to Tailwind CSS 4.x. The web app uses `@tailwindcss/postcss` (v4 ecosystem). This version split could cause confusion.

**Recommendation:** NativeWind currently requires Tailwind 3.x, so this split is necessary. Document it to avoid confusion. When NativeWind supports Tailwind 4, align both.

---

### 18. Supabase Types Package Has No Generated Types

**Observation:** `packages/supabase-types/` contains placeholder files. No generated database types exist yet.

**Recommendation:** Once real migrations exist, set up the type generation pipeline:
```bash
supabase gen types typescript --local > packages/supabase-types/src/database.ts
```

Add this as a script in root `package.json`.

---

### 19. Edge Function Shared Code Import Paths

**File:** `supabase/functions/safe-to-spend/index.ts`

**Observation:** Shared imports use relative paths (`../_shared/auth.ts`). Deno supports import maps, which would make these cleaner.

**Recommendation:** Add an import map to the root `supabase/functions/deno.json`:
```json
{
  "imports": {
    "@shared/": "./_shared/"
  }
}
```

Then imports become: `import { requireAuthenticatedUser } from "@shared/auth.ts"`

---

### 20. Consider Adding a `SECURITY.md`

**Problem:** While the `docs/security/` directory is comprehensive, there's no root-level `SECURITY.md` file for responsible disclosure.

**Recommendation:** Add a `SECURITY.md` with:
- How to report vulnerabilities
- Expected response timeline
- Scope of the security policy

---

## What's Working Well

These deserve explicit recognition — they represent best-in-class practices:

1. **Agent workflow documentation** — AGENTS.md, CLAUDE.md, .claude/rules, .codex/ mirroring — is one of the most thorough agent-assisted development setups in any open-source or startup codebase.

2. **Security-first culture** — Policy checks blocking `eval()`, `innerHTML`, service-role leaks, and .env commits at the pre-commit level. RLS enforcement tooling for Supabase. Separate storage tiers (SecureStore vs MMKV) with guards.

3. **Error sanitization** — The `UserSafeApiError` mapping pattern in the mobile client prevents backend error leakage to users. The policy check enforces this exists.

4. **Domain-driven shared packages** — `core-domain` contains pure business logic, `schemas` provides Zod contracts, `api-client` validates at boundaries. Clean separation.

5. **Repo contract validation** — `repo-contract.mjs` enforcing 218+ required files, required headings, and skill parity is unusually disciplined.

6. **Release gate system** — Gate A/B/C/D with explicit checklists, PR templates, and local enforcement is production-grade release management.

7. **Documentation ecosystem** — Product briefs, PRDs, feature specs, ADRs, runbooks, threat models, compliance matrices, postmortem templates — a complete documentation system.

---

## Recommended Priority Order

| Priority | Item | Effort |
|---|---|---|
| 1 | Fix CORS wildcard (#1) | Small |
| 2 | Add `.env.example` files (#5) | Small |
| 3 | Add web security headers (#12) | Small |
| 4 | Add error boundary to mobile (#8) | Small |
| 5 | Add CI concurrency group (#16) | Tiny |
| 6 | Implement rate limiting (#2) | Medium |
| 7 | Create foundational migration (#3) | Medium |
| 8 | Add auth flow to mobile (#4) | Large |
| 9 | Initialize monitoring SDKs (#9) | Medium |
| 10 | Split CI into parallel jobs (#6) | Medium |
| 11 | Add dependency update automation (#11) | Small |
| 12 | Add `SECURITY.md` (#20) | Small |
| 13 | Add test coverage reporting (#15) | Small |
| 14 | Expand MMKV sensitive key guard (#13) | Small |
| 15 | Document `verify_jwt = false` rationale (#7) | Small |

---

*Review performed by comprehensive static analysis of all configuration files, source code, scripts, CI workflows, Supabase functions, shared packages, documentation, and agent customization files across the PocketCurb monorepo.*
