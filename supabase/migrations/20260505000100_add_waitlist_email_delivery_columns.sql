alter table public.waitlist_signups
  add column confirmation_email_sent_at timestamptz,
  add column notification_email_sent_at timestamptz;

comment on column public.waitlist_signups.confirmation_email_sent_at is
  'UTC timestamp for the confirmation email delivery attempt that completed successfully.';

comment on column public.waitlist_signups.notification_email_sent_at is
  'UTC timestamp for the internal notification email delivery attempt that completed successfully.';
