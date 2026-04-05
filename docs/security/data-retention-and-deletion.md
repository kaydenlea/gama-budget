# Data Retention and Deletion

## Retention Philosophy

Retain only what is needed for product function, legal obligations, fraud prevention, security operations, and user support.

## Baseline Rules

- define retention classes for financial records, audit logs, analytics events, waitlist data, and support artifacts
- define explicit retention windows before launch for each retained class; do not ship with only generic retention intent
- support user-requested deletion flows where legally and operationally appropriate
- preserve security-relevant audit evidence according to documented retention windows
- ensure backups and restore plans document deletion lag expectations

## Current Baseline Retention Windows

- financial records and shared-spend operational records: retain until user-requested deletion or account closure workflow is completed, then follow the future product deletion policy and documented backup lag; do not hard-delete these records ad hoc outside an approved deletion flow
- security-relevant function and auth event logs: retain at least 90 days in the primary observability path, and preserve incident-related evidence longer when an active investigation or legal obligation requires it
- product analytics events: retain no longer than 30 days unless a later disclosure-reviewed product decision explicitly changes that window
- waitlist and pre-launch lead data: retain no longer than 180 days after the latest user interaction unless the user converts into a product account sooner
- support artifacts containing user financial context: retain no longer than 180 days after case closure unless legal, fraud, or incident obligations require longer preservation

These windows are the current minimum baseline and must be re-reviewed before launch-grade deletion features or public disclosures are finalized.

## Deletion Expectations

- deletion flows must be authorized and auditable
- user-facing deletion messaging must be accurate about what is removed immediately and what may remain in backups temporarily
- shared household data requires careful handling to avoid deleting records still needed by another user's lawful access scope
