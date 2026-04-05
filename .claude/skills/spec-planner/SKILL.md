---
name: spec-planner
description: Create or reconcile a task spec before any non-trivial implementation. Use when work changes behavior, architecture, data shape, navigation, security posture, or release risk and the repo needs a file plan, interfaces, edge cases, clarifying questions, and verification criteria.
---

# Spec Planner

1. Read `AGENTS.md`, `docs/agent-workflows/02-feature-lifecycle.md`, `docs/agent-workflows/11-prd-vs-spec-vs-plan.md`, and the relevant feature-spec or implementation-plan template.
2. Determine whether the task is trivial or non-trivial. If non-trivial, produce or update the feature spec before implementation.
3. Record clarifying questions for any unknown that materially changes architecture, data, security, user behavior, or release risk.
4. Build a feature spec that covers the user problem, scope and non-goals, UX and behavior, acceptance criteria, security or privacy implications, future extensibility notes, and linked product context.
5. Build a file-by-file implementation plan with interfaces, design choices, edge cases, rollback considerations, review checkpoints, documentation reconciliation, and verification criteria for each slice.
6. Produce or update the paired implementation plan, not only the feature spec, when the work is non-trivial.
7. Suggest `pnpm new:feature-spec -- <mobile|web> <slug>` and `pnpm new:implementation-plan -- <mobile|web|shared> <slug>` when a reusable plan file should be created.
8. Make the plan reviewable before coding. Prefer a second model or tool when available; otherwise call out the fresh-context same-tool fallback explicitly.
9. Keep the spec concrete enough that another engineer could execute it without guessing.
10. Reconcile the spec after implementation so it matches reality.
