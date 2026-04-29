# Website Launch Readiness Spec

## Linked Context

- Product brief: [docs/product/shared/gama-product-brief.md](../../product/shared/gama-product-brief.md)
- Website PRD: [docs/product/web/website-prd.md](../../product/web/website-prd.md)
- SEO strategy: [docs/product/web/seo-content-strategy.md](../../product/web/seo-content-strategy.md)
- SEO architecture: [docs/architecture/web/seo-architecture.md](../../architecture/web/seo-architecture.md)
- Security baseline: [docs/security/security-review-baseline.md](../../security/security-review-baseline.md)
- Privacy and disclosures: [docs/security/privacy-and-disclosures.md](../../security/privacy-and-disclosures.md)
- Release gates: [docs/runbooks/release-gates.md](../../runbooks/release-gates.md)
- Implementation plan: [docs/specs/web/plans/website-launch-readiness.md](plans/website-launch-readiness.md)

## Overview

Prepare the current web lane for a launch-readiness review by reconciling the canonical public domain to `gamabudget.com`, hardening the existing waitlist submission boundary, and updating durable SEO, security, and release documentation. This pass does not claim that the product is fully public-launch ready without human deployment, DNS, monitoring, legal, and disclosure sign-off.

## Scope

- Replace the old website-domain baseline with the canonical public origin `https://gamabudget.com`.
- Keep the apex domain as canonical and reject or avoid `www.gamabudget.com` until DNS, redirects, HSTS, and SEO policy are confirmed.
- Update web metadata, sitemap, robots, JSON-LD, manifest, Supabase function CORS defaults, tests, and docs that depend on the public origin.
- Harden `POST /api/waitlist` against malformed content types, oversized JSON bodies, cacheable responses, and inconsistent response headers.
- Patch launch-relevant web dependency audit findings and apply safe transitive overrides where they do not change major contracts.
- Record launch-gate obligations and residual release risks so deployment readiness is not inferred from code changes alone.

## Non-Goals

- Add analytics, ad attribution, referral tracking, or third-party growth scripts.
- Add new editorial SEO pages or comparison content.
- Change mobile product behavior or mobile launch scope.
- Replace the current waitlist backend with a new provider.
- Declare Gate C or Gate D complete without human launch-owner sign-off.

## Requirements

- Production indexability must require `NEXT_PUBLIC_SITE_URL=https://gamabudget.com` and must fail closed otherwise.
- Canonical URL generation, metadata, sitemap, robots, schema, and manifest output must use `https://gamabudget.com`.
- Non-production environments must remain `noindex`, `nofollow`, and crawl-disallowed by default.
- Supabase Edge Function CORS defaults must allow only the new canonical website origin by default.
- Waitlist API responses must be user-safe, non-cacheable, and must not leak privileged configuration details.
- Waitlist API parsing must reject non-JSON requests and oversized bodies before schema validation.
- Existing form consent, honeypot, server-side validation, and service-role-only Supabase storage boundaries must remain intact.
- Direct web runtime dependencies must not carry known high-severity audit findings after this pass.

## Security and Privacy Obligations

- Auth and RLS: not changed for product user data; waitlist table remains Edge/server-owned with no browser Supabase policy.
- Secrets: server-only Supabase service role and Resend keys remain non-public env values.
- Analytics disclosure: not applicable because this pass does not add analytics or tracking.
- Rate limiting: partially addressed by existing in-process limiter; production launch still needs human review of platform-level abuse controls because in-memory limiting is not a complete serverless abuse-control strategy.
- Retention and deletion: existing waitlist retention docs remain applicable and must be reviewed before public launch.
- Device integrity: not applicable to the web-lane launch-readiness pass.

## Acceptance Criteria

- No source, docs, tests, or CORS defaults continue to treat any prior domain as the current planned public website domain.
- Web tests assert `https://gamabudget.com` canonical, metadata, robots, sitemap, schema, manifest, and production-header behavior.
- Waitlist route tests cover content-type rejection, body-size rejection, invalid JSON, rate limiting, configuration failures, storage failures, and accepted submissions.
- `pnpm verify:web`, `pnpm supabase:functions:check`, `pnpm policy:check`, production web build, and dependency audit are run or explicitly recorded as blocked.
- Release posture is mapped to Gate B for code and docs touching waitlist secrets/CORS/security posture, and Gate C/D remain launch-owner obligations.

## Open Decisions

- `www.gamabudget.com` redirect policy: recommend keeping apex-only canonical behavior until DNS and hosting are provisioned, then add a tested redirect if `www` is enabled.
- Durable production rate limiting: recommend adding platform or database-backed rate limiting before public promotion of the waitlist because in-process rate limiting is not sufficient alone in a horizontally scaled serverless deployment.
- Legal privacy policy: recommend treating the current privacy page as a trust explainer, not a final legal policy, until reviewed by the launch owner.
- Remaining audit triage: the full audit still reports one moderate mobile-tooling `uuid` advisory and one low Jest/jsdom `@tootallnate/once` advisory. Do not force unsafe major transitive overrides without a mobile/tooling compatibility pass.

## Checklist

- [x] Source workflow, SEO, security, release, and docs standards reviewed.
- [x] Active implementation plan created.
- [x] Domain baseline reconciled to `gamabudget.com`.
- [x] Waitlist API hardening implemented.
- [x] Launch-relevant dependency audit findings patched or triaged.
- [x] Docs reconciled.
- [x] Verification evidence recorded.
- [x] Review notes recorded.
