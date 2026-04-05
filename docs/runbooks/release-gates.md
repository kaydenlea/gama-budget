# Release Gates

Every change must map to one of these gates before merge or deployment.

## Gate A

Gate A is the standard feature gate for routine product work that does not materially alter security posture, auth, billing, deletion, or compliance scope.

Required:

- spec updated or confirmed unnecessary
- verification completed
- docs reconciled
- human review completed

## Gate B

Gate B is the sensitive change gate for auth, authorization, RLS, secrets, secure storage, privacy toggles, household visibility, reimbursements, exports, deletion, analytics disclosures, billing, or monitoring changes that affect risk posture.

Required:

- explicit security review
- negative-path testing
- rollback plan reviewed
- alerting and logging check
- applicable remaining feature-dependent obligations from `docs/security/security-review-baseline.md` explicitly classified
- `docs/runbooks/security-release-checklist.md` completed and attached to the release evidence for the change
- human reviewer aware of risk class

## Gate C

Gate C is the release or deployment gate for shipping to users or production-like environments.

Required:

- release checklist complete
- dependency audit reviewed; critical findings resolved or blocked from release and any remaining high findings explicitly triaged
- monitoring and alerting configured
- documented retention windows confirmed for the affected data classes
- any sensitive-function scaffold blockers replaced with real abuse controls before shipping
- applicable remaining feature-dependent obligations from `docs/security/security-review-baseline.md` resolved or explicitly carried forward with human sign-off
- deployment checklist complete
- rollback path confirmed
- post-release validation plan defined

## Gate D

Gate D is the launch or compliance gate for public launch, app-store submission, or any change that materially alters legal, policy, disclosure, or external trust posture.

Required:

- privacy and disclosure review
- compliance-matrix review
- device-integrity posture reviewed for sensitive mobile flows
- store metadata and disclosure readiness
- third-party SDK disclosures reviewed for accuracy
- applicable remaining feature-dependent obligations from `docs/security/security-review-baseline.md` fully reconciled for launch scope
- incident and support readiness
- launch sign-off from the responsible human owner
