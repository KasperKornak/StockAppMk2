/**
 * Polish "Belka tax" calculation for a single dividend event.
 * See specs/dividend-tax-tracker.spec.md FR-TAX-001..007.
 */

const POLISH_TAX_RATE = 0.19;

export interface DividendTaxInput {
  /** Gross dividend amount in the foreign payment currency. */
  grossAmountForeign: number;
  /** Effective foreign withholding tax rate actually deducted at source, e.g. 0.30. */
  foreignWithholdingRate: number;
  /** NBP average exchange rate for the business day preceding the pay date. */
  nbpFxRate: number;
  /**
   * Max rate Poland recognizes for the credit under the relevant double tax
   * treaty (e.g. 0.15 for the US), independent of what was actually
   * withheld. FR-TAX-007: if the payer over-withheld (e.g. no W-8BEN on
   * file, so the US withheld 30% instead of the 15% treaty rate), Poland
   * still only credits up to the treaty rate — the excess isn't creditable
   * here and must be reclaimed directly from the foreign tax authority.
   * Omit when there's no separate treaty cap (e.g. domestic PL dividends).
   */
  treatyCreditRate?: number;
}

export interface DividendTaxResult {
  grossAmountPln: number;
  polishTaxDuePln: number;
  foreignTaxCreditPln: number;
  amountToSetAsidePln: number;
}

function roundToGrosze(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateDividendTax({
  grossAmountForeign,
  foreignWithholdingRate,
  nbpFxRate,
  treatyCreditRate,
}: DividendTaxInput): DividendTaxResult {
  const grossAmountPln = roundToGrosze(grossAmountForeign * nbpFxRate);
  const polishTaxDuePln = roundToGrosze(grossAmountPln * POLISH_TAX_RATE);
  const foreignWithheldPln = roundToGrosze(grossAmountPln * foreignWithholdingRate);
  const treatyLimitPln =
    treatyCreditRate !== undefined ? roundToGrosze(grossAmountPln * treatyCreditRate) : Infinity;

  // FR-TAX-003/006/007: credit is capped per-event at the lesser of what was
  // actually withheld, the treaty-rate limit, and the Polish tax due for
  // that event; excess is never creditable and never carried forward.
  const foreignTaxCreditPln = Math.min(foreignWithheldPln, treatyLimitPln, polishTaxDuePln);

  // FR-TAX-004: floored at zero.
  const amountToSetAsidePln = Math.max(polishTaxDuePln - foreignTaxCreditPln, 0);

  return {
    grossAmountPln,
    polishTaxDuePln,
    foreignTaxCreditPln,
    amountToSetAsidePln,
  };
}
