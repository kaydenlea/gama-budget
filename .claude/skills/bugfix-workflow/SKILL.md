---
name: bugfix-workflow
description: Reproduce, debug, root-cause, fix, verify, and document meaningful bug work. Use when a defect is non-trivial, subtle, risky, or recurring and needs more than a quick patch.
---

# Bugfix Workflow

1. Read `AGENTS.md`, `docs/agent-workflows/03-bugfix-lifecycle.md`, `docs/agent-workflows/10-root-cause-debugging.md`, and `docs/templates/bugfix-spec-template.md`.
2. Reproduce the bug or record why direct reproduction is not currently available.
3. Inspect logs, tests, and nearby code until the likely root cause is clear enough to act.
4. Write a focused bugfix spec when the issue is risky, cross-cutting, security-sensitive, or hard to reason about.
5. Suggest `pnpm new:bugfix-spec -- <slug>` when a reusable bugfix doc should be created.
6. Implement the smallest correct root-cause fix and verify before closing the bug.
7. Once the root cause and verification path are clear, do not require unnecessary user hand-holding to finish the fix.
8. Promote stable repeated lessons into shared docs or rules and keep one-off detail inside the bugfix spec.
