---
name: verification-runner
description: Select and run the correct proof set for a change. Use when a task needs verification planning or execution across lint, typecheck, tests, visual checks, regression comparison, security checks, or release-gate evidence.
---

# Verification Runner

1. Read `AGENTS.md` and `docs/agent-workflows/verification-standard.md`.
2. Map the current slice to the required checks: lint, typecheck, unit, integration, end-to-end, visual, migration, manual scenario, and security review as applicable.
3. Verify against the spec, implementation plan, and architecture, not only the diff.
4. For regressions and bugfixes, compare before and after behavior when possible.
5. For UI work, prefer visual verification when tooling is available.
6. Re-open the active spec or plan at each checkpoint and stop if verification reveals drift or a wrong assumption.
7. Record what was verified per slice, what fallback method was used if visual tooling was unavailable, and what residual risk remains.
8. Require final proof before the task is marked complete.
