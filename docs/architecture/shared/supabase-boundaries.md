# Supabase Boundaries

## Supabase Role in v1

Supabase provides database, auth, storage where needed, SQL migrations, and Edge Functions. It is the backend platform, not just a database.

## Access Rules

- authenticate with Supabase Auth
- enforce row ownership and visibility through RLS
- use Edge Functions as the privileged server-side layer
- keep service-role credentials and integration secrets server-side only
- default cost-sensitive, rate-limited, export, deletion, and recovery-sensitive flows to Edge Functions even if direct database access would technically work

## Table Boundary Classes

Classify each future table before creating it:

- user-owned table with direct client access under strict RLS
- shared-household table with membership-driven RLS
- Edge-function-only table with no broad client access

The classification must be recorded in the active spec and reflected in the migration design.

## Current MVP Table Boundaries

The current spending-meter and event-budgeting Slice 1 schema uses only user-owned tables in `public`.

- `budget_settings`: user-owned, direct client CRUD under strict RLS
- `financial_accounts`: user-owned, owner-readable under RLS, provider-managed writes stay behind privileged paths
- `ledger_transactions`: user-owned, owner-readable under RLS, direct client writes allowed only for manual rows
- `budget_events`: user-owned, direct client CRUD under strict RLS
- `event_transaction_assignments`: user-owned, direct client CRUD under strict RLS
- `transaction_splits`: user-owned, direct client CRUD under strict RLS

No shared-household tables or Edge-function-only integration tables have been added yet for this MVP slice.

The first linked-account foundation table now adds one Edge-function-only exception:

- `plaid_items`: Edge-function-only despite living in `public` for now; RLS is enabled with an explicit deny-all client policy and all reads or writes must flow through privileged server paths
- `function_rate_limit_windows`: Edge-function-only operational table for abuse protection; clients have no direct access and the shared limiter uses a privileged SQL RPC

## Hosted Project Connection Boundary

- public clients connect with project URL plus anon key only
- privileged Supabase credentials and provider secrets stay in `supabase/functions/.env.local`
- schema changes should originate from repo-tracked migrations first, not from ad hoc dashboard edits
- Codex MCP can inspect and migrate the hosted project when configured in the local Codex environment, but the repo remains the source of truth

For Plaid-specific provider flow and storage details, see `docs/architecture/shared/plaid-ingestion.md`.

## Migration Discipline

- migrations must be reviewable, reversible, and tied to specs
- security-relevant schema changes require release-gate review
- index fields that are queried often or used in RLS predicates

## Browser Note

CORS matters on browser surfaces. It is necessary for the web lane but is not a primary mobile security control.
