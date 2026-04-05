# Security Policy

PocketCurb is a pre-launch finance product repository. Security issues should be reported privately, not in public issues or discussions.

## Supported Versions

Until launch, treat the current default branch and the latest unreleased work derived from it as the only supported code line for security fixes.

## Reporting a Vulnerability

- Prefer GitHub private vulnerability reporting if it is enabled for this repository.
- If GitHub private reporting is not available, contact the repository owner or maintainers through an existing private channel already used for repository or operational access.
- Do not open a public GitHub issue, pull request, or discussion for a suspected vulnerability.

When reporting, include:

- affected file paths, routes, functions, or workflows
- reproduction steps or a proof-of-concept
- expected impact and likely severity
- any known mitigations or safe temporary workarounds

## Response Expectations

- reports are handled on a best-effort basis during the current pre-launch stage
- maintainers will triage, validate, and prioritize fixes based on user-risk and release impact
- please allow time for investigation and remediation before any public disclosure

## Scope

This policy covers security issues in:

- application code under `apps/*`
- shared packages under `packages/*`
- Supabase functions, migrations, and related backend boundaries under `supabase/*`
- CI, workflow, and automation files under `.github/*` and `scripts/*`
- documentation mistakes that materially weaken security posture or disclosure accuracy

This policy does not imply a public bug bounty program or guaranteed response SLA.
