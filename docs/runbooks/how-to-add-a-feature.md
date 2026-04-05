# How To Add A Feature

Use this runbook when the request is something like "add this feature", "build this screen", "support shared budgets", or "add the landing page".

## Default Flow

1. Read [AGENTS.md](../../AGENTS.md).
2. Read [docs/agent-workflows/00-operating-model.md](../agent-workflows/00-operating-model.md) and [docs/agent-workflows/02-feature-lifecycle.md](../agent-workflows/02-feature-lifecycle.md).
3. If the feature touches auth, schema, sensitive mobile flows, analytics or monitoring, exports, deletion, shared visibility, or other trust-critical boundaries, read [docs/security/security-review-baseline.md](../security/security-review-baseline.md) and classify any applicable remaining feature-dependent obligations before planning.
4. If the product framing is still fuzzy, create or refine:
   [docs/templates/product-brief-template.md](../templates/product-brief-template.md)
   and
   [docs/templates/prd-template.md](../templates/prd-template.md)
5. For non-trivial delivery work, create:
   [docs/templates/feature-spec-template.md](../templates/feature-spec-template.md)
   and
   [docs/templates/implementation-plan-template.md](../templates/implementation-plan-template.md)
6. Ask clarifying questions before planning if the answer materially changes architecture, privacy, security, release risk, or user behavior.
7. Make sure the implementation plan includes exact files, interfaces, design choices, edge cases, rollback considerations, verification steps, review checkpoints, documentation reconciliation, and applicable `security-review-baseline` obligation classifications.
8. Review the plan before coding.
   Prefer a second tool or model when available.
   If only one agent tool is available, use a fresh review-only context in that same tool and still require PR-stage AI review plus human review later.
9. Implement in small slices.
10. Run verification after each slice using [docs/agent-workflows/05-verification-loops.md](../agent-workflows/05-verification-loops.md).
   If the feature includes UI work, record any external references used, keep sensitive data out of external tools, and verify accessibility, primary-state legibility, and responsive or device behavior.
11. Update the spec and any affected docs during implementation.
12. Run post-implementation review:
   [docs/agent-workflows/06-cross-model-review.md](../agent-workflows/06-cross-model-review.md),
   PR-stage Codex review where configured,
   CodeRabbit where installed,
   and human review.
13. Debug and iterate on accepted review findings, rerun verification, and manually read every touched file before commit or merge.
14. Reconcile docs with `pnpm docs:reconcile`.
15. Apply the correct release gate from [docs/runbooks/release-gates.md](./release-gates.md) and merge only after the gate is satisfied.

## Useful Commands

- `pnpm new:product-brief -- <slug>`
- `pnpm new:prd -- <mobile|web|shared> <slug>`
- `pnpm new:feature-spec -- <mobile|web> <slug>`
- `pnpm new:implementation-plan -- <mobile|web|shared> <slug>`
- `pnpm review:ready`
- `pnpm ai:check`
- `pnpm verify`
- `pnpm docs:reconcile`

## Relevant Skills

- `product-brief-writer`
- `prd-writer`
- `spec-planner`
- `implementation-slicer`
- `verification-runner`
- `docs-updater`
- `cross-model-reviewer`
- `pr-reviewer`
- `release-checklist`
