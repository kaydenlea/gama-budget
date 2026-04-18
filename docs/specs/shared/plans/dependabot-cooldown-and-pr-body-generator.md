# dependabot-cooldown-and-pr-body-generator

Created: 2026-04-05
Document Type: Implementation Plan
Status: Implemented
Lane: shared

# Implementation Plan

## Linked Context

- feature spec: [docs/specs/shared/bugfixes/dependabot-cooldown-and-pr-body-generator.md](../bugfixes/dependabot-cooldown-and-pr-body-generator.md)
- PRD or bugfix doc: [docs/reviews/repo-review-2025-04-05.md](../../../reviews/repo-review-2025-04-05.md)
- likely release gate: Gate C

## Scope

Tighten Dependabot update timing and fix PR-body generation so the repo's own automation produces a validator-compliant starting point for PR metadata.

## Preconditions

- keep security updates prompt while adding delay only for normal version-update churn
- preserve the local-artifact design for generated PR bodies rather than turning them into tracked files
- applicable remaining feature-dependent obligations from `docs/security/security-review-baseline.md`: all are not applicable to this workflow fix

## File-Level Plan

- `docs/specs/shared/bugfixes/dependabot-cooldown-and-pr-body-generator.md`: active bugfix spec
- `docs/specs/shared/plans/dependabot-cooldown-and-pr-body-generator.md`: active implementation plan
- `.github/dependabot.yml`: add a conservative cooldown policy for routine workspace dependency updates
- `scripts/pr-body.mjs`: bring generated PR-body content into alignment with the current template and metadata validator

## Interfaces and Data Structures

- Dependabot config gains a `cooldown` block for npm workspace updates
- PR-body generator output remains markdown text, but the generated Release Gate and Review sections become more explicitly compliant with local validation expectations

## Design Choices

- use a short semver-tiered cooldown instead of a blanket long delay
- keep GitHub Actions update timing unchanged unless there is a documented need to delay those separately
- fix the generator at the source instead of relying on manual artifact edits

## Edge Cases and Failure Modes

- cooldown values that are so long they create stale dependency drift
- output wording that passes the validator but becomes misleading for humans
- generator changes that accidentally regress Gate A drafts while fixing Gate B/C/D

## Slice Plan

- Slice 1: planning artifacts
  - files: spec and implementation plan
  - design: record root cause, scope, and verification before code changes
  - verification: touched-file review

- Slice 2: Dependabot cooldown policy
  - files: `.github/dependabot.yml`
  - design: add a short semver-tiered cooldown for npm workspace updates only
  - verification: touched-file review against current GitHub Dependabot docs

- Slice 3: PR-body generator hardening
  - files: `scripts/pr-body.mjs`
  - design: emit the security release-checklist evidence link for Gate B/C/D and include the review metadata label required by the current template
  - verification: generate a PR body and run `scripts/check-pr-metadata.mjs` against a simulated PR event

## Plan Review

- independent review or cross-model review needed: fresh-context same-tool fallback after implementation
- review findings before implementation:
  - fix the generator in tracked code, not only in the ignored artifact
  - avoid slowing security updates
  - make the artifact-vs-tracked-file distinction explicit in the final explanation

## Failure and Rollback Considerations

- Dependabot cooldown can be reverted by removing the `cooldown` block if it proves too conservative
- PR-body generator changes are isolated to one script and can be rolled back without affecting product code

## Re-Planning Triggers

- current GitHub Dependabot docs indicate the chosen cooldown shape is unsupported
- generator changes expose a deeper mismatch between the PR template and the validator that should be fixed elsewhere

## Completion Evidence

- `.github/dependabot.yml` includes a deliberate cooldown policy
- `scripts/pr-body.mjs` generates a PR body that passes `scripts/check-pr-metadata.mjs` when evaluated as a PR event payload
- the final response explains why editing `.gama-artifacts/gama/pr-body.md` does not show up in git

## Documentation Reconciliation

- `docs/specs/shared/bugfixes/dependabot-cooldown-and-pr-body-generator.md`
- `docs/specs/shared/plans/dependabot-cooldown-and-pr-body-generator.md`

## Final Reconciliation

- Slice 1 shipped by adding the task spec and plan before modifying tracked repo behavior
- Slice 2 shipped by adding a conservative semver-tiered cooldown to `.github/dependabot.yml`
- Slice 3 shipped by updating `scripts/pr-body.mjs`, regenerating a real branch-specific PR body artifact, and validating it with `scripts/check-pr-metadata.mjs`
- the branch explanation now explicitly distinguishes tracked repo changes from the gitignored local PR-body artifact
