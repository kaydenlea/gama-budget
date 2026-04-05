# Planning Standard

Planning is the default for every non-trivial task. The goal is to reduce architectural drift, security surprises, and rework by making design and verification explicit before implementation starts.

## When Planning Is Required

Create or update the correct planning artifact when work changes behavior, data shape, navigation, security boundaries, release risk, product scope, or shared package contracts. Treat any task with 3 or more meaningful steps, architectural decisions, or non-trivial verification as planning-required by default. Use product briefs and PRDs for product-definition work, and feature specs plus implementation plans for delivery work. Tiny copy-only edits and isolated typo fixes can skip formal planning if they do not affect behavior or risk.

## Clarify Before Planning

Ask clarifying questions before producing the plan when answers materially change:

- system architecture or lane ownership
- user-facing behavior or data model
- security posture, privacy exposure, or release risk
- third-party integration design
- irreversible migrations or deletion behavior

Do not guess on structurally important unknowns.

## Required Plan Content

Every non-trivial plan must include:

- specific files to create or modify
- data structures, contracts, or interfaces that will change
- design choices and rejected alternatives where relevant
- edge cases and failure modes
- rollback or recovery considerations
- verification criteria for each implementation slice
- documentation updates required to keep reality aligned with docs
- explicit classification of any applicable remaining feature-dependent obligations from `docs/security/security-review-baseline.md`
- a checklist that can be marked off as slices complete

## Planning Quality Bar

- Prefer smaller scopes with clear checkpoints over one large autonomous run.
- Cross-examine the plan with an independent reviewer or model when possible.
- Treat disagreements between reviewers as useful signal, not noise.
- Use planning discipline for verification work too, not only for building.
- Ensure the plan respects mobile vs web separation and does not prematurely share UI patterns.
- Check whether security-sensitive work must go through Supabase Edge Functions rather than direct client access.
- Check whether the work triggers any remaining feature-dependent obligations in `docs/security/security-review-baseline.md`, and record whether each one is addressed now, deferred with rationale, or not applicable.
- Treat plan quality as the main defense against silent architectural drift, especially in new or still-forming codebases.

## Exit Criteria

Planning is complete only when the plan is specific enough that another engineer could execute it without guessing about file scope, interfaces, risk boundaries, or verification.

## Fast Path

To reduce friction without weakening the workflow, use the spec generators when helpful:

- `pnpm new:spec:mobile -- <slug>`
- `pnpm new:spec:web -- <slug>`
