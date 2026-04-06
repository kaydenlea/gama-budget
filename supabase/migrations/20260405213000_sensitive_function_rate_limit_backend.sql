create table public.function_rate_limit_windows (
  bucket_key text primary key,
  function_name text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  bucket_started_at timestamptz not null,
  bucket_expires_at timestamptz not null,
  request_count integer not null check (request_count >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index function_rate_limit_windows_expires_at_idx
  on public.function_rate_limit_windows (bucket_expires_at);

create index function_rate_limit_windows_user_function_idx
  on public.function_rate_limit_windows (user_id, function_name, bucket_expires_at desc);

create trigger function_rate_limit_windows_set_updated_at
before update on public.function_rate_limit_windows
for each row
execute function public.set_updated_at();

alter table public.function_rate_limit_windows enable row level security;

create policy "function_rate_limit_windows_no_client_access"
  on public.function_rate_limit_windows
  for all
  to authenticated
  using (false)
  with check (false);

create or replace function public.consume_function_rate_limit(
  p_function_name text,
  p_user_id uuid,
  p_max_requests integer,
  p_window_seconds integer
)
returns table (
  allowed boolean,
  remaining integer,
  reset_at timestamptz
)
language plpgsql
as $$
declare
  current_count integer;
  bucket_started_at timestamptz;
  bucket_expires_at timestamptz;
  bucket_key text;
begin
  if p_max_requests <= 0 then
    raise exception 'p_max_requests must be greater than zero';
  end if;

  if p_window_seconds <= 0 then
    raise exception 'p_window_seconds must be greater than zero';
  end if;

  bucket_started_at := to_timestamp(
    floor(extract(epoch from timezone('utc', now())) / p_window_seconds) * p_window_seconds
  );
  bucket_expires_at := bucket_started_at + make_interval(secs => p_window_seconds);
  bucket_key := p_function_name || ':' || p_user_id::text || ':' || extract(epoch from bucket_started_at)::bigint::text;

  loop
    insert into public.function_rate_limit_windows (
      bucket_key,
      function_name,
      user_id,
      bucket_started_at,
      bucket_expires_at,
      request_count
    )
    values (
      bucket_key,
      p_function_name,
      p_user_id,
      bucket_started_at,
      bucket_expires_at,
      1
    )
    on conflict do nothing
    returning function_rate_limit_windows.request_count into current_count;

    if found then
      return query
      select true, greatest(p_max_requests - current_count, 0), bucket_expires_at;
      return;
    end if;

    update public.function_rate_limit_windows
    set request_count = function_rate_limit_windows.request_count + 1,
        updated_at = timezone('utc', now())
    where function_rate_limit_windows.bucket_key = consume_function_rate_limit.bucket_key
      and function_rate_limit_windows.request_count < p_max_requests
    returning function_rate_limit_windows.request_count into current_count;

    if found then
      return query
      select true, greatest(p_max_requests - current_count, 0), bucket_expires_at;
      return;
    end if;

    select function_rate_limit_windows.request_count
    into current_count
    from public.function_rate_limit_windows
    where function_rate_limit_windows.bucket_key = consume_function_rate_limit.bucket_key;

    if current_count is not null then
      return query
      select false, greatest(p_max_requests - current_count, 0), bucket_expires_at;
      return;
    end if;
  end loop;
end;
$$;

revoke all on function public.consume_function_rate_limit(text, uuid, integer, integer) from public;
revoke all on function public.consume_function_rate_limit(text, uuid, integer, integer) from anon;
revoke all on function public.consume_function_rate_limit(text, uuid, integer, integer) from authenticated;
grant execute on function public.consume_function_rate_limit(text, uuid, integer, integer) to service_role;
