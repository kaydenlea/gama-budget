# Data Model

The data model must support short-term clarity, reimbursement correctness, shared spending with private autonomy, and forward-looking cash flow.

## Core Entities

- `user_profile`: identity, preferences, locale, notification posture, analytics consent, privacy posture.
- `household`: optional shared context grouping users while preserving private autonomy.
- `household_membership`: membership role, visibility rules, invitation state.
- `account`: linked or manual financial account with balance posture and visibility scope.
- `transaction`: amount, date, merchant, note, source, status, account, owner, visibility scope, and classification confidence.
- `transaction_split`: allocation of a transaction across user, household, business, or event contexts.
- `reimbursement_item`: expected payback amount, payer, payee, status, due state, and linked transaction references.
- `event`: trip, occasion, or narrative grouping with budget, dates, confidence score, and user-editable assignment.
- `budget_policy`: daily budget target, rollover settings, exceptions, and effective date range.
- `recurring_obligation`: bills, subscriptions, debt, or scheduled obligations with due cadence.
- `cash_flow_item`: normalized future inflow or outflow used by the forward-looking calendar and Safe-to-Spend logic.
- `safe_to_spend_snapshot`: computed near-term available spend, assumptions, time window, and explanation payload.
- `crisis_cushion_snapshot`: resilience summary and stress indicators.
- `privacy_preference`: personal pots, shared visibility toggles, and disclosure settings.
- `audit_log`: security-relevant and user-sensitive actions.

## Current MVP Slice 1 Tables

The first real Supabase schema slice currently implements these concrete tables:

- `budget_settings`: per-user budget defaults for protected buffer, default daily budget, rollover, and currency
- `financial_accounts`: user-owned account registry for manual accounts and linked providers such as Plaid
- `ledger_transactions`: normalized user ledger rows for imported and manual transactions
- `budget_events`: user-created event or trip budgets with target amount and date range
- `event_transaction_assignments`: explainable mapping records between transactions and events, including review state and confidence
- `transaction_splits`: partial amount allocation rows for transactions that need exact event or shared attribution
- `plaid_items`: provider item state and secret-backed token storage for Plaid-linked institutions

## Current Relationship Notes

- `financial_accounts.user_id` owns each account row
- `ledger_transactions` optionally belongs to a `financial_accounts` row for the same `user_id`
- `budget_events.user_id` owns each event row
- `event_transaction_assignments` joins one event to one transaction for the same `user_id`
- `transaction_splits` belongs to one ledger transaction and can optionally point to one event for the same `user_id`

Current implementation uses composite ownership foreign keys on `(id, user_id)` where cross-table references matter so rows cannot be linked across users by accident.

For Plaid-specific ingestion flow, item state, and normalization boundaries, see `docs/architecture/shared/plaid-ingestion.md`.

## Key Relationships

- users may belong to zero or one shared household in v1, with room for later expansion
- transactions belong to a user and can optionally link to a household, event, split, and reimbursement
- recurring obligations and forecast items feed the forward-looking cash-flow engine
- Safe-to-Spend and Crisis Cushion are derived views, not source-of-truth records

## Indexing Guidance

Create indexes early on frequently queried and RLS-relevant fields such as `user_id`, `household_id`, `account_id`, `transaction_date`, `event_id`, `status`, and forecast date ranges.

