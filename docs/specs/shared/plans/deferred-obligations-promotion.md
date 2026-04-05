# deferred-obligations-promotion

Created: 2026-04-05
Document Type: Implementation Plan
Status: Implemented
Lane: shared

# Implementation Plan

## Linked Context

- feature spec: [docs/specs/shared/bugfixes/deferred-obligations-promotion.md](../bugfixes/deferred-obligations-promotion.md)
- PRD or bugfix doc: [docs/reviews/repo-review-2025-04-05.md](../../../reviews/repo-review-2025-04-05.md)
- likely release gate: Gate A

## Scope

Promote deferred repo-review obligations into durable workflow, template, and review surfaces so future implementation must classify them explicitly.

## Preconditions

- do not fake-complete feature-dependent work in this pass
- make the classification requirement explicit: addressed now, deferred with rationale, or not applicable
- prefer existing canonical workflow and security docs over inventing a parallel tracker

## File-Level Plan

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

## Interfaces and Data Structures

- security baseline gains a trigger-oriented section for feature-dependent obligations
- workflow docs gain explicit review/planning duties around those obligations
- templates and PR metadata gain explicit fields for obligation classification

## Design Choices

- centralize the obligation list in `docs/security/security-review-baseline.md`
- reference that baseline from workflow docs and templates instead of copying long lists everywhere
- require explicit status classification instead of demanding premature implementation

## Edge Cases and Failure Modes

- duplicate lists drifting out of sync
- templates becoming too heavy for trivial work
- contributors misreading “deferred” as optional forever

## Checklist

- [x] planning complete
- [x] clarifying questions resolved or recorded as open decisions
- [x] slice 1 complete
- [x] slice 2 complete
- [x] slice 3 complete
- [x] verification completed
- [x] docs reconciled
- [x] review complete

## Slice Plan

- Slice 1: security baseline and AGENTS promotion
  - files: `AGENTS.md`, `docs/security/security-review-baseline.md`
  - verification: `node ./scripts/check-docs.mjs`

- Slice 2: workflow and runbook promotion
  - files: planning/review/lifecycle docs and runbooks
  - verification: touched-file review plus `node ./scripts/check-docs.mjs`

- Slice 3: template and PR metadata promotion
  - files: templates, PR template, review doc
  - verification: `node ./scripts/check-docs.mjs`, `node ./scripts/verify.mjs`

## Plan Review

- independent review or cross-model review needed: fresh-context same-tool fallback after implementation
- review findings before implementation:
  - keep one canonical list of obligations
  - require recognition, not false completion

## Failure and Rollback Considerations

- if the wording gets too heavy, simplify it while keeping the classification requirement explicit

## Re-Planning Triggers

- the obligation list expands beyond what the security baseline should own
- repo templates cannot carry the extra prompts cleanly

## Completion Evidence

- future planning docs explicitly point to the security baseline obligations
- release and PR templates force explicit classification
- the review doc points readers to the durable workflow surfaces
- `node ./scripts/verify.mjs` passes

## Documentation Reconciliation

- `docs/specs/shared/bugfixes/deferred-obligations-promotion.md`
- `docs/specs/shared/plans/deferred-obligations-promotion.md`
- `docs/security/security-review-baseline.md`
- workflow docs, runbooks, templates, and review artifact

## Final Reconciliation

- Slice 1 shipped by promoting the deferred obligations into the security baseline and AGENTS workflow
- Slice 2 shipped by updating planning, review, and add-feature workflow docs
- Slice 3 shipped by updating templates, PR metadata, release docs, and the repo review artifact
- full proof completed with `node ./scripts/verify.mjs`
