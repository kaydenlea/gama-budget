## Summary

Describe the change and the user or operational outcome.

## Planning Artifacts

- Product brief:
- PRD:
- Feature spec or bugfix spec:
- Implementation plan:

If any artifact was not required, explain why.

## Release Gate

State whether this change is Gate A, Gate B, Gate C, or Gate D.
If this is Gate B, Gate C, or Gate D, link the completed `docs/runbooks/security-release-checklist.md` evidence.

## Verification

- [ ] lint
- [ ] typecheck
- [ ] unit
- [ ] integration
- [ ] end-to-end
- [ ] visual verification if UI changed
- [ ] security review if sensitive

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
