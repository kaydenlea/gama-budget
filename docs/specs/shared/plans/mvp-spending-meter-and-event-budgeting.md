# mvp-spending-meter-and-event-budgeting

Created: 2026-04-05
Document Type: Implementation Plan
Status: In Progress
Lane: shared

# Implementation Plan

## Linked Context

- feature spec: [docs/specs/shared/mvp-spending-meter-and-event-budgeting.md](../mvp-spending-meter-and-event-budgeting.md)
- PRD or bugfix doc: [docs/product/mobile/prd.md](../../../product/mobile/prd.md)
- likely release gate: Gate B moving toward Gate C for production-linked accounts

## Scope

Deliver the first implementation path for:

- Daily Spending Meter backed by real imported or manual financial data
- event and trip budgets with manual control and explainable assignment suggestions
- local environment and provider setup needed to start implementation safely

## Progress Snapshot

Current implementation status on 2026-04-05:

- done:
  - Slice 0 environment and secret-path setup
  - Slice 1 schema, contracts, RLS, and hosted migrations
  - Slice 2 Plaid token flow and authenticated sandbox sync proof
  - Slice 3 first real hosted `safe-to-spend`
  - Slice 4 mobile event CRUD and manual assignment
- in progress:
  - Slice 5 suggestion review is implemented locally and partially deployed, but hosted JWT-gateway reconciliation is still open
- next:
  - Slice 6 manual entry and split transactions
  - real dashboard wiring for the Spending Meter UI

## Preconditions

- Supabase project exists and is ready for schema setup
- Plaid sandbox credentials are available
- mobile public env uses only safe public values
- private provider credentials stay in server-side env only
- the following security-review-baseline obligations stay explicit:
  - production schema and table-by-table RLS: addressed in this change
  - sensitive-function rate limiter: addressed in this change through the shared backend; policy strength remains reviewable per function
  - linked-account audit coverage: deferred for first implementation, required before launch-grade release

## File-Level Plan

- `docs/specs/shared/mvp-spending-meter-and-event-budgeting.md`: source feature spec
- `docs/specs/shared/plans/mvp-spending-meter-and-event-budgeting.md`: living implementation plan
- `supabase/migrations/*`: relational model and RLS
- `supabase/functions/plaid-link-token/*`: create link token
- `supabase/functions/plaid-exchange-public-token/*`: exchange public token for access token
- `supabase/functions/plaid-sync-transactions/*`: import or reconcile provider transactions
- `supabase/functions/safe-to-spend/*`: replace scaffold with real compute boundary
- `supabase/functions/event-assignment-suggestions/*`: return explainable event-match suggestions
- `supabase/functions/.env.example`: document required private function env
- `packages/schemas/src/index.ts`: add schemas for budgets, assignments, splits, and provider responses
- `packages/core-domain/src/index.ts`: add deterministic spending-meter and assignment helper logic
- `packages/api-client/src/index.ts`: add typed wrappers for new function calls
- `apps/mobile/.env`: approved local mobile public config path
- `apps/mobile/src/*`: add UI and state for provider linking, meter, events, review, and manual entry

## Interfaces and Data Structures

Initial schema targets:

- `budget_settings`
  - `user_id`
  - `protected_buffer`
  - `default_daily_budget`
  - `rollover_enabled`
- `financial_accounts`
  - provider metadata, current balances, active state
- `ledger_transactions`
  - provider transaction ids, merchant, amount, date, pending state, source
- `budget_events`
  - title, date range, target amount, notes, shared flag, status
- `event_transaction_assignments`
  - confidence, source (`manual` or `suggested`), ambiguous flag, assignment note
- `transaction_splits`
  - parent transaction id, split amount, split kind, shared flag, event id nullable

Initial function surfaces:

- `createPlaidLinkToken()`
- `exchangePlaidPublicToken()`
- `syncPlaidTransactions()`
- `computeSafeToSpend()`
- `listEventAssignmentSuggestions()`

## Design Choices

- server-side functions own provider secrets and token exchange
- imported transactions and manual transactions converge into one ledger-like transaction model
- assignment suggestions return confidence and reasons, not only a yes or no result
- event budgets are created manually first; auto-created events are deferred
- calendar import stays optional and separate from Plaid ingestion

## Edge Cases and Failure Modes

- duplicate imports across sync windows
- revoked Plaid items
- partial institution coverage causing misleading spending guidance
- missing or malformed event dates
- negative or refund transactions affecting event totals
- one transaction split across multiple events or shared buckets
- assignment rules overfitting to merchant names and causing false positives

