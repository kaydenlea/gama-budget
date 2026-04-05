---
name: pr-reviewer
description: Review a change against the spec, architecture, security model, verification evidence, and rollback posture. Use when performing AI-assisted review before or during pull requests and when preparing for human review or CodeRabbit review.
---

# PR Reviewer

1. Read `docs/agent-workflows/review-standard.md` and the active spec.
2. Review for correctness, user impact, boundary alignment, security, rollback safety, and documentation alignment.
3. Prefer findings-first review output ordered by severity.
4. Call out missing verification and mismatches between the implementation and the spec.
5. Treat CodeRabbit as an additional reviewer, not the final authority.
6. Confirm that every touched file was reviewed against the active spec or plan, not only the diff summary.
7. If only one local agent tool was available, confirm the fresh-context fallback review was still performed.
8. Require human review before merge.
