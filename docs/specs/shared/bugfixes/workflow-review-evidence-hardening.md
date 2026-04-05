# workflow-review-evidence-hardening

Created: 2026-04-05
Document Type: Bugfix Spec
Status: Implemented
Lane: shared

# Bugfix Spec

## Overview

Harden the repository workflow so substantive tasks are less dependent on an agent remembering every review step manually. The goal is to make planning, verification, and independent review evidence explicit enough that `review:ready`, local review artifacts, and PR metadata are harder to complete without the expected cross-checks.

## Failure Context

Observed behavior:

- workflow docs require planning, verification, independent review, and human review
- `pnpm review:ready` currently runs deterministic checks and prints reminders, but it does not require explicit evidence that independent review happened or that verification findings were recorded concretely
- PR metadata checks ensure section presence, but they do not yet require concrete review-method and verification-evidence content

Expected behavior:

- substantive implementation work should record explicit local evidence for verification and independent review before the branch is treated as review-ready
- the local review artifact should fail closed when required workflow evidence is missing for substantive implementation changes
- PR metadata should require concrete verification and review evidence fields rather than only headings and checkboxes

Impact:

- contributors can follow the spirit of the process inconsistently because the repo does not require enough evidence to prove the process actually happened
- same-model fresh-context review fallback is documented but can still be skipped or forgotten in practice
- review and verification quality remain more dependent on memory and habit than the repo’s automation should allow

## Reproduction

1. Open `scripts/review-ready.mjs`.
2. Observe that it runs verification, local review, and docs checks, then prints manual reminders.
3. Open `scripts/local-review.mjs`.
4. Observe that workflow evidence warnings only check for spec, plan, and doc updates, not explicit independent-review or verification evidence.
5. Open `scripts/check-pr-metadata.mjs`.
6. Observe that it validates required PR sections but does not require concrete verification or independent-review details inside those sections.

## Evidence

- `scripts/review-ready.mjs` currently prints reminders instead of requiring concrete review-evidence capture
- `scripts/local-review.mjs` currently writes a review artifact but does not require an explicit independent-review method or verification summary
- `.github/pull_request_template.md` includes review and verification sections, but their current structure allows shallow checkbox-only completion

## Root-Cause Statement

Confirmed root cause:

- the repo documents the intended workflow correctly, but the automation layer does not require enough concrete evidence to prove that planning, verification, and independent review were actually performed for substantive changes

Contributing factors:

- current local automation emphasizes deterministic code checks over process-evidence capture
- PR metadata validation focuses on structure more than the quality of the recorded evidence
- same-tool fresh-context review fallback is documented, but there is no consistent local mechanism to record how it was satisfied

## File Plan

- `docs/specs/shared/bugfixes/workflow-review-evidence-hardening.md`
- `docs/specs/shared/plans/workflow-review-evidence-hardening.md`
- `scripts/review-evidence.mjs`
- `scripts/local-review.mjs`
- `scripts/review-ready.mjs`
- `scripts/check-pr-metadata.mjs`
- `scripts/pr-body.mjs`
- `scripts/repo-contract.mjs`
- `package.json`
- `.github/pull_request_template.md`
- `AGENTS.md`
- `docs/agent-workflows/review-standard.md`
- `docs/agent-workflows/local-automation-standard.md`
- `docs/runbooks/local-development-flow.md`

## Minimal Fix Plan

1. Add a repo-owned way to record explicit review evidence locally for substantive work.
2. Make `local-review` and `review:ready` require that evidence when substantive implementation changes are present.
3. Tighten PR metadata and the PR template so verification and independent-review details are concrete and machine-checkable.
4. Reconcile the workflow docs and command inventory so the stricter path is documented consistently.

## Edge Cases

- docs-only or trivial workflow updates should not require the full evidence path
- substantive implementation changes in apps, packages, scripts, or Supabase should fail closed on missing review evidence
- same-model fresh-context review fallback must remain valid when only one model/tool is available
- human review should remain required but not falsely claim completion before merge

## Verification Plan

- run `node ./scripts/review-evidence.mjs --help`
- run `node ./scripts/local-review.mjs --require-workflow-evidence`
- run `node ./scripts/check-pr-metadata.mjs` in a non-PR environment to confirm the skip path still behaves correctly
- run `node ./scripts/verify.mjs`
- inspect the generated PR body shape from `node ./scripts/pr-body.mjs`

## Review Notes

Residual risk to track during implementation:

- local workflow evidence can prove the presence of review documentation, but it still cannot replace human judgment about whether the review itself was high quality
- the repo can require independent-review evidence, but it cannot mechanically prove that the external reviewer thought deeply enough

## Final Reconciliation

- added repo-owned review-evidence capture so substantive branches record verification and independent-review details explicitly
- made local review and review-ready fail closed on missing workflow evidence for substantive implementation changes
- tightened PR metadata and generated PR bodies so verification and independent-review evidence must be concrete rather than implied
- reconciled the workflow docs so the stricter evidence path is documented consistently
