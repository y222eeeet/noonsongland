create table if not exists public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  display_name text not null default '익명 송이' check (char_length(display_name) between 1 and 24),
  message text not null default '' check (char_length(message) <= 500),
  drawing text check (drawing is null or (char_length(drawing) <= 1500000 and drawing like 'data:image/png;base64,%')),
  created_at timestamptz not null default now(),
  check (char_length(message) > 0 or drawing is not null)
);

alter table public.guestbook_entries enable row level security;

grant select, insert on public.guestbook_entries to authenticated;

create policy "Authenticated Snowies can read guestbook"
  on public.guestbook_entries for select to authenticated
  using (true);

create policy "Authenticated Snowies can write their own guestbook entry"
  on public.guestbook_entries for insert to authenticated
  with check ((select auth.uid()) = user_id);
