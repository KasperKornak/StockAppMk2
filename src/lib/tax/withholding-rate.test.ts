import { describe, expect, it } from "vitest";
import { resolveSuggestedWithholdingRate, resolveTreatyCreditRate } from "./withholding-rate";

describe("resolveSuggestedWithholdingRate", () => {
  it("defaults US holdings to 30% when W-8BEN is not confirmed", () => {
    const rate = resolveSuggestedWithholdingRate({
      domicile: "USA",
      w8benConfirmed: false,
      domicileDefaultRate: null,
    });
    expect(rate).toBe(0.3);
  });

  it("uses 15% for US holdings once W-8BEN is confirmed", () => {
    const rate = resolveSuggestedWithholdingRate({
      domicile: "USA",
      w8benConfirmed: true,
      domicileDefaultRate: null,
    });
    expect(rate).toBe(0.15);
  });

  it("falls back to the domicile_tax_rules default for non-US domiciles", () => {
    const rate = resolveSuggestedWithholdingRate({
      domicile: "GBR",
      w8benConfirmed: false,
      domicileDefaultRate: 0,
    });
    expect(rate).toBe(0);
  });

  it("returns null when there is no seeded default for the domicile", () => {
    const rate = resolveSuggestedWithholdingRate({
      domicile: "DEU",
      w8benConfirmed: false,
      domicileDefaultRate: null,
    });
    expect(rate).toBeNull();
  });
});

describe("resolveTreatyCreditRate", () => {
  it("is always 15% for USA regardless of W-8BEN status", () => {
    // W-8BEN status only changes what's actually withheld (30% vs 15%),
    // never what Poland will credit — that's fixed by the treaty.
    expect(resolveTreatyCreditRate("USA", null)).toBe(0.15);
  });

  it("falls back to domicile_tax_rules.treaty_credit_rate for other domiciles", () => {
    expect(resolveTreatyCreditRate("GBR", 0)).toBe(0);
  });

  it("returns null when there is no seeded treaty rate for the domicile", () => {
    expect(resolveTreatyCreditRate("DEU", null)).toBeNull();
  });
});
