/**
 * FR-HOLD-004/006: suggested foreign withholding rate for a holding.
 * USA is special-cased because the correct default (15% vs 30%) depends on
 * the holding's own W-8BEN status, not a single per-country constant —
 * every other domicile falls back to the shared domicile_tax_rules table.
 */

export interface ResolveSuggestedWithholdingRateParams {
  domicile: string | null;
  w8benConfirmed: boolean;
  /** default_withholding_rate from domicile_tax_rules, if a row exists. */
  domicileDefaultRate: number | null;
}

export function resolveSuggestedWithholdingRate({
  domicile,
  w8benConfirmed,
  domicileDefaultRate,
}: ResolveSuggestedWithholdingRateParams): number | null {
  if (domicile === "USA") {
    return w8benConfirmed ? 0.15 : 0.3;
  }
  return domicileDefaultRate;
}

/**
 * FR-TAX-007: the treaty rate is fixed by the double tax treaty and does
 * NOT depend on W-8BEN status — that only changes how much is actually
 * withheld (30% vs 15%), not how much Poland will credit (always capped at
 * the 15% US treaty rate). Every other domicile falls back to
 * domicile_tax_rules.treaty_credit_rate.
 */
export function resolveTreatyCreditRate(
  domicile: string | null,
  domicileTreatyRate: number | null,
): number | null {
  if (domicile === "USA") {
    return 0.15;
  }
  return domicileTreatyRate;
}
