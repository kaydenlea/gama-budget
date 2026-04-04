# How To Fix A Bug

Use this runbook when the request is something like "fix this bug", "this crashes", "this screen is broken", or "this logic is wrong".

## Default Flow

1. Read [AGENTS.md](../../AGENTS.md).
2. Read [docs/agent-workflows/03-bugfix-lifecycle.md](../agent-workflows/03-bugfix-lifecycle.md) and [docs/agent-workflows/10-root-cause-debugging.md](../agent-workflows/10-root-cause-debugging.md).
3. Reproduce the bug or explain why direct reproduction is not currently available.
4. Inspect logs, failing tests, traces, and surrounding code until the likely root cause is clear enough to act.
5. Gather evidence before changing code.
6. If the bug is non-trivial, risky, or security-sensitive, create:
   [docs/templates/bugfix-spec-template.md](../templates/bugfix-spec-template.md)
7. State the root cause clearly and define the minimal fix plan before coding.
8. Implement the smallest correct root-cause fix.
9. Verify before and after behavior where relevant, then rerun the proof set.
10. Update docs or runbooks if the bug exposed stale guidance or a stable lesson.
11. Apply the correct release gate if the bug touches sensitive flows.
12. Run an independent review pass.
    Prefer a second tool or model when available.
    If only one agent tool is available, use a fresh review-only context in that same tool and still require PR-stage AI review plus human review before merge.
13. Debug and iterate on accepted review findings, rerun verification, and manually read every touched file before commit or merge.
14. Complete PR-stage Codex review where configured, CodeRabbit where installed, and human review before merge.

## Useful Commands

- `pnpm new:bugfix-spec -- <slug>`
- `pnpm test:unit`
- `pnpm test:integration`
- `pnpm test:e2e`
- `pnpm review:ready`
- `pnpm ai:check`
- `pnpm verify`
- `pnpm docs:reconcile`

## Relevant Skills

- `bugfix-workflow`
- `verification-runner`
- `security-reviewer`
- `docs-updater`
- `pr-reviewer`
- `release-checklist`
