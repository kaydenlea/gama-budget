create table public.plaid_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plaid_item_id text not null unique,
  access_token text not null,
  institution_id text,
  institution_name text,
  available_products text[] not null default '{}',
  billed_products text[] not null default '{}',
  products text[] not null default '{}',
  item_status text not null default 'active' check (item_status in ('active', 'needs_attention', 'revoked')),
  error_code text,
  error_type text,
  error_message text,
  consent_expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index plaid_items_user_id_idx
  on public.plaid_items (user_id);

create index plaid_items_user_status_idx
  on public.plaid_items (user_id, item_status);

create trigger plaid_items_set_updated_at
before update on public.plaid_items
for each row
execute function public.set_updated_at();

alter table public.plaid_items enable row level security;

create policy "plaid_items_no_client_access"
  on public.plaid_items
  for all
  to authenticated
  using (false)
  with check (false);
