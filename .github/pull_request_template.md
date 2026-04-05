## Summary

Describe the change and the user or operational outcome.

## Planning Artifacts

- Product brief:
- PRD:
- Feature spec or bugfix spec:
- Implementation plan:

If any artifact was not required, explain why.

## Release Gate

State the gate and plain-language meaning:

- Gate A: routine feature, maintenance, or docs work without sensitive security or release posture change
- Gate B: sensitive auth, privacy, secrets, billing, deletion, RLS, or other trust-critical change
- Gate C: release, deployment, CI/release infrastructure, or production-like shipping change
- Gate D: public launch, app-store submission, legal/disclosure, or compliance-sensitive change

Example: `Gate A - routine product and tooling work`

See `docs/runbooks/release-gates.md` for the full definitions.
If this is Gate B, Gate C, or Gate D, link the completed `docs/runbooks/security-release-checklist.md` evidence.
- Applicable `docs/security/security-review-baseline.md` obligations: list each applicable item as addressed, deferred with rationale, or not applicable

## Verification

- [ ] lint
- [ ] typecheck
- [ ] unit
- [ ] integration
- [ ] end-to-end
- [ ] visual verification if UI changed
- [ ] security review if sensitive
- Commands run: record the commands or proof items you actually ran
- Verification summary: summarize what passed, what was skipped, and why
- Residual risk: state any residual risk or write none

## Docs and Ops

- [ ] docs reconciled
- [ ] rollback path reviewed
- [ ] monitoring or alerting impact reviewed

## Review

- [ ] human review required
- [ ] every touched file reviewed against the active spec or plan
- [ ] independent review completed using a second tool or a fresh review-only context when only one tool was available
- [ ] Codex PR review requested or completed where configured
- [ ] CodeRabbit review completed if installed
- [ ] local review artifact checked if CodeRabbit is unavailable
- Independent review method: state whether this used a second model/tool or a fresh-context same-tool fallback
- Independent review outcome: summarize findings and whether they were resolved
- Security baseline obligation review: state which applicable remaining feature-dependent obligations were addressed, deferred with rationale, or not applicable
- Human review status: pending before merge

## Codex Review Prompt

Paste one ready-to-use prompt as a PR comment so reviewers do not need to guess:

- Routine: `@codex review against the linked planning artifacts in the PR body. Focus on correctness, security boundaries, rollback safety, documentation alignment, and missing verification.`
- Security-sensitive: `@codex review against the linked planning artifacts in the PR body. Focus on auth, authorization, RLS, secrets, secure storage, privacy, rollback safety, and whether negative-path verification is sufficient.`
- Mobile-heavy: `@codex review against the linked planning artifacts in the PR body. Focus on mobile architecture, Safe-to-Spend trust, secure storage, regression risk, and mobile-vs-web separation.`
- Web-heavy: `@codex review against the linked planning artifacts in the PR body. Focus on truthful claims, waitlist or SEO separation, privacy-safe analytics, release risk, and missing verification.`
- Release/CI: `@codex review against the linked planning artifacts in the PR body. Focus on release readiness, rollback safety, CI or deployment regressions, monitoring and alerting impact, and whether the stated release gate is correct.`
