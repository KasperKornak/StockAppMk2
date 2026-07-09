-- Shared, per-ticker latest-price cache (same dedupe-across-users pattern as
-- security_dividends) — used to show estimated market value per holding.
-- Populated by the daily sync job using Massive's previous-day-bar endpoint
-- (available on the free Basic plan; real-time snapshots are not).
create table public.security_prices (
  ticker text primary key,
  price numeric(20, 8) not null,
  currency text,
  as_of_date date not null,
  updated_at timestamptz not null default now()
);

alter table public.security_prices enable row level security;

create policy "security_prices: readable by authenticated users"
  on public.security_prices for select
  using (auth.role() = 'authenticated');
