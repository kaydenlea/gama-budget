# PocketCurb Supabase Backend

## Purpose

Gama is the app/product name. PocketCurb can remain the Supabase project and repository name. The app does not need a separate Supabase project just because the brand name is Gama.

## Key Split

Use the PocketCurb Supabase keys this way:

- Mobile app: `SUPABASE_URL` plus anon key only.
- Web waitlist backend: `SUPABASE_URL` plus service role key, server-side only.
- Browser/client code: never use the service role key.

## Local Env Setup

In the Supabase dashboard, open the PocketCurb project and copy:

- Project URL
- anon public key
- service role key

Then run from the repo root:

```bash
SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co" \
SUPABASE_ANON_KEY="YOUR_ANON_KEY" \
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY" \
RESEND_API_KEY="YOUR_RESEND_KEY" \
WAITLIST_FROM_EMAIL="Gama <waitlist@yourdomain.com>" \
WAITLIST_NOTIFY_EMAIL="you@yourdomain.com" \
pnpm backend:env:pocketcurb
```

This creates:

- `apps/mobile/.env.local`
- `apps/web/.env.local`

Both files are ignored by git.

If you need to regenerate them:

```bash
pnpm backend:env:pocketcurb --force
```

The `--force` run still needs the same environment variables.

## Waitlist Table

Apply this migration to the PocketCurb Supabase project:

```text
supabase/migrations/20260418000100_create_waitlist_signups.sql
```

If the Supabase CLI is installed and linked to the PocketCurb project:

```bash
supabase db push
```

If the CLI is not installed, paste the migration SQL into the Supabase dashboard SQL editor and run it against the PocketCurb project.

## Email

The waitlist backend currently expects Resend:

- `RESEND_API_KEY`
- `WAITLIST_FROM_EMAIL`
- `WAITLIST_NOTIFY_EMAIL`

Use a verified sending domain before public launch. The sender can still say Gama even while the Supabase project is named PocketCurb.

## Verification

After env files exist:

```bash
pnpm --dir apps/web typecheck
pnpm --dir apps/web test
pnpm --dir packages/schemas test
```

To smoke-test the web waitlist endpoint locally, run the web app and post to `/api/waitlist` after the migration and email keys are configured.
