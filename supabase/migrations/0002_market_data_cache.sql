-- Shared, per-ticker market data cache. Populated by the daily sync job
-- (Massive API), deduped across all users so the 5 req/min free-tier limit
-- scales with unique tickers, not with users x holdings.
-- See specs/dividend-tax-tracker.spec.md "Market Data Provider" NFR.

create table public.security_dividends (
  id uuid primary key default gen_random_uuid(),
  ticker text not null,
  massive_id text not null unique,
  cash_amount numeric(20, 8) not null,
  currency text not null,
  declaration_date date,
  ex_dividend_date date,
  record_date date,
  pay_date date,
  frequency smallint,
  distribution_type text,
  synced_at timestamptz not null default now(),
  unique (ticker, ex_dividend_date, cash_amount)
);

create index security_dividends_ticker_idx on public.security_dividends (ticker);

-- Reference data managed by the sync job (service role); readable by any
-- authenticated user, not writable by them directly.
alter table public.security_dividends enable row level security;

create policy "security_dividends: readable by authenticated users"
  on public.security_dividends for select
  using (auth.role() = 'authenticated');

-- FR-DIV-001/003: links a user's per-holding dividend event to the shared
-- cache row it was derived from, so recalculation never re-fetches the API.
alter table public.dividend_events
  add column security_dividend_id uuid references public.security_dividends (id);
