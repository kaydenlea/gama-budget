# deferred-obligations-promotion

Created: 2026-04-05
Document Type: Bugfix Spec
Status: Implemented
Lane: shared

# Bugfix Spec

## Overview

Promote the remaining feature-dependent obligations from the repo review into durable repo workflow surfaces so they cannot be forgotten. The goal is not to fake-complete feature work that correctly belongs later. The goal is to make future implementation, review, release, and PR preparation explicitly acknowledge those obligations whenever they become relevant.

## Failure Context

Observed behavior:

- the repo review now tracks which items are implemented versus deferred, but the deferred items still live primarily in a review artifact and security baseline prose
- core workflow docs and templates do not yet consistently force future feature work to classify those deferred obligations as addressed, deferred with rationale, or not applicable
- PR metadata and release checklists do not yet explicitly ask for that classification

Expected behavior:

- future feature work should have to recognize the remaining obligations in the normal planning and review path
- the obligations should live in stable docs, templates, and workflow checkpoints rather than in one review document
- the repo should make it harder to forget feature-dependent security and release blockers when product implementation begins

Impact:

- a contributor could start auth, migration, telemetry, or sensitive mobile work without explicitly acknowledging the unresolved repo-level obligations that still apply
- review quality would remain partly dependent on memory instead of the repo's durable workflow surfaces

## Reproduction

1. Open `docs/reviews/repo-review-2025-04-05.md`.
2. Observe that deferred items are tracked there.
3. Open the planning, review, and release workflow docs plus the spec and PR templates.
4. Observe that they do not yet consistently require explicit classification of the deferred feature-dependent obligations from `docs/security/security-review-baseline.md`.

## Evidence

- `docs/reviews/repo-review-2025-04-05.md`
- `docs/security/security-review-baseline.md`
- `docs/agent-workflows/planning-standard.md`
- `docs/agent-workflows/02-feature-lifecycle.md`
- `docs/agent-workflows/review-standard.md`
- `docs/runbooks/how-to-add-a-feature.md`
- `docs/runbooks/security-release-checklist.md`
- `docs/runbooks/release-gates.md`
- `.github/pull_request_template.md`
- `docs/templates/feature-spec-template.md`
- `docs/templates/implementation-plan-template.md`
- `docs/templates/bugfix-spec-template.md`
- `docs/templates/release-checklist-template.md`

## Root-Cause Statement

Confirmed root cause:

- the repo has good durable security guidance, but the deferred repo-review items were not yet fully promoted into every workflow surface that future implementation will be forced to use

## File Plan

- `docs/specs/shared/bugfixes/deferred-obligations-promotion.md`
- `docs/specs/shared/plans/deferred-obligations-promotion.md`
- `AGENTS.md`
- `docs/security/security-review-baseline.md`
- `docs/agent-workflows/planning-standard.md`
- `docs/agent-workflows/02-feature-lifecycle.md`
- `docs/agent-workflows/review-standard.md`
- `docs/runbooks/how-to-add-a-feature.md`
- `docs/runbooks/security-release-checklist.md`
- `docs/runbooks/release-gates.md`
- `.github/pull_request_template.md`
- `docs/templates/feature-spec-template.md`
- `docs/templates/implementation-plan-template.md`
- `docs/templates/bugfix-spec-template.md`
- `docs/templates/release-checklist-template.md`
- `docs/reviews/repo-review-2025-04-05.md`

## Minimal Fix Plan

1. Make the deferred obligations explicit in the security baseline with trigger-based guidance.
2. Add workflow requirements so planning and review must classify applicable obligations.
3. Add template and PR-body prompts that force explicit recording of addressed, deferred, or not-applicable status.
4. Reconcile the repo review so it points readers at the durable workflow surfaces rather than acting as the only tracker.

## Edge Cases

- do not overstate that every future feature must address every deferred obligation
- require explicit classification, not universal completion
- keep the workflow lightweight enough that docs-only work is not overburdened

## Verification Plan

- `node ./scripts/check-docs.mjs`
- `node ./scripts/verify.mjs`
- touched-file review for workflow coherence

## Review Notes

Residual risk to track:

- this pass can enforce recognition and documentation, but it cannot automatically implement feature-dependent controls before the corresponding feature exists

## Final Reconciliation

Actual root cause:

- the repo review correctly preserved the remaining feature-dependent obligations, but those obligations were not yet fully promoted into the workflow surfaces that future implementation must pass through

Repo fix:

- promoted the obligation list into `docs/security/security-review-baseline.md` with trigger-based guidance
- updated `AGENTS.md`, planning and review workflow docs, and the add-feature runbook so future trust-critical work must review and classify applicable obligations before coding
- updated the feature, implementation-plan, bugfix, and release-checklist templates to require explicit classification
- updated the PR template and release-gate docs so the same classification appears again at review and release time
- updated the repo review to point readers at the durable workflow surfaces rather than leaving it as the only tracker

Verification:

- `node ./scripts/check-docs.mjs`
- `node ./scripts/verify.mjs`

Stable lessons:

- if an obligation matters beyond one patch, it should live in canonical workflow docs and templates, not only in a review artifact
- the right durable enforcement for feature-dependent work is explicit classification at planning, review, PR, and release time rather than pretending early completion
