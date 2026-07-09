-- Fresh tables created via raw SQL don't automatically pick up the base
-- table grants Supabase's dashboard/Table Editor would normally apply —
-- RLS policies only narrow an existing grant, they don't create one. Without
-- this, every query (including from service_role, which bypasses RLS but
-- still needs the base grant) fails with "permission denied for table X".
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;
grant usage, select on all sequences in schema public to anon, authenticated, service_role;

-- Apply the same to any table created by future migrations automatically.
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated, service_role;
