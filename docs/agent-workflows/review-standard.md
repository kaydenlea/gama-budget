# Review Standard

Review must measure the change against the product intent, architecture, security model, and current spec. Diff-only review is insufficient.

Human judgment remains mandatory for cold-start architecture, scale risks, subtle race conditions, performance cliffs, and release-risk tradeoffs that agents can miss.

## Required Review Layers

- author self-review against the active spec
- independent AI review or cross-model review where useful, including PR-stage Codex review and CodeRabbit on pull requests where configured
- human review before merge or release
- local deterministic review gates before push where configured

If only one agent tool is available locally, use a fresh-context review pass in that same tool as the independent-review fallback. That fallback does not remove the need for PR-stage AI review where configured or for human review.

For substantive implementation changes, complete independent review before treating the branch as review-ready and record the outcome in the PR body. Prefer a second model or tool when available; otherwise use a fresh-context same-tool review fallback and make that explicit in the PR review section.

## Review Focus

Reviewers must check:

- correctness and user impact
- architecture and product-lane alignment
- security boundaries and authorization logic
- rollback safety and operational readiness
- documentation alignment and ADR impact
- test adequacy and missing verification

## PR-Stage Codex Review

Codex review quality depends on the repo context and the PR body quality, not only on the trigger phrase.

- Keep durable review rules in `AGENTS.md` plus `docs/**`.
- Make the PR body explicit and current before requesting review.
- Link the active product brief if any, PRD, feature spec or bugfix spec, and implementation plan in `Planning Artifacts`.
- State the release gate with a plain-language meaning, not only `Gate A/B/C/D`.
- Ensure deterministic proof already exists before asking for AI review.

Recommended baseline trigger:

```text
@codex review against the linked planning artifacts in the PR body. Focus on correctness, security boundaries, rollback safety, documentation alignment, and missing verification.
```

Recommended stronger trigger for sensitive or complex changes:

```text
@codex review against the linked planning artifacts in the PR body. Focus on auth, authorization, RLS, secrets, secure storage, privacy, rollback safety, release risk, and whether verification evidence is sufficient.
```

## Handling Disagreement

Disagreement between reviewers is valuable. Resolve it before merging by reconciling the spec, design intent, and verification evidence.

## Post-Implementation Iteration

Do not stop at the first review pass. Accepted findings should trigger another debug, implementation, and verification loop before the change is considered ready. The goal is not to collect review comments; the goal is to converge on a change that survives repeated checking.

## If CodeRabbit Is Unavailable

Use the local gates, PR-stage Codex review where configured, and human review. CodeRabbit is additive; its absence must not create a no-review workflow.

## Review Output

Capture:

- material findings
- unresolved risks
- required follow-up before release
- changes made in response to review
