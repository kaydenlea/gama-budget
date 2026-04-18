# Compliance Matrix

Compliance scope depends on the business model, jurisdictions, and data actually handled. The system must be ready to map scope explicitly rather than assuming it away.

## Always-Needed Baseline Controls

- privacy law readiness: required from the start because personal financial data and user identifiers are involved
- App Store and Play disclosure readiness: required from the start for mobile launch
- secure engineering controls: required from the start through auth, RLS, logging, monitoring, backup, and incident handling
- OWASP MASVS and MASTG baseline: required for mobile security posture
- MFA planning: required for sensitive flows and admin access
- pentesting or external security review cadence: planned before broad launch and then periodically

## Business-Model-Dependent Obligations

- PCI DSS: only relevant if cardholder data enters the environment; avoid handling raw card data in v1
- SOC 2 style controls: likely useful as the product matures or serves partnership requirements
- tax or regulated-advice scope: depends on future feature design; current positioning is decision support, not regulated financial advice

## PCI-Only-If-Relevant Nuance

- PCI scope is driven by whether cardholder data enters the environment, not by the general presence of payments or subscriptions
- if cardholder data is delegated entirely to a compliant third party and never touches Gama systems, keep the boundary explicit in design and disclosures
- if any future feature changes that boundary, reopen the compliance plan before implementation rather than after launch

## Control Mapping Expectations

Map each launch or sensitive feature to:

- data collected
- user disclosures required
- retention and deletion behavior
- access control model
- incident response owner
- third-party processor impact
