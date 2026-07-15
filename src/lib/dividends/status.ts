/**
 * FR-DIV-001/003: a dividend event is "confirmed" once its pay date has
 * passed (exact NBP rate for that date becomes available). Before that,
 * it's "qualified" once the ex-dividend date has passed (shares are locked
 * in for the payout, just not paid yet), or "upcoming" before the ex-date.
 */
export function determineEventStatus(
  exDividendDate: string | null,
  payDate: string | null,
  today: Date = new Date(),
): "upcoming" | "qualified" | "confirmed" {
  const todayIso = today.toISOString().slice(0, 10);
  if (payDate && payDate <= todayIso) {
    return "confirmed";
  }
  if (exDividendDate && exDividendDate <= todayIso) {
    return "qualified";
  }
  return "upcoming";
}
