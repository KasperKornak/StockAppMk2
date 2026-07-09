import { describe, expect, it } from "vitest";
import { computeAveragePrice, computeQuantityAtDate, type HoldingTransaction } from "./position";

describe("computeQuantityAtDate", () => {
  it("returns 0 for no transactions", () => {
    expect(computeQuantityAtDate([])).toBe(0);
  });

  it("sums all transactions when no asOfDate is given", () => {
    const txns: HoldingTransaction[] = [
      { transactionType: "buy", quantity: 10, price: 100, transactionDate: "2024-01-01" },
      { transactionType: "buy", quantity: 5, price: 110, transactionDate: "2024-06-01" },
      { transactionType: "sell", quantity: 3, price: 120, transactionDate: "2024-09-01" },
    ];
    expect(computeQuantityAtDate(txns)).toBe(12);
  });

  it("excludes transactions after the given date", () => {
    const txns: HoldingTransaction[] = [
      { transactionType: "buy", quantity: 10, price: 100, transactionDate: "2024-01-01" },
      { transactionType: "buy", quantity: 5, price: 110, transactionDate: "2024-06-01" },
    ];
    expect(computeQuantityAtDate(txns, "2024-03-01")).toBe(10);
  });

  it("includes a transaction dated exactly on asOfDate", () => {
    const txns: HoldingTransaction[] = [
      { transactionType: "buy", quantity: 10, price: 100, transactionDate: "2024-06-01" },
    ];
    expect(computeQuantityAtDate(txns, "2024-06-01")).toBe(10);
  });

  it("returns 0 for a dividend dated before any transaction (fixes the historical-dividend bug)", () => {
    const txns: HoldingTransaction[] = [
      { transactionType: "buy", quantity: 10, price: 100, transactionDate: "2024-06-01" },
    ];
    expect(computeQuantityAtDate(txns, "2020-01-01")).toBe(0);
  });

  it("nets buys and sells", () => {
    const txns: HoldingTransaction[] = [
      { transactionType: "buy", quantity: 10, price: 100, transactionDate: "2024-01-01" },
      { transactionType: "sell", quantity: 4, price: 120, transactionDate: "2024-02-01" },
    ];
    expect(computeQuantityAtDate(txns, "2024-02-01")).toBe(6);
  });
});

describe("computeAveragePrice", () => {
  it("returns null when there are no priced buys", () => {
    expect(computeAveragePrice([])).toBeNull();
  });

  it("returns the single buy price when there's one transaction", () => {
    const txns: HoldingTransaction[] = [
      { transactionType: "buy", quantity: 10, price: 100, transactionDate: "2024-01-01" },
    ];
    expect(computeAveragePrice(txns)).toBe(100);
  });

  it("computes the weighted average across multiple buys", () => {
    const txns: HoldingTransaction[] = [
      { transactionType: "buy", quantity: 10, price: 100, transactionDate: "2024-01-01" },
      { transactionType: "buy", quantity: 10, price: 200, transactionDate: "2024-06-01" },
    ];
    expect(computeAveragePrice(txns)).toBe(150);
  });

  it("ignores sells (does not reduce cost basis)", () => {
    const txns: HoldingTransaction[] = [
      { transactionType: "buy", quantity: 10, price: 100, transactionDate: "2024-01-01" },
      { transactionType: "sell", quantity: 5, price: 150, transactionDate: "2024-06-01" },
    ];
    expect(computeAveragePrice(txns)).toBe(100);
  });
});
