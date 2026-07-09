-- Replaces the single holdings.quantity/average_price snapshot with real
-- buy/sell transaction history, so dividends can be calculated using the
-- shares actually held on each dividend's ex-dividend date instead of
-- today's quantity applied retroactively to years of history. See
-- src/lib/holdings/position.ts and the rewritten sync job.
create table public.holding_transactions (
  id uuid primary key default gen_random_uuid(),
  holding_id uuid not null references public.holdings (id) on delete cascade,
  transaction_type text not null check (transaction_type in ('buy', 'sell')),
  quantity numeric(20, 8) not null check (quantity > 0),
  price numeric(20, 8),
  transaction_date date not null,
  created_at timestamptz not null default now()
);

create index holding_transactions_holding_id_idx on public.holding_transactions (holding_id);

alter table public.holding_transactions enable row level security;

create policy "holding_transactions: user manages own via holding"
  on public.holding_transactions for all
  using (
    exists (
      select 1 from public.holdings
      where holdings.id = holding_transactions.holding_id
      and holdings.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.holdings
      where holdings.id = holding_transactions.holding_id
      and holdings.user_id = auth.uid()
    )
  );

-- Backfill: existing holdings have no real transaction history, so become a
-- single "buy" dated at holding creation. Dividends before that date will
-- now correctly compute to 0 shares held and be skipped by the sync job.
insert into public.holding_transactions (holding_id, transaction_type, quantity, price, transaction_date)
select id, 'buy', quantity, average_price, created_at::date
from public.holdings
where quantity > 0;

-- dividend_events.gross_amount_foreign etc. are still snapshotted per-event
-- (per-user, rate-dependent), so nothing there needs to change — only the
-- input (quantity) moves from a static column to a computed value.
alter table public.holdings drop column quantity;
alter table public.holdings drop column average_price;
