/**
 * Derives current position facts from transaction history rather than a
 * static quantity snapshot — see migration 0007_holding_transactions.sql for
 * why (dividends must use shares held as of each dividend's date, not
 * today's count applied retroactively).
 */

export interface HoldingTransaction {
  transactionType: "buy" | "sell";
  quantity: number;
  price: number | null;
  transactionDate: string;
}

/**
 * Shares held as of a given date (inclusive), or the current total if
 * asOfDate is omitted. Used with a dividend's ex-dividend date to determine
 * how many shares were actually eligible for that payout.
 */
export function computeQuantityAtDate(
  transactions: HoldingTransaction[],
  asOfDate?: string,
): number {
  return transactions
    .filter((t) => !asOfDate || t.transactionDate <= asOfDate)
    .reduce((sum, t) => sum + (t.transactionType === "buy" ? t.quantity : -t.quantity), 0);
}

/**
 * Weighted average cost of buy transactions. Simplification: doesn't reduce
 * cost basis on sells (e.g. FIFO/average-cost lot matching) — fine for a
 * display estimate, not for real capital-gains accounting.
 */
export function computeAveragePrice(transactions: HoldingTransaction[]): number | null {
  const pricedBuys = transactions.filter((t) => t.transactionType === "buy" && t.price !== null);
  const totalQuantity = pricedBuys.reduce((sum, t) => sum + t.quantity, 0);
  if (totalQuantity === 0) {
    return null;
  }
  const totalCost = pricedBuys.reduce((sum, t) => sum + t.quantity * (t.price ?? 0), 0);
  return totalCost / totalQuantity;
}
