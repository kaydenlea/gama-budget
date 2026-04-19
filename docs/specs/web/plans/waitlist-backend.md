# Waitlist Backend Plan

## Goal

Prepare the waitlist backend and email path so the landing or waitlist UI can become live with a small, explicit form change.

## Scope

- shared waitlist validation schema
- server-only Next API route
- Supabase storage table
- Resend confirmation and internal notification emails
- environment contract
- tests for validation, storage branching, duplicate handling, and email failures

## Out Of Scope

- final visual form design
- public launch copy changes
- analytics and attribution vendors
- CRM sync
- production domain or sender-domain verification

## Implementation Slices

### Slice 1: Contract

- Add `waitlistSignupSchema` to `@gama/schemas`.
- Keep payload shape explicit and small.
- Require consent and an empty honeypot field.

### Slice 2: Storage

- Add `public.waitlist_signups`.
- Enforce unique emails and known persona values.
- Enable RLS and add only a service-role policy, with no direct browser policies.

### Slice 3: API Route

- Add `POST /api/waitlist`.
- Validate JSON.
- Store through Supabase REST with the service role key.
- Treat duplicate emails as successful idempotent outcomes.

### Slice 4: Email

- Send user confirmation through Resend.
- Send internal notification through Resend.
- Fail the request if storage succeeds but email fails, then monitor manually before public launch.

### Slice 5: UI Wiring

- Replace the current "not live yet" form shell with a form that posts to `/api/waitlist`.
- Show success for `accepted` and `duplicate`.
- Keep `503` visible as "waitlist is not open yet" in non-production or unconfigured environments.

## Risks

- Email delivery requires a verified sender domain before production launch.
- Storage succeeds before email can fail; if that becomes operationally painful, add an `email_status` column and retry job.
- IP address storage may need copy updates depending on privacy policy final wording.
- Bot traffic needs real rate limiting before launch volume grows.

## Acceptance Criteria

- UI can call one local endpoint without knowing Supabase or email provider details.
- Missing env fails closed.
- Duplicate signups do not send repeated emails.
- Service role key is never exposed to the browser.
- Tests cover the main success and failure branches.
