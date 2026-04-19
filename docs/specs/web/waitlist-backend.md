# Waitlist Backend

## Summary

Wire the website waitlist to a server-owned backend path without putting service credentials in the browser. The first live version should validate intake data, store the signup in Supabase, send a confirmation email to the user, send an internal notification email, and return stable response states for the UI.

## Current State

- The waitlist page exists but intentionally says intake is not live.
- There is no user-facing waitlist form yet.
- There is no current waitlist storage table.
- The repo has a Next.js web lane, a shared schema package, and Supabase infrastructure for privileged server-side work.

## Backend Contract

The UI should submit `POST /api/waitlist` with JSON:

```json
{
  "email": "user@example.com",
  "firstName": "Kayden",
  "persona": "solo",
  "biggestPain": "I need shared spending clarity without spreadsheet work.",
  "referralSource": "landing-page",
  "marketingConsent": true,
  "website": ""
}
```

Fields:

- `email`: required, normalized to lowercase.
- `firstName`: optional display name for follow-up.
- `persona`: optional segment, one of `solo`, `partnered`, `household`, `advisor`, or `other`.
- `biggestPain`: optional research/prioritization note.
- `referralSource`: optional attribution string.
- `marketingConsent`: required `true`.
- `website`: hidden honeypot field; should stay empty.

Responses:

- `202 { "status": "accepted" }`: signup stored and emails sent.
- `202 { "status": "duplicate" }`: email already exists; treat as a successful idempotent signup.
- `400 { "error": "invalid_waitlist_signup" }`: validation failed.
- `503 { "error": "waitlist_not_configured" }`: required backend secrets are missing.
- `502 { "error": "waitlist_unavailable" }`: storage or email provider failed.

## Storage

Supabase table: `public.waitlist_signups`.

The browser must not write to this table directly. Row-level security stays enabled with only a service-role policy and no broad client policies. The Next route uses the service role key on the server only.

Stored fields:

- email
- first name
- persona
- biggest pain
- referral source
- marketing consent
- submitted timestamp
- user agent
- IP address

## Email

Provider path: Resend API via server-side `fetch`.

The backend sends:

- confirmation email to the signup email
- internal notification email to `WAITLIST_NOTIFY_EMAIL`

Required env:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `WAITLIST_FROM_EMAIL`
- `WAITLIST_NOTIFY_EMAIL`

## UI Wiring Plan

When the visual waitlist form is ready:

1. Import `waitlistSignupSchema` from `@gama/schemas` for client-side validation or type alignment.
2. Submit form data to `/api/waitlist`.
3. Show a success state for both `accepted` and `duplicate`.
4. Show inline validation copy for `400`.
5. Show a temporary unavailable message for `502` or `503`.
6. Keep the honeypot field hidden from users and leave it empty.

## Privacy And Launch Rules

- Do not call the endpoint from UI until the visible copy explains follow-up expectations.
- Keep consent explicit.
- Do not collect financial account data through the waitlist.
- Do not add analytics or ad attribution identifiers until the privacy copy is updated.
- Do not expose the service role key through `NEXT_PUBLIC_*` env vars.

## Verification

Run:

```bash
pnpm --dir apps/web test
pnpm --dir apps/web typecheck
pnpm --dir packages/schemas test
```

Before launch, also apply the Supabase migration and test the route against a real Supabase project and Resend sandbox/domain.
