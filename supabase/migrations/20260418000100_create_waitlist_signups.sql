create table public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  first_name text,
  persona text,
  biggest_pain text,
  referral_source text,
  marketing_consent boolean not null,
  submitted_at timestamptz not null default timezone('utc', now()),
  user_agent text,
  ip_address text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint waitlist_signups_email_unique unique (email),
  constraint waitlist_signups_email_format check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  constraint waitlist_signups_marketing_consent_required check (marketing_consent is true),
  constraint waitlist_signups_persona_check check (
    persona is null
    or persona in ('solo', 'partnered', 'household', 'advisor', 'other')
  )
);

create index waitlist_signups_submitted_at_idx
  on public.waitlist_signups (submitted_at desc);

alter table public.waitlist_signups enable row level security;

-- No browser or mobile client policies on purpose. The public website writes
-- through the server-only Next route with the Supabase service role key.
