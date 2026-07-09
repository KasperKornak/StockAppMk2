import { describe, expect, it } from "vitest";
import { calculateDividendTax } from "./calculate";

describe("calculateDividendTax", () => {
  // AC-005: US dividend with W-8BEN (15% foreign WHT)
  it("credits foreign withholding up to the Polish tax due", () => {
    const result = calculateDividendTax({
      grossAmountForeign: 100,
      foreignWithholdingRate: 0.15,
      nbpFxRate: 4,
    });

    expect(result.grossAmountPln).toBe(400);
    expect(result.polishTaxDuePln).toBe(76);
    expect(result.foreignTaxCreditPln).toBe(60);
    expect(result.amountToSetAsidePln).toBe(16);
  });

  // AC-006: UK dividend, 0% withholding at source
  it("requires the full 19% when no foreign tax was withheld", () => {
    const result = calculateDividendTax({
      grossAmountForeign: 100,
      foreignWithholdingRate: 0,
      nbpFxRate: 5,
    });

    expect(result.polishTaxDuePln).toBe(95);
    expect(result.foreignTaxCreditPln).toBe(0);
    expect(result.amountToSetAsidePln).toBe(95);
  });

  // AC-007: Polish domestic dividend, fully withheld at source (19%)
  it("requires no set-aside when the domestic rate already equals the Belka rate", () => {
    const result = calculateDividendTax({
      grossAmountForeign: 100,
      foreignWithholdingRate: 0.19,
      nbpFxRate: 1,
    });

    expect(result.amountToSetAsidePln).toBe(0);
  });

  // AC-008: foreign withholding exceeds the Polish tax due (e.g. German bond coupon)
  it("floors the set-aside at zero and does not carry forward excess credit", () => {
    const result = calculateDividendTax({
      grossAmountForeign: 100,
      foreignWithholdingRate: 0.26375,
      nbpFxRate: 4.3,
    });

    expect(result.foreignTaxCreditPln).toBe(result.polishTaxDuePln);
    expect(result.amountToSetAsidePln).toBe(0);
  });

  // AC-011: US dividend, no W-8BEN on file (30% actually withheld) — Poland
  // still only credits up to the 15% treaty rate, so 4% is still owed even
  // though more tax was withheld abroad than Poland will recognize.
  it("caps the credit at the treaty rate even when more was actually withheld", () => {
    const result = calculateDividendTax({
      grossAmountForeign: 100,
      foreignWithholdingRate: 0.3,
      nbpFxRate: 4,
      treatyCreditRate: 0.15,
    });

    expect(result.polishTaxDuePln).toBe(76);
    expect(result.foreignTaxCreditPln).toBe(60); // 15% of 400, not 30%
    expect(result.amountToSetAsidePln).toBe(16); // same 4% owed as with W-8BEN
  });

  // Without a treaty cap supplied, behavior is unchanged (credit limited
  // only by the Polish tax due) — e.g. domestic PL dividends.
  it("does not apply a treaty cap when none is provided", () => {
    const result = calculateDividendTax({
      grossAmountForeign: 100,
      foreignWithholdingRate: 0.3,
      nbpFxRate: 4,
    });

    expect(result.foreignTaxCreditPln).toBe(76);
    expect(result.amountToSetAsidePln).toBe(0);
  });
});
