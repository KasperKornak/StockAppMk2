-- Dividend Tax Tracker: initial schema
-- See specs/dividend-tax-tracker.spec.md for the functional requirements
-- (FR-*) referenced in comments below.

-- FR-AUTH / Extensibility NFR: one row per auth.users, carries the plan
-- field so a paid tier can be introduced without touching existing rows.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free',
  w8ben_confirmed_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- FR-NOTIF-001/002: per-user notification channel preferences.
create table public.notification_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  email_enabled boolean not null default true,
  in_app_enabled boolean not null default true
);

-- Reference table seeding default withholding rates per domicile.
-- FR-HOLD-004, FR-HOLD-006. Maintained manually as treaties/rates change
-- (see Open Questions in the spec).
create table public.domicile_tax_rules (
  domicile text primary key,
  default_withholding_rate numeric(5, 4) not null,
  notes text
);

insert into public.domicile_tax_rules (domicile, default_withholding_rate, notes) values
  ('USA', 0.30, 'Defaults to 30%% unless the holding has W-8BEN confirmed (15%%) — FR-HOLD-006'),
  ('GBR', 0.00, 'UK dividends carry 0%% withholding'),
  ('POL', 0.00, 'Fully withheld at source by the Polish payer — FR-TAX-005');

-- FR-HOLD-001..006: user holdings, aggregate quantity only for MVP.
create table public.holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  ticker text not null,
  domicile text references public.domicile_tax_rules (domicile),
  quantity numeric(20, 8) not null,
  average_price numeric(20, 8),
  currency text,
  w8ben_confirmed boolean not null default false,
  withholding_rate_override numeric(5, 4),
  created_at timestamptz not null default now(),
  unique (user_id, ticker)
);

-- FR-HOLD-007: support request for tickers the market data feed doesn't cover.
create table public.ticker_support_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  ticker text not null,
  created_at timestamptz not null default now()
);

-- FR-DIV-001..004, FR-TAX-001..006: one row per dividend event per holding,
-- moving from 'upcoming' to 'confirmed' as the market data feed reports it.
create table public.dividend_events (
  id uuid primary key default gen_random_uuid(),
  holding_id uuid not null references public.holdings (id) on delete cascade,
  status text not null check (status in ('upcoming', 'confirmed')),
  ex_dividend_date date,
  pay_date date,
  gross_amount_foreign numeric(20, 8),
  foreign_currency text,
  foreign_withholding_rate numeric(5, 4),
  nbp_fx_rate numeric(20, 8),
  gross_amount_pln numeric(20, 2),
  polish_tax_due_pln numeric(20, 2),
  foreign_tax_credit_pln numeric(20, 2),
  amount_to_set_aside_pln numeric(20, 2),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.holdings enable row level security;
alter table public.ticker_support_requests enable row level security;
alter table public.dividend_events enable row level security;

create policy "profiles: user manages own row"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "notification_preferences: user manages own row"
  on public.notification_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "holdings: user manages own rows"
  on public.holdings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "ticker_support_requests: user manages own rows"
  on public.ticker_support_requests for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "dividend_events: user manages own rows via holding"
  on public.dividend_events for all
  using (
    exists (
      select 1 from public.holdings
      where holdings.id = dividend_events.holding_id
      and holdings.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.holdings
      where holdings.id = dividend_events.holding_id
      and holdings.user_id = auth.uid()
    )
  );

-- domicile_tax_rules is reference data: readable by any authenticated user,
-- writable only via migrations/service role.
alter table public.domicile_tax_rules enable row level security;

create policy "domicile_tax_rules: readable by authenticated users"
  on public.domicile_tax_rules for select
  using (auth.role() = 'authenticated');
