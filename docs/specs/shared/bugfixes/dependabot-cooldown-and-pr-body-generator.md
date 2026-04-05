# dependabot-cooldown-and-pr-body-generator

Created: 2026-04-05
Document Type: Bugfix Spec
Status: Implemented
Lane: shared

# Bugfix Spec

## Overview

Correct two repo-workflow defects discovered during PR preparation for the repo-hardening branch:

- Dependabot currently updates on a weekly cadence but does not enforce a minimum post-release delay for normal version updates.
- The PR-body generator produces output that can fail the repo's own PR metadata validation requirements or require manual repair, and generated PR-body artifacts are written to an ignored directory so they do not appear as branch changes.

This work should tighten update hygiene and make PR-body generation truthful, validator-compliant, and less confusing for contributors.

## Failure Context

Observed behavior:

- `.github/dependabot.yml` schedules weekly updates but does not use a documented minimum-age delay for normal dependency releases.
- `scripts/pr-body.mjs` generates a generic draft that omits or under-specifies some required PR metadata details.
- editing `.pocketcurb-artifacts/pocketcurb/pr-body.md` does not show up in `git status` because `.pocketcurb-artifacts/` is ignored.

Expected behavior:

- routine dependency updates should be delayed for a short, deliberate cooldown window so very fresh upstream releases do not immediately open update PRs.
- the PR-body generator should emit a draft that already contains the required security release-checklist evidence link for Gate B/C/D PRs and the required review labels from the current template.
- contributors should understand that the generated PR-body artifact is a local helper output, not a tracked repo file.

Impact:

- without cooldown, routine version updates can arrive too quickly after upstream releases and create avoidable churn or early-breakage risk.
- a non-compliant PR-body draft wastes review time and undermines trust in repo automation.
- editing ignored artifacts creates false expectations that branch changes should appear in git.

## Reproduction

1. Open `.github/dependabot.yml`.
2. Observe that the npm workspace update block has a weekly schedule but no cooldown configuration.
3. Open `scripts/pr-body.mjs`.
4. Observe that the generated Release Gate section only includes the checklist link but does not help contributors satisfy all current template expectations, especially around security baseline obligation review.
5. Generate a PR body and compare it against `.github/pull_request_template.md` and `scripts/check-pr-metadata.mjs`.
6. Edit `.pocketcurb-artifacts/pocketcurb/pr-body.md`.
7. Run `git status --short`.
8. Observe that no branch change appears because `.pocketcurb-artifacts/` is ignored.

## Evidence

- `.github/dependabot.yml`
- `scripts/pr-body.mjs`
- `.github/pull_request_template.md`
- `scripts/check-pr-metadata.mjs`
- `.gitignore`

## Root-Cause Statement

Confirmed root cause:

- Dependabot was added with a safe basic schedule, but without the additional cooldown policy that better matches a cautious security-first repo posture.
- the PR-body generator drifted behind the current PR template and validator expectations, so a hand-written correction was needed.
- the generated PR body is intentionally stored as a local artifact, but that behavior was not clearly distinguished from tracked repo content during use.

## File Plan

- `docs/specs/shared/bugfixes/dependabot-cooldown-and-pr-body-generator.md`
- `docs/specs/shared/plans/dependabot-cooldown-and-pr-body-generator.md`
- `.github/dependabot.yml`
- `scripts/pr-body.mjs`

## Minimal Fix Plan

1. Add a conservative Dependabot cooldown policy for normal npm/pnpm workspace version updates while leaving security updates prompt.
2. Update the PR-body generator so Gate B/C/D drafts always include the required security release-checklist evidence line and the current required review metadata structure.
3. Regenerate and validate a PR body locally against `scripts/check-pr-metadata.mjs`.

## Edge Cases

- do not delay security updates that should still surface promptly
- do not make the PR-body generator overly specific to one branch's wording
- keep the generated body compatible with both Gate A and Gate B/C/D branches
- avoid pretending the artifact path is a tracked file

## Verification Plan

- run `node ./scripts/pr-body.mjs --write`
- validate a generated body against `node ./scripts/check-pr-metadata.mjs` using a simulated PR event payload
- review `.github/dependabot.yml` against current GitHub Dependabot documentation
- run `node ./scripts/check-docs.mjs` if spec or docs drift requires reconciliation

Applicable remaining feature-dependent obligations from `docs/security/security-review-baseline.md`:

- real sensitive-function rate limiting: not applicable to this workflow fix
- production schema and table-by-table RLS completion: not applicable to this workflow fix
- App Attest / Play Integrity: not applicable to this workflow fix
- feature-specific audit-event coverage: not applicable to this workflow fix

## Review Notes

Residual risk to track:

- cooldown reduces early-churn risk but cannot guarantee upstream releases are defect-free
- generator correctness still depends on staying aligned with future template and validator changes

## Final Reconciliation

Actual root cause:

- Dependabot had a safe weekly schedule but no deliberate cooldown policy for routine version updates.
- the PR-body generator had drifted behind the current PR template and validator expectations, so manual artifact edits were needed to produce a compliant PR body.
- the generated PR body lives under `.pocketcurb-artifacts/`, which is intentionally gitignored, so editing it does not create tracked branch changes.

Repo fix:

- added a semver-tiered Dependabot cooldown for normal npm/pnpm workspace version updates
- updated `scripts/pr-body.mjs` so Gate B/C/D drafts include the security release-checklist evidence link and the current security-baseline review label
- generated a branch-specific PR body artifact with real content and validated it locally with `scripts/check-pr-metadata.mjs`

Verification:

- `node ./scripts/pr-body.mjs --write`
- `node ./scripts/check-pr-metadata.mjs` against a simulated PR event payload
- `node ./scripts/check-docs.mjs`

Stable lessons:

- if repo policy depends on a PR-body shape, the generator and validator need to evolve together
- local generated artifacts are useful outputs, but contributors should not expect git to track files under `.pocketcurb-artifacts/`
