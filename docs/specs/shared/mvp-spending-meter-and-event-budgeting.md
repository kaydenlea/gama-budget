# mvp-spending-meter-and-event-budgeting

Created: 2026-04-05
Document Type: Feature Spec
Status: In Progress
Lane: shared

# Feature Spec

## Linked Context

- product brief: n/a
- PRD: [docs/product/mobile/prd.md](../../product/mobile/prd.md)
- likely release gate: Gate B moving toward Gate C as linked-account flows become real

## Overview

Build the first real MVP slice for PocketCurb around two user-facing outcomes:

1. a trustworthy Daily Spending Meter backed by real account and transaction inputs
2. event and trip budgeting that can collect, suggest, and explain which transactions belong to an event budget

This slice should prove the core PocketCurb thesis without pretending launch-complete finance automation. Imported transactions, manual entry, explicit edits, and user-reviewable assignment logic are in scope. Silent over-automation is not.

## Progress Snapshot

Current repo status on 2026-04-05:

- completed: core Supabase schema, RLS posture, Plaid token flow, Plaid sandbox sync proof, first live `safe-to-spend`, and first mobile event-budget CRUD plus manual assignment workspace
- implemented locally but not fully hosted-reconciled: `event-assignment-suggestions` function plus mobile ambiguity-review UI
- remaining MVP backend slices: manual transaction functions and split-transaction functions
- remaining MVP product slices: real Spending Meter UI wiring, manual entry UX, split editing UX, and final hosted proof for suggestion review

## User or Problem Context

PocketCurb is trying to answer "what can I safely spend today?" and "how is this trip or event tracking against plan?" without turning the user into a full-time budget reconciler.

The MVP should favor:

- quick daily clarity
- visible and editable event budgeting
- trustworthy auto-suggestions with ambiguity review
- manual fallback paths when source data is incomplete

## Scope

In scope for this MVP slice:

- Plaid-backed linked-account transaction and balance ingestion through secure server-side boundaries
- Daily Spending Meter inputs from balances, recent transactions, protected buffer, and user budget settings
- Safe-to-spend calculation backed by server-authoritative logic
- event or trip entities with manual creation and editing
- manual transaction assignment and unassignment for event budgets
- rule-based auto-suggestions for likely event transactions
- ambiguous-match flagging instead of silent assignment when confidence is low
- shared-transaction split support at the data-model level
- manual transaction entry for missing cash or off-network activity
- forward-looking event and spending inputs sufficient for the Spending Meter and near-term trip visibility

## Non-Goals

- Gmail ingestion in the first MVP slice
- fully automatic event creation from inbox data
- fully automatic transaction assignment with no user review path
- launch-grade reimbursements workflow
- full household collaboration UX
- broad rollover budgeting across all budget categories
- full month-view calendar UX before weekly forward-looking correctness is proven

## UX and Behavior

Expected user flow:

1. user links an account or manually adds a transaction
2. app imports balances and transactions
3. app computes a Daily Spending Meter and safe-to-spend number
4. user can create an event or trip with dates and a target budget
5. app suggests matching transactions for the event
6. user confirms, edits, unassigns, or splits ambiguous items
7. event budget progress and daily guidance update accordingly

Trust expectations:

- auto-assignment must always be explainable and reversible
- ambiguous transactions must be visibly flagged
- manual entry must remain available even when Plaid is connected
- private or shared handling must be explicit where it changes user-visible totals

## Requirements

1. The app must support linked-account import through Plaid without exposing Plaid secrets in client code.
2. The app must store only public Supabase configuration in the mobile client.
3. The Spending Meter must be derived from server-authoritative inputs and return at least:
   - safe-to-spend amount
   - meter status
   - supporting timeline or rationale inputs
4. The user must be able to create, edit, archive, and review event budgets.
5. The user must be able to manually assign or unassign transactions to an event.
6. The system must be able to suggest event assignments using date, merchant, and amount heuristics.
7. The system must flag ambiguous matches for review rather than silently assigning them.
8. The system must support transaction splitting so only part of a transaction can count toward an event or shared budget.
9. Manual transaction entry must coexist with imported transactions.
10. The data model must leave room for optional future Google Calendar event suggestions without forcing Gmail ingestion now.

## Acceptance Criteria

