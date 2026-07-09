-- 0001 seeded Poland's default_withholding_rate as 0.00 with a note saying
-- "fully withheld at source" — that's backwards. The rate here represents
-- tax already withheld before the investor receives the payout, so a
-- domestic Polish dividend (19% Belka withheld by the paying broker) must
-- be 0.19, not 0.00. At 0.00 the tax calc would wrongly demand a further
-- 19% set-aside on income already fully taxed (see FR-TAX-005 and
-- calculateDividendTax in src/lib/tax/calculate.ts).
update public.domicile_tax_rules
set default_withholding_rate = 0.19,
    notes = 'Fully withheld (19% Belka tax) at source by the Polish payer — FR-TAX-005'
where domicile = 'POL';
