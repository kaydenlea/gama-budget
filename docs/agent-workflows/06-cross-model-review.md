# Cross-Model Review

Cross-model review is the preferred way to challenge the plan or implementation when the task is complex, ambiguous, security-sensitive, or likely to drift architecturally.

## When To Use It

- large or risky feature work
- architecture or schema changes
- auth, RLS, privacy, storage, or release-risk changes
- subtle bugfixes where the root cause is not obvious
- moments where the current plan feels brittle or overcomplicated

## Review Order

1. review the plan before coding when the work is risky, cross-cutting, or hard to roll back
2. review again after implementation against the active spec, verification evidence, and release gate
3. record disagreements or required changes before the work is considered ready for PR

## Fallbacks When Only One Tool Is Available

- preferred: use a second tool or model, such as Codex plus Claude
- acceptable fallback: use a fresh context in the available tool with a strict review prompt and no implementation context beyond the spec, plan, and diff summary
- still required after that: PR-stage AI review where configured, deterministic local and CI checks, and human review

This means the workflow remains strong even when a contributor has only Claude or only Codex on their machine.

## What To Review

- whether the plan is coherent and minimal
- whether interfaces and data boundaries are correct
- whether the release gate is correct
- whether the implementation matches the spec
- whether the verification plan is sufficient

## Handling Disagreement

Do not average the opinions mechanically. Resolve disagreement by returning to:

- product intent
- architecture and security boundaries
- verification evidence
- maintainability and rollback safety

Human review still remains mandatory after cross-model review.