## Checklist

- [x] spec reviewed
- [x] local env setup documented and confirmed
- [x] Supabase function env example created
- [x] data model finalized
- [x] migration slice complete
- [x] Plaid token flow slice complete
- [x] transaction sync slice complete
- [x] safe-to-spend slice complete
- [x] event budget CRUD slice complete
- [~] assignment suggestion slice locally complete; hosted rollout still blocked
- [ ] split-transaction slice complete
- [ ] manual-entry slice complete
- [ ] review completed
- [x] verification completed
- [ ] reconciliation completed

## Immediate Next Steps

1. Reconcile the hosted `event-assignment-suggestions` deployment so it matches the existing project function auth pattern and passes an authenticated live invoke.
2. Implement `manual-transaction-upsert` and `manual-transaction-delete` so manual ledger entry stops depending on direct client writes.
3. Implement `transaction-split-upsert` and `transaction-split-delete` so event totals and meter math can move beyond the current single-assignment path.
4. Replace the remaining preview-oriented dashboard UI path with the real `safe-to-spend` response end to end.

## Step-by-Step Notes

1. Confirm local env values and provider accounts before coding against live or sandbox services.
2. Create the minimum schema first so imported transactions, manual transactions, and event budgets can coexist.
3. Implement Plaid token exchange and transaction sync before trying to perfect meter UX.
4. Replace the current mocked safe-to-spend path with real function-backed data once sync is reliable.
5. Add event budget CRUD and manual assignment before suggestion heuristics.
6. Add explainable suggestion heuristics and ambiguity flags after manual flows are stable.
7. Add split logic only after the base assignment model is correct.
8. Treat Google Calendar as a follow-up slice after the event model and meter trust are proven.

## Slice Plan

- Slice 0: environment and provider setup
  - files to change:
    - `supabase/functions/.env.example`
    - `supabase/functions/.env.local`
    - `apps/mobile/.env`
    - `apps/web/.env.local`
    - planning docs
  - interfaces or contracts affected:
    - local env contract only
  - design choice for the slice:
    - keep private credentials server-side and allow local env files only in approved repo paths
  - edge cases or failure modes touched:
    - accidental secret placement in tracked files
  - verification required before moving on:
    - manual file review

- Slice 1: schema and shared contracts
  - files to change:
    - `supabase/migrations/*`
    - `packages/schemas/src/index.ts`
    - `packages/supabase-types/*`
  - interfaces or contracts affected:
    - event budget, ledger transaction, assignment, split, settings schemas
  - design choice for the slice:
    - one transaction model with source metadata, not separate manual and imported UIs all the way down
  - edge cases or failure modes touched:
    - ownership, RLS, archive behavior, duplicate external ids
  - verification required before moving on:
    - schema review, migration security check, typecheck
  - implementation notes:
    - classify all six initial MVP tables as user-owned in `public`
    - reserve direct authenticated write access for user-editable rows only:
      `budget_settings`, `budget_events`, `event_transaction_assignments`, and `transaction_splits` have owner CRUD policies
      `financial_accounts` is owner-readable only because Plaid sync should author balances and provider metadata
      `ledger_transactions` is owner-readable for all rows, but authenticated inserts, updates, and deletes are limited to rows where `source = 'manual'`
    - use composite ownership foreign keys on `(id, user_id)` to prevent cross-user linking between accounts, transactions, events, assignments, and splits
    - enforce split safety with a trigger that requires split signs to match the parent transaction and prevents total absolute split allocation from exceeding the parent amount

- Slice 2: Plaid link and sync
  - files to change:
    - new Plaid Edge Functions
    - `packages/api-client/*`
    - mobile provider-link UI
  - interfaces or contracts affected:
    - link token, token exchange, sync requests and responses
  - design choice for the slice:
    - use Plaid sandbox only until sync correctness is proven
  - edge cases or failure modes touched:
    - invalid public token, revoked access token, empty sync window
  - verification required before moving on:
    - function checks, integration tests, Plaid sandbox manual test
  - implementation notes:
    - add `plaid_items` as the first Edge-function-only integration table
    - keep `plaid_items` inaccessible to clients under RLS even though it currently lives in `public`
    - create `plaid-link-token` and `plaid-exchange-public-token` first, then layer transaction sync on top of persisted item state
    - use the shared sensitive-function rate-limit backend for Plaid token and sync flows; backend failures must still fail closed
    - the hosted Supabase project now has active deployments for `plaid-link-token`, `plaid-exchange-public-token`, and `plaid-sync-transactions`; remaining proof work is authenticated sandbox execution rather than deployment plumbing
    - current sync implementation uses Plaid `/transactions/sync` cursor pagination, restarts pagination on `TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION`, and maps normalized account and transaction state into the MVP tables
    - current sync implementation marks accounts `inactive` when they disappear from the current Plaid account response, but broader disconnected-institution handling is still future work

