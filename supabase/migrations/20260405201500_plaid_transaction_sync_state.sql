alter table public.plaid_items
  add column transactions_cursor text,
  add column last_transactions_sync_started_at timestamptz,
  add column last_transactions_sync_completed_at timestamptz,
  add column last_transactions_sync_error text;
