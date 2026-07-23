-- "Delete holding" used to be a hard delete, which cascaded away
-- holding_transactions AND every dividend_events row for it — including
-- already-paid-out dividends, destroying real tax history. Switch to a
-- soft delete: the holdings row (and its transactions/dividend_events)
-- stays intact, just excluded from the active holdings list.
alter table public.holdings add column deleted_at timestamptz;

-- The (user_id, ticker) uniqueness only needs to hold among active
-- holdings — otherwise re-adding a ticker you'd previously removed would
-- be permanently blocked by its own soft-deleted row.
alter table public.holdings drop constraint holdings_user_id_ticker_key;
create unique index holdings_user_id_ticker_active_key
  on public.holdings (user_id, ticker)
  where deleted_at is null;
