# Security Review Baseline

## Purpose

This document summarizes the minimum current security baseline that must remain true as the repository evolves from scaffold to production finance product.

## Current Enforced Baseline

- clients use only public Supabase configuration values; privileged keys remain server-side
- shared mobile storage helpers separate sensitive SecureStore usage from non-sensitive MMKV usage
- mobile API wrappers convert backend failures into user-safe error objects
- Supabase Edge Functions use shared helpers for method guards, code-owned JWT verification on authenticated scaffolds, explicit rate-limit release blockers on sensitive scaffolds until a real backend exists, and user-safe error responses
- migration security checks reject public-table patterns that omit RLS or allow obviously broad policies
- policy checks block known unsafe patterns such as committed `.env` files, public secret-like environment variables, raw dangerous DOM sinks, and raw backend errors leaked from the mobile API client
- release gates, local review, and CI enforce verification before merge

## Required Human Review Baseline

- every auth, RLS, storage-boundary, household-visibility, export, deletion, or secret-handling change is reviewed under Gate B or stronger
- reviewers inspect both the implementation and the surrounding docs or ADRs, not only the diff
- new tables and new Edge Functions must confirm their boundary class, trust boundaries, validation path, and rollback plan
- release reviewers confirm that analytics, monitoring, and audit logging remain intentionally separated

## Remaining Feature-Dependent Release Blockers

- the repository does not yet contain the full production schema, so table-by-table RLS correctness remains a per-feature review obligation
- sensitive function rate limiting is intentionally not implemented yet; a real backed limiter must be completed before any sensitive function moves beyond scaffold/preparation status
- App Attest and Play Integrity remain required before launch of sensitive mobile flows where device trust materially affects risk
- feature-specific audit-event coverage still needs to expand as real export, deletion, reimbursement, shared-visibility, and linked-account flows are implemented

## Feature Trigger Rules

Future work must not leave the remaining feature-dependent release blockers implicit.

When planning, reviewing, or releasing work that touches one of the trigger areas below, explicitly classify the matching blocker as:

- addressed in this change
- deferred with rationale and decision trigger
- not applicable to this change

Trigger map:

- schema-backed feature work:
  - classify the production-schema and table-by-table RLS obligation
- sensitive or abuse-prone Edge Function work:
  - classify the real rate-limiter obligation
- sensitive mobile flows where device trust affects risk:
  - classify the App Attest / Play Integrity obligation
- exports, deletion, reimbursements, linked-account work, shared visibility, or other trust-sensitive flows:
  - classify the feature-specific audit-event coverage obligation
- analytics, monitoring, or third-party SDK rollout:
  - classify disclosure, retention, and monitoring separation obligations alongside the security baseline and privacy docs

The active feature spec, implementation plan, PR body, and release evidence should point out the applicable classifications rather than assuming reviewers will remember them from old review notes.

## Release Interpretation

- passing verification means the current baseline rules hold; it does not mean future finance features are automatically safe without new review
- no release should claim launch-grade security unless Gate C and Gate D evidence is complete for the features being shipped
- upstream dependency audit findings that remain open must be explicitly triaged rather than silently ignored
