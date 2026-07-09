-- FR-DIV-002/004, FR-NOTIF-002: in-app notifications for upcoming/confirmed
-- dividend events. A dedicated table (not just a flag on dividend_events)
-- because one event can produce two notifications over its lifetime — one
-- when created "upcoming", another when it flips to "confirmed" — and each
-- needs its own independent read state.
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  dividend_event_id uuid not null references public.dividend_events (id) on delete cascade,
  type text not null check (type in ('upcoming', 'confirmed')),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (dividend_event_id, type)
);

create index notifications_user_id_idx on public.notifications (user_id, read_at);

alter table public.notifications enable row level security;

create policy "notifications: user manages own rows"
  on public.notifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
