# Waitlist Backend Reference

This document describes the current Gama waitlist backend. It replaces the earlier
Supabase MCP handoff checklist now that the table, server route, and local smoke
test are working.

## Current State

The waitlist backend is implemented and locally smoke-tested.

Implemented files:

- `packages/schemas/src/index.ts` defines `waitlistSignupSchema`.
- `packages/schemas/src/__tests__/schemas.unit.test.ts` covers waitlist input validation.
- `apps/web/app/api/waitlist/route.ts` exposes `POST /api/waitlist`.
- `apps/web/src/server/waitlist.ts` stores signups in Supabase and sends Resend emails.
- `apps/web/src/server/waitlist.unit.test.ts` covers storage, duplicate recovery, config, and email error behavior.
- `supabase/migrations/20260418000100_create_waitlist_signups.sql` defines the waitlist table and service-role-only policy.
- `scripts/setup-pocketcurb-supabase-env.mjs` helps populate local Supabase env values.

Verified on 2026-04-19:

```bash
pnpm --dir apps/web typecheck
pnpm --dir apps/web test
pnpm --dir packages/schemas test
```

Local API smoke test also passed:

- First `POST /api/waitlist` returned `202` with `{ "status": "accepted" }`.
- Repeating the same email returned `202` with `{ "status": "duplicate" }`.
- Resend accepted the configured test sender path.

## Request Flow

The landing page should submit waitlist forms to:

```text
POST /api/waitlist
```

The route:

1. Parses JSON from the request body.
2. Validates with `waitlistSignupSchema`.
3. Reads server-only env from `process.env`.
4. Inserts into `public.waitlist_signups` through Supabase REST using the service-role key.
5. Treats Supabase `409` unique-email conflicts as an idempotent duplicate success and retries only the email types whose delivery state is still unset.
6. Sends two Resend emails for new signups:
   - confirmation email to the signup email
   - internal notification email to `WAITLIST_NOTIFY_EMAIL`

The backend intentionally avoids browser/mobile Supabase writes. The public site
submits only to the Next API route.

## Request Body

Expected JSON shape:

```json
{
  "email": "person@example.com",
  "firstName": "Person",
  "persona": "solo",
  "biggestPain": "Keeping daily spending decisions calm.",
  "referralSource": "landing-page",
  "marketingConsent": true,
  "website": ""
}
```

Fields:

- `email`: required, normalized to lowercase, max 254 characters.
- `firstName`: optional, max 80 characters.
- `persona`: optional; one of `solo`, `partnered`, `household`, `advisor`, `other`.
- `biggestPain`: optional, max 280 characters.
- `referralSource`: optional, max 120 characters.
- `marketingConsent`: required and must be `true`.
- `website`: optional honeypot field; keep it hidden and empty in the UI.

## API Responses

Successful new signup:

```http
202 Accepted
```

```json
{ "status": "accepted" }
```

Duplicate email:

```http
202 Accepted
```

```json
{ "status": "duplicate" }
```

Stored but email delivery failed:

```http
202 Accepted
```

```json
{ "status": "accepted_email_failed" }
```

Invalid JSON:

```http
400 Bad Request
```

```json
{ "error": "invalid_json" }
```

Validation failure:

```http
400 Bad Request
```

```json
{ "error": "invalid_waitlist_signup" }
```

Missing server env:

```http
503 Service Unavailable
```

```json
{ "error": "waitlist_not_configured" }
```

Supabase storage failure:

```http
502 Bad Gateway
```

```json
{ "error": "waitlist_unavailable" }
```

## Required Env

Local env lives in `apps/web/.env.local`.

Required values:

```bash
SUPABASE_URL=https://efkvplapeqbyeknbxhwa.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...
WAITLIST_FROM_EMAIL="Gama <onboarding@resend.dev>"
WAITLIST_NOTIFY_EMAIL=your-email@example.com
```

For local testing, `onboarding@resend.dev` is acceptable if Resend accepts the
recipient for the account.

Before production, replace the sender with a verified domain sender:

```bash
WAITLIST_FROM_EMAIL="Gama <waitlist@gamabudget.com>"
WAITLIST_NOTIFY_EMAIL=gamabudget@gmail.com
```

Security rules:

- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
- Keep `RESEND_API_KEY` server-only.
- Do not add either secret to `NEXT_PUBLIC_*`, `EXPO_PUBLIC_*`, tracked `.env.example`, or mobile env.
- Add these values separately to the deployment provider's server env.

## Supabase State

Project:

```text
project_ref: efkvplapeqbyeknbxhwa
```

Supabase MCP applied migration:

```text
20260419012234_create_waitlist_signups
20260419014736_add_waitlist_service_role_policy
```

Local migration file:

```text
supabase/migrations/20260418000100_create_waitlist_signups.sql
```

Table:

```text
public.waitlist_signups
```

Columns:

- `id uuid primary key default gen_random_uuid()`
- `email text not null`
- `first_name text`
- `persona text`
- `biggest_pain text`
- `referral_source text`
- `marketing_consent boolean not null`
- `submitted_at timestamptz not null default timezone('utc', now())`
- `confirmation_email_sent_at timestamptz`
- `notification_email_sent_at timestamptz`
- `user_agent text`
- `ip_address text`
- `created_at timestamptz not null default timezone('utc', now())`

Constraints:

- unique email
- email format check
- `marketing_consent is true`
- persona allowlist

Index:

- `waitlist_signups_submitted_at_idx` on `submitted_at desc`

RLS:

- RLS is enabled.
- The only policy should be `waitlist_signups_service_role_only` for the `service_role` role.
- There are no direct browser/mobile client policies.

## Supabase Verification Queries

Confirm table exists:

```sql
select
  table_schema,
  table_name
from information_schema.tables
where table_schema = 'public'
  and table_name = 'waitlist_signups';
```

Confirm RLS:

```sql
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'waitlist_signups';
```

Confirm no browser/mobile client policies:

```sql
select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd
from pg_policies
where schemaname = 'public'
  and tablename = 'waitlist_signups';
```

Expected policy result: one `service_role`-only policy and no `anon` or
`authenticated` policies.

## Smoke Test

Start the web app:

```bash
pnpm --dir apps/web dev
```

Submit a test signup:

```bash
curl -i http://localhost:3000/api/waitlist \
  -H 'content-type: application/json' \
  -d '{
    "email": "your-email@example.com",
    "firstName": "Test",
    "persona": "solo",
    "biggestPain": "Testing waitlist setup.",
    "referralSource": "local-smoke-test",
    "marketingConsent": true,
    "website": ""
  }'
```

Expected first response:

```json
{ "status": "accepted" }
```

Expected duplicate response after all delivery state is already complete:

```json
{ "status": "duplicate" }
```

## UI Integration Contract

When wiring the landing page form:

1. Submit to `POST /api/waitlist`.
2. Send `marketingConsent: true` only after the user explicitly consents.
3. Include a hidden honeypot input named `website`; keep it empty.
4. Treat `accepted`, `accepted_email_failed`, and `duplicate` as success states, but show a distinct message for `accepted_email_failed`.
5. Show field-level validation for `400`.
6. Show temporary unavailable copy for `429`, `502`, or `503`.
7. Do not expose Supabase or Resend keys to the client.

## Remaining Production Work

Before real public traffic:

- Add the required env vars to the deployment provider.
- Confirm the deployment provider preserves the visitor IP in `x-forwarded-for` so rate limiting keys on the real client IP.
- Decide whether the initial in-memory rate limiter should be replaced with a durable edge, Redis, or platform-native limiter before higher traffic.

Current behavior stores first and emails second. Supabase storage success is the
primary success condition. If Resend fails after storage succeeds, the route
returns `202 { "status": "accepted_email_failed" }`, logs the email failure for
manual follow-up, and leaves the delivery-state columns unset so a later
duplicate retry can send only the missing email types.

Basic rate limiting is applied before storage and email delivery. The initial
limit is 5 submissions per 10 minutes by IP address and by email address, backed
by process-local memory. This is enough to blunt simple abuse on one running
server, but it is not a durable cross-instance production control.

## CLI Notes

The repo was previously linked with:

```bash
supabase link --project-ref efkvplapeqbyeknbxhwa
```

`supabase db push` was blocked because the remote project has migration history
entries not present in this checkout:

```text
20260406022331
20260406025114
20260406030822
20260406031543
```

Do not run `supabase migration repair --status reverted ...` unless intentionally
rewriting migration history metadata. For small schema checks or one-off
verification, prefer Supabase MCP tools against the existing remote project.