- Slice 3: safe-to-spend and meter
  - files to change:
    - `supabase/functions/safe-to-spend/*`
    - `packages/core-domain/src/index.ts`
    - mobile dashboard query and UI
  - interfaces or contracts affected:
    - meter response DTOs and daily-guidance query path
  - design choice for the slice:
    - compute server-side, render client-side
  - edge cases or failure modes touched:
    - stale balances, missing account coverage, negative cash days
  - verification required before moving on:
    - unit tests, integration tests, manual sandbox proof
  - implementation notes:
    - hosted `safe-to-spend` now reads `budget_settings`, active `financial_accounts`, active `budget_events`, confirmed event assignments, transaction splits, and current-day ledger activity directly from Supabase
    - the first live computation reserves remaining event target amounts against available cash, falls back to `current_balance` when `available_balance` is missing, and caps same-day safe-to-spend at zero after subtracting today's net spend
    - this first pass does not yet account for recurring bills, account-coverage confidence, or richer user-facing rationale fields; those remain follow-up work before the meter should be treated as launch-grade guidance

- Slice 4: event budgets and manual assignment
  - files to change:
    - event tables and client state/UI
    - event CRUD and assignment APIs
  - interfaces or contracts affected:
    - event creation, update, archive, assignment contracts
  - design choice for the slice:
    - make manual control complete before automation
  - edge cases or failure modes touched:
    - archived events, date edits, deleted assignments
  - verification required before moving on:
    - UI tests and state verification
  - implementation notes:
    - mobile now has an `events` workspace route that uses direct Supabase table CRUD for `budget_events` and `event_transaction_assignments` under existing owner RLS
    - the first UI pass supports create, edit, archive, select-event, assign, and unassign flows against recent ledger transactions without adding new privileged functions
    - this slice currently requires an authenticated mobile session and deliberately prevents visible multi-event assignment conflicts by treating one confirmed assignment per transaction as the non-split path

- Slice 5: assignment suggestions and ambiguity review
  - files to change:
    - assignment suggestion function
    - review UI
    - domain heuristics
  - interfaces or contracts affected:
    - suggestion response with reasons, confidence, ambiguous flag
  - design choice for the slice:
    - suggestions are advisory and reversible
  - edge cases or failure modes touched:
    - same merchant across multiple events, low-confidence date overlaps
  - verification required before moving on:
    - heuristic tests and manual review path proof
  - implementation notes:
    - local code now includes `event-assignment-suggestions`, shared request and response contracts, explainable confidence plus rationale scoring, and a mobile review panel that confirms or rejects pending suggested assignments
    - current heuristics stay intentionally simple: event-window proximity, merchant or note token overlap, and amount plausibility, with ambiguity flagged when competing events score within a narrow band
    - hosted function proof is not fully complete yet because the first active deployment landed with `verify_jwt = true` while the existing deployed project pattern relies on `verify_jwt = false` plus explicit in-function auth; corrective redeploy attempts through MCP are currently failing with an internal deploy error

- Slice 6: split transactions and manual entry
  - files to change:
    - split tables, forms, APIs, and meter/event aggregation logic
  - interfaces or contracts affected:
    - split payloads and ledger aggregation
  - design choice for the slice:
    - support exact user corrections before advanced reimbursement logic
  - edge cases or failure modes touched:
    - split totals not matching parent amount, refund handling, shared/private flags
  - verification required before moving on:
    - math tests, integration tests, negative-path UI tests

## Plan Review

- independent review or cross-model review needed:
  - yes, before implementation begins in earnest
- review findings before implementation:
  - prefer correctness and editability over feature count
  - keep Google integrations out of the critical path for the first delivery slice
  - do not let Plaid provider constraints leak into the core event-budget model

## Failure and Rollback Considerations

