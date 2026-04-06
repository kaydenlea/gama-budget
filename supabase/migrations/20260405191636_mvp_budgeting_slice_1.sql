create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.budget_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  protected_buffer numeric(12, 2) not null default 0 check (protected_buffer >= 0),
  default_daily_budget numeric(12, 2) not null default 0 check (default_daily_budget >= 0),
  rollover_enabled boolean not null default false,
  default_currency text not null default 'USD' check (char_length(default_currency) = 3),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.financial_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null check (provider in ('manual', 'plaid')),
  external_account_id text,
  provider_item_id text,
  institution_name text,
  official_name text,
  display_name text not null,
  mask text check (mask is null or char_length(mask) <= 8),
  account_type text,
  account_subtype text,
  currency_code text not null default 'USD' check (char_length(currency_code) = 3),
  current_balance numeric(12, 2),
  available_balance numeric(12, 2),
  account_status text not null default 'active' check (account_status in ('active', 'inactive', 'disconnected')),
  last_synced_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (id, user_id)
);

create unique index financial_accounts_user_provider_external_account_uidx
  on public.financial_accounts (user_id, provider, external_account_id)
  where external_account_id is not null;

create index financial_accounts_user_id_idx
  on public.financial_accounts (user_id);

create index financial_accounts_user_status_idx
  on public.financial_accounts (user_id, account_status);

create table public.ledger_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  financial_account_id uuid,
  source text not null check (source in ('manual', 'plaid')),
  external_transaction_id text,
  amount numeric(12, 2) not null check (amount <> 0),
  currency_code text not null default 'USD' check (char_length(currency_code) = 3),
  merchant_name text,
  description text,
  posted_on date not null,
  authorized_at timestamptz,
  pending boolean not null default false,
  pending_external_transaction_id text,
  category_labels text[] not null default '{}',
  user_note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (id, user_id),
  constraint ledger_transactions_financial_account_fkey
    foreign key (financial_account_id, user_id)
    references public.financial_accounts (id, user_id)
    on delete set null
);

create unique index ledger_transactions_user_source_external_tx_uidx
  on public.ledger_transactions (user_id, source, external_transaction_id)
  where external_transaction_id is not null;

create index ledger_transactions_user_posted_on_idx
  on public.ledger_transactions (user_id, posted_on desc);

create index ledger_transactions_user_account_idx
  on public.ledger_transactions (user_id, financial_account_id, posted_on desc);

create table public.budget_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) <= 120),
  notes text,
  starts_on date not null,
  ends_on date not null,
  target_amount numeric(12, 2) not null check (target_amount >= 0),
  status text not null default 'active' check (status in ('active', 'completed', 'archived', 'cancelled')),
  is_shared boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  archived_at timestamptz,
  unique (id, user_id),
  check (ends_on >= starts_on)
);

create index budget_events_user_date_idx
  on public.budget_events (user_id, starts_on, ends_on);

create index budget_events_user_status_idx
  on public.budget_events (user_id, status);

create table public.event_transaction_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_id uuid not null,
  ledger_transaction_id uuid not null,
  assignment_source text not null check (assignment_source in ('manual', 'suggested')),
  review_status text not null default 'pending' check (review_status in ('pending', 'confirmed', 'rejected')),
  confidence_score numeric(4, 3) check (confidence_score is null or (confidence_score >= 0 and confidence_score <= 1)),
  is_ambiguous boolean not null default false,
  rationale jsonb not null default '[]'::jsonb,
  assignment_note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  reviewed_at timestamptz,
  unique (event_id, ledger_transaction_id),
  constraint event_transaction_assignments_event_fkey
    foreign key (event_id, user_id)
    references public.budget_events (id, user_id)
    on delete cascade,
  constraint event_transaction_assignments_transaction_fkey
    foreign key (ledger_transaction_id, user_id)
    references public.ledger_transactions (id, user_id)
    on delete cascade
);

create index event_transaction_assignments_user_event_idx
  on public.event_transaction_assignments (user_id, event_id);

create index event_transaction_assignments_user_review_idx
  on public.event_transaction_assignments (user_id, review_status, is_ambiguous);

create table public.transaction_splits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  ledger_transaction_id uuid not null,
  event_id uuid,
  split_amount numeric(12, 2) not null check (split_amount <> 0),
  split_kind text not null default 'event' check (split_kind in ('event', 'shared', 'manual_adjustment')),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint transaction_splits_transaction_fkey
    foreign key (ledger_transaction_id, user_id)
    references public.ledger_transactions (id, user_id)
    on delete cascade,
  constraint transaction_splits_event_fkey
    foreign key (event_id, user_id)
    references public.budget_events (id, user_id)
    on delete set null
);

