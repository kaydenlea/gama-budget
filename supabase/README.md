# Supabase Workspace

This directory contains the backend platform assets for the Supabase-first v1 architecture.

- `migrations/`: SQL schema changes that must remain reviewable and rollback-aware.
- `seed/`: non-production seed assets and scripts.
- `functions/`: Supabase Edge Functions for privileged or secret-backed operations.
- `types/`: generated or curated type artifacts that can be promoted into `packages/supabase-types`.

Direct client access is allowed only for safe user-scoped operations under strict RLS. Privileged logic belongs in Edge Functions.

Use `docs/security/supabase-schema-security.md` plus `pnpm supabase:check-security` before introducing real schema migrations.

## Connecting To Supabase

PocketCurb currently uses a hosted Supabase project plus local repo-managed env files.

### Client Connection

- mobile public variables live in `apps/mobile/.env`
- web public variables live in `apps/web/.env.local`
- clients should use only safe public Supabase values such as project URL and anon key
- do not place service-role keys, Plaid secrets, or other privileged credentials in client env files

### Edge Function Connection

- server-side Supabase and provider secrets live in `supabase/functions/.env.local`
- Edge Functions are the boundary for token exchange, provider sync, and other privileged operations
- keep local function env values untracked and limited to the approved repo path above

### Codex MCP Connection

If you want Codex to inspect or migrate the hosted project directly, configure the Supabase MCP server outside the repo:

```powershell
codex mcp add supabase --url https://mcp.supabase.com/mcp?project_ref=<your-project-ref>
codex mcp login supabase
```

After that, a new Codex session can use the Supabase MCP tools to inspect tables, migrations, advisors, and apply schema changes.

### Verification Before Use

- run `node .\scripts\verify.mjs` before claiming Supabase work is complete
- for schema changes, make sure the checked-in SQL migration and the live hosted project stay aligned
- prefer repo-tracked migrations over one-off dashboard edits

## Current Baseline

- `config.toml`: local Supabase CLI settings
- `migrations/`: secure table templates and future timestamped migrations
- `functions/_shared`: shared helpers for auth, secrets, and common responses
- `functions/safe-to-spend`: starter Edge Function shape for privileged decision-layer logic
- `functions/*/deno.json`: function-local Deno configuration for runtime-correct dependency resolution and checking
- `functions/*/deno.lock`: pinned Deno dependency graph for reproducible function checks
- `types/`: placeholders and notes for generated database types before they are promoted into `packages/supabase-types`

## Current MVP Schema

Slice 1 of the spending-meter and event-budgeting MVP is now represented by these `public` tables:

- `budget_settings`: one row per user for protected buffer, default daily budget, rollover flag, and currency
- `financial_accounts`: linked or manual account records, balances, provider metadata, and sync status
- `ledger_transactions`: imported or manual ledger rows with source metadata, posting dates, merchant text, and category labels
- `budget_events`: user-owned event and trip budgets with date range, target amount, and lifecycle status
- `event_transaction_assignments`: explainable event-assignment suggestions and review state for ledger rows
- `transaction_splits`: amount allocations for a ledger transaction across event or shared budgeting contexts
- `plaid_items`: Edge-function-only Plaid item state and access-token storage for linked-account setup
- `function_rate_limit_windows`: Edge-function-only operational state for the shared sensitive-function limiter

All six tables are user-owned tables in `public` with RLS enabled.

## MVP Progress Snapshot

As of 2026-04-05, the backend status is:

- complete:
  - schema and RLS baseline
  - Plaid token exchange and sandbox-backed account plus transaction sync
  - sensitive-function rate-limit backend
  - first live `safe-to-spend` computation
- partially complete:
  - `event-assignment-suggestions` is implemented locally and has an active hosted deployment, but hosted auth behavior still needs one clean redeploy to match the existing function configuration pattern
- next backend slices:
  - manual transaction functions
  - split-transaction functions

### Current Access Posture

- `budget_settings`: owner CRUD under RLS
- `financial_accounts`: owner read only; provider-backed writes should come from Edge Functions or privileged server paths
- `ledger_transactions`: owner read for all rows; direct client writes are limited to rows where `source = 'manual'`
- `budget_events`: owner CRUD under RLS
- `event_transaction_assignments`: owner CRUD under RLS
- `transaction_splits`: owner CRUD under RLS
- `plaid_items`: no direct client access; Edge Functions write and read through service-role-backed server paths
- `function_rate_limit_windows`: no direct client access; the shared limiter consumes it through a privileged RPC

### Current Live Migration

- local migration file: `supabase/migrations/20260405191636_mvp_budgeting_slice_1.sql`
- hosted project migration name: `mvp_budgeting_slice_1`
- additional hosted migrations now include `plaid_token_flow_foundation`, `plaid_transaction_sync_state`, and `sensitive_function_rate_limit_backend`

## Plaid Notes

Plaid is currently wired for token flow, item-state persistence, and first-pass transaction sync scaffolding.

- `plaid-link-token` creates Link tokens for authenticated users
- `plaid-exchange-public-token` exchanges a Plaid `public_token` and stores item state in `plaid_items`
- `plaid-sync-transactions` reads persisted Plaid item state and normalizes accounts and transactions into `financial_accounts` and `ledger_transactions`
- `plaid_items` is not client-readable and stores sensitive provider state such as the Plaid `access_token` plus sync cursor metadata
- the Plaid functions now use the shared Supabase-backed sensitive-function limiter and fail closed if that backend is unavailable
- the hosted Supabase project now has active deployments for all three Plaid functions; authenticated Plaid sandbox proof is still a separate follow-up step

Use `docs/architecture/shared/plaid-ingestion.md` as the canonical doc for Plaid data flow, stored fields, and security posture.

## Secret Handling

- do not commit real service-role keys or third-party credentials
- anon/public keys belong in client env only when they are safe public values
- privileged secrets stay in Edge Function runtime configuration
- imports, exports, destructive deletes, and server-authoritative calculations must remain server-side
