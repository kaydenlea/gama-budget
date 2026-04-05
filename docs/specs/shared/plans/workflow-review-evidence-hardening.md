# workflow-review-evidence-hardening

Created: 2026-04-05
Document Type: Implementation Plan
Status: Implemented
Lane: shared

# Implementation Plan

## Linked Context

- feature spec: [docs/specs/shared/bugfixes/workflow-review-evidence-hardening.md](../bugfixes/workflow-review-evidence-hardening.md)
- PRD or bugfix doc: n/a
- likely release gate: Gate A

## Scope

Strengthen the repository workflow so substantive changes must carry explicit verification and independent-review evidence locally and in PR metadata before they are treated as review-ready.

## Preconditions

- the repo continues to use deterministic local automation plus PR-stage AI review and human review
- same-tool fresh-context review fallback remains acceptable when only one model is available
- the change should improve enforcement without inventing a burdensome workflow for docs-only work

## File-Level Plan

- `docs/specs/shared/bugfixes/workflow-review-evidence-hardening.md`: active bugfix spec
- `docs/specs/shared/plans/workflow-review-evidence-hardening.md`: active implementation plan
- `scripts/review-evidence.mjs`: create or update local review-evidence artifacts with explicit verification and independent-review details
- `scripts/local-review.mjs`: require review-evidence artifacts for substantive implementation changes and include the recorded evidence in the local artifact
- `scripts/review-ready.mjs`: keep deterministic checks but fail closed when review evidence is missing
- `scripts/check-pr-metadata.mjs`: require concrete verification and review evidence labels in PR metadata
- `scripts/pr-body.mjs`: prefill PR body sections with review-evidence placeholders or recorded content
- `scripts/repo-contract.mjs`: require the new script and package command
- `package.json`: expose the new review-evidence command
- `.github/pull_request_template.md`: add explicit evidence labels
- `AGENTS.md`: add the new command to the command list and reinforce the requirement
- `docs/agent-workflows/review-standard.md`: document the explicit evidence expectation
- `docs/agent-workflows/local-automation-standard.md`: document local enforcement changes
- `docs/runbooks/local-development-flow.md`: document the required `review:evidence` step before `review:ready`

## Interfaces and Data Structures

- `review-evidence.json`: local artifact containing:
  - `recordedAt`
  - `branch`
  - `verification` with commands, notes, and residual risk
  - `independentReview` with method, reviewer/tool, findings summary, and status
  - `humanReview` with status and notes
- `local-review.json` should embed the recorded review evidence when present
- PR body `Verification` and `Review` sections should contain labeled evidence lines, not only checkboxes

## Design Choices

- use a repo-owned artifact rather than only manual reminders so the workflow can fail closed when evidence is missing
- keep the evidence capture lightweight and text-based instead of introducing an interactive prompt dependency
- require concrete PR labels so metadata validation can stay deterministic
- exempt docs-only changes from the full evidence requirement to avoid over-burdening low-risk updates

## Edge Cases and Failure Modes

- running `review:ready` without first recording review evidence for substantive changes
- stale local evidence from another branch
- PR bodies that include headings and checkboxes but omit concrete verification or review method details
- contributors using same-tool fresh-context review fallback instead of a second model

## Slice Plan

- Slice 1: evidence artifact capture
  - files: `scripts/review-evidence.mjs`, `package.json`, `scripts/repo-contract.mjs`
  - interfaces: local `review-evidence.json` artifact and CLI flags
  - design: capture explicit verification and independent-review details in a deterministic local artifact
  - edge cases: branch mismatch, missing required flags, substantive vs docs-only work
  - verification: run the script help path and create a valid artifact

- Slice 2: local enforcement
  - files: `scripts/local-review.mjs`, `scripts/review-ready.mjs`
  - interfaces: local-review artifact enrichment and fail-closed enforcement
  - design: require review evidence for substantive implementation changes when workflow evidence is required
  - edge cases: stale artifact, docs-only changes, missing evidence fields
  - verification: run local review with `--require-workflow-evidence`

- Slice 3: PR metadata hardening
  - files: `scripts/check-pr-metadata.mjs`, `scripts/pr-body.mjs`, `.github/pull_request_template.md`
  - interfaces: labeled PR body fields for verification and review evidence
  - design: require commands run, residual risk, independent review method, and review outcome in PR metadata
  - edge cases: placeholder-only PR bodies, same-tool fallback wording, Gate B/C/D checklist references
  - verification: generate a PR body and review the required labels

- Slice 4: docs reconciliation
  - files: `AGENTS.md`, workflow docs, runbooks, planning artifacts
  - interfaces: documentation truthfulness only
  - design: document the stricter evidence path in the same places contributors already read
  - edge cases: avoid promising mechanical certainty beyond what the repo can actually enforce
  - verification: docs review plus `node ./scripts/verify.mjs`

## Plan Review

- independent review or cross-model review needed: yes, fresh-context same-tool fallback after implementation if no second model is available
- review findings before implementation:
  - prefer minimal enforcement that meaningfully improves reliability without turning docs-only work into ceremony
  - require evidence of independent review, not just reminders that it should happen

## Failure and Rollback Considerations

- if the new evidence enforcement blocks legitimate low-risk work, narrow the substantive-change detection rather than removing the evidence requirement entirely
- do not replace explicit evidence with more reminder text

## Re-Planning Triggers

- the current local artifact model cannot be made branch-safe enough
- PR metadata constraints conflict with GitHub template or CI behavior in an unexpected way

## Completion Evidence

- substantive implementation changes require explicit local review evidence before `review:ready` passes
- local review artifacts include review-evidence details when present
- PR metadata requires concrete verification and review evidence labels
- generated PR bodies guide contributors toward the required evidence format
- verification passes after the hardening change

## Documentation Reconciliation

- `docs/specs/shared/bugfixes/workflow-review-evidence-hardening.md`
- `docs/specs/shared/plans/workflow-review-evidence-hardening.md`
- `docs/agent-workflows/review-standard.md`
- `docs/agent-workflows/local-automation-standard.md`
- `docs/runbooks/local-development-flow.md`
- `AGENTS.md`

## Final Reconciliation

- removed the separate local review-evidence artifact from the enforced path so ordinary publish flows do not depend on manually recorded review summaries
- kept the workflow strict through deterministic proof, planning/doc evidence, PR metadata structure, PR-stage AI review expectations, and human review requirements
- kept PR-body generation and metadata checks structured enough to guide contributors toward recording verification and review outcomes in the PR itself
- reconciled the workflow docs and command list to match the stronger process
