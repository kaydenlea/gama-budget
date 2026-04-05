# Release Checklist

## Release Context

- release gate
- change summary
- linked spec or bugfix doc
- linked implementation plan if applicable

## Verification Evidence

- lint
- typecheck
- tests
- visual checks where relevant
- negative-path checks where relevant

## Security and Privacy

- security review complete
- secrets and env reviewed
- auth or RLS impacts checked
- applicable remaining feature-dependent obligations from `docs/security/security-review-baseline.md` classified and reconciled
- disclosures updated if needed

## Operations

- monitoring and alerting confirmed
- rollback steps confirmed
- incident owner known

## Final Sign-Off

- AI review complete where configured
- human review complete
- remaining risks explicitly accepted by the responsible human owner
