# Feature Lifecycle

Use this lifecycle for non-trivial product, infrastructure, or shared-package work.

## Sequence

1. Confirm product context from the relevant product docs.
2. Clarify important unknowns before planning if they materially change product behavior, architecture, privacy, or release risk.
3. Create or refine the product brief or PRD if the work is still ambiguous at the product-definition level.
4. Create or refine the feature spec.
5. Write the implementation plan.
6. Review the plan before coding.
   Use a second model or tool when available.
   If only one agent tool is available, use a fresh review-oriented context in that same tool and record that fallback in the plan or review notes.
7. Implement in small slices.
8. After each slice, run the matching verification loop and then reopen the spec or plan to confirm the design still matches reality.
9. Re-plan immediately if the current design is no longer correct, if file scope expands materially, or if verification shows an assumption was wrong.
10. Update docs and specs while the work is in progress, not only at the end.
11. Run independent review, debug or iterate on the findings, then complete PR AI review where configured and human review.
12. Reconcile docs and apply the correct release gate before merge.

## Required Checkpoints

- Before coding: the feature spec and implementation plan must be concrete enough that another engineer could execute them without guessing.
- After each slice: verification must run before the next slice starts.
- Every checkpoint: inspect the active spec or plan for drift instead of trusting the current implementation blindly.
- After implementation: run a review-debug-verify loop until the remaining findings and residual risks are acceptable.
- Before merge: review every touched file against the feature spec, implementation plan, and release gate, not only the diff summary.

## What The Feature Spec Must Contain

- linked product context from the brief and PRD
- product or user problem statement
- explicit scope and non-goals
- UX and behavior expectations
- acceptance criteria
- exact files to create or modify
- interfaces and data structures
- design choices and boundaries
- edge cases and negative paths
- security and privacy implications
- future extensibility notes when the design intentionally leaves room for later work
- failure modes and rollback considerations
- verification criteria for each step

## What The Implementation Plan Must Contain

- exact files touched per slice
- interfaces and data structures touched per slice
- design choices for each slice
- edge cases and failure modes for each slice
- per-step verification criteria
- review checkpoints before coding or before risky scope changes
- failure and rollback considerations
- documentation reconciliation checkpoints

## Feature Workflow Rules

- do not start coding large non-trivial work without a spec and plan
- keep mobile and web concerns separated
- do not prematurely centralize platform-specific UI
- push privileged or rate-limited backend work behind Edge Functions
- stop and re-plan when implementation broadens file scope materially
- for UI work, attach visual verification evidence when tooling is available; otherwise document the fallback verification method explicitly
- for risky or cross-cutting work, treat plan review before coding as required rather than optional
