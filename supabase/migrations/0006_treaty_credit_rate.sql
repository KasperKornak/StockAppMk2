-- FR-TAX-007: the foreign tax credit Poland recognizes is capped at the
-- double-tax-treaty rate, independent of what was actually withheld at
-- source. Without this, a US holding without W-8BEN (30% actually withheld)
-- was wrongly calculated as owing 0 PLN, when Poland only credits up to the
-- 15% treaty rate regardless — 4% is still owed either way. See
-- src/lib/tax/calculate.ts.
alter table public.domicile_tax_rules
  add column treaty_credit_rate numeric(5, 4);

update public.domicile_tax_rules set treaty_credit_rate = 0.15 where domicile = 'USA';
update public.domicile_tax_rules set treaty_credit_rate = 0.00 where domicile = 'GBR';
-- POL is domestic, not a treaty-credit scenario — left null intentionally.

-- Snapshot the treaty rate used at event-creation time, same reasoning as
-- foreign_withholding_rate, so finalizeMaturedDividendEvents can recompute
-- without re-joining back to holdings/domicile.
alter table public.dividend_events
  add column treaty_credit_rate numeric(5, 4);
