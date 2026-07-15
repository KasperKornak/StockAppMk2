-- FR-DIV-001: dividend events pass through "upcoming" -> "qualified" (ex-date
-- passed, not yet paid) -> "confirmed" (pay date passed, PLN figures known).
alter table public.dividend_events drop constraint dividend_events_status_check;
alter table public.dividend_events add constraint dividend_events_status_check
  check (status in ('upcoming', 'qualified', 'confirmed'));