- a linked test account can import balances and transactions in Plaid sandbox
- a user can see a Daily Spending Meter backed by imported or manual data
- a user can create an event or trip budget and see current spend against target
- a user can review suggested event assignments and manually correct them
- at least one ambiguous transaction path is handled explicitly in UI and data state
- split transactions can be represented and verified end to end
- no Plaid secret or private integration credential is placed in tracked client env files
- local `.env` files are restricted to the approved development paths and must remain ignored

## Clarifying Questions

- should event budgets reduce the Daily Spending Meter immediately, only as transactions post, or both with separate planned-vs-posted views?
- should the first MVP treat reimbursements as future work or a partial negative-amount adjustment flow?
- should Google Calendar suggestions enter the MVP only after the core event model is stable?

## File Plan

- `docs/specs/shared/mvp-spending-meter-and-event-budgeting.md`: active feature spec
- `docs/specs/shared/plans/mvp-spending-meter-and-event-budgeting.md`: active implementation plan
- `supabase/migrations/*`: new tables for linked items, events, assignments, splits, and budget settings
- `supabase/functions/*`: Edge Functions for Plaid token exchange, transaction sync, safe-to-spend compute, and assignment suggestion logic
- `packages/schemas/*`: shared contracts for event budgets, assignments, manual entry, and meter responses
- `packages/core-domain/*`: deterministic calculation logic where it belongs outside privileged secret boundaries
- `packages/api-client/*`: typed client wrappers for the new function and table interaction boundaries
- `apps/mobile/*`: linked-account, spending meter, event budget, assignment review, and manual entry screens

## Interfaces and Types

Likely first data structures:

- `budget_settings`
- `financial_accounts`
- `ledger_transactions`
- `transaction_splits`
- `budget_events`
- `event_transaction_assignments`
- `plaid_items`
- `manual_transactions`
- `daily_guidance_snapshots` or function response DTOs

Likely function surfaces:

- create Plaid link token
- exchange public token
- sync transactions
- compute safe-to-spend
- suggest event assignments

## Edge Cases

- pending transactions that later post with changed identifiers or amounts
- duplicate import plus manual entry overlap
- a transaction matching multiple events in the same date window
- one large transaction partially belonging to an event
- deleted or archived events with historical assigned transactions
- imported transaction category being wrong or unhelpful
- linked account temporarily stale or disconnected
- safe-to-spend becoming misleading when account coverage is incomplete

## Security and Privacy Implications

- clients use only public Supabase configuration values and never store Plaid secrets
- Plaid client id and secret stay in server-side function env only
- linked-account work triggers the feature-specific audit-event coverage obligation:
  - deferred for this initial planning pass, but required before launch-grade linked-account release
- schema-backed feature work triggers the production-schema and table-by-table RLS obligation:
  - addressed in planning and implementation; every table added in this feature must classify ownership and RLS rules
- sensitive or abuse-prone Edge Function work triggers the real rate-limiter obligation:
  - addressed in implementation through the shared Supabase-backed sensitive-function limiter; policy strength and backend health remain part of review
- shared-visibility and split flows trigger trust-sensitive review:
  - addressed in the spec through explicit editability and ambiguity review
- future Google integrations would also trigger disclosure, retention, and OAuth-scope review:
  - not applicable to the first implementation slice unless calendar support is added

## Future Extensibility Notes

- keep event budgets independent from any one provider so Plaid import, manual entry, and later calendar suggestions can all target the same event model
- keep assignment suggestions rule-based and explainable before considering ML or opaque scoring
- keep Gmail ingestion decoupled from the event model so it can be added later without rewriting budgets

## Verification Plan

- unit tests for safe-to-spend, event assignment heuristics, and split math
- schema validation tests for new request and response contracts
- integration tests for API client and Edge Function paths
- manual sandbox verification with Plaid-linked sample data
- negative-path tests for missing env, invalid tokens, incomplete coverage, and ambiguous assignment handling

## Implementation Plan Link

- [docs/specs/shared/plans/mvp-spending-meter-and-event-budgeting.md](./plans/mvp-spending-meter-and-event-budgeting.md)

## Checklist

- [x] scope confirmed
- [x] MVP data model drafted
- [x] Supabase tables created
- [x] RLS reviewed for each new table
- [x] Plaid sandbox link flow working
- [x] transaction sync working
- [x] safe-to-spend function returns real data
- [ ] Spending Meter UI using real data
- [x] event creation and editing UI working
- [x] manual assign and unassign flow working
- [~] ambiguous-match review flow working locally; hosted rollout still needs cleanup
- [ ] split transactions supported
- [ ] manual entry supported
- [x] verification complete
- [~] docs reconciled; progress snapshot added but final reconciliation is still pending

