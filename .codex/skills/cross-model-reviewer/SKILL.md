---
name: cross-model-reviewer
description: Run an independent review pass over the plan, implementation, verification, and release posture when a second opinion is valuable. Use on complex, security-sensitive, or architecture-heavy work before merge.
---

# Cross-Model Reviewer

1. Read `AGENTS.md`, `docs/agent-workflows/06-cross-model-review.md`, and `docs/agent-workflows/07-staff-review-standard.md`.
2. Review the active brief, PRD, spec, plan, implementation summary, and verification evidence together.
3. Use this both before coding when the plan is risky and after implementation when the delivered result needs an independent check.
4. Check whether the design is minimal, whether the boundaries are correct, and whether the release gate matches the risk.
5. If a second tool or model is unavailable, run the review from a fresh context and state that the review used the same-tool fallback.
6. Surface disagreements clearly and require them to be resolved before merge.
7. Treat this as additive to human review, not a replacement for it.
