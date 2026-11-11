-- The browser can add a first inhale and read only world-wide aggregates.
-- It cannot query individual smokers or change an existing event.
create or replace function public.get_cigarette_counts()
returns table(total bigint, today bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    count(*)::bigint as total,
    count(*) filter (
      where (started_at at time zone 'Asia/Seoul')::date = (now() at time zone 'Asia/Seoul')::date
    )::bigint as today
  from public.cigarette_starts;
$$;

create or replace function public.record_cigarette_start(p_cigarette_id uuid)
returns table(total bigint, today bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'anonymous sign-in is required';
  end if;

  insert into public.cigarette_starts (cigarette_id, user_id)
  values (p_cigarette_id, auth.uid())
  on conflict (cigarette_id) do nothing;

  return query select * from public.get_cigarette_counts();
end;
$$;

revoke all on function public.get_cigarette_counts() from public;
revoke all on function public.record_cigarette_start(uuid) from public;
grant execute on function public.get_cigarette_counts() to anon, authenticated;
grant execute on function public.record_cigarette_start(uuid) to authenticated;