## Current Gaps

- `event-assignment-suggestions` needs a clean hosted redeploy that matches the existing function JWT-gateway pattern before it can be treated as production-proof
- the mobile dashboard still uses preview-oriented UI structure and has not fully switched to the live meter path end to end
- manual transaction entry and split-transaction workflows are still planned but not implemented
- event totals currently follow the non-split path first; richer split-aware review and editing remain future work inside this MVP

## Design Decisions

- prefer Plaid for account and transaction ingestion, not for product-specific budgeting logic
- prefer manual event creation before automated event discovery
- prefer Google Calendar over Gmail if external event detection is added early
- prefer explicit review for ambiguous transactions over invisible automation
- keep the Slice 1 schema user-owned in `public` with strict RLS instead of introducing shared-household visibility before collaboration requirements are real
- allow direct client CRUD only for user-editable records in Slice 1; provider-backed accounts are owner-readable, and imported ledger rows are owner-readable while client writes stay limited to `source = 'manual'`
- use `event_transaction_assignments` for explainable suggestion and review state, and `transaction_splits` for amount allocation so ambiguous review and exact spend math can evolve independently
- store Plaid item ids and access tokens in an Edge-function-only `plaid_items` table with no direct client access; linked-account setup must remain server-authoritative even before full sync lands
- document the Plaid provider boundary explicitly, including what data is stored in `plaid_items`, what later normalizes into user-facing tables, and what never enters client env or client-readable storage

## Review Notes

- 2026-04-05: Slice 1 schema reviewed against `docs/security/supabase-schema-security.md`; all six initial tables classified as user-owned for the first MVP pass
- 2026-04-05: Live Supabase project checked before the first migration; `public` had no tables or existing migrations, so no schema conflicts were present
- 2026-04-05: Slice 2 began by adding `plaid_items` as an Edge-function-only table plus first-pass Plaid link-token and public-token-exchange functions
- 2026-04-05: Slice 2 expanded with first-pass `plaid-sync-transactions` scaffolding, including Plaid cursor persistence and normalization into `financial_accounts` and `ledger_transactions`
- 2026-04-05: Sensitive Edge Function rate limiting moved from explicit placeholder blocker to a shared Supabase-backed backend that fails closed if unavailable
- 2026-04-05: Added `function_rate_limit_windows` plus atomic SQL consumption logic as shared operational infrastructure for sensitive Edge Functions
- 2026-04-05: Hosted Supabase now has active deployments for `plaid-link-token`, `plaid-exchange-public-token`, and `plaid-sync-transactions`; sandbox runtime proof is still pending authenticated execution
- 2026-04-05: Authenticated hosted sandbox proof now succeeds for Plaid item exchange and transaction sync; live project state includes synced `plaid_items`, `financial_accounts`, and `ledger_transactions`
- 2026-04-05: Sandbox proof uncovered and fixed two backend issues in the shared Supabase REST helper: empty success-body parsing for `return=minimal` responses and oversized transaction-id lookup queries during sync
- 2026-04-05: Hosted `safe-to-spend` now returns live server-computed guidance from synced balances, budget settings, event reservations, and current-day ledger activity
- 2026-04-05: First-pass meter assumptions are intentionally conservative but incomplete: the live compute path uses active cash-account balances, remaining event target reservations, protected buffer, and today's posted ledger amounts, but it does not yet model broader recurring liabilities, coverage confidence, or richer rationale detail
- 2026-04-05: Slice 4 now includes a first real mobile event-budget workspace with create, edit, archive, and manual assign or unassign flows against the live `budget_events` and `event_transaction_assignments` tables
- 2026-04-05: The first event workspace intentionally depends on an authenticated mobile Supabase session and keeps assignment scope simple: one visible confirmed event assignment per transaction until split editing and ambiguity review land
- 2026-04-05: Slice 5 implementation now exists locally with a new `event-assignment-suggestions` Edge Function, explainable rationale strings, ambiguity flags, and mobile review UI for confirm or reject
- 2026-04-05: Hosted rollout for `event-assignment-suggestions` is not fully reconciled yet; the first deployment is active but uses a mismatched `verify_jwt` setting compared with the existing function pattern, and follow-up redeploy through MCP is currently failing with an internal deploy error

## Final Reconciliation

- not started
