-- Lightweight in-app feedback/contact channel (doubles as the Privacy
-- Policy's "Contact" method — no personal email needs to be published).
-- Submissions are reviewed directly in the Supabase dashboard (Studio
-- connects as an admin role that bypasses RLS); the app itself never reads
-- this table back, so there's intentionally no select policy.
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  email text,
  message text not null check (char_length(message) between 1 and 4000),
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

create policy "feedback: anyone can submit"
  on public.feedback for insert
  to anon, authenticated
  with check (true);
