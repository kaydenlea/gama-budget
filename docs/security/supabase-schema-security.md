# Supabase Schema Security

This document defines the minimum security baseline for all future Gama database schema work.

## Goal

Prevent the repo from drifting into a schema where tables, policies, or privileged operations accidentally expose user data, shared-household data, or internal-only state.

## Table Classes

Every new table must be classified into one of these groups before the migration is written.

### User-Owned Table

A table where each row belongs to a single authenticated user.

Examples:

- `user_profile`
- `account`
- `transaction`
- `budget_policy`
- `privacy_preference`

Rules:

- place the table in `public` only if direct client access is intended
- include an ownership column such as `user_id`
- enable RLS
- use deny-by-default policies
- allow access only where `auth.uid()` matches the owning user
- index the ownership field and high-traffic query fields

### Shared-Household Table

A table where a row is visible to multiple users through an explicit shared context.

Examples:

- `household`
- `household_membership`
- shared event or reimbursement records

Rules:

- enable RLS
- never rely on client honesty for shared membership
- use membership-based policies
- keep private autonomy explicit; private or personal-pot data must not leak through shared joins
- index `household_id`, membership lookup fields, and visibility-driving fields

### Edge-Function-Only Table

A table that should not be directly accessible from mobile or web clients even under authenticated access.

Examples:

- sensitive audit records
- admin-only workflow state
- secrets-adjacent integration metadata
- server-authoritative export job state

Rules:

- keep direct client access disabled
- do not create client-facing RLS policies for ordinary app access
- route access through Edge Functions or other privileged server-side paths only
- document why the table is not client-readable

## Policy Rules

- RLS is mandatory for every client-accessible table in `public`
- no allow-all policy using `USING (true)` or `WITH CHECK (true)` on user or shared data
- policies must be specific to `SELECT`, `INSERT`, `UPDATE`, and `DELETE` rather than vague broad grants when risk differs
- shared access must be backed by membership checks, not only by household IDs supplied from the client
- service-role behavior must remain outside client reach

## Edge Function Boundary

Use Edge Functions for:

- privileged mutations
- admin actions
- imports and exports
- deletion workflows with multi-step checks
- third-party integrations
- server-authoritative calculations that must not rely on client trust
- any operation where RLS alone is insufficient

## Review Checklist for Every New Table

1. classify the table as user-owned, shared-household, or Edge-function-only
2. justify whether the table belongs in `public` or a more restricted path
3. define the ownership or membership fields
4. enable RLS where client access exists
5. write deny-by-default policies
6. add indexes for ownership, membership, and hot filters
7. define whether the operation belongs in direct client access or Edge Functions
8. update the active spec and relevant docs

## Open Decision

Current recommendation: keep user-facing operational tables in `public` with strict RLS, and reserve stronger internal-only handling for audit, admin, and integration-supporting state.

Rationale: this fits the Supabase-first v1 model while keeping client access explicit and reviewable.

What would change the decision: a future architecture that introduces a dedicated backend layer or materially different operational needs.

