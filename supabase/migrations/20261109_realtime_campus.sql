-- Run in Supabase SQL Editor after enabling anonymous sign-ins.
-- Private campus channel access for authenticated users (including anonymous users).
create policy "Campus members can receive realtime"
on realtime.messages for select to authenticated
using (realtime.topic() = 'campus:main:v1');

create policy "Campus members can send realtime"
on realtime.messages for insert to authenticated
with check (realtime.topic() = 'campus:main:v1');
