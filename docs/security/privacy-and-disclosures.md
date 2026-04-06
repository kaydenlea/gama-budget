# Privacy and Disclosures

PocketCurb should use data minimization and plain-language transparency. The product narrative is privacy-first resilience, not aggressive surveillance.

## Privacy Rules

- collect only data that materially improves decision support, trust, or operations
- avoid collecting unnecessary raw metadata or behavioral exhaust
- give users clear expectations for shared visibility and privacy toggles
- ensure analytics collection aligns with disclosures and consent posture
- distinguish operational monitoring from analytics; Sentry and backend logs support reliability and incident response, while product analytics must remain disclosed and intentionally scoped

## Disclosure Readiness

Prepare for:

- privacy policy publication
- App Store privacy nutrition labels
- Play data safety disclosures
- in-product explanations of shared visibility, personal pots, and analytics behavior
- third-party SDK disclosures covering Supabase, Sentry, PostHog, RevenueCat, and any future provider that receives user or device data
- accurate explanations of retention windows, deletion lag from backups, and what data remains required for security or legal reasons

## Plaid-Specific Disclosure Notes

When linked-account features are user-facing, PocketCurb disclosures must clearly explain:

- Plaid is used for bank-linking, account, and transaction ingestion
- Plaid credentials and long-lived provider access tokens remain server-side only
- PocketCurb stores normalized account and transaction data needed for spending guidance and event budgeting
- PocketCurb currently stores Plaid item state and access tokens in an Edge-function-only table with no direct client access
- manual transaction entry remains available and linked-account data is not the only product path
- degraded or revoked institution connections can affect freshness of balances and transaction coverage

The current engineering boundary for this is documented in `docs/architecture/shared/plaid-ingestion.md`.

## Shared Context Rule

Shared household features must never make private autonomy ambiguous. Users must understand what is visible, to whom, and under what setting.
