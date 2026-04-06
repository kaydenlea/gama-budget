# Plaid Ingestion

This document defines the current PocketCurb Plaid boundary for the spending-meter and event-budgeting MVP.

## Goal

Use Plaid for linked-account connection, balance ingestion, and transaction ingestion without letting provider-specific secrets or opaque provider behavior leak into the client or core product model.

## Current Scope

Plaid currently supports these server-side slices:

- create Link tokens through `plaid-link-token`
- exchange a Plaid public token through `plaid-exchange-public-token`
- persist item-level provider state in `public.plaid_items` through privileged server paths only
- synchronize Plaid accounts and transactions through `plaid-sync-transactions`

Transaction sync is now scaffolded behind the shared Supabase-backed sensitive-function limiter. The functions are no longer intentionally runtime-blocked by a placeholder limiter, but they still fail closed if the limiter backend is unavailable.

The hosted Supabase project now has active deployments for `plaid-link-token`, `plaid-exchange-public-token`, and `plaid-sync-transactions`. What remains is authenticated sandbox execution proof, not deployment wiring.

## Data Flow

1. the mobile or web client requests a Link token from the authenticated Edge Function
2. the client opens Plaid Link and receives a short-lived `public_token`
3. the client sends that `public_token` to `plaid-exchange-public-token`
4. the Edge Function exchanges it for a long-lived Plaid `access_token`
5. the Edge Function stores item-level provider state in `plaid_items`
6. `plaid-sync-transactions` uses the stored item state to hydrate `financial_accounts` and `ledger_transactions`

## What Data PocketCurb Stores Today

### In `plaid_items`

- owning `user_id`
- `plaid_item_id`
- Plaid `access_token`
- `institution_id` when Plaid returns it
- item product arrays:
  - `available_products`
  - `billed_products`
  - `products`
- current item status:
  - `active`
  - `needs_attention`
  - `revoked`
- latest item error snapshot:
  - `error_code`
  - `error_type`
  - `error_message`
- `consent_expires_at`
- `transactions_cursor`
- `last_transactions_sync_started_at`
- `last_transactions_sync_completed_at`
- `last_transactions_sync_error`
- `created_at`
- `updated_at`

### In user-facing tables after sync lands

Plaid-backed sync is intended to populate:

- `financial_accounts`
  - provider
  - provider item id
  - external account id
  - institution and display metadata
  - balances
  - sync status
- `ledger_transactions`
  - provider transaction id
  - amount
  - posting date
  - pending state
  - merchant and description text
  - category labels

## What PocketCurb Does Not Store In Client Space

- Plaid `client_id`
- Plaid `secret`
- Supabase service-role key
- Plaid `access_token`
- raw privileged provider credentials of any kind

Those values remain server-side only in `supabase/functions/.env.local` or in Edge-function-only storage.

## Current Security Boundary

- `plaid_items` is an Edge-function-only table
- it lives in `public` for the current Supabase-first architecture, but RLS is enabled with a deny-all authenticated policy
- clients have no direct read or write path to `plaid_items`
- Edge Functions use service-role-backed server access to write provider state
- user-facing app data should flow into RLS-protected user-owned tables only after server-side normalization

## Current Product Mapping Rules

- Plaid is the ingestion provider, not the source of PocketCurb budgeting truth
- provider-specific identifiers stay attached to accounts and ledger rows as metadata
- event budgets, assignments, splits, and spending-meter logic stay provider-agnostic
- manual transactions must remain possible even when Plaid is connected

## Data Minimization Rules

- store the minimum Plaid item state needed to reconnect, sync, and explain degraded connection state
- do not copy unnecessary provider payloads into broad JSON blobs
- do not expose raw provider error objects to clients
- normalize only the fields needed for account, transaction, and meter/event use cases

## Known Risks And Follow-Ups

- `access_token` is currently stored in `plaid_items`; this is intentionally server-only, but encryption-at-rest posture and future secret-hardening should be reviewed before launch-grade release
- accounts that disappear from the current Plaid `/accounts/get` response are now marked `inactive`, but broader disconnected-institution handling is still future work
- transaction sync currently handles add, modify, and remove updates plus pending-to-posted linkage fields, based on Plaid's `/transactions/sync` model
- item institution names are now hydrated during sync, but broader institution-health handling is still future work
- linked-account audit coverage remains a documented follow-up before launch-grade release
- rate-limit backend health still matters because sensitive Plaid functions fail closed if the shared limiter backend is unavailable

## Related Files

- `supabase/migrations/20260405194759_plaid_token_flow_foundation.sql`
- `supabase/migrations/20260405201500_plaid_transaction_sync_state.sql`
- `supabase/functions/plaid-link-token/index.ts`
- `supabase/functions/plaid-exchange-public-token/index.ts`
- `supabase/functions/plaid-sync-transactions/index.ts`
- `supabase/functions/_shared/plaid.ts`
- `supabase/functions/_shared/supabase-rest.ts`
- `docs/architecture/shared/supabase-boundaries.md`
- `docs/security/privacy-and-disclosures.md`
