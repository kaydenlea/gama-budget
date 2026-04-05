# Local Automation Standard

PocketCurb uses local automation to reduce the chance that weak changes are committed or pushed. The local gates are protection mechanisms, not a substitute for human judgment.

## Local Gates

- `pre-commit`: runs the repository verification suite before a commit is created
- `pre-push`: blocks direct pushes to protected branches, reruns verification, and executes the local review gate

The standard first-run path is `pnpm bootstrap:local`, which installs dependencies, installs hooks, verifies the repo, and checks local Codex CLI availability.

## Package-Manager Discipline

- Treat repeated broad install hangs as a workflow smell, not as a prompt to keep retrying the same command.
- Prefer repo-owned package-manager entrypoints such as `node ./scripts/bootstrap-local.mjs` and `node ./scripts/pnpm.mjs`.
- When debugging, separate package-manager bootstrap failures from repo test/runtime failures so the wrong layer does not get blamed.

## Degraded Local Gate Boundary

- If the local dependency layout is incomplete, local automation may fall back to a degraded pre-commit path for docs, workflow, CI, and repo-automation changes only.
- Degraded mode must not be used to commit app code, shared package code, Supabase code, or other substantive product changes.
- The degraded path exists to avoid endless install loops on machines with a broken local package-manager state while still protecting real product code behind the full verifier.

## Protected Branch Rule

Direct pushes to `main`, `master`, and `release/*` are blocked locally by default. Use a pull request unless an emergency override is explicitly justified.

## Local Review Gate

The local review gate includes:

- repository verification
- change classification and release-gate recommendation
- security-sensitive path detection
- lightweight policy scanning for high-risk patterns
- workflow-evidence enforcement when implementation changes land without the expected spec, plan, security-doc, or runbook evidence

The workflow-evidence layer is intentionally conservative, but `pre-push` and `review:ready` now require the expected workflow evidence before the change is treated as ready for publication. This keeps local review thorough even though Codex review itself has moved to pull-request stage.

For substantive implementation changes, workflow evidence now includes explicit local review-evidence capture. Record verification commands, verification summary, independent-review method, and independent-review outcome with `pnpm review:evidence` before relying on `pnpm review:ready`.

## AI Review Boundary

Do not pretend AI review replaces the rest of the workflow. In PocketCurb, Codex review belongs at pull-request stage rather than in the local push hook. Local gates stay deterministic and fail closed on verification or workflow-evidence gaps, while PR-stage AI review adds another review layer before merge. Claude and Codex still share the same workflow and mirrored skills.

## Deliberately Manual

The automation layer does not replace:

- clarifying questions when product, architecture, privacy, or release risk would change materially
- human review before merge for substantive work
- release sign-off for sensitive or launch-grade work
- GitHub-side configuration such as CodeRabbit installation or branch-protection rules

## Emergency Overrides

- `POCKETCURB_BYPASS_LOCAL_GATES=1`: bypass local hooks entirely. Use only for emergencies.
- `POCKETCURB_ALLOW_PROTECTED_PUSH=1`: allow a direct push to a protected branch. Use only for emergencies.