- provider sync can be feature-flagged or disconnected without deleting ledger history
- event-budget suggestions can be disabled independently from manual assignment
- split support should be behind a schema-aware rollback plan because aggregation logic becomes more complex
- safe-to-spend output should fail closed to a user-safe unavailable state rather than show fake confidence

## Re-Planning Triggers

- Plaid sandbox data shape conflicts with the planned ledger model
- required RLS policies become materially more complex than expected
- the Spending Meter needs scheduled liabilities not yet represented in the first schema pass
- calendar support becomes a hard MVP requirement before event-budget basics are stable

## Completion Evidence

- a linked sandbox institution can sync transactions successfully
- the app can compute and render a real Daily Spending Meter
- event budgets can be created, edited, and tracked against transactions
- ambiguous assignments are reviewable and reversible
- split transactions and manual entries affect both event totals and daily guidance correctly
- verification passes for lint, policy checks, typecheck, tests, and Supabase checks

## Documentation Reconciliation

- `docs/specs/shared/mvp-spending-meter-and-event-budgeting.md`
- `docs/specs/shared/plans/mvp-spending-meter-and-event-budgeting.md`
- `docs/architecture/shared/data-model.md`
- `docs/architecture/shared/plaid-ingestion.md`
- `docs/architecture/shared/supabase-boundaries.md`
- `docs/security/auth-and-authorization.md`
- `docs/security/privacy-and-disclosures.md`
- relevant mobile product docs once UX solidifies

## Notes Log

- 2026-04-05: initial implementation plan created on branch `k-test`
- 2026-04-05: Google Calendar left as a follow-up integration, not part of the first coding slice
- 2026-04-05: Supabase MCP was available in the new session; live `public` schema and migration history were both empty before applying Slice 1
- 2026-04-05: Slice 1 migration added for `budget_settings`, `financial_accounts`, `ledger_transactions`, `budget_events`, `event_transaction_assignments`, and `transaction_splits`, plus shared schemas and Supabase types
- 2026-04-05: `node .\\scripts\\verify.mjs` passed after the Slice 1 migration and contract updates
- 2026-04-05: Slice 2 foundation added `plaid_items`, `plaid-link-token`, and `plaid-exchange-public-token`; transaction sync remains the next step on top of that persisted item state
- 2026-04-05: `node .\\scripts\\verify.mjs` passed after the Slice 2 foundation changes
- 2026-04-05: Added dedicated Plaid ingestion documentation covering provider data flow, stored fields, and server-only boundaries before transaction sync work continues
- 2026-04-05: Added `plaid-sync-transactions` plus Plaid cursor state in `plaid_items`; remaining gaps are reconciliation polish, audit coverage, and sandbox execution proof rather than the old rate-limit placeholder
- 2026-04-05: Implemented the shared Supabase-backed sensitive-function rate-limit backend using an Edge-function-only operational table plus atomic SQL RPC
- 2026-04-05: Applied the sensitive-function limiter migration to the hosted project and re-verified the repo successfully
- 2026-04-05: Sync reconciliation now marks missing Plaid accounts as `inactive`; remaining linked-account proof blockers are hosted deployment/auth setup and sandbox execution evidence
- 2026-04-05: Deployed `plaid-link-token`, `plaid-exchange-public-token`, and `plaid-sync-transactions` to the hosted Supabase project with `deno.json` import-map packaging; remaining linked-account proof work is authenticated sandbox execution
- 2026-04-05: Completed authenticated Plaid sandbox proof against the hosted project by minting a sandbox `public_token`, exchanging it through `plaid-exchange-public-token`, and syncing live account plus transaction rows into `financial_accounts` and `ledger_transactions`
- 2026-04-05: Fixed two hosted sync bugs discovered during sandbox proof: empty-body `return=minimal` PostgREST success responses in the shared REST helper, and oversized `external_transaction_id=in.(...)` sync lookups that needed chunking
- 2026-04-05: Deployed the first real `safe-to-spend` implementation and confirmed a live hosted response backed by synced balances, budget settings, event reservations, and current-day ledger data
- 2026-04-05: Added the first real mobile event-budget workspace with direct table-backed create, edit, archive, and manual assignment flows; remaining work for this lane is suggestions, ambiguity review, and split editing rather than base CRUD
- 2026-04-05: Implemented Slice 5 locally with server-backed event-assignment suggestions, ambiguity review UI, new shared schemas, and heuristic unit coverage; hosted rollout still needs a clean redeploy to align JWT-gateway behavior with the existing project function pattern