create index transaction_splits_user_transaction_idx
  on public.transaction_splits (user_id, ledger_transaction_id);

create index transaction_splits_user_event_idx
  on public.transaction_splits (user_id, event_id)
  where event_id is not null;

create or replace function public.assert_transaction_split_totals(target_transaction_id uuid)
returns void
language plpgsql
as $$
declare
  parent_amount numeric(12, 2);
  split_total numeric(12, 2);
  sign_mismatch_count integer;
begin
  select lt.amount
  into parent_amount
  from public.ledger_transactions lt
  where lt.id = target_transaction_id;

  if parent_amount is null then
    return;
  end if;

  select count(*)
  into sign_mismatch_count
  from public.transaction_splits ts
  where ts.ledger_transaction_id = target_transaction_id
    and sign(ts.split_amount) <> sign(parent_amount);

  if sign_mismatch_count > 0 then
    raise exception 'transaction_splits must keep the same sign as the parent ledger transaction';
  end if;

  select coalesce(sum(abs(ts.split_amount)), 0)
  into split_total
  from public.transaction_splits ts
  where ts.ledger_transaction_id = target_transaction_id;

  if split_total > abs(parent_amount) then
    raise exception 'transaction_splits total exceeds the absolute value of the parent ledger transaction amount';
  end if;
end;
$$;

create or replace function public.enforce_transaction_split_totals()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform public.assert_transaction_split_totals(old.ledger_transaction_id);
    return old;
  end if;

  perform public.assert_transaction_split_totals(new.ledger_transaction_id);

  if tg_op = 'UPDATE' and old.ledger_transaction_id is distinct from new.ledger_transaction_id then
    perform public.assert_transaction_split_totals(old.ledger_transaction_id);
  end if;

  return new;
end;
$$;

create trigger budget_settings_set_updated_at
before update on public.budget_settings
for each row
execute function public.set_updated_at();

create trigger financial_accounts_set_updated_at
before update on public.financial_accounts
for each row
execute function public.set_updated_at();

create trigger ledger_transactions_set_updated_at
before update on public.ledger_transactions
for each row
execute function public.set_updated_at();

create trigger budget_events_set_updated_at
before update on public.budget_events
for each row
execute function public.set_updated_at();

create trigger event_transaction_assignments_set_updated_at
before update on public.event_transaction_assignments
for each row
execute function public.set_updated_at();

create trigger transaction_splits_set_updated_at
before update on public.transaction_splits
for each row
execute function public.set_updated_at();

create trigger transaction_splits_enforce_totals
after insert or update or delete on public.transaction_splits
for each row
execute function public.enforce_transaction_split_totals();

alter table public.budget_settings enable row level security;
alter table public.financial_accounts enable row level security;
alter table public.ledger_transactions enable row level security;
alter table public.budget_events enable row level security;
alter table public.event_transaction_assignments enable row level security;
alter table public.transaction_splits enable row level security;

create policy "budget_settings_select_own"
  on public.budget_settings
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "budget_settings_insert_own"
  on public.budget_settings
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "budget_settings_update_own"
  on public.budget_settings
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "budget_settings_delete_own"
  on public.budget_settings
  for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "financial_accounts_select_own"
  on public.financial_accounts
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "ledger_transactions_select_own"
  on public.ledger_transactions
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "ledger_transactions_insert_manual_own"
  on public.ledger_transactions
  for insert
  to authenticated
  with check (auth.uid() = user_id and source = 'manual');

create policy "ledger_transactions_update_manual_own"
  on public.ledger_transactions
  for update
  to authenticated
  using (auth.uid() = user_id and source = 'manual')
  with check (auth.uid() = user_id and source = 'manual');

create policy "ledger_transactions_delete_manual_own"
  on public.ledger_transactions
  for delete
  to authenticated
  using (auth.uid() = user_id and source = 'manual');

create policy "budget_events_select_own"
  on public.budget_events
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "budget_events_insert_own"
  on public.budget_events
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "budget_events_update_own"
  on public.budget_events
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "budget_events_delete_own"
  on public.budget_events
  for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "event_transaction_assignments_select_own"
  on public.event_transaction_assignments
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "event_transaction_assignments_insert_own"
  on public.event_transaction_assignments
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "event_transaction_assignments_update_own"
  on public.event_transaction_assignments
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "event_transaction_assignments_delete_own"
  on public.event_transaction_assignments
  for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "transaction_splits_select_own"
  on public.transaction_splits
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "transaction_splits_insert_own"
  on public.transaction_splits
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "transaction_splits_update_own"
  on public.transaction_splits
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "transaction_splits_delete_own"
  on public.transaction_splits
  for delete
  to authenticated
  using (auth.uid() = user_id);
