# Website Launch Readiness Implementation Plan

## Linked Context

- Feature spec: [docs/specs/web/website-launch-readiness.md](../website-launch-readiness.md)
- Website PRD: [docs/product/web/website-prd.md](../../../product/web/website-prd.md)
- Security baseline: [docs/security/security-review-baseline.md](../../../security/security-review-baseline.md)
- Release gates: [docs/runbooks/release-gates.md](../../../runbooks/release-gates.md)

## Plan Review

Same-tool review fallback is required for this local pass unless a separate PR-stage AI review or human reviewer is attached later. Official Next.js docs reviewed for `headers`, metadata files, `generateMetadata`, and CSP guidance; the implementation should stay within those App Router conventions.

## Release Gate

Gate B for this change because it touches waitlist security posture, secret-backed server route behavior, CORS defaults, and public disclosure/docs. Gate C and Gate D remain incomplete until deployment owner sign-off covers DNS, hosting, monitoring, rollback, audit triage, legal privacy review, and launch disclosure readiness.

## Slice 1: Domain Truth Reconciliation

Files:

- `apps/web/src/lib/site-origin.cjs`
- `apps/web/src/lib/*.unit.test.ts`
- `apps/web/src/server/waitlist.unit.test.ts`
- `supabase/functions/_shared/cors.ts`
- `supabase/functions/_shared/cors.verify.ts`
- Product, architecture, spec, and README docs that mention the prior public-domain baseline

Work:

- Replace canonical website origin with `https://gamabudget.com`.
- Update tests and examples to use the new apex domain.
- Keep `www.gamabudget.com` rejected until redirect and provisioning policy is explicit.

Verification:

- Targeted web unit tests for site config, metadata, schema, routes, and Next config helpers.
- Supabase functions check for CORS default behavior.

## Slice 2: Waitlist API Boundary Hardening

Files:

- `apps/web/app/api/waitlist/route.ts`
- `apps/web/src/server/waitlist.unit.test.ts`
- New or existing route-level tests under `apps/web/app/api/waitlist`

Work:

- Reject non-JSON content types before body parsing.
- Read request text with a small explicit size limit before JSON parsing.
- Return non-cacheable JSON responses consistently.
- Preserve user-safe error responses and existing rate-limit behavior.

Verification:

- Unit tests for invalid content type, oversized body, invalid JSON, rate limiting, configuration failure, storage failure, accepted, and duplicate outcomes.
- Web lane lint, typecheck, and test.

## Slice 3: Documentation and Release Evidence

Files:

- `docs/specs/web/website-launch-readiness.md`
- `docs/specs/web/plans/website-launch-readiness.md`
- `docs/product/shared/gama-product-brief.md`
- `docs/product/web/*`
- `docs/architecture/web/*`
- `apps/web/README.md`

Work:

- Reconcile public domain and launch posture docs.
- Record remaining Gate C and Gate D obligations.
- Make durable rate-limit, `www`, DNS, monitoring, and legal-policy decisions explicit.

Verification:

- `pnpm policy:check`
- `pnpm audit`
- Final review of touched files against the spec.

## Slice 4: Dependency Audit Remediation

Files:

- `apps/web/package.json`
- `package.json`
- `pnpm-lock.yaml`

Work:

- Upgrade the direct web Next.js dependency to the patched release for the high-severity Server Components DoS advisory.
- Upgrade direct web PostCSS and add safe patch-level transitive overrides for `@xmldom/xmldom`, `@sentry/browser`, and `postcss`.
- Avoid forcing unsafe major-version overrides for mobile/dev-tooling transitive advisories.

Verification:

- Dependency install and lockfile update.
- Audit rerun.
- Full repo verification and production web build.

## Rollback

- Domain rollback: revert `site-origin.cjs`, CORS defaults, tests, and docs as one unit to avoid split canonical behavior.
- API hardening rollback: revert route parsing changes only if they block legitimate JSON waitlist submissions; keep non-cacheable responses if possible.
- Docs rollback: only with matching code rollback, because the docs are canonical launch truth.

## Verification Log

- `node ./scripts/pnpm.mjs --dir apps/web test -- --runTestsByPath app/api/waitlist/route.unit.test.ts src/lib/site-config.unit.test.ts src/lib/site-metadata.unit.test.ts src/lib/site-routes.unit.test.ts src/lib/site-schema.unit.test.ts src/lib/next-config-helpers.unit.test.ts` passed: 6 suites, 37 tests.
- `node ./scripts/pnpm.mjs --dir apps/web test -- --runTestsByPath app/api/waitlist/route.unit.test.ts` passed after final route cleanup: 1 suite, 9 tests.
- `node ./scripts/pnpm.mjs verify:web` passed.
- `node ./scripts/pnpm.mjs supabase:functions:check` passed.
- `node ./scripts/pnpm.mjs policy:check` passed.
- `node ./scripts/pnpm.mjs docs:check` passed.
- `node ./scripts/pnpm.mjs audit` initially found high-severity Next.js and transitive `@xmldom/xmldom` findings plus moderate/low findings.
- Updated `next` to `16.2.3`, direct web `postcss` to `8.5.10`, and added safe overrides for `@xmldom/xmldom`, `@sentry/browser`, and `postcss`.
- `node ./scripts/pnpm.mjs audit` after remediation reports only one moderate mobile-tooling `uuid` advisory and one low Jest/jsdom `@tootallnate/once` advisory.
- `node ./scripts/pnpm.mjs audit --audit-level=high` passed.
- `node ./scripts/pnpm.mjs audit --audit-level=critical` passed.
- `node ./scripts/pnpm.mjs verify` passed.
- `node ./scripts/pnpm.mjs --dir apps/web build` passed after rerunning with network access for `next/font` Google font fetch.

## Review Notes

- Self-review completed against the active spec, SEO architecture, security baseline, and Gate B release posture.
- No remaining references to the prior public website domain were found with `rg`.
- Remaining launch blockers are operational rather than code-complete: DNS/hosting, `www` redirect decision, production durable waitlist abuse controls, monitoring/alerting, retention/deletion review, legal privacy review, PR-stage AI review, and human launch sign-off.
- Full release readiness is not claimed until Gate C and Gate D evidence is complete.
