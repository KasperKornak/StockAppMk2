-- NBP rates for a past date never change once published, so once we've
-- looked one up we never need to ask NBP for that exact (currency, date)
-- pair again — this cuts external calls on every subsequent sync run,
-- across all users. See src/lib/fx/nbp-rate-cache.ts.
create table public.nbp_rates (
  currency text not null,
  rate_date date not null,
  mid_rate numeric(20, 8) not null,
  created_at timestamptz not null default now(),
  primary key (currency, rate_date)
);

alter table public.nbp_rates enable row level security;

create policy "nbp_rates: readable by authenticated users"
  on public.nbp_rates for select
  using (auth.role() = 'authenticated');
