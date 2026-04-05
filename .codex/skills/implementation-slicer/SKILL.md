---
name: implementation-slicer
description: Break planned work into small verified implementation slices. Use when a task is already planned and needs safe sequencing, checkpoint verification, re-planning triggers, balanced elegance, and minimal-impact execution.
---

# Implementation Slicer

1. Read `AGENTS.md`, `docs/agent-workflows/implementation-standard.md`, the active task spec, and the implementation plan.
2. Split work into narrow slices with a clear outcome, touched files, and per-slice verification step.
3. Prefer root-cause fixes and the simplest correct solution with balanced elegance.
4. Keep shared package boundaries clean and avoid broad speculative refactors.
5. Stop and re-plan when the design drifts, file scope expands materially, or verification exposes a mismatch with the spec.
6. Stop and re-plan when the implementation plan no longer matches reality instead of stretching the current plan.
7. Update the spec, implementation plan, checklist, and related docs during implementation, not only at the end.
8. If a fix feels hacky, re-evaluate whether a more elegant root-cause solution is warranted before closing the slice.
9. Fix ordinary bugs autonomously when the root cause and verification path are clear enough.
