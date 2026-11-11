create table public.cigarette_starts (
  cigarette_id uuid primary key,
  user_id uuid references auth.users(id) on delete set null,
  started_at timestamptz not null default now()
);

create index cigarette_starts_started_at_idx
  on public.cigarette_starts (started_at);

alter table public.cigarette_starts enable row level security;
revoke all on table public.cigarette_starts from anon, authenticated;
